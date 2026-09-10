"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/cache";
import * as XLSX from "xlsx";
import { DeviceType, DeviceStatus, Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Một dòng dữ liệu thô từ workbook (key không xác định trước, giá trị kiểu cơ bản). */
type RawRow = Record<string, string | number | boolean | null | undefined>;

/** Bản ghi thiết bị hợp lệ để create, khớp Prisma DeviceCreateInput. */
type DeviceCreateData = Prisma.DeviceUncheckedCreateInput;

interface ImportRowError {
  row: number;
  message: string;
}

/** Lấy giá trị dạng text từ ô bất kỳ trong workbook */
function cellStr(row: RawRow, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null) return String(v);
  }
  return "";
}

/** Ép lỗi unknown thành chuỗi thông báo */
function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function toEnum<T extends Record<string, string>>(enumObj: T, value: string | undefined): T[keyof T] | undefined {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase();
  const match = (Object.keys(enumObj) as Array<keyof T>).find((k) => String(enumObj[k]).toUpperCase() === upper);
  return match ? enumObj[match] : undefined;
}

async function parseWorkbook(file: File): Promise<RawRow[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
}

function genQrCode(): string {
  return `DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export async function importDevices(formData: FormData): Promise<{
  success: boolean;
  inserted: number;
  skipped: number;
  errors: ImportRowError[];
}> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "Không có quyền thao tác." }] };
  }

  const { allowed } = rateLimit(`import:devices:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "Quá nhiều yêu cầu, thử lại sau 1 phút." }] };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "Không có file." }] };

  let rows: RawRow[];
  try {
    rows = await parseWorkbook(file);
  } catch {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "File không đọc được (phải là .xlsx/.xls/.csv)." }] };
  }

  const rooms = await db.room.findMany({ where: { deletedAt: null }, select: { id: true, name: true } });
  const roomByName = new Map(rooms.map((r) => [r.name.trim().toLowerCase(), r.id]));

  const errors: ImportRowError[] = [];
  const toCreate: DeviceCreateData[] = [];

  rows.forEach((raw, i) => {
    const rowNum = i + 2; // +1 header, +1 to 1-based
    const name = cellStr(raw, "name").trim();
    const type = toEnum(DeviceType, cellStr(raw, "type"));
    const status = toEnum(DeviceStatus, cellStr(raw, "status")) ?? DeviceStatus.ACTIVE;
    const roomName = cellStr(raw, "room", "roomName").trim().toLowerCase();
    const roomId = roomByName.get(roomName);

    if (!name || !type) {
      errors.push({ row: rowNum, message: `Thiếu tên hoặc loại thiết bị không hợp lệ (${cellStr(raw, "type")}).` });
      return;
    }
    if (!roomId) {
      errors.push({ row: rowNum, message: `Phòng "${cellStr(raw, "room", "roomName")}" không tồn tại.` });
      return;
    }
    const serial = cellStr(raw, "serialNumber").trim() || undefined;
    toCreate.push({
      name,
      type,
      status,
      roomId,
      qrCode: genQrCode(),
      manufacturer: cellStr(raw, "manufacturer").trim() || null,
      model: cellStr(raw, "model").trim() || null,
      serialNumber: serial,
      notes: cellStr(raw, "notes").trim() || null,
    });
  });

  let inserted = 0;
  for (const d of toCreate) {
    try {
      if (d.serialNumber) {
        const dup = await db.device.findFirst({ where: { serialNumber: d.serialNumber, deletedAt: null } });
        if (dup) {
          errors.push({ row: -1, message: `Serial ${d.serialNumber} đã tồn tại, bỏ qua.` });
          continue;
        }
      }
      await db.device.create({ data: d });
      inserted++;
    } catch (e: unknown) {
      errors.push({ row: -1, message: `Lỗi lưu ${d.name}: ${errorMessage(e)}` });
    }
  }

  return { success: inserted > 0, inserted, skipped: rows.length - inserted, errors };
}

export async function importUsers(formData: FormData): Promise<{
  success: boolean;
  inserted: number;
  skipped: number;
  errors: ImportRowError[];
}> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "Chỉ Admin mới được nhập người dùng." }] };
  }

  const { allowed } = rateLimit(`import:users:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "Quá nhiều yêu cầu, thử lại sau 1 phút." }] };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "Không có file." }] };

  let rows: RawRow[];
  try {
    rows = await parseWorkbook(file);
  } catch {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "File không đọc được (phải là .xlsx/.xls/.csv)." }] };
  }

  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNum = i + 2;
    const name = cellStr(raw, "name").trim();
    const email = cellStr(raw, "email").trim().toLowerCase();
    const role = toEnum(Role, cellStr(raw, "role")) ?? Role.USER;

    if (!name || !email) {
      errors.push({ row: rowNum, message: "Thiếu tên hoặc email." });
      continue;
    }
    if (!email.endsWith("@dlu.edu.vn")) {
      errors.push({ row: rowNum, message: `${email} không phải email @dlu.edu.vn.` });
      continue;
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      errors.push({ row: rowNum, message: `${email} đã tồn tại, bỏ qua.` });
      continue;
    }

    try {
      const password = await bcrypt.hash(email, 10);
      await db.user.create({
        data: {
          name,
          email,
          password,
          role,
          phone: cellStr(raw, "phone").trim() || null,
          mustChangePassword: true,
        },
      });
      inserted++;
    } catch (e: unknown) {
      errors.push({ row: rowNum, message: `Lỗi lưu ${email}: ${errorMessage(e)}` });
    }
  }

  return { success: inserted > 0, inserted, skipped: rows.length - inserted, errors };
}

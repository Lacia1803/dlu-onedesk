"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/cache";
import * as XLSX from "xlsx";
import { DeviceType, DeviceStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

interface ImportRowError {
  row: number;
  message: string;
}

function toEnum<T extends Record<string, string>>(enumObj: T, value: string | undefined): T[keyof T] | undefined {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase();
  const match = (Object.keys(enumObj) as Array<keyof T>).find((k) => String(enumObj[k]).toUpperCase() === upper);
  return match ? enumObj[match] : undefined;
}

async function parseWorkbook(file: File): Promise<any[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
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

  let rows: any[];
  try {
    rows = await parseWorkbook(file);
  } catch {
    return { success: false, inserted: 0, skipped: 0, errors: [{ row: 0, message: "File không đọc được (phải là .xlsx/.xls/.csv)." }] };
  }

  const rooms = await db.room.findMany({ where: { deletedAt: null }, select: { id: true, name: true } });
  const roomByName = new Map(rooms.map((r) => [r.name.trim().toLowerCase(), r.id]));

  const errors: ImportRowError[] = [];
  const toCreate: any[] = [];

  rows.forEach((raw, i) => {
    const rowNum = i + 2; // +1 header, +1 to 1-based
    const name = String(raw.name ?? "").trim();
    const type = toEnum(DeviceType, raw.type);
    const status = toEnum(DeviceStatus, raw.status) ?? DeviceStatus.ACTIVE;
    const roomName = String(raw.room ?? raw.roomName ?? "").trim().toLowerCase();
    const roomId = roomByName.get(roomName);

    if (!name || !type) {
      errors.push({ row: rowNum, message: `Thiếu tên hoặc loại thiết bị không hợp lệ (${raw.type}).` });
      return;
    }
    if (!roomId) {
      errors.push({ row: rowNum, message: `Phòng "${raw.room ?? raw.roomName}" không tồn tại.` });
      return;
    }
    const serial = String(raw.serialNumber ?? "").trim() || undefined;
    toCreate.push({
      name,
      type,
      status,
      roomId,
      qrCode: genQrCode(),
      manufacturer: String(raw.manufacturer ?? "").trim() || null,
      model: String(raw.model ?? "").trim() || null,
      serialNumber: serial,
      notes: String(raw.notes ?? "").trim() || null,
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
    } catch (e: any) {
      errors.push({ row: -1, message: `Lỗi lưu ${d.name}: ${e.message}` });
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

  let rows: any[];
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
    const name = String(raw.name ?? "").trim();
    const email = String(raw.email ?? "").trim().toLowerCase();
    const role = toEnum(Role, raw.role) ?? Role.USER;

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
          phone: String(raw.phone ?? "").trim() || null,
        },
      });
      inserted++;
    } catch (e: any) {
      errors.push({ row: rowNum, message: `Lỗi lưu ${email}: ${e.message}` });
    }
  }

  return { success: inserted > 0, inserted, skipped: rows.length - inserted, errors };
}

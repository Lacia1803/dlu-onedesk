"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireFreshAdmin } from "@/lib/permissions";
import { rateLimit } from "@/lib/cache";
import ExcelJS from "exceljs";
import { DeviceType, DeviceStatus, Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

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

function toEnum<T extends Record<string, string>>(
  enumObj: T,
  value: string | undefined
): T[keyof T] | undefined {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase();
  const match = (Object.keys(enumObj) as Array<keyof T>).find(
    (k) => String(enumObj[k]).toUpperCase() === upper
  );
  return match ? enumObj[match] : undefined;
}

async function parseWorkbook(file: File): Promise<RawRow[]> {
  if (file.name.toLowerCase().endsWith(".csv")) {
    return parseCsv(await file.text());
  }
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];

  // Dòng 1 là header; các dòng sau map theo tên cột.
  const headers: string[] = [];
  const rows: RawRow[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber] = cellText(cell.value);
      });
      return;
    }
    const record: RawRow = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (!key) return;
      record[key] = cell.value as string | number | boolean | null | undefined;
    });
    rows.push(record);
  });
  return rows;
}

/** Parse CSV đơn giản (dòng 1 là header), hỗ trợ ô có dấu ngoặc kép và BOM. */
function parseCsv(text: string): RawRow[] {
  const clean = text.replace(/^﻿/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else quoted = false;
        } else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === "," || ch === ";") {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    return cells;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const record: RawRow = {};
    headers.forEach((h, i) => {
      record[h.trim()] = cells[i] ?? "";
    });
    return record;
  });
}

/** Chuyển giá trị ô ExcelJS (có thể là object rich-text/công thức) thành text thuần. */
function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((r) => r.text).join("");
    }
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
    if ("hyperlink" in value) return String(value.text ?? value.hyperlink);
  }
  return String(value);
}

function genQrCode(): string {
  // Sinh QR an toàn bằng crypto (không Math.random)
  return `DEV-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function importDevices(formData: FormData): Promise<{
  success: boolean;
  inserted: number;
  skipped: number;
  errors: ImportRowError[];
}> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "Không có quyền thao tác." }],
    };
  }

  const { allowed } = await rateLimit(`import:devices:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "Quá nhiều yêu cầu, thử lại sau 1 phút." }],
    };
  }

  const file = formData.get("file") as File | null;
  if (!file)
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "Không có file." }],
    };

  let rows: RawRow[];
  try {
    rows = await parseWorkbook(file);
  } catch {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "File không đọc được (phải là .xlsx hoặc .csv)." }],
    };
  }

  const rooms = await db.room.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
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
      errors.push({
        row: rowNum,
        message: `Thiếu tên hoặc loại thiết bị không hợp lệ (${cellStr(raw, "type")}).`,
      });
      return;
    }
    if (!roomId) {
      errors.push({
        row: rowNum,
        message: `Phòng "${cellStr(raw, "room", "roomName")}" không tồn tại.`,
      });
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

  // Kiểm tra serial trùng trong 1 query thay vì từng dòng
  const serials = toCreate.map((d) => d.serialNumber).filter((s): s is string => !!s);
  const existingSerials = new Set(
    serials.length > 0
      ? (
          await db.device.findMany({
            where: { serialNumber: { in: serials }, deletedAt: null },
            select: { serialNumber: true },
          })
        ).map((d) => d.serialNumber)
      : []
  );

  const valid = toCreate.filter((d) => {
    if (d.serialNumber && existingSerials.has(d.serialNumber)) {
      errors.push({ row: -1, message: `Serial ${d.serialNumber} đã tồn tại, bỏ qua.` });
      return false;
    }
    return true;
  });

  // Tất cả hoặc không: 1 transaction, lỗi 1 dòng → rollback toàn bộ
  let inserted = 0;
  if (valid.length > 0) {
    try {
      await db.$transaction(async (tx) => {
        await tx.device.createMany({ data: valid });
        inserted = valid.length;
      });
    } catch (e: unknown) {
      errors.push({ row: 0, message: `Import thất bại, đã rollback toàn bộ: ${errorMessage(e)}` });
      inserted = 0;
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
  const session = await requireFreshAdmin();
  if (!session) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "Chỉ Admin mới được nhập người dùng." }],
    };
  }

  const { allowed } = await rateLimit(`import:users:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "Quá nhiều yêu cầu, thử lại sau 1 phút." }],
    };
  }

  const file = formData.get("file") as File | null;
  if (!file)
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "Không có file." }],
    };

  let rows: RawRow[];
  try {
    rows = await parseWorkbook(file);
  } catch {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [{ row: 0, message: "File không đọc được (phải là .xlsx hoặc .csv)." }],
    };
  }

  // Giới hạn số lượng dòng tối đa để tránh cạn kiệt tài nguyên máy chủ
  if (rows.length > 200) {
    return {
      success: false,
      inserted: 0,
      skipped: rows.length,
      errors: [
        {
          row: 0,
          message: `File có ${rows.length} dòng, vượt quá giới hạn tối đa 200 người dùng/lần import.`,
        },
      ],
    };
  }

  const errors: ImportRowError[] = [];
  let inserted = 0;

  // Validate tất cả các dòng trước, gom dữ liệu hợp lệ
  type UserCreateData = Prisma.UserUncheckedCreateInput;
  const toCreate: UserCreateData[] = [];

  rows.forEach((raw, i) => {
    const rowNum = i + 2;
    const name = cellStr(raw, "name").trim();
    const email = cellStr(raw, "email").trim().toLowerCase();
    const role = toEnum(Role, cellStr(raw, "role")) ?? Role.USER;

    if (!name || !email) {
      errors.push({ row: rowNum, message: "Thiếu tên hoặc email." });
      return;
    }
    if (!email.endsWith("@dlu.edu.vn")) {
      errors.push({ row: rowNum, message: `${email} không phải email @dlu.edu.vn.` });
      return;
    }
    toCreate.push({
      name,
      email,
      password: "", // placeholder, hash theo từng batch bên dưới
      role,
      phone: cellStr(raw, "phone").trim() || null,
      mustChangePassword: true,
    });
  });

  // Kiểm tra email trùng DB trong 1 query
  const emails = toCreate.map((u) => u.email);
  const existingEmails = new Set(
    emails.length > 0
      ? (await db.user.findMany({ where: { email: { in: emails } }, select: { email: true } })).map(
          (u) => u.email
        )
      : []
  );

  const valid = toCreate.filter((u) => {
    if (existingEmails.has(u.email)) {
      errors.push({ row: -1, message: `${u.email} đã tồn tại, bỏ qua.` });
      return false;
    }
    return true;
  });

  // Hash mật khẩu theo từng batch 10 phần tử để tránh nghẽn libuv thread pool
  if (valid.length > 0) {
    try {
      const BATCH_SIZE = 10;
      for (let i = 0; i < valid.length; i += BATCH_SIZE) {
        const batch = valid.slice(i, i + BATCH_SIZE);
        const hashes = await Promise.all(batch.map((u) => bcrypt.hash(u.email, 10)));
        batch.forEach((u, idx) => {
          u.password = hashes[idx];
        });
      }

      // Tất cả hoặc không: 1 transaction
      await db.$transaction(async (tx) => {
        await tx.user.createMany({ data: valid });
        inserted = valid.length;
      });
    } catch (e: unknown) {
      errors.push({ row: 0, message: `Import thất bại, đã rollback toàn bộ: ${errorMessage(e)}` });
      inserted = 0;
    }
  }

  return { success: inserted > 0, inserted, skipped: rows.length - inserted, errors };
}

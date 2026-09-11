import ExcelJS from "exceljs";

/**
 * Tiện ích tạo workbook Excel (chỉ dùng phía server). Dùng chung cho mọi tính năng
 * xuất .xlsx để không phải bundle exceljs xuống client (~1MB).
 * Hàm tải file phía client nằm ở "@/lib/download".
 * ponytail: giữ ở server action, cần stream cho file cực lớn thì chuyển sang Route Handler.
 */

export type SheetData = {
  name: string;
  rows: Array<Record<string, unknown>>;
};

/** ExcelJS tính theo pixel; quy đổi thô từ độ dài text (chỉ để cột dễ đọc). */
function columnWidth(key: string, rows: Array<Record<string, unknown>>): number {
  let max = key.length;
  for (const row of rows) {
    const len = String(row[key] ?? "").length;
    if (len > max) max = len;
  }
  return Math.min(Math.max(max + 2, 10), 50);
}

/** Tạo buffer .xlsx từ danh sách sheet (mỗi sheet là mảng object, header lấy từ key). */
export async function buildWorkbookBuffer(sheets: SheetData[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "DLU OneDesk";
  wb.created = new Date();

  for (const sheet of sheets) {
    const ws = wb.addWorksheet(sheet.name);
    const headers = sheet.rows.length > 0 ? Object.keys(sheet.rows[0]) : [];
    if (headers.length === 0) continue;

    ws.columns = headers.map((key) => ({ header: key, key, width: columnWidth(key, sheet.rows) }));
    ws.getRow(1).font = { bold: true };
    for (const row of sheet.rows) ws.addRow(row);
  }

  // ExcelJS trả về Buffer tại runtime Node nhưng type khai báo là ArrayBuffer.
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}

/** Mã hoá buffer thành chuỗi base64 để truyền qua ranh giới server action → client. */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

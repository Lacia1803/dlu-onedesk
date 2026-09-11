/**
 * Tiện ích tải file phía client — không phụ thuộc thư viện ngoài nên an toàn khi
 * import vào Client Component.
 */

/** Kích hoạt tải file từ chuỗi base64 (dùng cho dữ liệu server trả về). */
export function downloadBase64File(filename: string, base64: string, mime: string): void {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Kích hoạt tải file text (CSV) kèm BOM để Excel đọc đúng tiếng Việt. */
export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob(["﻿" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

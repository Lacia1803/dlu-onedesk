import assert from "node:assert";
import { describe, it } from "node:test";
import ExcelJS from "exceljs";
import { buildWorkbookBuffer, bufferToBase64 } from "../src/lib/xlsx.ts";

// Round-trip: build a workbook with the server helper, read it back with exceljs
// to confirm headers, values, sheet names, and base64 transport all survive.
describe("Excel export (exceljs)", () => {
  it("builds a two-sheet workbook with correct headers and rows", async () => {
    const buffer = await buildWorkbookBuffer([
      {
        name: "Thiết bị",
        rows: [
          { "Mã QR": "DEV-1", "Tên thiết bị": "Máy chiếu" },
          { "Mã QR": "DEV-2", "Tên thiết bị": "Máy in" },
        ],
      },
      { name: "Tickets", rows: [{ "Mã Ticket": "abc123", "Tiêu đề": "Hỏng máy" }] },
    ]);

    assert.ok(Buffer.isBuffer(buffer), "returns a Buffer");
    assert.ok(buffer.length > 0, "buffer is non-empty");

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    assert.deepStrictEqual(
      wb.worksheets.map((w) => w.name),
      ["Thiết bị", "Tickets"]
    );

    const ws = wb.worksheets[0];
    assert.strictEqual(ws.getRow(1).getCell(1).value, "Mã QR");
    assert.strictEqual(ws.getRow(1).getCell(2).value, "Tên thiết bị");
    assert.strictEqual(ws.getRow(2).getCell(1).value, "DEV-1");
    assert.strictEqual(ws.getRow(3).getCell(2).value, "Máy in");
  });

  it("handles an empty sheet without throwing", async () => {
    const buffer = await buildWorkbookBuffer([{ name: "Empty", rows: [] }]);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    assert.strictEqual(wb.worksheets.length, 1);
  });

  it("base64 transport round-trips exactly", async () => {
    const buffer = await buildWorkbookBuffer([{ name: "S", rows: [{ A: "1" }] }]);
    const restored = Buffer.from(bufferToBase64(buffer), "base64");
    assert.ok(restored.equals(buffer), "base64 decode equals original");
  });
});

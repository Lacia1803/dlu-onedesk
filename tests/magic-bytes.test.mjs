import assert from "node:assert";
import { describe, it } from "node:test";
import { saveUpload } from "../src/lib/storage.ts";

describe("Magic Bytes File Upload Security", () => {
  it("chấp nhận file PNG có magic bytes chuẩn (89 50 4E 47)", async () => {
    // 89 50 4E 47 0D 0A 1A 0A ... (16 bytes)
    const pngMagic = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
    ]);
    const file = new File([pngMagic], "valid.png", { type: "image/png" });

    // Sẽ gọi saveUpload mà không ném ra ngoại lệ validation
    const path = await saveUpload(file, "test");
    assert.ok(path.startsWith("/uploads/test/"));
    assert.ok(path.endsWith(".png"));
  });

  it("chặn file độc hại nhái Header image/png nhưng chứa script HTML/JS", async () => {
    const maliciousContent = Buffer.from("<script>alert('XSS')</script>");
    const file = new File([maliciousContent], "shell.png", { type: "image/png" });

    await assert.rejects(
      async () => {
        await saveUpload(file, "test");
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /Phát hiện gian lận Header|Header PNG/);
        return true;
      }
    );
  });

  it("chặn file JPEG có header fake nhưng byte không phải FFD8FF", async () => {
    const fakeJpeg = Buffer.from("THIS IS NOT A JPEG FILE DATA AT ALL");
    const file = new File([fakeJpeg], "fake.jpg", { type: "image/jpeg" });

    await assert.rejects(
      async () => {
        await saveUpload(file, "test");
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /Phát hiện gian lận Header|Header JPEG/);
        return true;
      }
    );
  });
});

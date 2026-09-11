import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Mã hóa AES-256-GCM cho secret nhạy cảm (2FA TOTP secret).
 * Khóa lấy từ env ENCRYPTION_KEY (64 hex chars = 32 bytes).
 * Định dạng output: iv:authTag:ciphertext (hex), có prefix "enc:" để phân biệt
 * với secret plaintext cũ (tương thích ngược khi migrate).
 */
const PREFIX = "enc:";

function getKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("ENCRYPTION_KEY chưa được cấu hình (cần 64 ký tự hex). Chạy: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  }
  return Buffer.from(keyHex, "hex");
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // GCM chuẩn dùng 12-byte IV
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

/** Giải mã secret. Nếu value không có prefix "enc:" → trả nguyên văn (tương thích secret plaintext cũ). */
export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored;
  const [ivHex, tagHex, dataHex] = stored.slice(PREFIX.length).split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Secret mã hóa không hợp lệ (missing iv/tag/data).");
  }
  const key = getKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

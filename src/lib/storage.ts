import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
// Ánh xạ ngược: từ đuôi đã whitelist suy ra Content-Type (không tin client).
const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getSafeExt(file: File): string {
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    throw new Error(`File ${file.name} không đúng định dạng (JPEG, PNG, WEBP).`);
  }
  return ext;
}

/**
 * Kiểm tra file signature (magic bytes) cấp thấp.
 * Chặn Postman hoặc script sửa Content-Type để gửi file độc hại (JS, PHP, SVG,...).
 */
async function validateMagicBytes(file: File): Promise<void> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length < 12) {
    throw new Error(`File quá nhỏ để chứa dữ liệu ảnh hợp lệ.`);
  }

  // Chuyển 4 hoặc 12 byte đầu thành chuỗi Hex
  const hex4 = buffer.subarray(0, 4).toString("hex").toUpperCase();
  const hex12 = buffer.subarray(0, 12).toString("hex").toUpperCase();

  const isJPEG = hex4.startsWith("FFD8FF");
  const isPNG = hex4 === "89504E47";
  // WEBP bắt đầu bằng RIFF, byte 8-11 là WEBP
  const isWEBP = hex12.startsWith("52494646") && hex12.substring(16, 24) === "57454250";

  if (!isJPEG && !isPNG && !isWEBP) {
    throw new Error(`Phát hiện gian lận Header: Dữ liệu thực tế không phải ảnh JPEG/PNG/WEBP hợp lệ.`);
  }

  // Đối chiếu Magic Bytes với Header file.type
  const ext = MIME_TO_EXT[file.type];
  if (ext === ".jpg" && !isJPEG) throw new Error("Header JPEG nhưng dữ liệu không phải JPEG.");
  if (ext === ".png" && !isPNG) throw new Error("Header PNG nhưng dữ liệu không phải PNG.");
  if (ext === ".webp" && !isWEBP) throw new Error("Header WEBP nhưng dữ liệu không phải WEBP.");
}

async function validate(file: File): Promise<void> {
  getSafeExt(file); // Throws if file.type is not allowed
  if (file.size > MAX_SIZE) {
    throw new Error(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
  }
  await validateMagicBytes(file);
}

/**
 * Lưu file local (STORAGE_DRIVER=local, mặc định).
 */
async function saveLocal(file: File, subdir: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(uploadDir, { recursive: true });

  const ext = getSafeExt(file);
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const filePath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return `/uploads/${subdir}/${filename}`;
}

/**
 * Lưu file lên S3-compatible storage (STORAGE_DRIVER=s3|r2).
 * Cần env: S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (+S3_ENDPOINT cho R2/minio).
 * Lazy-require aws-sdk để không bắt buộc dependency ở môi trường local.
 */
async function saveRemote(file: File, subdir: string): Promise<string> {
  const { S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT } = process.env;
  if (!S3_BUCKET || !S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new Error(
      "Thiếu cấu hình S3 (S3_BUCKET / S3_REGION / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY)."
    );
  }
  const client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });
  const ext = getSafeExt(file);
  const key = `${subdir}/${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      // Suy Content-Type từ đuôi đã whitelist, KHÔNG lấy từ client.
      ContentType: EXT_TO_MIME[ext] ?? "application/octet-stream",
    })
  );
  const base = S3_ENDPOINT
    ? S3_ENDPOINT.replace(/\/$/, "")
    : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;
  return `${base}/${key}`;
}

/**
 * Save uploaded file và trả về URL công khai.
 * - STORAGE_DRIVER=local (mặc định): ghi vào public/uploads/<subdir>, trả về /uploads/...
 * - STORAGE_DRIVER=s3|r2: upload lên S3-compatible, trả về URL tuyệt đối.
 * File serverless (Vercel/Render) không có filesystem persistent → dùng s3/r2.
 */
export async function saveUpload(file: File, subdir: string): Promise<string> {
  await validate(file);
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "s3" || driver === "r2") {
    return saveRemote(file, subdir);
  }
  return saveLocal(file, subdir);
}

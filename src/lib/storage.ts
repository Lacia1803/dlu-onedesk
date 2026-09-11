import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function validate(file: File): void {
  if (!ALLOWED.includes(file.type)) {
    throw new Error(`File ${file.name} không đúng định dạng (JPEG, PNG, WEBP).`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
  }
}

/**
 * Lưu file local (STORAGE_DRIVER=local, mặc định).
 */
async function saveLocal(file: File, subdir: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
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
  const ext = path.extname(file.name) || ".jpg";
  const key = `${subdir}/${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
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
  validate(file);
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "s3" || driver === "r2") {
    return saveRemote(file, subdir);
  }
  return saveLocal(file, subdir);
}

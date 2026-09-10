import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Save uploaded file to public/uploads/<subdir> and return public URL.
 * Validates mime type and size (5MB max, image/*).
 */
export async function saveUpload(file: File, subdir: string): Promise<string> {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"]; // extend if needed

  if (!ALLOWED.includes(file.type)) {
    throw new Error(`File ${file.name} không đúng định dạng (JPEG, PNG, WEBP).`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  // public URL is relative to /uploads
  return `/uploads/${subdir}/${filename}`;
}

import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
]);

export async function saveImageUpload(
  slug: string,
  dateIso: string,
  role: "square" | "vertical",
  file: File,
): Promise<string> {
  const original = file.name || "upload";
  let ext = path.extname(original).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    ext = ".jpg";
  }
  const filename = `${dateIso}-${role}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", slug);
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  const full = path.join(dir, filename);
  await writeFile(full, buf);
  return `/uploads/${slug}/${filename}`;
}

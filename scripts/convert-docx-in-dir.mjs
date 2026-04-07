/**
 * Convert every .docx in a folder to .txt in the same folder.
 * If name.txt exists, uses "name (docx).txt", "name (docx 2).txt", ...
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resolveOutPath(dir, base) {
  const ext = ".txt";
  const candidates = [
    path.join(dir, `${base}${ext}`),
    path.join(dir, `${base} (docx)${ext}`),
  ];
  for (let i = 2; i < 50; i++) {
    candidates.push(path.join(dir, `${base} (docx ${i})${ext}`));
  }
  for (const p of candidates) {
    try {
      await fs.access(p);
    } catch {
      return p;
    }
  }
  return candidates[candidates.length - 1];
}

async function main() {
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error("Usage: node convert-docx-in-dir.mjs <absolute-or-relative-folder>");
    process.exit(1);
  }
  const dir = path.resolve(dirArg);
  let names;
  try {
    names = await fs.readdir(dir);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const docxFiles = names.filter((f) => f.toLowerCase().endsWith(".docx"));
  let ok = 0;
  for (const name of docxFiles) {
    const inputPath = path.join(dir, name);
    const base = path.basename(name, path.extname(name));
    const outPath = await resolveOutPath(dir, base);
    try {
      const buf = await fs.readFile(inputPath);
      const { value } = await mammoth.extractRawText({ buffer: buf });
      const text = (value || "").replace(/\r\n/g, "\n").trim() + "\n";
      await fs.writeFile(outPath, text, "utf8");
      console.log("Wrote", path.relative(process.cwd(), outPath));
      ok++;
    } catch (e) {
      console.error("FAIL", name, e.message || e);
    }
  }
  console.log(`Converted ${ok} docx in ${dir}`);
}

main();

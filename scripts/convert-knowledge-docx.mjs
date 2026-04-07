/**
 * Converts all .docx in knowledge/ to .txt in the same folder.
 * If name.txt already exists, writes name (docx).txt (or name (docx 2).txt, …).
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const knowledgeDir = path.join(root, "knowledge");

async function resolveOutPath(base) {
  const candidates = [path.join(knowledgeDir, `${base}.txt`)];
  candidates.push(path.join(knowledgeDir, `${base} (docx).txt`));
  for (let i = 2; i < 50; i++) {
    candidates.push(
      path.join(knowledgeDir, `${base} (docx ${i}).txt`),
    );
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
  let names;
  try {
    names = await fs.readdir(knowledgeDir);
  } catch (e) {
    console.error("Cannot read knowledge folder:", e.message);
    process.exit(1);
  }

  const docxFiles = names.filter((f) => f.toLowerCase().endsWith(".docx"));
  if (docxFiles.length === 0) {
    console.log("No .docx files in knowledge/");
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const name of docxFiles) {
    const inputPath = path.join(knowledgeDir, name);
    const base = path.basename(name, path.extname(name));
    const outPath = await resolveOutPath(base);
    try {
      const buf = await fs.readFile(inputPath);
      const { value } = await mammoth.extractRawText({ buffer: buf });
      const text = (value || "").replace(/\r\n/g, "\n").trim() + "\n";
      await fs.writeFile(outPath, text, "utf8");
      console.log("Wrote", path.relative(root, outPath));
      ok++;
    } catch (e) {
      console.error("FAIL", name, e.message || e);
      failed++;
    }
  }

  console.log(`\nDone: ${ok} converted, ${failed} failed → knowledge/`);
}

main();

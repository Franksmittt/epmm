import fs from "node:fs/promises";
import path from "node:path";

const VAULT_REL = path.join(
  "knowledge",
  "clients",
  "alberton-tyre-clinic",
  "vault.txt",
);

/** Resolve repo `knowledge/.../vault.txt` from portal cwd (dev/build) or monorepo root. */
async function tryRead(abs: string): Promise<string | null> {
  try {
    return await fs.readFile(abs, "utf8");
  } catch {
    return null;
  }
}

export async function readAtcVaultText(): Promise<string | null> {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "..", VAULT_REL),
    path.join(cwd, VAULT_REL),
    path.join(cwd, "..", "..", VAULT_REL),
  ];
  for (const p of candidates) {
    const t = await tryRead(p);
    if (t !== null) return t;
  }
  return null;
}

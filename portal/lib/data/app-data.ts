import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

/** ISO date yyyy-mm-dd → saved day (mock persistence until Supabase). */
export interface StoredDayContent {
  caption: string;
  squareUrl: string | null;
  verticalUrl: string | null;
  updatedAt: string;
  /** Feed post only: no 9:16 story asset; admin completion skips vertical. */
  feedOnly?: boolean;
}

export interface AppData {
  /** Client slugs that cannot log in. */
  revokedSlugs: string[];
  /** slug → date → content */
  schedules: Record<string, Record<string, StoredDayContent>>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");

const empty: AppData = { revokedSlugs: [], schedules: {} };

export async function loadAppData(): Promise<AppData> {
  try {
    if (!existsSync(DATA_FILE)) {
      return structuredClone(empty);
    }
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AppData;
    return {
      revokedSlugs: Array.isArray(parsed.revokedSlugs)
        ? parsed.revokedSlugs
        : [],
      schedules:
        parsed.schedules && typeof parsed.schedules === "object"
          ? parsed.schedules
          : {},
    };
  } catch {
    return structuredClone(empty);
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function isSlugRevoked(data: AppData, slug: string): boolean {
  return data.revokedSlugs.includes(slug);
}

export async function setSlugRevoked(
  slug: string,
  revoked: boolean,
): Promise<void> {
  const data = await loadAppData();
  const set = new Set(data.revokedSlugs);
  if (revoked) {
    set.add(slug);
  } else {
    set.delete(slug);
  }
  data.revokedSlugs = [...set];
  await saveAppData(data);
}

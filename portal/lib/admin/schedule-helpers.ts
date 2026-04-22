import type { StoredDayContent } from "@/lib/data/app-data";
import type { ClientRecord } from "@/lib/clients/registry";

export type DayPostStatus = "none" | "incomplete" | "complete";

/** What still needs doing for this day (if anything). */
export function getDayPostStatus(
  entry: StoredDayContent | undefined,
): DayPostStatus {
  if (!entry) return "none";
  const cap = entry.caption?.trim().length ?? 0;
  const hasSq = Boolean(entry.squareUrl);
  const hasV = Boolean(entry.verticalUrl);
  const feedOnly = Boolean(entry.feedOnly);
  if (cap > 0 && hasSq && (hasV || feedOnly)) return "complete";
  return "incomplete";
}

export function statusLabel(status: DayPostStatus): string {
  switch (status) {
    case "complete":
      return "Ready";
    case "incomplete":
      return "Needs work";
    default:
      return "No post";
  }
}

export function missingParts(entry: StoredDayContent | undefined): string[] {
  if (!entry) return [];
  const m: string[] = [];
  if (!entry.caption?.trim()) m.push("caption");
  if (!entry.squareUrl) m.push("square");
  if (!entry.verticalUrl && !entry.feedOnly) m.push("vertical");
  return m;
}

/** Last day of month (month 1–12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 6 rows × 7 cols, Monday-first. Null = outside this month.
 * Each string is ISO date yyyy-mm-dd.
 */
export function buildMonthGrid(
  year: number,
  month: number,
): (string | null)[][] {
  const last = daysInMonth(year, month);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const startPad = (firstDow + 6) % 7;
  const weeks: (string | null)[][] = [];
  let n = 1 - startPad;
  for (let w = 0; w < 6; w++) {
    const row: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if (n < 1 || n > last) {
        row.push(null);
      } else {
        const mm = String(month).padStart(2, "0");
        const dd = String(n).padStart(2, "0");
        row.push(`${year}-${mm}-${dd}`);
      }
      n++;
    }
    weeks.push(row);
  }
  return weeks;
}

export interface MonthSummary {
  scheduled: number;
  complete: number;
  incomplete: number;
  /** Days in this month that have at least one field saved */
  withEntry: number;
}

export function summarizeClientMonth(
  slug: string,
  year: number,
  month: number,
  schedules: Record<string, Record<string, StoredDayContent>>,
): MonthSummary {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const byDate = schedules[slug] ?? {};
  let scheduled = 0;
  let complete = 0;
  let incomplete = 0;
  for (const date of Object.keys(byDate)) {
    if (!date.startsWith(prefix)) continue;
    scheduled++;
    const s = getDayPostStatus(byDate[date]);
    if (s === "complete") complete++;
    else incomplete++;
  }
  return {
    scheduled,
    complete,
    incomplete,
    withEntry: scheduled,
  };
}

export interface MasterScheduleRow {
  date: string;
  slug: string;
  clientName: string;
  status: DayPostStatus;
  captionPreview: string;
  hasSquare: boolean;
  hasVertical: boolean;
  missing: string[];
}

export function buildMasterSchedule(
  clients: ClientRecord[],
  schedules: Record<string, Record<string, StoredDayContent>>,
): MasterScheduleRow[] {
  const rows: MasterScheduleRow[] = [];
  const bySlug = new Map(clients.map((c) => [c.slug, c.name]));

  for (const [slug, dates] of Object.entries(schedules)) {
    const name = bySlug.get(slug) ?? slug;
    for (const [date, entry] of Object.entries(dates)) {
      const status = getDayPostStatus(entry);
      const cap = entry.caption?.trim() ?? "";
      rows.push({
        date,
        slug,
        clientName: name,
        status,
        captionPreview: cap.length > 80 ? `${cap.slice(0, 80)}…` : cap,
        hasSquare: Boolean(entry.squareUrl),
        hasVertical: Boolean(entry.verticalUrl),
        missing: missingParts(entry),
      });
    }
  }

  rows.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.clientName.localeCompare(b.clientName);
  });
  return rows;
}

export function filterMasterRows(
  rows: MasterScheduleRow[],
  opts: {
    year: number;
    month: number;
    clientSlug?: string;
    status?: "all" | DayPostStatus;
  },
): MasterScheduleRow[] {
  const prefix = `${opts.year}-${String(opts.month).padStart(2, "0")}-`;
  let out = rows.filter((r) => r.date.startsWith(prefix));
  if (opts.clientSlug) {
    out = out.filter((r) => r.slug === opts.clientSlug);
  }
  if (opts.status && opts.status !== "all") {
    out = out.filter((r) => r.status === opts.status);
  }
  return out;
}

export function parseYearMonth(
  yRaw: string | null | undefined,
  mRaw: string | null | undefined,
): { year: number; month: number } {
  const now = new Date();
  const y = yRaw ? parseInt(yRaw, 10) : now.getFullYear();
  const m = mRaw ? parseInt(mRaw, 10) : now.getMonth() + 1;
  if (!Number.isFinite(y) || y < 2020 || y > 2100) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  if (!Number.isFinite(m) || m < 1 || m > 12) {
    return { year: y, month: now.getMonth() + 1 };
  }
  return { year: y, month: m };
}

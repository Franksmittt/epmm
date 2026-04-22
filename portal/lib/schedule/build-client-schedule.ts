import path from "path";
import { getClientBySlug } from "@/lib/clients/registry";
import { loadAppData } from "@/lib/data/app-data";
import type { DaySchedule, WeekSchedule } from "@/lib/schedule/types";

export async function buildClientSchedule(slug: string): Promise<WeekSchedule> {
  const client = getClientBySlug(slug);
  if (!client) {
    return {
      clientSlug: slug,
      clientDisplayName: slug,
      weekLabel: "Unknown client",
      days: [],
    };
  }

  const data = await loadAppData();
  const byDate = data.schedules[slug] ?? {};
  /** Chronological ascending (yyyy-mm-dd lexicographic === calendar order). */
  const dates = Object.keys(byDate).sort((a, b) => {
    const ta = Date.parse(`${a}T12:00:00`);
    const tb = Date.parse(`${b}T12:00:00`);
    if (Number.isNaN(ta) || Number.isNaN(tb)) {
      return a.localeCompare(b);
    }
    return ta - tb;
  });
  const safeName = client.name.replace(/\s+/g, "_");

  const days: DaySchedule[] = dates.map((iso) => {
    const row = byDate[iso];
    const d = new Date(`${iso}T12:00:00`);
    const dayLabel = d.toLocaleDateString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const squareExt = row.squareUrl
      ? path.extname(row.squareUrl) || ".jpg"
      : ".jpg";
    const verticalExt = row.verticalUrl
      ? path.extname(row.verticalUrl) || ".jpg"
      : ".jpg";

    const posts = [
      {
        id: `${iso}-square`,
        label: "Square (feed)",
        caption: row.caption,
        assetUrl: row.squareUrl,
        assetFileName: row.squareUrl
          ? `${safeName}_${iso}_square${squareExt}`
          : null,
      },
    ];

    if (row.verticalUrl) {
      posts.push({
        id: `${iso}-vertical`,
        label: "Vertical (story)",
        caption: row.caption,
        assetUrl: row.verticalUrl,
        assetFileName: `${safeName}_${iso}_vertical${verticalExt}`,
      });
    }

    return {
      id: iso,
      dayLabel,
      posts,
    };
  });

  return {
    clientSlug: slug,
    clientDisplayName: client.name,
    weekLabel:
      dates.length === 0 ? "No scheduled posts yet" : "Your scheduled content",
    days,
  };
}

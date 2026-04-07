import Link from "next/link";
import {
  buildMonthGrid,
  getDayPostStatus,
  type DayPostStatus,
} from "@/lib/admin/schedule-helpers";
import type { StoredDayContent } from "@/lib/data/app-data";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cellClasses(status: DayPostStatus, inMonth: boolean): string {
  if (!inMonth) return "min-h-[2.75rem] bg-black/20";
  switch (status) {
    case "complete":
      return "min-h-[2.75rem] border border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20";
    case "incomplete":
      return "min-h-[2.75rem] border border-amber-500/45 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20";
    default:
      return "min-h-[2.75rem] border border-white/10 bg-black/30 text-[#8E8E93] hover:border-white/20 hover:bg-white/5";
  }
}

export function AdminMonthCalendar({
  slug,
  year,
  month,
  byDate,
}: {
  slug: string;
  year: number;
  month: number;
  byDate: Record<string, StoredDayContent>;
}) {
  const grid = buildMonthGrid(year, month);
  const title = new Date(year, month - 1, 1).toLocaleString("en-ZA", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-md border border-white/15 bg-[#1D1D1F] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        <p className="text-xs text-[#8E8E93]">
          Tap a day to add or edit ·{" "}
          <span className="text-emerald-300">Green</span> ready ·{" "}
          <span className="text-amber-300">Amber</span> missing something ·{" "}
          <span className="text-[#8E8E93]">Grey</span> no post
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-[#8E8E93] sm:text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 space-y-1">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((iso, di) => {
              if (!iso) {
                return (
                  <div
                    key={`e-${wi}-${di}`}
                    className="min-h-[2.75rem] rounded-md bg-black/15"
                  />
                );
              }
              const entry = byDate[iso];
              const status = getDayPostStatus(entry);
              const dayNum = parseInt(iso.slice(8, 10), 10);
              const href = `/admin/clients/${slug}?y=${year}&m=${month}&date=${iso}`;
              return (
                <Link
                  key={iso}
                  href={href}
                  className={`flex flex-col items-center justify-center rounded-md px-0.5 py-1 text-center text-xs transition-colors sm:text-sm ${cellClasses(status, true)}`}
                >
                  <span className="font-medium text-white">{dayNum}</span>
                  {status === "complete" ? (
                    <span className="hidden text-[9px] text-emerald-200/90 sm:block">
                      Done
                    </span>
                  ) : null}
                  {status === "incomplete" ? (
                    <span className="hidden text-[9px] text-amber-200/90 sm:block">
                      Todo
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

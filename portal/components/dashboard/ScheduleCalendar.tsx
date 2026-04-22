"use client";

import { useMemo, useState } from "react";
import { buildMonthGrid } from "@/lib/admin/schedule-helpers";
import { DayDetailModal } from "@/components/dashboard/DayDetailModal";
import type { DaySchedule, WeekSchedule } from "@/lib/schedule/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function monthKey(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function fromMonthKey(key: number): { year: number; month: number } {
  return { year: Math.floor(key / 12), month: (key % 12) + 1 };
}

function monthTitle(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
  });
}

function MonthPanel({
  year,
  month,
  daysByIso,
  onScheduledClick,
}: {
  year: number;
  month: number;
  daysByIso: Map<string, DaySchedule>;
  onScheduledClick: (day: DaySchedule) => void;
}) {
  const grid = buildMonthGrid(year, month);
  const title = monthTitle(year, month);

  return (
    <div className="rounded-md border border-white/15 bg-[#1D1D1F] p-3 sm:p-4">
      <h2 className="mb-3 text-center text-base font-semibold text-white sm:text-lg">
        {title}
      </h2>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-[#8E8E93] sm:gap-1 sm:text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 space-y-0.5 sm:space-y-1">
        {grid.map((row, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {row.map((iso, di) => {
              if (!iso) {
                return (
                  <div
                    key={`e-${wi}-${di}`}
                    className="min-h-[2.5rem] rounded-md bg-black/20 sm:min-h-[2.75rem]"
                  />
                );
              }
              const dayNum = parseInt(iso.slice(8, 10), 10);
              const scheduled = daysByIso.get(iso);
              if (scheduled) {
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onScheduledClick(scheduled)}
                    className="flex min-h-[2.5rem] flex-col items-center justify-center rounded-md border border-emerald-500/50 bg-emerald-500/15 px-0.5 py-1 text-center text-xs text-emerald-100 transition hover:bg-emerald-500/25 hover:border-emerald-400/60 sm:min-h-[2.75rem] sm:text-sm"
                    aria-label={`Open post for ${iso}`}
                  >
                    <span className="font-semibold text-white">{dayNum}</span>
                    <span className="hidden text-[9px] text-emerald-200/90 sm:block">
                      Post
                    </span>
                  </button>
                );
              }
              return (
                <div
                  key={iso}
                  className="flex min-h-[2.5rem] flex-col items-center justify-center rounded-md border border-white/5 bg-black/25 px-0.5 py-1 text-center text-xs text-[#6E6E73] sm:min-h-[2.75rem] sm:text-sm"
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleCalendar({ week }: { week: WeekSchedule }) {
  const daysByIso = useMemo(() => {
    const m = new Map<string, DaySchedule>();
    for (const d of week.days) {
      m.set(d.id, d);
    }
    return m;
  }, [week.days]);

  const scheduledKeys = useMemo(() => {
    const s = new Set<number>();
    for (const d of week.days) {
      const y = parseInt(d.id.slice(0, 4), 10);
      const mo = parseInt(d.id.slice(5, 7), 10);
      s.add(monthKey(y, mo));
    }
    return [...s].sort((a, b) => a - b);
  }, [week.days]);

  const initialWindow = useMemo(() => {
    if (week.days.length === 0) {
      const t = new Date();
      return { year: t.getFullYear(), month: t.getMonth() + 1 };
    }
    const first = [...week.days].sort((a, b) => a.id.localeCompare(b.id))[0]!;
    return {
      year: parseInt(first.id.slice(0, 4), 10),
      month: parseInt(first.id.slice(5, 7), 10),
    };
  }, [week.days]);

  const [viewStart, setViewStart] = useState(initialWindow);
  const [activeDay, setActiveDay] = useState<DaySchedule | null>(null);

  const monthA = viewStart;
  const monthB = addMonths(viewStart.year, viewStart.month, 1);

  const minK = scheduledKeys[0] ?? monthKey(initialWindow.year, initialWindow.month);
  const maxK =
    scheduledKeys[scheduledKeys.length - 1] ??
    monthKey(initialWindow.year, initialWindow.month);

  const viewK = monthKey(viewStart.year, viewStart.month);
  const secondK = monthKey(monthB.year, monthB.month);

  const canGoBack = viewK > minK;
  const canGoForward = secondK < maxK;

  const visibleKeys = new Set([viewK, secondK]);
  const jumpKeys = scheduledKeys.filter((k) => !visibleKeys.has(k));

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#8E8E93]">
        <p className="text-white/90">
          Every client sees this same layout.{" "}
          <span className="font-medium text-emerald-300">Green</span> days have a
          scheduled post — tap to copy the caption and download images. Grey days
          have nothing yet.
        </p>
        <p className="mt-2 text-xs">
          You always see two months side by side. Use the arrows to move forward
          or back; any month that still has posts but is hidden appears under
          Jump to month so you can open it again.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() =>
              setViewStart((v) => addMonths(v.year, v.month, -1))
            }
            className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ← Earlier months
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={() =>
              setViewStart((v) => addMonths(v.year, v.month, 1))
            }
            className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Later months →
          </button>
        </div>
        <p className="text-xs text-[#8E8E93]">
          Showing{" "}
          <span className="text-white/90">
            {monthTitle(monthA.year, monthA.month)}
          </span>{" "}
          and{" "}
          <span className="text-white/90">
            {monthTitle(monthB.year, monthB.month)}
          </span>
        </p>
      </div>

      {jumpKeys.length > 0 ? (
        <div className="rounded-md border border-orange-500/20 bg-orange-500/[0.06] px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-orange-200/90">
            Jump to month (has scheduled posts)
          </p>
          <div className="flex flex-wrap gap-2">
            {jumpKeys.map((k) => {
              const { year, month } = fromMonthKey(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setViewStart({ year, month })}
                  className="rounded-md border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-white hover:border-orange-400/40 hover:bg-white/5"
                >
                  {monthTitle(year, month)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthPanel
          year={monthA.year}
          month={monthA.month}
          daysByIso={daysByIso}
          onScheduledClick={setActiveDay}
        />
        <MonthPanel
          year={monthB.year}
          month={monthB.month}
          daysByIso={daysByIso}
          onScheduledClick={setActiveDay}
        />
      </div>

      {activeDay ? (
        <DayDetailModal
          day={activeDay}
          open={Boolean(activeDay)}
          onClose={() => setActiveDay(null)}
        />
      ) : null}
    </div>
  );
}

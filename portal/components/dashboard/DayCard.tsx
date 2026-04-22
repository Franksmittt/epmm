"use client";

import { useState } from "react";
import { DayDetailModal } from "@/components/dashboard/DayDetailModal";
import type { DaySchedule } from "@/lib/schedule/types";

interface DayCardProps {
  day: DaySchedule;
}

export function DayCard({ day }: DayCardProps) {
  const [open, setOpen] = useState(false);
  const caption = day.posts[0]?.caption ?? "";
  const hasSquare = Boolean(day.posts.find((p) => p.id.endsWith("-square"))?.assetUrl);
  const hasVertical = Boolean(
    day.posts.find((p) => p.id.endsWith("-vertical"))?.assetUrl,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col gap-2 rounded-md border border-white/15 bg-[#1D1D1F] p-4 text-left transition hover:border-white/25 hover:bg-[#222224]"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-base font-medium leading-snug text-white sm:text-lg">
            {day.dayLabel}
          </span>
          <span className="shrink-0 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90">
            Open
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-[#8E8E93]">{caption}</p>
        <p className="text-xs text-[#8E8E93]">
          {hasSquare ? "1:1 feed" : "No feed image"}
          {hasVertical ? " · 9:16 story" : " · Feed post only (no story)"}
        </p>
      </button>

      <DayDetailModal day={day} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

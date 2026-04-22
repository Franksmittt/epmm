"use client";

import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
import type { WeekSchedule } from "@/lib/schedule/types";

interface WeekBentoProps {
  week: WeekSchedule;
}

export function WeekBento({ week }: WeekBentoProps) {
  if (week.days.length === 0) {
    return (
      <div className="rounded-md border border-white/15 bg-[#1D1D1F] px-5 py-8 text-center">
        <p className="text-sm text-[#8E8E93]">
          No posts scheduled yet. When your agency publishes content for you,
          it will show up here — captions and images, ready to copy and
          download.
        </p>
      </div>
    );
  }

  return <ScheduleCalendar week={week} />;
}

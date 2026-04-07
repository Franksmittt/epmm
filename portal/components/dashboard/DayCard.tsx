"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CopyCaptionButton } from "@/components/dashboard/CopyCaptionButton";
import { DownloadAssetButton } from "@/components/dashboard/DownloadAssetButton";
import { premiumSpring } from "@/lib/motion";
import type { DaySchedule } from "@/lib/schedule/types";

interface DayCardProps {
  day: DaySchedule;
}

export function DayCard({ day }: DayCardProps) {
  const [open, setOpen] = useState(false);
  const caption = day.posts[0]?.caption ?? "";

  return (
    <motion.article
      layout
      transition={premiumSpring}
      className="rounded-md border border-white/15 bg-[#1D1D1F] p-4 text-left"
    >
      <button
        type="button"
        className="flex w-full flex-col gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-medium text-white">{day.dayLabel}</span>
          <span className="text-xs text-[#8E8E93]">{open ? "Hide" : "Show"}</span>
        </div>
        {!open ? (
          <p className="line-clamp-2 text-sm text-[#8E8E93]">{caption}</p>
        ) : null}
      </button>

      {open ? (
        <motion.div
          layout
          transition={premiumSpring}
          className="mt-4 space-y-4 border-t border-white/10 pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="whitespace-pre-wrap text-sm text-white">{caption}</p>
          <div className="flex flex-wrap gap-2">
            <CopyCaptionButton text={caption} />
          </div>

          {day.posts.map((post) => (
            <div
              key={post.id}
              className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
                {post.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.assetUrl && post.assetFileName ? (
                  <DownloadAssetButton
                    url={post.assetUrl}
                    filename={post.assetFileName}
                  />
                ) : (
                  <span className="rounded-md border border-white/15 px-3 py-2 text-xs text-[#8E8E93]">
                    No file yet
                  </span>
                )}
              </div>
              {post.assetUrl ? (
                <div className="overflow-hidden rounded-md border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.assetUrl}
                    alt=""
                    className="h-auto w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </motion.div>
      ) : null}
    </motion.article>
  );
}

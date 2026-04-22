"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CopyCaptionButton } from "@/components/dashboard/CopyCaptionButton";
import { DownloadAssetButton } from "@/components/dashboard/DownloadAssetButton";
import type { DaySchedule } from "@/lib/schedule/types";

type Props = {
  day: DaySchedule;
  open: boolean;
  onClose: () => void;
};

export function DayDetailModal({ day, open, onClose }: Props) {
  const caption = day.posts[0]?.caption ?? "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`day-modal-title-${day.id}`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[101] flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col rounded-t-2xl border border-white/15 bg-[#1D1D1F] shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p
              id={`day-modal-title-${day.id}`}
              className="text-lg font-semibold leading-snug text-white"
            >
              {day.dayLabel}
            </p>
            <p className="mt-1 text-xs text-[#8E8E93]">
              {day.posts.length > 1
                ? "Square for the feed and vertical for stories when both are supplied."
                : "Feed post only — use the square on Facebook feed (no story image for this day)."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-white/15 px-3 py-1.5 text-sm text-[#8E8E93] hover:border-white/25 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8E8E93]">
              Caption
            </h3>
            <p className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-white/10 bg-black/40 p-3 text-sm leading-relaxed text-white">
              {caption}
            </p>
            <CopyCaptionButton text={caption} />
          </section>

          <section className="space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8E8E93]">
              Images
            </h3>
            {day.posts.map((post) => (
              <div
                key={post.id}
                className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3"
              >
                <p className="text-xs font-medium text-white/90">{post.label}</p>
                <div className="flex flex-wrap gap-2">
                  {post.assetUrl && post.assetFileName ? (
                    <DownloadAssetButton
                      url={post.assetUrl}
                      filename={post.assetFileName}
                    />
                  ) : (
                    <span className="rounded-md border border-white/15 px-3 py-2 text-xs text-[#8E8E93]">
                      No file for this format
                    </span>
                  )}
                </div>
                {post.assetUrl ? (
                  <div className="overflow-hidden rounded-md border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.assetUrl}
                      alt=""
                      className="max-h-56 w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  saveClientDayAction,
  type SaveClientDayState,
} from "@/app/admin/actions";

const initial: SaveClientDayState = null;

export function SaveDayForm({
  slug,
  defaultDate,
  defaultCaption = "",
}: {
  slug: string;
  /** yyyy-mm-dd from calendar selection */
  defaultDate?: string;
  defaultCaption?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveClientDayAction,
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state?.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5"
    >
      <h2 className="text-lg font-medium text-white">Add or update a day</h2>
      <p className="text-xs text-[#8E8E93]">
        Pick the post date, paste the caption, upload square (feed) and
        vertical (story). Leaving a file empty keeps the previous image for
        that slot.
      </p>
      <input type="hidden" name="slug" value={slug} />
      <div className="space-y-1.5">
        <label htmlFor="day-date" className="text-sm text-white">
          Date
        </label>
        <input
          id="day-date"
          key={defaultDate ?? "new"}
          name="date"
          type="date"
          required
          defaultValue={defaultDate ?? ""}
          className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="day-caption" className="text-sm text-white">
          Caption
        </label>
        <textarea
          id="day-caption"
          key={`${defaultDate ?? "new"}-caption`}
          name="caption"
          required
          rows={5}
          placeholder="Full caption (line breaks and hashtags preserved)"
          defaultValue={defaultCaption}
          className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-[#8E8E93]/50"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="day-square" className="text-sm text-[#8E8E93]">
            Square image (feed)
          </label>
          <input
            id="day-square"
            name="square"
            type="file"
            accept="image/*"
            className="w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="day-vertical" className="text-sm text-[#8E8E93]">
            Vertical image (story)
          </label>
          <input
            id="day-vertical"
            name="vertical"
            type="file"
            accept="image/*"
            className="w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
          />
        </div>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-emerald-400" role="status">
          Saved. Client will see this on their portal.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save day"}
      </button>
    </form>
  );
}

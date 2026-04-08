"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ATC_APRIL_POST_SLOTS,
  ATC_APRIL_TEMPLATE_LABELS,
} from "@/lib/alberton-tyre-clinic/atc-april-2026-post-pack";
import {
  AlbertonTyreClinicOverlayStudio,
  atcMergedCopyForPreset,
  type AtcStudioCampaignPayload,
} from "./AlbertonTyreClinicOverlayStudio";

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function AtcAprilCampaignPlanner() {
  const todayIso = useMemo(() => {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, "0");
    const d = String(n.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const [campaignApply, setCampaignApply] =
    useState<AtcStudioCampaignPayload | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [captionFlash, setCaptionFlash] = useState<string | null>(null);

  const loadSlot = useCallback(
    (date: string) => {
      const slot = ATC_APRIL_POST_SLOTS.find((s) => s.date === date);
      if (!slot) return;
      setActiveDate(date);
      setCampaignApply({
        applyKey: `${slot.date}-${Date.now()}`,
        preset: slot.preset,
        copy: atcMergedCopyForPreset(slot.preset, slot.copyPatch),
      });
    },
    [],
  );

  const copyCaption = useCallback(async (date: string) => {
    const slot = ATC_APRIL_POST_SLOTS.find((s) => s.date === date);
    if (!slot) return;
    try {
      await navigator.clipboard.writeText(slot.facebookCaption);
      setCaptionFlash(date);
      window.setTimeout(() => setCaptionFlash(null), 2000);
    } catch {
      setCaptionFlash(null);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-orange-500/30 bg-orange-500/[0.06] p-4">
        <h2 className="text-lg font-semibold text-white">
          April 2026 post pack · Alberton Tyre Clinic
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#8E8E93]">
          Thirteen feed slots (every Monday, Wednesday, Friday). Each row picks a
          template (1–5) and product/service copy — all merged for you. Click{" "}
          <span className="text-white/90">Load into studio</span>, upload square
          + vertical heroes, export PNGs, then paste the caption into Facebook.
          Template numbers match the studio presets: 1 Velocity · 2 Kinetic Grip
          · 3 Commercial Transit · 4 Tectonic Tread · 5 Kinetic Monolith.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm text-[#D1D1D6]">
          <thead className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wide text-[#8E8E93]">
            <tr>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5">Template</th>
              <th className="px-3 py-2.5">Product / theme</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ATC_APRIL_POST_SLOTS.map((s) => {
              const overdue = s.date < todayIso;
              const active = activeDate === s.date;
              return (
                <tr
                  key={s.date}
                  className={`border-b border-white/5 ${
                    overdue ? "bg-amber-500/[0.07]" : ""
                  } ${active ? "bg-emerald-500/[0.08]" : ""}`}
                >
                  <td className="px-3 py-2.5 align-top">
                    <div className="font-medium text-white">
                      {formatDisplayDate(s.date)}
                    </div>
                    <div className="text-xs text-[#8E8E93]">{s.weekday}</div>
                    {overdue ? (
                      <span className="mt-1 inline-block text-xs text-amber-300/90">
                        Past date — catch up
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="font-mono text-xs text-orange-300/95">
                      T{s.templateNumber}
                    </span>
                    <div className="mt-1 max-w-[220px] text-xs leading-snug text-[#8E8E93]">
                      {ATC_APRIL_TEMPLATE_LABELS[s.templateNumber]}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs leading-relaxed">
                    {s.productLine}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadSlot(s.date)}
                        className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90"
                      >
                        Load into studio
                      </button>
                      <button
                        type="button"
                        onClick={() => copyCaption(s.date)}
                        className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/5"
                      >
                        {captionFlash === s.date ? "Copied" : "Copy caption"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-white/15 bg-[#1D1D1F] p-5">
        <h3 className="text-base font-semibold text-white">
          Overlay studio (loaded slot applies here)
        </h3>
        <p className="mt-1 text-sm text-[#8E8E93]">
          After you load a row, the preset and all text fields update. Add
          images, then download 1:1 and 9:16 PNGs.
        </p>
        <div className="mt-4 rounded-md border border-white/10 bg-black/40 p-4">
          <AlbertonTyreClinicOverlayStudio campaignApply={campaignApply} />
        </div>
      </div>
    </div>
  );
}

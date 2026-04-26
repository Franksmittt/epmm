"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  CAROUSEL_KEYS_BY_PRESET,
  CarouselCardCanvas,
  defaultCopyForPreset,
  inferCarouselPresetFromBlock,
  initialCopyByPreset,
  isCarouselPresetId,
  VKW_CAROUSEL_PRESETS,
  type VkwCarouselPresetId,
} from "./VaalpenskraalWoodCarouselRenders";

export type { VkwCarouselPresetId } from "./VaalpenskraalWoodCarouselRenders";
export { VKW_CAROUSEL_PRESETS } from "./VaalpenskraalWoodCarouselRenders";

export const VKW_CAROUSEL_JSON_TEMPLATE_ID =
  "vaalpenskraal-wood-braai-carousel";
export const VKW_CAROUSEL_JSON_VERSION = 2;

export const VKW_CAROUSEL_CARD_COUNT = 5;

function stripMarkdownJsonFence(raw: string): string {
  const t = raw.trim();
  const block = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im.exec(t);
  if (block) return block[1].trim();
  if (t.startsWith("```")) {
    return t
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }
  return t;
}

function extractCopyBlock(parsed: unknown): Record<string, unknown> | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const o = parsed as Record<string, unknown>;
  if (
    o.copy &&
    typeof o.copy === "object" &&
    !Array.isArray(o.copy)
  ) {
    return o.copy as Record<string, unknown>;
  }
  return o;
}

const CARD_PREVIEW_PX = 172;
const SCALE_PREVIEW = CARD_PREVIEW_PX / 1080;

function readFileAsDataUrl(
  file: File,
  setData: (url: string | null) => void,
) {
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === "string") setData(result);
  };
  reader.onerror = () => setData(null);
  reader.readAsDataURL(file);
}

function cardIndexForFieldKey(
  preset: VkwCarouselPresetId,
  key: string,
): number {
  if (preset === "carousel-mock") {
    const m = /^carouselCard(\d)/.exec(key);
    return m ? parseInt(m[1], 10) : 0;
  }
  const m = /C(\d)/.exec(key);
  return m ? parseInt(m[1], 10) : 0;
}

function fieldRowsForKey(key: string): number {
  if (key.includes("Body")) return 3;
  if (key === "appleC2Title") return 1;
  if (key.includes("Title")) return 2;
  return 1;
}

export function VaalpenskraalWoodCarouselStudio() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [preset, setPreset] = useState<VkwCarouselPresetId>("apple-glass");
  const [copyByPreset, setCopyByPreset] = useState<
    Record<VkwCarouselPresetId, Record<string, string>>
  >(initialCopyByPreset);

  const copy = copyByPreset[preset];
  const keys = CAROUSEL_KEYS_BY_PRESET[preset];

  const sortedKeys = useMemo(() => {
    return [...keys].sort((a, b) => {
      const ca = cardIndexForFieldKey(preset, a);
      const cb = cardIndexForFieldKey(preset, b);
      if (ca !== cb) return ca - cb;
      return a.localeCompare(b);
    });
  }, [keys, preset]);

  const patchCopy = useCallback(
    (key: string, value: string) => {
      setCopyByPreset((prev) => ({
        ...prev,
        [preset]: { ...prev[preset], [key]: value },
      }));
    },
    [preset],
  );

  const [bgShared, setBgShared] = useState<string | null>(null);
  const sharedFileRef = useRef<HTMLInputElement>(null);
  const [bgByCard, setBgByCard] = useState<(string | null)[]>(() =>
    Array.from({ length: VKW_CAROUSEL_CARD_COUNT }, () => null),
  );
  const cardFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<null | number | "all">(null);

  const [jsonPaste, setJsonPaste] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState(false);
  const [applyFlash, setApplyFlash] = useState(false);

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          template: VKW_CAROUSEL_JSON_TEMPLATE_ID,
          version: VKW_CAROUSEL_JSON_VERSION,
          preset,
          copy: copyByPreset[preset],
        },
        null,
        2,
      ),
    [preset, copyByPreset],
  );

  const copyJsonToClipboard = useCallback(async () => {
    setJsonError(null);
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopyFlash(true);
      window.setTimeout(() => setCopyFlash(false), 2000);
    } catch {
      setJsonError(
        "Could not copy to clipboard. Select the JSON manually or check browser permissions.",
      );
    }
  }, [exportJson]);

  const applyJsonFromPaste = useCallback(() => {
    setJsonError(null);
    setApplyFlash(false);
    const trimmed = stripMarkdownJsonFence(jsonPaste);
    if (!trimmed) {
      setJsonError("Paste JSON first.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setJsonError(
        "Invalid JSON — fix syntax (e.g. trailing commas, unescaped quotes).",
      );
      return;
    }
    const root =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    const block = extractCopyBlock(parsed);
    if (!block) {
      setJsonError('Expected an object with a "copy" field or flat keys.');
      return;
    }

    const tmpl = root?.template;
    if (
      tmpl != null &&
      tmpl !== VKW_CAROUSEL_JSON_TEMPLATE_ID
    ) {
      setJsonError(
        `Unknown template "${String(tmpl)}". Use ${VKW_CAROUSEL_JSON_TEMPLATE_ID}.`,
      );
      return;
    }

    let targetPreset: VkwCarouselPresetId = preset;
    if (isCarouselPresetId(root?.preset)) {
      targetPreset = root.preset;
    } else {
      targetPreset =
        inferCarouselPresetFromBlock(block) ?? "apple-glass";
    }

    const klist = CAROUSEL_KEYS_BY_PRESET[targetPreset];
    const picked: Record<string, string> = {};
    for (const key of klist) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const val = block[key];
        picked[key] = val == null ? "" : String(val);
      }
    }
    if (!Object.keys(picked).length) {
      setJsonError(`No recognised fields. Try: ${klist.slice(0, 4).join(", ")}…`);
      return;
    }

    setPreset(targetPreset);
    setCopyByPreset((prev) => ({
      ...prev,
      [targetPreset]: { ...prev[targetPreset], ...picked },
    }));
    setApplyFlash(true);
    window.setTimeout(() => setApplyFlash(false), 2000);
  }, [jsonPaste, preset]);

  const onPickSharedBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, setBgShared);
  };

  const clearSharedBg = () => {
    setBgShared(null);
    if (sharedFileRef.current) sharedFileRef.current.value = "";
  };

  const onPickCardBg = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, (url) => {
      setBgByCard((prev) => prev.map((v, j) => (j === index ? url : v)));
    });
  };

  const clearCardBg = (index: number) => {
    setBgByCard((prev) => prev.map((v, j) => (j === index ? null : v)));
    const input = cardFileRefs.current[index];
    if (input) input.value = "";
  };

  const heroForCard = (card: 1 | 2 | 3 | 4 | 5) =>
    bgByCard[card - 1] ?? bgShared ?? null;

  const resetCopy = () => {
    setCopyByPreset((prev) => ({
      ...prev,
      [preset]: defaultCopyForPreset(preset),
    }));
  };

  const exportSlug = preset;

  const downloadCard = useCallback(
    async (cardIndex: number) => {
      const el = cardRefs.current[cardIndex];
      if (!el) return;
      setExportError(null);
      setExporting(cardIndex);
      try {
        await document.fonts.ready;
        const dataUrl = await toPng(el, {
          cacheBust: true,
          pixelRatio: 1,
          width: 1080,
          height: 1080,
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `vpb-carousel-${exportSlug}-card-${cardIndex + 1}-1080-${Date.now()}.png`;
        a.click();
      } catch (err) {
        setExportError(
          err instanceof Error ? err.message : "Could not render PNG.",
        );
      } finally {
        setExporting(null);
      }
    },
    [exportSlug],
  );

  const downloadAll = useCallback(async () => {
    setExportError(null);
    setExporting("all");
    try {
      await document.fonts.ready;
      for (let i = 0; i < VKW_CAROUSEL_CARD_COUNT; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const dataUrl = await toPng(el, {
          cacheBust: true,
          pixelRatio: 1,
          width: 1080,
          height: 1080,
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `vpb-carousel-${exportSlug}-card-${i + 1}-1080-${Date.now()}.png`;
        a.click();
        await new Promise((r) => window.setTimeout(r, 350));
      }
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Could not render PNGs.",
      );
    } finally {
      setExporting(null);
    }
  }, [exportSlug]);

  const renderCard = (
    index: 1 | 2 | 3 | 4 | 5,
    setRef: ((el: HTMLDivElement | null) => void) | null,
  ) => (
    <CarouselCardCanvas
      preset={preset}
      card={index}
      copy={copy}
      bgDataUrl={heroForCard(index)}
      rootRef={setRef ?? undefined}
    />
  );

  const keyGroups = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const key of sortedKeys) {
      const c = cardIndexForFieldKey(preset, key);
      const arr = m.get(c) ?? [];
      arr.push(key);
      m.set(c, arr);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [sortedKeys, preset]);

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      <div className="w-full shrink-0 space-y-4 xl:max-w-[min(100%,420px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Carousel template
          </p>
          <p className="text-[11px] leading-snug text-[#8E8E93]">
            All six options are listed below (easier than a tiny dropdown).
          </p>
          <div
            className="flex max-h-[min(60vh,520px)] flex-col gap-1.5 overflow-y-auto pr-1"
            role="listbox"
            aria-label="Vaalpenskraal carousel preset"
          >
            {VKW_CAROUSEL_PRESETS.map((p) => {
              const selected = preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setPreset(p.id)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-white/45 bg-white/12 text-white"
                      : "border-white/10 bg-black/45 text-[#E8E8ED] hover:border-white/22 hover:bg-black/60"
                  }`}
                >
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-xs font-normal leading-snug text-[#8E8E93]">
                    {p.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Card images · 1:1 (crop-to-fill)
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]/90">
            Upload a different hero for each carousel card. Square or near-square
            sources work best. (Images are not stored in the JSON export—export
            PNGs to keep the art.)
          </p>
          <div className="space-y-3">
            {([0, 1, 2, 3, 4] as const).map((i) => {
              const hasOwn = Boolean(bgByCard[i]);
              const usesFallback = !hasOwn && Boolean(bgShared);
              return (
                <div
                  key={i}
                  className="space-y-1.5 border-t border-white/10 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white/90">
                      Card {i + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-[#8E8E93]">
                      {hasOwn
                        ? "Custom image"
                        : usesFallback
                          ? "Shared fallback"
                          : "No image"}
                    </span>
                  </div>
                  <input
                    ref={(el) => {
                      cardFileRefs.current[i] = el;
                    }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickCardBg(i, e)}
                    className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
                  />
                  {hasOwn ? (
                    <button
                      type="button"
                      onClick={() => clearCardBg(i)}
                      className="text-xs text-[#8E8E93] underline hover:text-white"
                    >
                      Remove this card’s image
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Shared fallback (optional)
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]/90">
            Used only for cards that don’t have their own upload above—handy for
            a quick preview or a single mood shot behind the whole set.
          </p>
          <input
            ref={sharedFileRef}
            type="file"
            accept="image/*"
            onChange={onPickSharedBg}
            className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
          />
          {bgShared ? (
            <button
              type="button"
              onClick={clearSharedBg}
              className="text-xs text-[#8E8E93] underline hover:text-white"
            >
              Remove shared image
            </button>
          ) : null}
        </div>

        <div className="space-y-4 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Copy · {preset.replace(/-/g, " ")}
          </p>
          <p className="text-[11px] leading-relaxed text-[#8E8E93]">
            Use line breaks in multi-line fields where the layout stacks lines
            (e.g. headlines).
          </p>
          <div className="space-y-6">
            {keyGroups.map(([cardNum, groupKeys]) => (
              <div key={cardNum} className="space-y-3">
                {cardNum > 0 ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">
                    Card {cardNum} of {VKW_CAROUSEL_CARD_COUNT}
                  </p>
                ) : null}
                {groupKeys.map((key) => (
                  <Field
                    key={key}
                    label={key}
                    value={copy[key] ?? ""}
                    onChange={(v) => patchCopy(key, v)}
                    rows={fieldRowsForKey(key)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            JSON ·{" "}
            <code className="text-white/80">
              {VKW_CAROUSEL_JSON_TEMPLATE_ID}
            </code>
          </p>
          <textarea
            value={exportJson}
            readOnly
            className="max-h-40 w-full resize-y rounded-md border border-white/15 bg-black/50 p-2 font-mono text-xs text-white/90"
            rows={8}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyJsonToClipboard}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              {copyFlash ? "Copied" : "Copy JSON"}
            </button>
          </div>
          <textarea
            value={jsonPaste}
            onChange={(e) => setJsonPaste(e.target.value)}
            placeholder="Paste JSON to apply…"
            className="min-h-[80px] w-full resize-y rounded-md border border-white/15 bg-black/50 p-2 text-sm text-white placeholder:text-white/30"
            rows={4}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyJsonFromPaste}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Apply JSON
            </button>
            {applyFlash ? (
              <span className="text-xs text-emerald-300">Applied.</span>
            ) : null}
          </div>
          {jsonError ? (
            <p className="text-xs text-red-300">{jsonError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={resetCopy}
            className="rounded-md border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5"
          >
            Reset this template’s copy to defaults
          </button>
          <button
            type="button"
            onClick={downloadAll}
            disabled={exporting !== null}
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {exporting === "all"
              ? "Exporting all…"
              : "Download all 5 PNGs (1080×1080)"}
          </button>
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2, 3, 4] as const).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => downloadCard(i)}
                disabled={exporting !== null}
                className="rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
              >
                {exporting === i ? "…" : `Card ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
        {exportError ? (
          <p className="text-sm text-red-300">{exportError}</p>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
          Preview · five squares · {preset.replace(/-/g, " ")}
        </p>
        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <div key={n} className="shrink-0 space-y-1.5">
              <p className="text-center text-[10px] font-medium uppercase tracking-wide text-[#8E8E93]">
                {n}
              </p>
              <div
                className="overflow-hidden rounded-md border border-white/15 bg-black"
                style={{
                  width: CARD_PREVIEW_PX,
                  height: CARD_PREVIEW_PX,
                }}
              >
                <div
                  style={{
                    width: 1080,
                    height: 1080,
                    transform: `scale(${SCALE_PREVIEW})`,
                    transformOrigin: "top left",
                  }}
                >
                  {renderCard(n, null)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#8E8E93]">
          PNG export uses hidden full-size 1080×1080 layers off-screen. Previews
          are scaled to fit five across.
        </p>

        <div
          className="pointer-events-none fixed left-[-9999px] top-0"
          aria-hidden
        >
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <div key={`export-${n}`}>
              {renderCard(n, (el) => {
                cardRefs.current[n - 1] = el;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const base =
    "mt-1 w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 font-mono text-xs text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none";
  return (
    <label className="block text-sm text-[#8E8E93]">
      {label}
      {rows > 1 ? (
        <textarea
          className={`${base} min-h-[72px] resize-y`}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className={base}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
      )}
    </label>
  );
}

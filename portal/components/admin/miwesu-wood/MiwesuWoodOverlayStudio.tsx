"use client";

import { Inter } from "next/font/google";
import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import thermalSquare from "./mww-thermal-square.module.css";
import thermalVertical from "./mww-thermal-vertical.module.css";
import braaiSquare from "./mww-braai-mix-square.module.css";
import braaiVertical from "./mww-braai-mix-vertical.module.css";
import balancedSquare from "./mww-balanced-square.module.css";
import balancedVertical from "./mww-balanced-vertical.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-mww-thermal",
  display: "swap",
});

export const MWW_OVERLAY_JSON_TEMPLATE_ID = "miwesu-wood-overlay";
export const MWW_OVERLAY_JSON_VERSION = 2;

export type MwwPresetId =
  | "thermal-dynamics"
  | "braai-mix"
  | "balanced-burn";

export const MWW_OVERLAY_PRESETS: { id: MwwPresetId; label: string }[] = [
  {
    id: "thermal-dynamics",
    label: "Thermal dynamics — ember hero + spec chips (Sekelbos-style)",
  },
  {
    id: "braai-mix",
    label: "Braai mix — glass card (vertical) + gold split title (square)",
  },
  {
    id: "balanced-burn",
    label: "Balanced burn — golden flame hero (Geelhaak-style)",
  },
];

const THERMAL_KEYS = [
  "statusPill",
  "weightTag",
  "productTitle",
  "tagline",
  "spec1Label",
  "spec1Value",
  "spec2Label",
  "spec2Value",
  "spec3Label",
  "spec3Value",
  "spec4Label",
  "spec4Value",
  "priceLine",
  "perBagLabel",
  "ctaLabel",
] as const;

const BRAAI_MIX_KEYS = [
  "weightBadge",
  "mixLabel",
  "productTitle",
  "tagline",
  "wood1Name",
  "wood1Trait",
  "wood2Name",
  "wood2Trait",
  "priceLine",
  "logisticsLine",
  "ctaLabel",
  "pill1",
  "pill2",
  "titleWord1",
  "titleWord2",
  "desc",
  "woodBlock1Title",
  "woodBlock1Desc",
  "woodBlock2Title",
  "woodBlock2Desc",
  "perBagLabel",
] as const;

type ThermalCopyKey = (typeof THERMAL_KEYS)[number];
type BraaiCopyKey = (typeof BRAAI_MIX_KEYS)[number];

const DEFAULT_THERMAL: Record<ThermalCopyKey, string> = {
  statusPill: "The Braai Favorite",
  weightTag: "10kg Premium Bag",
  productTitle: "Sekelbos.",
  tagline:
    "High heat. Zero hassle. A perfectly clean burn.",
  spec1Label: "Min. Order",
  spec1Value: "50 Bags",
  spec2Label: "Delivery",
  spec2Value: "Free (Gauteng)",
  spec3Label: "Burn Profile",
  spec3Value: "Smokeless",
  spec4Label: "Best For",
  spec4Value: "High-Heat Searing",
  priceLine: "R35.00",
  perBagLabel: "Per Bag",
  ctaLabel: "Order Now",
};

const DEFAULT_BALANCED: Record<ThermalCopyKey, string> = {
  statusPill: "The All-Rounder",
  weightTag: "10kg Premium Bag",
  productTitle: "Geelhaak.",
  tagline:
    "The perfect balance. Bright crackling flames that transition into enduring, steady coals.",
  spec1Label: "Min. Order",
  spec1Value: "50 Bags",
  spec2Label: "Delivery",
  spec2Value: "Free (Gauteng)",
  spec3Label: "Flame",
  spec3Value: "Bright crackling",
  spec4Label: "Coals",
  spec4Value: "Steady enduring",
  priceLine: "R35.00",
  perBagLabel: "Per Bag",
  ctaLabel: "Order Now",
};

const DEFAULT_BRAAI: Record<BraaiCopyKey, string> = {
  weightBadge: "10kg Bag",
  mixLabel: "The Ultimate Braai Mix",
  productTitle: "Master Blend.",
  tagline:
    "Gourmet aroma meets iron-hard coals. A curated combination of SA's finest hardwoods.",
  wood1Name: "Snuifpeul",
  wood1Trait: "Sweet, Musky Aroma",
  wood2Name: "Knoppiesdoring",
  wood2Trait: "Iron-Hard Coals",
  priceLine: "R35.00",
  logisticsLine: "Min 50 | Free Del (GP)",
  ctaLabel: "Order Now",
  pill1: "10kg Bag",
  pill2: "Premium Mix",
  titleWord1: "Master",
  titleWord2: "Blend.",
  desc: "Take the guesswork out of the perfect fire. Hand-selected for mouth-watering flavor and an easy light.",
  woodBlock1Title: "Snuifpeul & Knoppiesdoring",
  woodBlock1Desc: "Gourmet musky smoke meets iron-hard coals.",
  woodBlock2Title: "Free Gauteng Delivery",
  woodBlock2Desc: "Minimum order of 50 bags applies.",
  perBagLabel: "Per Bag",
};

type CopyByPreset = {
  "thermal-dynamics": Record<ThermalCopyKey, string>;
  "braai-mix": Record<BraaiCopyKey, string>;
  "balanced-burn": Record<ThermalCopyKey, string>;
};

function initialCopyByPreset(): CopyByPreset {
  return {
    "thermal-dynamics": { ...DEFAULT_THERMAL },
    "braai-mix": { ...DEFAULT_BRAAI },
    "balanced-burn": { ...DEFAULT_BALANCED },
  };
}

function keysForPreset(p: MwwPresetId): readonly string[] {
  if (p === "braai-mix") return BRAAI_MIX_KEYS;
  return THERMAL_KEYS;
}

function isPresetId(x: unknown): x is MwwPresetId {
  return (
    x === "thermal-dynamics" ||
    x === "braai-mix" ||
    x === "balanced-burn"
  );
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): MwwPresetId | null {
  const k = Object.keys(block);
  if (
    k.includes("mixLabel") ||
    k.includes("wood1Name") ||
    k.includes("pill1") ||
    k.includes("titleWord1")
  ) {
    return "braai-mix";
  }
  return null;
}

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

function exportSlug(p: MwwPresetId): string {
  if (p === "thermal-dynamics") return "thermal";
  if (p === "braai-mix") return "braai-mix";
  return "balanced-burn";
}

const PREVIEW_SQUARE = 420;
const VERT_PREVIEW_W = 315;
const VERT_PREVIEW_H = 560;

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

export function MiwesuWoodOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<MwwPresetId>("thermal-dynamics");
  const [copyByPreset, setCopyByPreset] = useState<CopyByPreset>(
    initialCopyByPreset,
  );

  const th = copyByPreset["thermal-dynamics"];
  const br = copyByPreset["braai-mix"];
  const bal = copyByPreset["balanced-burn"];

  const patchThermal = useCallback((key: ThermalCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "thermal-dynamics": { ...prev["thermal-dynamics"], [key]: value },
    }));
  }, []);

  const patchBalanced = useCallback((key: ThermalCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "balanced-burn": { ...prev["balanced-burn"], [key]: value },
    }));
  }, []);

  const patchBraai = useCallback((key: BraaiCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "braai-mix": { ...prev["braai-mix"], [key]: value },
    }));
  }, []);

  const [bgSquareDataUrl, setBgSquareDataUrl] = useState<string | null>(null);
  const [bgVerticalDataUrl, setBgVerticalDataUrl] = useState<string | null>(
    null,
  );

  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<null | "square" | "vertical">(
    null,
  );

  const [jsonPaste, setJsonPaste] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState(false);
  const [applyFlash, setApplyFlash] = useState(false);

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          template: MWW_OVERLAY_JSON_TEMPLATE_ID,
          version: MWW_OVERLAY_JSON_VERSION,
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
      typeof tmpl === "string" &&
      tmpl !== MWW_OVERLAY_JSON_TEMPLATE_ID
    ) {
      setJsonError(
        `Unknown template "${tmpl}". Use ${MWW_OVERLAY_JSON_TEMPLATE_ID}.`,
      );
      return;
    }

    const ver = root?.version;
    let targetPreset: MwwPresetId = preset;
    if (isPresetId(root?.preset)) {
      targetPreset = root.preset;
    } else if (ver === 1 || ver == null) {
      const inferred = inferPresetFromBlock(block);
      targetPreset = inferred ?? "thermal-dynamics";
    } else {
      targetPreset = inferPresetFromBlock(block) ?? "thermal-dynamics";
    }

    const keys = keysForPreset(targetPreset);
    const picked: Record<string, string> = {};
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const val = block[key];
        picked[key] = val == null ? "" : String(val);
      }
    }
    if (!Object.keys(picked).length) {
      setJsonError(`No recognised fields. Try: ${keys.join(", ")}`);
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

  const onPickSquare = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, setBgSquareDataUrl);
  };

  const onPickVertical = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, setBgVerticalDataUrl);
  };

  const clearSquare = () => {
    setBgSquareDataUrl(null);
    if (squareFileRef.current) squareFileRef.current.value = "";
  };

  const clearVertical = () => {
    setBgVerticalDataUrl(null);
    if (verticalFileRef.current) verticalFileRef.current.value = "";
  };

  const resetCopy = () => {
    setCopyByPreset((prev) => ({
      ...prev,
      [preset]:
        preset === "thermal-dynamics"
          ? { ...DEFAULT_THERMAL }
          : preset === "balanced-burn"
            ? { ...DEFAULT_BALANCED }
            : { ...DEFAULT_BRAAI },
    }));
  };

  const slug = exportSlug(preset);

  const downloadSquare = useCallback(async () => {
    const el = squareRef.current;
    if (!el) return;
    setExportError(null);
    setExporting("square");
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
      a.download = `mww-${slug}-square-1080-${Date.now()}.png`;
      a.click();
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Could not render square PNG.",
      );
    } finally {
      setExporting(null);
    }
  }, [slug]);

  const downloadVertical = useCallback(async () => {
    const el = verticalRef.current;
    if (!el) return;
    setExportError(null);
    setExporting("vertical");
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1920,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `mww-${slug}-vertical-9x16-${Date.now()}.png`;
      a.click();
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Could not render vertical PNG.",
      );
    } finally {
      setExporting(null);
    }
  }, [slug]);

  const scaleSquare = PREVIEW_SQUARE / 1080;
  const scaleVert = VERT_PREVIEW_W / 1080;

  const squareCanvas =
    preset === "braai-mix" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${braaiSquare.root}`}
        aria-label="Miwesu Wood braai mix square export"
      >
        <div className={braaiSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={braaiSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={braaiSquare.goldGlow} aria-hidden />
          <div className={braaiSquare.infoPanel}>
            <div className={braaiSquare.content}>
              <div className={braaiSquare.pillGroup}>
                <span className={braaiSquare.tagPill}>{br.pill1}</span>
                <span className={braaiSquare.tagPill}>{br.pill2}</span>
              </div>
              <h1 className={braaiSquare.productTitle}>
                <span className={braaiSquare.titleLine}>{br.titleWord1}</span>
                <span className={braaiSquare.titleLine}>
                  <span className={braaiSquare.titleHighlight}>
                    {br.titleWord2}
                  </span>
                </span>
              </h1>
              <p className={braaiSquare.desc}>{br.desc}</p>
              <div className={braaiSquare.woodList}>
                <div className={braaiSquare.woodDetail}>
                  <h4>{br.woodBlock1Title}</h4>
                  <p>{br.woodBlock1Desc}</p>
                </div>
                <div className={braaiSquare.woodDetail}>
                  <h4>{br.woodBlock2Title}</h4>
                  <p>{br.woodBlock2Desc}</p>
                </div>
              </div>
              <div className={braaiSquare.bottomBar}>
                <div className={braaiSquare.priceBox}>
                  <span className={braaiSquare.price}>{br.priceLine}</span>
                  <span className={braaiSquare.terms}>{br.perBagLabel}</span>
                </div>
                <button type="button" className={braaiSquare.ctaBtn}>
                  {br.ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "balanced-burn" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${balancedSquare.root}`}
        aria-label="Miwesu Wood balanced burn square export"
      >
        <div className={balancedSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={balancedSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={balancedSquare.fadeLayer} aria-hidden />
          <div className={balancedSquare.amberAura} aria-hidden />
          <div className={balancedSquare.content}>
            <div className={balancedSquare.statusPill}>
              <div className={balancedSquare.statusDot} aria-hidden />
              <span className={balancedSquare.statusText}>{bal.statusPill}</span>
            </div>
            <div className={balancedSquare.weightTag}>{bal.weightTag}</div>
            <h1 className={balancedSquare.productTitle}>{bal.productTitle}</h1>
            <p className={balancedSquare.tagline}>{bal.tagline}</p>
            <div className={balancedSquare.specsGrid}>
              <div className={balancedSquare.specItem}>
                <span className={balancedSquare.specLabel}>
                  {bal.spec1Label}
                </span>
                <span className={balancedSquare.specValue}>
                  {bal.spec1Value}
                </span>
              </div>
              <div className={balancedSquare.specItem}>
                <span className={balancedSquare.specLabel}>
                  {bal.spec2Label}
                </span>
                <span className={balancedSquare.specValue}>
                  {bal.spec2Value}
                </span>
              </div>
              <div className={balancedSquare.specItem}>
                <span className={balancedSquare.specLabel}>
                  {bal.spec3Label}
                </span>
                <span className={balancedSquare.specValue}>
                  {bal.spec3Value}
                </span>
              </div>
              <div className={balancedSquare.specItem}>
                <span className={balancedSquare.specLabel}>
                  {bal.spec4Label}
                </span>
                <span className={balancedSquare.specValue}>
                  {bal.spec4Value}
                </span>
              </div>
            </div>
            <div className={balancedSquare.actionRow}>
              <div className={balancedSquare.priceBlock}>
                <span className={balancedSquare.price}>{bal.priceLine}</span>
                <span className={balancedSquare.perBag}>{bal.perBagLabel}</span>
              </div>
              <button type="button" className={balancedSquare.ctaBtn}>
                {bal.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={squareRef}
        className={`${inter.variable} ${thermalSquare.root}`}
        aria-label="Miwesu Wood thermal square export"
      >
        <div className={thermalSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={thermalSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={thermalSquare.fadeLayer} aria-hidden />
          <div className={thermalSquare.emberAura} aria-hidden />
          <div className={thermalSquare.content}>
            <div className={thermalSquare.statusPill}>
              <div className={thermalSquare.statusDot} aria-hidden />
              <span className={thermalSquare.statusText}>{th.statusPill}</span>
            </div>
            <h1 className={thermalSquare.productTitle}>{th.productTitle}</h1>
            <p className={thermalSquare.tagline}>{th.tagline}</p>
            <div className={thermalSquare.specsGrid}>
              <div className={thermalSquare.specItem}>
                <span className={thermalSquare.specLabel}>{th.spec1Label}</span>
                <span className={thermalSquare.specValue}>{th.spec1Value}</span>
              </div>
              <div className={thermalSquare.specItem}>
                <span className={thermalSquare.specLabel}>{th.spec2Label}</span>
                <span className={thermalSquare.specValue}>{th.spec2Value}</span>
              </div>
              <div className={thermalSquare.specItem}>
                <span className={thermalSquare.specLabel}>{th.spec3Label}</span>
                <span className={thermalSquare.specValue}>{th.spec3Value}</span>
              </div>
              <div className={thermalSquare.specItem}>
                <span className={thermalSquare.specLabel}>{th.spec4Label}</span>
                <span className={thermalSquare.specValue}>{th.spec4Value}</span>
              </div>
            </div>
            <div className={thermalSquare.actionRow}>
              <div className={thermalSquare.priceBlock}>
                <span className={thermalSquare.price}>{th.priceLine}</span>
                <span className={thermalSquare.perBag}>{th.perBagLabel}</span>
              </div>
              <button type="button" className={thermalSquare.ctaBtn}>
                {th.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const verticalCanvas =
    preset === "braai-mix" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${braaiVertical.root}`}
        aria-label="Miwesu Wood braai mix vertical export"
      >
        <div className={braaiVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={braaiVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={braaiVertical.vignette} aria-hidden />
          <div className={braaiVertical.topBar}>
            <div className={braaiVertical.weightBadge}>{br.weightBadge}</div>
          </div>
          <div className={braaiVertical.glassCard}>
            <div className={braaiVertical.mixLabel}>{br.mixLabel}</div>
            <h1 className={braaiVertical.productTitle}>{br.productTitle}</h1>
            <p className={braaiVertical.tagline}>{br.tagline}</p>
            <div className={braaiVertical.blendSpecs}>
              <div className={braaiVertical.blendItem}>
                <div className={braaiVertical.woodType}>{br.wood1Name}</div>
                <div className={braaiVertical.woodTrait}>{br.wood1Trait}</div>
              </div>
              <div className={braaiVertical.blendItem}>
                <div className={braaiVertical.woodType}>{br.wood2Name}</div>
                <div className={braaiVertical.woodTrait}>{br.wood2Trait}</div>
              </div>
            </div>
            <div className={braaiVertical.actionRow}>
              <div className={braaiVertical.priceCol}>
                <span className={braaiVertical.price}>{br.priceLine}</span>
                <span className={braaiVertical.logistics}>{br.logisticsLine}</span>
              </div>
              <button type="button" className={braaiVertical.ctaBtn}>
                {br.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "balanced-burn" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${balancedVertical.root}`}
        aria-label="Miwesu Wood balanced burn vertical export"
      >
        <div className={balancedVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={balancedVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={balancedVertical.cinematicFade} aria-hidden />
          <div className={balancedVertical.statusPill}>
            <div className={balancedVertical.statusDot} aria-hidden />
            <span className={balancedVertical.statusText}>{bal.statusPill}</span>
          </div>
          <div className={balancedVertical.content}>
            <div className={balancedVertical.weightTag}>{bal.weightTag}</div>
            <h1 className={balancedVertical.productTitle}>{bal.productTitle}</h1>
            <p className={balancedVertical.tagline}>{bal.tagline}</p>
            <div className={balancedVertical.specsGrid}>
              <div className={balancedVertical.specChip}>
                <span className={balancedVertical.chipLabel}>
                  {bal.spec1Label}
                </span>
                <span className={balancedVertical.chipValue}>
                  {bal.spec1Value}
                </span>
              </div>
              <div className={balancedVertical.specChip}>
                <span className={balancedVertical.chipLabel}>
                  {bal.spec2Label}
                </span>
                <span className={balancedVertical.chipValue}>
                  {bal.spec2Value}
                </span>
              </div>
            </div>
            <div className={balancedVertical.actionRow}>
              <div className={balancedVertical.priceBlock}>
                <span className={balancedVertical.price}>{bal.priceLine}</span>
                <span className={balancedVertical.perBag}>{bal.perBagLabel}</span>
              </div>
              <button type="button" className={balancedVertical.ctaBtn}>
                {bal.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${thermalVertical.root}`}
        aria-label="Miwesu Wood thermal vertical export"
      >
        <div className={thermalVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={thermalVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={thermalVertical.cinematicFade} aria-hidden />
          <div className={thermalVertical.statusPill}>
            <div className={thermalVertical.statusDot} aria-hidden />
            <span className={thermalVertical.statusText}>{th.statusPill}</span>
          </div>
          <div className={thermalVertical.content}>
            <div className={thermalVertical.weightTag}>{th.weightTag}</div>
            <h1 className={thermalVertical.productTitle}>{th.productTitle}</h1>
            <p className={thermalVertical.tagline}>{th.tagline}</p>
            <div className={thermalVertical.specsGrid}>
              <div className={thermalVertical.specChip}>
                <span className={thermalVertical.chipLabel}>
                  {th.spec1Label}
                </span>
                <span className={thermalVertical.chipValue}>
                  {th.spec1Value}
                </span>
              </div>
              <div className={thermalVertical.specChip}>
                <span className={thermalVertical.chipLabel}>
                  {th.spec2Label}
                </span>
                <span className={thermalVertical.chipValue}>
                  {th.spec2Value}
                </span>
              </div>
              <div className={thermalVertical.specChip}>
                <span className={thermalVertical.chipLabel}>
                  {th.spec3Label}
                </span>
                <span className={thermalVertical.chipValue}>
                  {th.spec3Value}
                </span>
              </div>
            </div>
            <div className={thermalVertical.actionRow}>
              <div className={thermalVertical.priceBlock}>
                <span className={thermalVertical.price}>{th.priceLine}</span>
                <span className={thermalVertical.perBag}>{th.perBagLabel}</span>
              </div>
              <button type="button" className={thermalVertical.ctaBtn}>
                {th.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const previewLabel =
    preset === "thermal-dynamics"
      ? "Thermal dynamics"
      : preset === "braai-mix"
        ? "Braai mix"
        : "Balanced burn";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Template preset
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as MwwPresetId)}
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {MWW_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Hero images
          </p>
          <div className="space-y-2">
            <label className="text-xs text-[#8E8E93]">Square 1:1</label>
            <input
              ref={squareFileRef}
              type="file"
              accept="image/*"
              onChange={onPickSquare}
              className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
            />
            {bgSquareDataUrl ? (
              <button
                type="button"
                onClick={clearSquare}
                className="text-xs text-[#8E8E93] underline hover:text-white"
              >
                Remove square image
              </button>
            ) : null}
          </div>
          <div className="space-y-2 border-t border-white/10 pt-3">
            <label className="text-xs text-[#8E8E93]">Vertical 9:16</label>
            <input
              ref={verticalFileRef}
              type="file"
              accept="image/*"
              onChange={onPickVertical}
              className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
            />
            {bgVerticalDataUrl ? (
              <button
                type="button"
                onClick={clearVertical}
                className="text-xs text-[#8E8E93] underline hover:text-white"
              >
                Remove vertical image
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
          {preset === "braai-mix" ? (
            <>
              <p className="text-xs font-medium text-[#8E8E93]">
                Vertical (glass card)
              </p>
              <Field
                label="Weight badge (top bar)"
                value={br.weightBadge}
                onChange={(x) => patchBraai("weightBadge", x)}
              />
              <Field
                label="Mix label (gold, above title)"
                value={br.mixLabel}
                onChange={(x) => patchBraai("mixLabel", x)}
              />
              <Field
                label="Product title"
                value={br.productTitle}
                onChange={(x) => patchBraai("productTitle", x)}
              />
              <Field
                label="Tagline"
                value={br.tagline}
                onChange={(x) => patchBraai("tagline", x)}
                rows={3}
              />
              <Field
                label="Wood 1 — name"
                value={br.wood1Name}
                onChange={(x) => patchBraai("wood1Name", x)}
              />
              <Field
                label="Wood 1 — trait"
                value={br.wood1Trait}
                onChange={(x) => patchBraai("wood1Trait", x)}
              />
              <Field
                label="Wood 2 — name"
                value={br.wood2Name}
                onChange={(x) => patchBraai("wood2Name", x)}
              />
              <Field
                label="Wood 2 — trait"
                value={br.wood2Trait}
                onChange={(x) => patchBraai("wood2Trait", x)}
              />
              <Field
                label="Price"
                value={br.priceLine}
                onChange={(x) => patchBraai("priceLine", x)}
              />
              <Field
                label="Logistics line (under price)"
                value={br.logisticsLine}
                onChange={(x) => patchBraai("logisticsLine", x)}
              />
              <Field
                label="CTA"
                value={br.ctaLabel}
                onChange={(x) => patchBraai("ctaLabel", x)}
              />
              <p className="text-xs font-medium text-[#8E8E93] pt-2 border-t border-white/10">
                Square (split title + wood list)
              </p>
              <Field
                label="Tag pill 1"
                value={br.pill1}
                onChange={(x) => patchBraai("pill1", x)}
              />
              <Field
                label="Tag pill 2"
                value={br.pill2}
                onChange={(x) => patchBraai("pill2", x)}
              />
              <Field
                label="Title line 1 (silver gradient)"
                value={br.titleWord1}
                onChange={(x) => patchBraai("titleWord1", x)}
              />
              <Field
                label="Title line 2 (gold gradient)"
                value={br.titleWord2}
                onChange={(x) => patchBraai("titleWord2", x)}
              />
              <Field
                label="Description"
                value={br.desc}
                onChange={(x) => patchBraai("desc", x)}
                rows={3}
              />
              <Field
                label="Wood block 1 — heading"
                value={br.woodBlock1Title}
                onChange={(x) => patchBraai("woodBlock1Title", x)}
              />
              <Field
                label="Wood block 1 — body"
                value={br.woodBlock1Desc}
                onChange={(x) => patchBraai("woodBlock1Desc", x)}
                rows={2}
              />
              <Field
                label="Wood block 2 — heading"
                value={br.woodBlock2Title}
                onChange={(x) => patchBraai("woodBlock2Title", x)}
              />
              <Field
                label="Wood block 2 — body"
                value={br.woodBlock2Desc}
                onChange={(x) => patchBraai("woodBlock2Desc", x)}
                rows={2}
              />
              <Field
                label="Per-bag label (under price)"
                value={br.perBagLabel}
                onChange={(x) => patchBraai("perBagLabel", x)}
              />
            </>
          ) : preset === "balanced-burn" ? (
            <>
              <Field
                label="Status pill"
                value={bal.statusPill}
                onChange={(x) => patchBalanced("statusPill", x)}
              />
              <Field
                label="Weight line (vertical; square shows under pill)"
                value={bal.weightTag}
                onChange={(x) => patchBalanced("weightTag", x)}
              />
              <Field
                label="Product title"
                value={bal.productTitle}
                onChange={(x) => patchBalanced("productTitle", x)}
              />
              <Field
                label="Tagline"
                value={bal.tagline}
                onChange={(x) => patchBalanced("tagline", x)}
                rows={3}
              />
              <p className="text-xs text-[#8E8E93]">
                Vertical: first two specs in a row. Square: all four in a 2×2
                grid.
              </p>
              <Field
                label="Spec 1 label"
                value={bal.spec1Label}
                onChange={(x) => patchBalanced("spec1Label", x)}
              />
              <Field
                label="Spec 1 value"
                value={bal.spec1Value}
                onChange={(x) => patchBalanced("spec1Value", x)}
              />
              <Field
                label="Spec 2 label"
                value={bal.spec2Label}
                onChange={(x) => patchBalanced("spec2Label", x)}
              />
              <Field
                label="Spec 2 value"
                value={bal.spec2Value}
                onChange={(x) => patchBalanced("spec2Value", x)}
              />
              <Field
                label="Spec 3 label (square)"
                value={bal.spec3Label}
                onChange={(x) => patchBalanced("spec3Label", x)}
              />
              <Field
                label="Spec 3 value"
                value={bal.spec3Value}
                onChange={(x) => patchBalanced("spec3Value", x)}
              />
              <Field
                label="Spec 4 label (square)"
                value={bal.spec4Label}
                onChange={(x) => patchBalanced("spec4Label", x)}
              />
              <Field
                label="Spec 4 value"
                value={bal.spec4Value}
                onChange={(x) => patchBalanced("spec4Value", x)}
              />
              <Field
                label="Price line"
                value={bal.priceLine}
                onChange={(x) => patchBalanced("priceLine", x)}
              />
              <Field
                label="Per-bag subtitle"
                value={bal.perBagLabel}
                onChange={(x) => patchBalanced("perBagLabel", x)}
              />
              <Field
                label="CTA label"
                value={bal.ctaLabel}
                onChange={(x) => patchBalanced("ctaLabel", x)}
              />
            </>
          ) : (
            <>
              <Field
                label="Status pill (vertical: top-left; square: above title)"
                value={th.statusPill}
                onChange={(x) => patchThermal("statusPill", x)}
              />
              <Field
                label="Weight line (vertical only — above title)"
                value={th.weightTag}
                onChange={(x) => patchThermal("weightTag", x)}
              />
              <Field
                label="Product title"
                value={th.productTitle}
                onChange={(x) => patchThermal("productTitle", x)}
              />
              <Field
                label="Tagline"
                value={th.tagline}
                onChange={(x) => patchThermal("tagline", x)}
                rows={3}
              />
              <p className="text-xs text-[#8E8E93]">
                Specs: vertical uses the first three rows as chips; square uses
                all four in a 2×2 grid.
              </p>
              <Field
                label="Spec 1 label"
                value={th.spec1Label}
                onChange={(x) => patchThermal("spec1Label", x)}
              />
              <Field
                label="Spec 1 value"
                value={th.spec1Value}
                onChange={(x) => patchThermal("spec1Value", x)}
              />
              <Field
                label="Spec 2 label"
                value={th.spec2Label}
                onChange={(x) => patchThermal("spec2Label", x)}
              />
              <Field
                label="Spec 2 value"
                value={th.spec2Value}
                onChange={(x) => patchThermal("spec2Value", x)}
              />
              <Field
                label="Spec 3 label"
                value={th.spec3Label}
                onChange={(x) => patchThermal("spec3Label", x)}
              />
              <Field
                label="Spec 3 value"
                value={th.spec3Value}
                onChange={(x) => patchThermal("spec3Value", x)}
              />
              <Field
                label="Spec 4 label (square grid)"
                value={th.spec4Label}
                onChange={(x) => patchThermal("spec4Label", x)}
              />
              <Field
                label="Spec 4 value"
                value={th.spec4Value}
                onChange={(x) => patchThermal("spec4Value", x)}
              />
              <Field
                label="Price line"
                value={th.priceLine}
                onChange={(x) => patchThermal("priceLine", x)}
              />
              <Field
                label="Per-bag subtitle"
                value={th.perBagLabel}
                onChange={(x) => patchThermal("perBagLabel", x)}
              />
              <Field
                label="CTA label"
                value={th.ctaLabel}
                onChange={(x) => patchThermal("ctaLabel", x)}
              />
            </>
          )}
        </div>

        <div className="space-y-3 rounded-md border border-orange-500/25 bg-orange-500/[0.07] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-200/90">
            JSON
          </p>
          <p className="text-xs text-[#8E8E93]">
            <code className="text-white/80">{MWW_OVERLAY_JSON_TEMPLATE_ID}</code>{" "}
            · v{MWW_OVERLAY_JSON_VERSION} ·{" "}
            <code className="text-white/80">preset</code>:{" "}
            <code className="text-white/80">thermal-dynamics</code>,{" "}
            <code className="text-white/80">braai-mix</code>,{" "}
            <code className="text-white/80">balanced-burn</code>. v1 exports
            without <code className="text-white/80">preset</code> still apply
            (inferred when possible).
          </p>
          <button
            type="button"
            onClick={copyJsonToClipboard}
            className="rounded-md bg-orange-500/20 px-3 py-1.5 text-xs font-semibold text-orange-100 hover:bg-orange-500/30"
          >
            {copyFlash ? "Copied" : "Copy JSON"}
          </button>
          <textarea
            readOnly
            value={exportJson}
            rows={20}
            className="w-full resize-y rounded-md border border-white/15 bg-black/60 px-2 py-2 font-mono text-[11px] leading-relaxed text-[#D1D1D6] focus:outline-none"
            spellCheck={false}
          />
          <textarea
            value={jsonPaste}
            onChange={(ev) => {
              setJsonPaste(ev.target.value);
              setJsonError(null);
            }}
            rows={8}
            placeholder={`{ "template": "${MWW_OVERLAY_JSON_TEMPLATE_ID}", "preset": "braai-mix", "copy": { ... } }`}
            className="w-full resize-y rounded-md border border-white/15 bg-black/50 px-2 py-2 font-mono text-[11px] text-white placeholder:text-white/25 focus:outline-none"
            spellCheck={false}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyJsonFromPaste}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Apply JSON
            </button>
            {applyFlash ? (
              <span className="text-xs text-orange-300">Applied.</span>
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
            Reset this preset’s copy to defaults
          </button>
          <button
            type="button"
            onClick={downloadSquare}
            disabled={exporting !== null}
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {exporting === "square"
              ? "Exporting…"
              : "Download square PNG (1080×1080)"}
          </button>
          <button
            type="button"
            onClick={downloadVertical}
            disabled={exporting !== null}
            className="rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
          >
            {exporting === "vertical"
              ? "Exporting…"
              : "Download vertical PNG (1080×1920)"}
          </button>
        </div>
        {exportError ? (
          <p className="text-sm text-red-300">{exportError}</p>
        ) : null}
      </div>

      <div className="flex min-w-0 w-full flex-1 flex-col gap-8 overflow-x-auto pb-1 lg:flex-row lg:flex-nowrap lg:items-start lg:gap-10">
        <div className="shrink-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Preview · square · {previewLabel}
          </p>
          <div
            className="overflow-hidden rounded-md border border-white/15 bg-black"
            style={{ width: PREVIEW_SQUARE, height: PREVIEW_SQUARE }}
          >
            <div
              style={{
                width: 1080,
                height: 1080,
                transform: `scale(${scaleSquare})`,
                transformOrigin: "top left",
              }}
            >
              {squareCanvas}
            </div>
          </div>
        </div>
        <div className="shrink-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Preview · vertical · {previewLabel}
          </p>
          <div
            className="overflow-hidden rounded-md border border-white/15 bg-black"
            style={{ width: VERT_PREVIEW_W, height: VERT_PREVIEW_H }}
          >
            <div
              style={{
                width: 1080,
                height: 1920,
                transform: `scale(${scaleVert})`,
                transformOrigin: "top left",
              }}
            >
              {verticalCanvas}
            </div>
          </div>
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
    "mt-1 w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none";
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

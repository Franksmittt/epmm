"use client";

import { Inter } from "next/font/google";
import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import streamSquare from "./vpb-data-stream-square.module.css";
import streamVertical from "./vpb-data-stream-vertical.module.css";
import notifySquare from "./vpb-notify-spatial-square.module.css";
import notifyVertical from "./vpb-notify-spatial-vertical.module.css";
import realitySquare from "./vpb-reality-distortion-square.module.css";
import realityVertical from "./vpb-reality-distortion-vertical.module.css";
import glassSquare from "./vpb-vision-glass-square.module.css";
import glassVertical from "./vpb-vision-glass-vertical.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-vpb",
  display: "swap",
});

export const VKW_BRAI_OVERLAY_JSON_TEMPLATE_ID = "vaalpenskraal-wood-braai-overlay";
export const VKW_BRAI_OVERLAY_JSON_VERSION = 1;

export type VkwBraiPresetId =
  | "data-stream"
  | "notify-spatial"
  | "reality-distortion"
  | "vision-glass";

export const VKW_BRAI_OVERLAY_PRESETS: { id: VkwBraiPresetId; label: string }[] =
  [
    {
      id: "data-stream",
      label: "Data Stream (Overclocked) — ticker + hero + glass HUD",
    },
    {
      id: "notify-spatial",
      label: "Notification Bubble (Spatial) — AR tag + speech bubbles",
    },
    {
      id: "reality-distortion",
      label:
        "Reality Distortion (Nightography) — typographic hero + squircle glass panel",
    },
    {
      id: "vision-glass",
      label:
        "Vision glass panel — frosted footer, detail grid, gradient CTA bar",
    },
  ];

const STREAM_KEYS = [
  "ticker1",
  "ticker2",
  "heroTitleSquare",
  "heroTitleVertical",
  "woodsSquare",
  "badgeSquare",
  "woodsVertical",
  "badgeVertical",
  "sqM1Label",
  "sqM1Value",
  "sqM2Label",
  "sqM2Value",
  "vtM1Label",
  "vtM1Value",
  "vtM2Label",
  "vtM2Value",
  "vtM3Label",
  "vtM3Value",
] as const;

const NOTIFY_KEYS = [
  "productNameSquare",
  "productNameVertical",
  "productSubSquare",
  "productSubVertical",
  "speechBeforeSquare",
  "speechHighlight",
  "speechLine1Vertical",
  "speechLine2Vertical",
  "subBubbleSquare",
  "subBubbleVertical",
  "whatsappLine",
] as const;

const REALITY_KEYS = [
  "villainCopy",
  "heroHeading",
  "subSquare",
  "subVertical",
  "floatingBadge",
  "priceCurrency",
  "priceNumber",
  "priceContext",
  "ctaLine",
] as const;

const GLASS_KEYS = [
  "brandName",
  "headlineSquare",
  "headlineVertical",
  "subheadSquare",
  "subheadVertical",
  "woodTypes",
  "sqD1Label",
  "sqD1Value",
  "sqD2Label",
  "sqD2Value",
  "vtD1Label",
  "vtD1Value",
  "vtD2Label",
  "vtD2Value",
  "vtD3Label",
  "vtD3Value",
  "ctaPriceMain",
  "ctaPriceSuffix",
  "ctaDeliveryLine1",
  "ctaDeliveryLine2",
] as const;

type StreamCopyKey = (typeof STREAM_KEYS)[number];
type NotifyCopyKey = (typeof NOTIFY_KEYS)[number];
type RealityCopyKey = (typeof REALITY_KEYS)[number];
type GlassCopyKey = (typeof GLASS_KEYS)[number];

const DEFAULT_STREAM: Record<StreamCopyKey, string> = {
  ticker1: "FREE GAUTENG DELIVERY",
  ticker2: "WA: 063 184 1939",
  heroTitleSquare: "Vaalpenskraal\nBraai Mix",
  heroTitleVertical: "Vaalpens\nkraal",
  woodsSquare: "SWARTHAAK / GEELHAAK",
  badgeSquare: "WHOLESALE DEAL",
  woodsVertical: "10KG PREMIUM MIX",
  badgeVertical: "WHOLESALE",
  sqM1Label: "Minimum Order QTY",
  sqM1Value: "50 x 10KG BAGS",
  sqM2Label: "Total Delivered",
  sqM2Value: "R1250",
  vtM1Label: "Minimum Order Quantity",
  vtM1Value: "50 x 10KG BAGS",
  vtM2Label: "Total Price (Delivered)",
  vtM2Value: "R1250",
  vtM3Label: "Dispatch Line",
  vtM3Value: "WA: 063 184 1939",
};

const DEFAULT_NOTIFY: Record<NotifyCopyKey, string> = {
  productNameSquare: "Vaalpenskraal",
  productNameVertical: "Vaalpens\nkraal",
  productSubSquare: "10KG PREMIUM BRAAI MIX",
  productSubVertical: "10KG BRAAI MIX",
  speechBeforeSquare: "50 x 10kg bags delivered for ",
  speechHighlight: "R1250",
  speechLine1Vertical: "50 x 10kg bags",
  speechLine2Vertical: "delivered for ",
  subBubbleSquare: "FREE DELIVERY ANYWHERE IN GAUTENG",
  subBubbleVertical: "FREE DELIVERY IN GAUTENG",
  whatsappLine: "WhatsApp: 063 184 1939",
};

const DEFAULT_REALITY: Record<RealityCopyKey, string> = {
  villainCopy: "Ordinary fires are dead.",
  heroHeading: "VAALPENS\nKRAAL.",
  subSquare:
    "10KG of Absolute Premium Hardwood.\nThe reinvention of the braai.",
  subVertical:
    "The reinvention of the braai. 10KG of absolute premium hardwood.",
  floatingBadge: "FREE GAUTENG DELIVERY",
  priceCurrency: "R",
  priceNumber: "1250",
  priceContext: "50 x 10KG Bags Delivered",
  ctaLine: "063 184 1939",
};

const DEFAULT_GLASS: Record<GlassCopyKey, string> = {
  brandName: "Vaalpenskraal",
  headlineSquare: "The Ultimate Burn.",
  headlineVertical: "Ignite the Elements.",
  subheadSquare: "Premium Brix Mix Firewood",
  subheadVertical: "Premium Brix Mix",
  woodTypes: "Swarthaak • Geelhaak • Kameeldoring",
  sqD1Label: "Bag Size",
  sqD1Value: "10kg",
  sqD2Label: "Min. Order",
  sqD2Value: "50 Bags",
  vtD1Label: "Price Per Bag",
  vtD1Value: "R25",
  vtD2Label: "Min. Order",
  vtD2Value: "50 Bags",
  vtD3Label: "Weight",
  vtD3Value: "10kg per bag",
  ctaPriceMain: "R1250",
  ctaPriceSuffix: "Total",
  ctaDeliveryLine1: "Free Delivery",
  ctaDeliveryLine2: "in Gauteng",
};

type CopyByPreset = {
  "data-stream": Record<StreamCopyKey, string>;
  "notify-spatial": Record<NotifyCopyKey, string>;
  "reality-distortion": Record<RealityCopyKey, string>;
  "vision-glass": Record<GlassCopyKey, string>;
};

function initialCopyByPreset(): CopyByPreset {
  return {
    "data-stream": { ...DEFAULT_STREAM },
    "notify-spatial": { ...DEFAULT_NOTIFY },
    "reality-distortion": { ...DEFAULT_REALITY },
    "vision-glass": { ...DEFAULT_GLASS },
  };
}

function keysForPreset(p: VkwBraiPresetId): readonly string[] {
  if (p === "data-stream") return STREAM_KEYS;
  if (p === "notify-spatial") return NOTIFY_KEYS;
  if (p === "reality-distortion") return REALITY_KEYS;
  return GLASS_KEYS;
}

function isPresetId(x: unknown): x is VkwBraiPresetId {
  return (
    x === "data-stream" ||
    x === "notify-spatial" ||
    x === "reality-distortion" ||
    x === "vision-glass"
  );
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): VkwBraiPresetId | null {
  const k = Object.keys(block);
  if (k.some((key) => GLASS_KEYS.includes(key as GlassCopyKey))) {
    return "vision-glass";
  }
  if (k.some((key) => REALITY_KEYS.includes(key as RealityCopyKey))) {
    return "reality-distortion";
  }
  if (k.some((key) => NOTIFY_KEYS.includes(key as NotifyCopyKey))) {
    return "notify-spatial";
  }
  if (k.some((key) => STREAM_KEYS.includes(key as StreamCopyKey))) {
    return "data-stream";
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

function exportSlug(p: VkwBraiPresetId): string {
  if (p === "data-stream") return "data-stream";
  if (p === "notify-spatial") return "notify-spatial";
  if (p === "reality-distortion") return "reality-distortion";
  return "vision-glass";
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

function titleLines(text: string): string[] {
  return text.split("\n").filter((l) => l.length > 0);
}

function WaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      aria-hidden
    >
      <path d="M12.031 0C5.385 0 0 5.388 0 12.034c0 2.124.553 4.195 1.603 6.015L.17 23.315l5.405-1.417a11.96 11.96 0 006.455 1.868h.005C18.68 23.766 24 18.38 24 11.734 24 5.388 18.682 0 12.031 0z" />
    </svg>
  );
}

function WaIconBlack({ size = 45 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#000000"
      aria-hidden
    >
      <path d="M12.031 0C5.385 0 0 5.388 0 12.034c0 2.124.553 4.195 1.603 6.015L.17 23.315l5.405-1.417a11.96 11.96 0 006.455 1.868h.005C18.68 23.766 24 18.38 24 11.734 24 5.388 18.682 0 12.031 0z" />
    </svg>
  );
}

export function VaalpenskraalWoodOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<VkwBraiPresetId>("data-stream");
  const [copyByPreset, setCopyByPreset] = useState<CopyByPreset>(
    initialCopyByPreset,
  );

  const s = copyByPreset["data-stream"];
  const n = copyByPreset["notify-spatial"];
  const r = copyByPreset["reality-distortion"];
  const g = copyByPreset["vision-glass"];

  const patchStream = useCallback((key: StreamCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "data-stream": { ...prev["data-stream"], [key]: value },
    }));
  }, []);

  const patchNotify = useCallback((key: NotifyCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "notify-spatial": { ...prev["notify-spatial"], [key]: value },
    }));
  }, []);

  const patchReality = useCallback((key: RealityCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "reality-distortion": { ...prev["reality-distortion"], [key]: value },
    }));
  }, []);

  const patchGlass = useCallback((key: GlassCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "vision-glass": { ...prev["vision-glass"], [key]: value },
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
          template: VKW_BRAI_OVERLAY_JSON_TEMPLATE_ID,
          version: VKW_BRAI_OVERLAY_JSON_VERSION,
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
      tmpl !== VKW_BRAI_OVERLAY_JSON_TEMPLATE_ID
    ) {
      setJsonError(
        `Unknown template "${String(tmpl)}". Use ${VKW_BRAI_OVERLAY_JSON_TEMPLATE_ID}.`,
      );
      return;
    }

    let targetPreset: VkwBraiPresetId = preset;
    if (isPresetId(root?.preset)) {
      targetPreset = root.preset;
    } else {
      targetPreset = inferPresetFromBlock(block) ?? "data-stream";
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
        preset === "data-stream"
          ? { ...DEFAULT_STREAM }
          : preset === "notify-spatial"
            ? { ...DEFAULT_NOTIFY }
            : preset === "reality-distortion"
              ? { ...DEFAULT_REALITY }
              : { ...DEFAULT_GLASS },
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
      a.download = `vpb-${slug}-square-1080-${Date.now()}.png`;
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
      a.download = `vpb-${slug}-vertical-9x16-${Date.now()}.png`;
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

  const previewLabel =
    preset === "data-stream"
      ? "Data Stream"
      : preset === "notify-spatial"
        ? "Notification Bubble (Spatial)"
        : preset === "reality-distortion"
          ? "Reality Distortion (Nightography)"
          : "Vision glass panel";

  const squareCanvas =
    preset === "data-stream" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${streamSquare.root}`}
        aria-label="Vaalpenskraal Data Stream square export"
      >
        <div className={streamSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={streamSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={streamSquare.edgeGradient} aria-hidden />
          <div className={streamSquare.uiLayer}>
            <div className={streamSquare.topBar}>
              <div className={streamSquare.topTicker}>
                <div className={streamSquare.tickerText}>{s.ticker1}</div>
                {s.ticker2.trim() ? (
                  <div className={streamSquare.tickerText}>{s.ticker2}</div>
                ) : null}
              </div>
              <h1 className={streamSquare.heroTitle}>
                {titleLines(s.heroTitleSquare).map((line, i) => (
                  <span key={i}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </h1>
            </div>
            <div className={streamSquare.bottomHud}>
              <div className={streamSquare.hudHeader}>
                <div className={streamSquare.woodsList}>{s.woodsSquare}</div>
                <div className={streamSquare.badge}>{s.badgeSquare}</div>
              </div>
              <div className={streamSquare.dataGrid}>
                <div className={streamSquare.metric}>
                  <div className={streamSquare.mLabel}>{s.sqM1Label}</div>
                  <div className={streamSquare.mVal}>{s.sqM1Value}</div>
                </div>
                <div
                  className={`${streamSquare.metric} ${streamSquare.metricRight}`}
                >
                  <div className={streamSquare.mLabel}>{s.sqM2Label}</div>
                  <div
                    className={`${streamSquare.mVal} ${streamSquare.mHighlight}`}
                  >
                    {s.sqM2Value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "notify-spatial" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${notifySquare.root}`}
        aria-label="Vaalpenskraal Notify Spatial square export"
      >
        <div className={notifySquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={notifySquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={notifySquare.edgeGradient} aria-hidden />
          <div className={notifySquare.uiLayer}>
            <div className={notifySquare.arTag}>
              <div className={notifySquare.arDot}>
                <span className={notifySquare.arDotRing} aria-hidden />
              </div>
              <div className={notifySquare.arLine} aria-hidden />
              <div>
                <div className={notifySquare.productName}>
                  {n.productNameSquare}
                </div>
                <div className={notifySquare.productSub}>
                  {n.productSubSquare}
                </div>
              </div>
            </div>
            <div className={notifySquare.bubbleCol}>
              <div className={notifySquare.speechBubble}>
                <span className={notifySquare.unreadDot} aria-hidden />
                {n.speechBeforeSquare}
                <span className={notifySquare.highlightText}>
                  {n.speechHighlight}
                </span>
              </div>
              <div className={notifySquare.subBubble}>{n.subBubbleSquare}</div>
              <div className={notifySquare.whatsappRow}>
                <div className={notifySquare.waIcon}>
                  <WaIcon size={20} />
                </div>
                {n.whatsappLine}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "reality-distortion" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${realitySquare.root}`}
        aria-label="Vaalpenskraal Reality Distortion square export"
      >
        <div className={realitySquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={realitySquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={realitySquare.topShadow} aria-hidden />
          <div className={realitySquare.bottomShadow} aria-hidden />
          <div className={realitySquare.topTypography}>
            <div className={realitySquare.villainCopy}>{r.villainCopy}</div>
            <h1 className={realitySquare.mainHeading}>
              {titleLines(r.heroHeading).map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h1>
            <div className={realitySquare.subHeading}>
              {titleLines(r.subSquare).map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </div>
          </div>
          <div className={realitySquare.footerUi}>
            <div className={realitySquare.floatingBadge}>{r.floatingBadge}</div>
            <div className={realitySquare.priceBlock}>
              <div className={realitySquare.priceTag}>
                <span className={realitySquare.priceCurrency}>
                  {r.priceCurrency}
                </span>
                {r.priceNumber}
              </div>
              <div className={realitySquare.priceContext}>{r.priceContext}</div>
            </div>
            <div className={realitySquare.ctaButton}>
              <WaIconBlack size={45} />
              {r.ctaLine}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={squareRef}
        className={`${inter.variable} ${glassSquare.root}`}
        aria-label="Vaalpenskraal Vision glass square export"
      >
        <div className={glassSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={glassSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={glassSquare.overlayGradient} aria-hidden />
          <div className={glassSquare.glassPanel}>
            <div className={glassSquare.brandName}>{g.brandName}</div>
            <h1 className={glassSquare.headline}>{g.headlineSquare}</h1>
            <h2 className={glassSquare.subhead}>{g.subheadSquare}</h2>
            <p className={glassSquare.woodTypes}>{g.woodTypes}</p>
            <div className={glassSquare.detailsGrid}>
              <div className={glassSquare.detailItem}>
                <h3 className={glassSquare.detailLabel}>{g.sqD1Label}</h3>
                <p className={glassSquare.detailValue}>{g.sqD1Value}</p>
              </div>
              <div className={glassSquare.detailItem}>
                <h3 className={glassSquare.detailLabel}>{g.sqD2Label}</h3>
                <p className={glassSquare.detailValue}>{g.sqD2Value}</p>
              </div>
            </div>
            <div className={glassSquare.ctaBar}>
              <div className={glassSquare.ctaPrice}>
                {g.ctaPriceMain}
                <span className={glassSquare.ctaPriceSuffix}>
                  {g.ctaPriceSuffix}
                </span>
              </div>
              <div className={glassSquare.ctaDelivery}>
                {g.ctaDeliveryLine1}
                <span className={glassSquare.ctaDeliverySub}>
                  {g.ctaDeliveryLine2}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const verticalCanvas =
    preset === "data-stream" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${streamVertical.root}`}
        aria-label="Vaalpenskraal Data Stream vertical export"
      >
        <div className={streamVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={streamVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={streamVertical.edgeGradient} aria-hidden />
          <div className={streamVertical.uiLayer}>
            <div className={streamVertical.topBar}>
              <div className={streamVertical.topTicker}>
                <div className={streamVertical.tickerText}>{s.ticker1}</div>
              </div>
              <h1 className={streamVertical.heroTitle}>
                {titleLines(s.heroTitleVertical).map((line, i) => (
                  <span key={i}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </h1>
            </div>
            <div className={streamVertical.bottomHud}>
              <div className={streamVertical.hudHeader}>
                <div className={streamVertical.woodsList}>{s.woodsVertical}</div>
                <div className={streamVertical.badge}>{s.badgeVertical}</div>
              </div>
              <div className={streamVertical.dataGrid}>
                <div className={streamVertical.metric}>
                  <div className={streamVertical.mLabel}>{s.vtM1Label}</div>
                  <div className={streamVertical.mVal}>{s.vtM1Value}</div>
                </div>
                <div className={streamVertical.metric}>
                  <div className={streamVertical.mLabel}>{s.vtM2Label}</div>
                  <div
                    className={`${streamVertical.mVal} ${streamVertical.mValLarge} ${streamVertical.mHighlight}`}
                  >
                    {s.vtM2Value}
                  </div>
                </div>
                <div
                  className={`${streamVertical.metric} ${streamVertical.metricDivider}`}
                >
                  <div className={streamVertical.mLabel}>{s.vtM3Label}</div>
                  <div
                    className={`${streamVertical.mVal} ${streamVertical.mValDispatch}`}
                  >
                    {s.vtM3Value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "notify-spatial" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${notifyVertical.root}`}
        aria-label="Vaalpenskraal Notify Spatial vertical export"
      >
        <div className={notifyVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={notifyVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={notifyVertical.edgeGradient} aria-hidden />
          <div className={notifyVertical.uiLayer}>
            <div className={notifyVertical.arTag}>
              <div className={notifyVertical.arDot}>
                <span className={notifyVertical.arDotRing} aria-hidden />
              </div>
              <div className={notifyVertical.arLine} aria-hidden />
              <div>
                <div className={notifyVertical.productName}>
                  {titleLines(n.productNameVertical).map((line, i) => (
                    <span key={i}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </div>
                <div className={notifyVertical.productSub}>
                  {n.productSubVertical}
                </div>
              </div>
            </div>
            <div className={notifyVertical.bubbleCol}>
              <div className={notifyVertical.speechBubble}>
                <span className={notifyVertical.unreadDot} aria-hidden />
                {n.speechLine1Vertical}
                <br />
                {n.speechLine2Vertical}
                <span className={notifyVertical.highlightText}>
                  {n.speechHighlight}
                </span>
              </div>
              <div className={notifyVertical.subBubble}>
                {n.subBubbleVertical}
              </div>
              <div className={notifyVertical.whatsappRow}>
                <div className={notifyVertical.waIcon}>
                  <WaIcon size={26} />
                </div>
                {n.whatsappLine}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "reality-distortion" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${realityVertical.root}`}
        aria-label="Vaalpenskraal Reality Distortion vertical export"
      >
        <div className={realityVertical.adCanvas}>
          <div className={realityVertical.particleSwarm} aria-hidden />
          <div className={realityVertical.heroMaskWrap}>
            {bgVerticalDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={realityVertical.heroBg}
                src={bgVerticalDataUrl}
                alt=""
              />
            ) : null}
          </div>
          <div className={realityVertical.typographyLayer}>
            <div className={realityVertical.villainCopy}>{r.villainCopy}</div>
            <h1 className={realityVertical.heroCopy}>
              {titleLines(r.heroHeading).map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h1>
            <p className={realityVertical.heroSub}>{r.subVertical}</p>
          </div>
          <div className={realityVertical.uiLayer}>
            <div className={realityVertical.squirclePanel}>
              <div className={realityVertical.floatingBadge}>
                {r.floatingBadge}
              </div>
              <div className={realityVertical.priceData}>
                <div className={realityVertical.priceTag}>
                  <span className={realityVertical.priceCurrency}>
                    {r.priceCurrency}
                  </span>
                  {r.priceNumber}
                </div>
                <div className={realityVertical.priceContext}>
                  {r.priceContext}
                </div>
              </div>
              <div className={realityVertical.ctaButton}>
                <WaIconBlack size={45} />
                {r.ctaLine}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${glassVertical.root}`}
        aria-label="Vaalpenskraal Vision glass vertical export"
      >
        <div className={glassVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={glassVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={glassVertical.overlayGradient} aria-hidden />
          <div className={glassVertical.glassPanel}>
            <div className={glassVertical.brandName}>{g.brandName}</div>
            <h1 className={glassVertical.headline}>{g.headlineVertical}</h1>
            <h2 className={glassVertical.subhead}>{g.subheadVertical}</h2>
            <p className={glassVertical.woodTypes}>{g.woodTypes}</p>
            <div className={glassVertical.detailsGrid}>
              <div className={glassVertical.detailItem}>
                <h3 className={glassVertical.detailLabel}>{g.vtD1Label}</h3>
                <p className={glassVertical.detailValue}>{g.vtD1Value}</p>
              </div>
              <div className={glassVertical.detailItem}>
                <h3 className={glassVertical.detailLabel}>{g.vtD2Label}</h3>
                <p className={glassVertical.detailValue}>{g.vtD2Value}</p>
              </div>
              <div
                className={`${glassVertical.detailItem} ${glassVertical.detailSpan2}`}
              >
                <h3 className={glassVertical.detailLabel}>{g.vtD3Label}</h3>
                <p className={glassVertical.detailValue}>{g.vtD3Value}</p>
              </div>
            </div>
            <div className={glassVertical.ctaBar}>
              <div className={glassVertical.ctaPrice}>
                {g.ctaPriceMain}
                <span className={glassVertical.ctaPriceSuffix}>
                  {g.ctaPriceSuffix}
                </span>
              </div>
              <div className={glassVertical.ctaDelivery}>
                {g.ctaDeliveryLine1}
                <span className={glassVertical.ctaDeliverySub}>
                  {g.ctaDeliveryLine2}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={`${inter.variable} flex flex-col gap-8 lg:flex-row`}>
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Braai mix template
          </label>
          <select
            value={preset}
            onChange={(e) =>
              setPreset(e.target.value as VkwBraiPresetId)
            }
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            aria-label="Vaalpenskraal braai overlay preset"
          >
            {VKW_BRAI_OVERLAY_PRESETS.map((p) => (
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

        {preset === "data-stream" ? (
          <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase text-[#8E8E93]">
              Data Stream copy
            </p>
            <Field label="Ticker 1" value={s.ticker1} onChange={(v) => patchStream("ticker1", v)} />
            <Field label="Ticker 2 (square only; hidden on vertical)" value={s.ticker2} onChange={(v) => patchStream("ticker2", v)} />
            <Field label="Hero title · square (use line break for two lines)" value={s.heroTitleSquare} onChange={(v) => patchStream("heroTitleSquare", v)} rows={2} />
            <Field label="Hero title · vertical" value={s.heroTitleVertical} onChange={(v) => patchStream("heroTitleVertical", v)} rows={2} />
            <Field label="HUD woods line · square" value={s.woodsSquare} onChange={(v) => patchStream("woodsSquare", v)} />
            <Field label="HUD badge · square" value={s.badgeSquare} onChange={(v) => patchStream("badgeSquare", v)} />
            <Field label="HUD woods line · vertical" value={s.woodsVertical} onChange={(v) => patchStream("woodsVertical", v)} />
            <Field label="HUD badge · vertical" value={s.badgeVertical} onChange={(v) => patchStream("badgeVertical", v)} />
            <Field label="Square metric 1 label" value={s.sqM1Label} onChange={(v) => patchStream("sqM1Label", v)} />
            <Field label="Square metric 1 value" value={s.sqM1Value} onChange={(v) => patchStream("sqM1Value", v)} />
            <Field label="Square metric 2 label" value={s.sqM2Label} onChange={(v) => patchStream("sqM2Label", v)} />
            <Field label="Square metric 2 value" value={s.sqM2Value} onChange={(v) => patchStream("sqM2Value", v)} />
            <Field label="Vertical metric 1 label" value={s.vtM1Label} onChange={(v) => patchStream("vtM1Label", v)} />
            <Field label="Vertical metric 1 value" value={s.vtM1Value} onChange={(v) => patchStream("vtM1Value", v)} />
            <Field label="Vertical metric 2 label" value={s.vtM2Label} onChange={(v) => patchStream("vtM2Label", v)} />
            <Field label="Vertical metric 2 value" value={s.vtM2Value} onChange={(v) => patchStream("vtM2Value", v)} />
            <Field label="Vertical metric 3 label" value={s.vtM3Label} onChange={(v) => patchStream("vtM3Label", v)} />
            <Field label="Vertical metric 3 value" value={s.vtM3Value} onChange={(v) => patchStream("vtM3Value", v)} />
          </div>
        ) : preset === "notify-spatial" ? (
          <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase text-[#8E8E93]">
              Notification Bubble copy
            </p>
            <Field label="Product name · square" value={n.productNameSquare} onChange={(v) => patchNotify("productNameSquare", v)} />
            <Field label="Product name · vertical (line break for two lines)" value={n.productNameVertical} onChange={(v) => patchNotify("productNameVertical", v)} rows={2} />
            <Field label="Product sub · square" value={n.productSubSquare} onChange={(v) => patchNotify("productSubSquare", v)} />
            <Field label="Product sub · vertical" value={n.productSubVertical} onChange={(v) => patchNotify("productSubVertical", v)} />
            <Field label="Speech before highlight · square" value={n.speechBeforeSquare} onChange={(v) => patchNotify("speechBeforeSquare", v)} />
            <Field label="Speech highlight (e.g. price)" value={n.speechHighlight} onChange={(v) => patchNotify("speechHighlight", v)} />
            <Field label="Speech line 1 · vertical" value={n.speechLine1Vertical} onChange={(v) => patchNotify("speechLine1Vertical", v)} />
            <Field label="Speech line 2 · vertical (before highlight)" value={n.speechLine2Vertical} onChange={(v) => patchNotify("speechLine2Vertical", v)} />
            <Field label="Sub bubble · square" value={n.subBubbleSquare} onChange={(v) => patchNotify("subBubbleSquare", v)} />
            <Field label="Sub bubble · vertical" value={n.subBubbleVertical} onChange={(v) => patchNotify("subBubbleVertical", v)} />
            <Field label="WhatsApp row" value={n.whatsappLine} onChange={(v) => patchNotify("whatsappLine", v)} />
          </div>
        ) : preset === "reality-distortion" ? (
          <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase text-[#8E8E93]">
              Reality Distortion copy
            </p>
            <Field label="Villain / urgency line" value={r.villainCopy} onChange={(v) => patchReality("villainCopy", v)} />
            <Field label="Hero heading (line break for two lines)" value={r.heroHeading} onChange={(v) => patchReality("heroHeading", v)} rows={2} />
            <Field label="Sub copy · square" value={r.subSquare} onChange={(v) => patchReality("subSquare", v)} rows={3} />
            <Field label="Sub copy · vertical" value={r.subVertical} onChange={(v) => patchReality("subVertical", v)} rows={3} />
            <Field label="Floating badge" value={r.floatingBadge} onChange={(v) => patchReality("floatingBadge", v)} />
            <Field label="Price currency (superscript, e.g. R)" value={r.priceCurrency} onChange={(v) => patchReality("priceCurrency", v)} />
            <Field label="Price number" value={r.priceNumber} onChange={(v) => patchReality("priceNumber", v)} />
            <Field label="Price context line" value={r.priceContext} onChange={(v) => patchReality("priceContext", v)} />
            <Field label="CTA / WhatsApp number" value={r.ctaLine} onChange={(v) => patchReality("ctaLine", v)} />
          </div>
        ) : (
          <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase text-[#8E8E93]">
              Vision glass panel copy
            </p>
            <Field label="Brand name" value={g.brandName} onChange={(v) => patchGlass("brandName", v)} />
            <Field label="Headline · square" value={g.headlineSquare} onChange={(v) => patchGlass("headlineSquare", v)} />
            <Field label="Headline · vertical" value={g.headlineVertical} onChange={(v) => patchGlass("headlineVertical", v)} />
            <Field label="Subhead · square" value={g.subheadSquare} onChange={(v) => patchGlass("subheadSquare", v)} />
            <Field label="Subhead · vertical" value={g.subheadVertical} onChange={(v) => patchGlass("subheadVertical", v)} />
            <Field label="Wood types line" value={g.woodTypes} onChange={(v) => patchGlass("woodTypes", v)} />
            <p className="text-[11px] uppercase tracking-wide text-[#8E8E93]">
              Square detail tiles (2-up)
            </p>
            <Field label="Square tile 1 label" value={g.sqD1Label} onChange={(v) => patchGlass("sqD1Label", v)} />
            <Field label="Square tile 1 value" value={g.sqD1Value} onChange={(v) => patchGlass("sqD1Value", v)} />
            <Field label="Square tile 2 label" value={g.sqD2Label} onChange={(v) => patchGlass("sqD2Label", v)} />
            <Field label="Square tile 2 value" value={g.sqD2Value} onChange={(v) => patchGlass("sqD2Value", v)} />
            <p className="text-[11px] uppercase tracking-wide text-[#8E8E93]">
              Vertical detail tiles (2 + full width)
            </p>
            <Field label="Vertical tile 1 label" value={g.vtD1Label} onChange={(v) => patchGlass("vtD1Label", v)} />
            <Field label="Vertical tile 1 value" value={g.vtD1Value} onChange={(v) => patchGlass("vtD1Value", v)} />
            <Field label="Vertical tile 2 label" value={g.vtD2Label} onChange={(v) => patchGlass("vtD2Label", v)} />
            <Field label="Vertical tile 2 value" value={g.vtD2Value} onChange={(v) => patchGlass("vtD2Value", v)} />
            <Field label="Vertical tile 3 label (spans both columns)" value={g.vtD3Label} onChange={(v) => patchGlass("vtD3Label", v)} />
            <Field label="Vertical tile 3 value" value={g.vtD3Value} onChange={(v) => patchGlass("vtD3Value", v)} />
            <p className="text-[11px] uppercase tracking-wide text-[#8E8E93]">
              CTA bar (shared)
            </p>
            <Field label="CTA price (e.g. R1250)" value={g.ctaPriceMain} onChange={(v) => patchGlass("ctaPriceMain", v)} />
            <Field label="CTA price suffix (e.g. Total)" value={g.ctaPriceSuffix} onChange={(v) => patchGlass("ctaPriceSuffix", v)} />
            <Field label="Delivery line 1" value={g.ctaDeliveryLine1} onChange={(v) => patchGlass("ctaDeliveryLine1", v)} />
            <Field label="Delivery line 2 (smaller, below)" value={g.ctaDeliveryLine2} onChange={(v) => patchGlass("ctaDeliveryLine2", v)} />
          </div>
        )}

        <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            JSON ·{" "}
            <code className="text-white/80">{VKW_BRAI_OVERLAY_JSON_TEMPLATE_ID}</code>
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

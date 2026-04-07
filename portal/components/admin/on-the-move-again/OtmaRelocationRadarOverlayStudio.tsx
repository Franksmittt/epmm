"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import radarSquare from "./otma-radar-square.module.css";
import radarVertical from "./otma-radar-vertical.module.css";
import waypointSquare from "./otma-waypoint-square.module.css";
import waypointVertical from "./otma-waypoint-vertical.module.css";
import corporateSquare from "./otma-corporate-square.module.css";
import corporateVertical from "./otma-corporate-vertical.module.css";

export const OTMA_OVERLAY_JSON_TEMPLATE_ID = "on-the-move-again-overlay";
/** v3: Corporate transit + corp* keys; v2: Waypoint; v1: Radar only. */
export const OTMA_OVERLAY_JSON_VERSION = 3;

export type OtmaOverlayPresetId =
  | "relocation-radar"
  | "waypoint-compact"
  | "corporate-transit";

export const OTMA_OVERLAY_PRESETS: {
  id: OtmaOverlayPresetId;
  label: string;
  short: string;
}[] = [
  {
    id: "relocation-radar",
    label: "Relocation Radar — GPS strip + glass terminal",
    short: "Relocation Radar",
  },
  {
    id: "waypoint-compact",
    label: "Waypoint compact — route line + waypoint dots",
    short: "Waypoint",
  },
  {
    id: "corporate-transit",
    label: "Corporate transit — blueprint grid + B2B badge",
    short: "Corporate",
  },
];

const RADAR_KEYS = [
  "squareBrandPill",
  "squareHeroL1",
  "squareHeroL2Blue",
  "squareServiceL1",
  "squareServiceL2",
  "squareServiceSub",
  "squareSpec1",
  "squareSpec2",
  "squareCta",
  "verticalBrandName",
  "verticalTrackingLabel",
  "verticalSpecTag1",
  "verticalSpecTag2",
  "verticalHeadlineL1",
  "verticalHeadlineL2Blue",
  "verticalSubtext",
  "verticalServiceL1",
  "verticalServiceL2",
  "verticalServiceSub",
  "verticalCta",
] as const;

const WAYPOINT_KEYS = [
  "wpSquareBrandName",
  "wpSquareBrandSub",
  "wpSquareHeroL1",
  "wpSquareHeroL2Blue",
  "wpSquareStatusPill",
  "wpSquareSubtext",
  "wpSquareTrust1",
  "wpSquareTrust2",
  "wpSquarePhone",
  "wpVerticalBrandName",
  "wpVerticalBrandSub",
  "wpVerticalStatusPill",
  "wpVerticalHeadlineL1",
  "wpVerticalHeadlineL2Blue",
  "wpVerticalSubtext",
  "wpVerticalTrust1",
  "wpVerticalTrust2",
  "wpVerticalPhone",
] as const;

const CORP_KEYS = [
  "corpSquareBrandName",
  "corpSquareHeroL1",
  "corpSquareHeroL2Blue",
  "corpSquareServiceTitle",
  "corpSquareServiceBody",
  "corpSquareSpec1",
  "corpSquareSpec2",
  "corpSquareActionLbl",
  "corpSquarePhone",
  "corpVerticalBrandName",
  "corpVerticalTopBadge",
  "corpVerticalSpec1",
  "corpVerticalSpec2",
  "corpVerticalHeadlineL1",
  "corpVerticalHeadlineL2Blue",
  "corpVerticalSubtext",
  "corpVerticalServiceTitle",
  "corpVerticalServiceSub",
  "corpVerticalPhone",
] as const;

type RadarCopyKey = (typeof RADAR_KEYS)[number];
type WaypointCopyKey = (typeof WAYPOINT_KEYS)[number];
type CorpCopyKey = (typeof CORP_KEYS)[number];

const DEFAULTS_RADAR: Record<RadarCopyKey, string> = {
  squareBrandPill: "On The Move Again",
  squareHeroL1: "Smile! You're",
  squareHeroL2Blue: "On Camera.",
  squareServiceL1: "Full-Service",
  squareServiceL2: "Furniture Relocations",
  squareServiceSub: "(Alberton Base)",
  squareSpec1: "Live GPS Tracking",
  squareSpec2: "Goods-in-Transit Protection",
  squareCta: "Get a Quote",
  verticalBrandName: "On The Move Again",
  verticalTrackingLabel: "LIVE GPS TRACKING",
  verticalSpecTag1: "PMA Accredited",
  verticalSpecTag2: "AMOSA Certified",
  verticalHeadlineL1: "Secure.",
  verticalHeadlineL2Blue: "Relocation.",
  verticalSubtext:
    "Smile! You're on camera. We provide full-service relocations with live in-transit monitoring and comprehensive Goods-in-Transit protection.",
  verticalServiceL1: "Alberton Based",
  verticalServiceL2: "Moving Company",
  verticalServiceSub: "Local & Long Distance",
  verticalCta: "Get Quote",
};

const DEFAULTS_WAYPOINT: Record<WaypointCopyKey, string> = {
  wpSquareBrandName: "On The Move Again",
  wpSquareBrandSub: "Relocation Logistics",
  wpSquareHeroL1: "Move with",
  wpSquareHeroL2Blue: "Certainty.",
  wpSquareStatusPill: "GPS In-Transit Active",
  wpSquareSubtext:
    "Live vehicle tracking and comprehensive Goods-in-Transit insurance. We don't just move boxes; we secure your assets.",
  wpSquareTrust1: "PMA Accredited",
  wpSquareTrust2: "AMOSA Certified",
  wpSquarePhone: "072 100 0936",
  wpVerticalBrandName: "On The Move Again",
  wpVerticalBrandSub: "Relocation Logistics",
  wpVerticalStatusPill: "GPS In-Transit Active",
  wpVerticalHeadlineL1: "Move with",
  wpVerticalHeadlineL2Blue: "Certainty.",
  wpVerticalSubtext:
    "Live vehicle tracking and comprehensive Goods-in-Transit insurance. We don't just move boxes; we secure your assets from start to finish.",
  wpVerticalTrust1: "PMA Accredited",
  wpVerticalTrust2: "AMOSA Certified",
  wpVerticalPhone: "072 100 0936",
};

const DEFAULTS_CORP: Record<CorpCopyKey, string> = {
  corpSquareBrandName: "On The Move Again",
  corpSquareHeroL1: "Business.",
  corpSquareHeroL2Blue: "Uninterrupted.",
  corpSquareServiceTitle: "Corporate Relocations",
  corpSquareServiceBody:
    "Secure, fully insured office moving. We minimize downtime for your business with precision logistics.",
  corpSquareSpec1: "Zero Downtime",
  corpSquareSpec2: "Live GPS Tracking",
  corpSquareActionLbl: "B2B Logistics",
  corpSquarePhone: "072 100 0936",
  corpVerticalBrandName: "On The Move Again",
  corpVerticalTopBadge: "B2B Logistics",
  corpVerticalSpec1: "Zero Downtime",
  corpVerticalSpec2: "Asset Monitored",
  corpVerticalHeadlineL1: "Business.",
  corpVerticalHeadlineL2Blue: "Uninterrupted.",
  corpVerticalSubtext:
    "Secure, fully insured corporate and office relocations. We minimize downtime for your business with precision logistics and live GPS tracking.",
  corpVerticalServiceTitle: "Corporate Relocations",
  corpVerticalServiceSub: "Alberton & Alrode",
  corpVerticalPhone: "072 100 0936",
};

function initialCopyByPreset(): Record<OtmaOverlayPresetId, Record<string, string>> {
  return {
    "relocation-radar": { ...DEFAULTS_RADAR },
    "waypoint-compact": { ...DEFAULTS_WAYPOINT },
    "corporate-transit": { ...DEFAULTS_CORP },
  };
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

function isPresetId(v: unknown): v is OtmaOverlayPresetId {
  return (
    v === "relocation-radar" ||
    v === "waypoint-compact" ||
    v === "corporate-transit"
  );
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): OtmaOverlayPresetId | null {
  const keys = Object.keys(block);
  const corpHit = keys.some((k) =>
    (CORP_KEYS as readonly string[]).includes(k),
  );
  const wpHit = keys.some((k) =>
    (WAYPOINT_KEYS as readonly string[]).includes(k),
  );
  const rdHit = keys.some((k) =>
    (RADAR_KEYS as readonly string[]).includes(k),
  );
  if (corpHit && !wpHit && !rdHit) return "corporate-transit";
  if (wpHit && !rdHit && !corpHit) return "waypoint-compact";
  if (rdHit && !wpHit && !corpHit) return "relocation-radar";
  return null;
}

function ArrowRightSvg({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PhoneHandsetSvg({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
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

export function OtmaRelocationRadarOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<OtmaOverlayPresetId>("relocation-radar");
  const [copyByPreset, setCopyByPreset] = useState(initialCopyByPreset);

  const setRadar = (key: RadarCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "relocation-radar": { ...prev["relocation-radar"], [key]: value },
    }));
  };

  const setWaypoint = (key: WaypointCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "waypoint-compact": { ...prev["waypoint-compact"], [key]: value },
    }));
  };

  const setCorp = (key: CorpCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "corporate-transit": { ...prev["corporate-transit"], [key]: value },
    }));
  };

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

  const exportJson = useMemo(() => {
    return JSON.stringify(
      {
        template: OTMA_OVERLAY_JSON_TEMPLATE_ID,
        version: OTMA_OVERLAY_JSON_VERSION,
        preset,
        copy: copyByPreset[preset],
      },
      null,
      2,
    );
  }, [preset, copyByPreset]);

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
      setJsonError("Paste JSON from your AI first.");
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
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setJsonError("JSON root must be an object.");
      return;
    }
    const root = parsed as Record<string, unknown>;
    const block =
      root.copy !== undefined &&
      root.copy !== null &&
      typeof root.copy === "object" &&
      !Array.isArray(root.copy)
        ? (root.copy as Record<string, unknown>)
        : root;

    const targetPreset: OtmaOverlayPresetId =
      (isPresetId(root.preset) ? root.preset : null) ??
      inferPresetFromBlock(block) ??
      preset;

    const keys =
      targetPreset === "relocation-radar"
        ? RADAR_KEYS
        : targetPreset === "waypoint-compact"
          ? WAYPOINT_KEYS
          : CORP_KEYS;
    const picked: Record<string, string> = {};
    let any = false;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const v = block[key];
        picked[key] = v == null ? "" : String(v);
        any = true;
      }
    }
    if (!any) {
      setJsonError(
        `No copy fields for preset "${targetPreset}". Expected keys: ${keys.join(", ")}.`,
      );
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
    if (preset === "relocation-radar") {
      setCopyByPreset((p) => ({
        ...p,
        "relocation-radar": { ...DEFAULTS_RADAR },
      }));
    } else if (preset === "waypoint-compact") {
      setCopyByPreset((p) => ({
        ...p,
        "waypoint-compact": { ...DEFAULTS_WAYPOINT },
      }));
    } else {
      setCopyByPreset((p) => ({
        ...p,
        "corporate-transit": { ...DEFAULTS_CORP },
      }));
    }
  };

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
      a.download = `otma-${preset}-square-1080-${Date.now()}.png`;
      a.click();
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Could not render square PNG.",
      );
    } finally {
      setExporting(null);
    }
  }, [preset]);

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
      a.download = `otma-${preset}-vertical-9x16-${Date.now()}.png`;
      a.click();
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Could not render vertical PNG.",
      );
    } finally {
      setExporting(null);
    }
  }, [preset]);

  const scaleSquare = PREVIEW_SQUARE / 1080;
  const scaleVert = VERT_PREVIEW_W / 1080;

  const cr = copyByPreset["relocation-radar"] as typeof DEFAULTS_RADAR;
  const cw = copyByPreset["waypoint-compact"] as typeof DEFAULTS_WAYPOINT;
  const cc = copyByPreset["corporate-transit"] as typeof DEFAULTS_CORP;

  const radarSquareCanvas = (
    <div
      ref={squareRef}
      className={`${radarSquare.root} ${radarSquare.canvas1080}`}
      aria-label="OTMA Relocation Radar square export"
    >
      <div className={radarSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={radarSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={radarSquare.scrimTop} />
        <div className={radarSquare.scrimBottom} />
        <div className={radarSquare.topPerimeter}>
          <div className={radarSquare.brandPill}>{cr.squareBrandPill}</div>
          <h1 className={radarSquare.heroType}>
            {cr.squareHeroL1}
            <br />
            <span className={radarSquare.heroAccent}>
              {cr.squareHeroL2Blue}
            </span>
          </h1>
        </div>
        <div className={radarSquare.logisticsStrip}>
          <div className={radarSquare.stripSpecs}>
            <div>
              <div className={radarSquare.serviceTitle}>
                {cr.squareServiceL1}
                {cr.squareServiceL1 && cr.squareServiceL2 ? <br /> : null}
                {cr.squareServiceL2}
              </div>
              <span className={radarSquare.serviceSub}>
                {cr.squareServiceSub}
              </span>
            </div>
            <div className={radarSquare.specRow}>
              <span className={radarSquare.specMini}>{cr.squareSpec1}</span>
              <span className={radarSquare.specMini}>{cr.squareSpec2}</span>
            </div>
          </div>
          <div className={radarSquare.divider} />
          <div className={radarSquare.stripAction}>
            <button type="button" className={radarSquare.btnQuote}>
              {cr.squareCta}
              <ArrowRightSvg size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const radarVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${radarVertical.root} ${radarVertical.canvas1080x1920}`}
      aria-label="OTMA Relocation Radar vertical export"
    >
      <div className={radarVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={radarVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={radarVertical.gpsOverlay} />
        <div className={radarVertical.scrim} />
        <div className={radarVertical.topHud}>
          <div className={radarVertical.brandLockup}>
            <span className={radarVertical.btName}>{cr.verticalBrandName}</span>
          </div>
          <div className={radarVertical.trackingStatus}>
            <span className={radarVertical.trackingDot} aria-hidden />
            {cr.verticalTrackingLabel}
          </div>
        </div>
        <div className={radarVertical.logisticsTerminal}>
          <div className={radarVertical.specGrid}>
            <div className={radarVertical.specTag}>{cr.verticalSpecTag1}</div>
            <div className={radarVertical.specTag}>{cr.verticalSpecTag2}</div>
          </div>
          <h1 className={radarVertical.headline}>
            {cr.verticalHeadlineL1}
            <br />
            <span className={radarVertical.headlineAccent}>
              {cr.verticalHeadlineL2Blue}
            </span>
          </h1>
          <p className={radarVertical.subtext}>{cr.verticalSubtext}</p>
          <div className={radarVertical.actionDock}>
            <div className={radarVertical.serviceId}>
              <span className={radarVertical.serviceTitle}>
                {cr.verticalServiceL1}
                {cr.verticalServiceL1 && cr.verticalServiceL2 ? <br /> : null}
                {cr.verticalServiceL2}
              </span>
              <span className={radarVertical.serviceSub}>
                {cr.verticalServiceSub}
              </span>
            </div>
            <button type="button" className={radarVertical.btnQuote}>
              {cr.verticalCta}
              <ArrowRightSvg size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const waypointSquareCanvas = (
    <div
      ref={squareRef}
      className={`${waypointSquare.root} ${waypointSquare.canvas1080}`}
      aria-label="OTMA Waypoint square export"
    >
      <div className={waypointSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={waypointSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={waypointSquare.routeLine} />
        <div className={waypointSquare.scrimTop} />
        <div className={waypointSquare.scrimBottom} />
        <div className={waypointSquare.topHud}>
          <div className={waypointSquare.brandSection}>
            <div className={waypointSquare.waypointDot} aria-hidden />
            <div className={waypointSquare.brandLockup}>
              <span className={waypointSquare.btName}>
                {cw.wpSquareBrandName}
              </span>
              <span className={waypointSquare.btSub}>
                {cw.wpSquareBrandSub}
              </span>
            </div>
          </div>
          <h1 className={waypointSquare.heroType}>
            {cw.wpSquareHeroL1}
            <br />
            <span className={waypointSquare.heroAccent}>
              {cw.wpSquareHeroL2Blue}
            </span>
          </h1>
        </div>
        <div className={waypointSquare.logisticsTerminal}>
          <div className={waypointSquare.terminalInfo}>
            <div className={waypointSquare.terminalHeader}>
              <div className={waypointSquare.waypointDotEnd} aria-hidden />
              <div className={waypointSquare.statusPill}>
                {cw.wpSquareStatusPill}
              </div>
            </div>
            <p className={waypointSquare.subtext}>{cw.wpSquareSubtext}</p>
          </div>
          <div className={waypointSquare.divider} />
          <div className={waypointSquare.actionCol}>
            <div className={waypointSquare.trustRow}>
              <span className={waypointSquare.trustTag}>
                {cw.wpSquareTrust1}
              </span>
              <span className={waypointSquare.trustTag}>
                {cw.wpSquareTrust2}
              </span>
            </div>
            <button type="button" className={waypointSquare.btnContact}>
              <PhoneHandsetSvg size={18} />
              {cw.wpSquarePhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const waypointVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${waypointVertical.root} ${waypointVertical.canvas1080x1920}`}
      aria-label="OTMA Waypoint vertical export"
    >
      <div className={waypointVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={waypointVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={waypointVertical.routeLine} />
        <div className={waypointVertical.scrim} />
        <div className={waypointVertical.topHud}>
          <div className={waypointVertical.waypointDot} aria-hidden />
          <div className={waypointVertical.brandLockup}>
            <span className={waypointVertical.btName}>
              {cw.wpVerticalBrandName}
            </span>
            <span className={waypointVertical.btSub}>
              {cw.wpVerticalBrandSub}
            </span>
          </div>
        </div>
        <div className={waypointVertical.logisticsTerminal}>
          <div className={waypointVertical.terminalHeader}>
            <div className={waypointVertical.waypointDotEnd} aria-hidden />
            <div className={waypointVertical.statusPill}>
              {cw.wpVerticalStatusPill}
            </div>
          </div>
          <h1 className={waypointVertical.headline}>
            {cw.wpVerticalHeadlineL1}
            <br />
            <span className={waypointVertical.headlineAccent}>
              {cw.wpVerticalHeadlineL2Blue}
            </span>
          </h1>
          <p className={waypointVertical.subtext}>{cw.wpVerticalSubtext}</p>
          <div className={waypointVertical.actionDock}>
            <div className={waypointVertical.trustCol}>
              <span className={waypointVertical.trustTag}>
                {cw.wpVerticalTrust1}
              </span>
              <span className={waypointVertical.trustTag}>
                {cw.wpVerticalTrust2}
              </span>
            </div>
            <button type="button" className={waypointVertical.btnContact}>
              <PhoneHandsetSvg size={16} />
              {cw.wpVerticalPhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const corporateSquareCanvas = (
    <div
      ref={squareRef}
      className={`${corporateSquare.root} ${corporateSquare.canvas1080}`}
      aria-label="OTMA Corporate transit square export"
    >
      <div className={corporateSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={corporateSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={corporateSquare.scrimTop} />
        <div className={corporateSquare.scrimBottom} />
        <div className={corporateSquare.topPerimeter}>
          <div className={corporateSquare.brandLockup}>
            <span className={corporateSquare.brandIcon} aria-hidden />
            <span className={corporateSquare.btName}>
              {cc.corpSquareBrandName}
            </span>
          </div>
          <h1 className={corporateSquare.heroType}>
            {cc.corpSquareHeroL1}
            <br />
            <span className={corporateSquare.heroAccent}>
              {cc.corpSquareHeroL2Blue}
            </span>
          </h1>
        </div>
        <div className={corporateSquare.logisticsTerminal}>
          <div className={corporateSquare.terminalInfo}>
            <span className={corporateSquare.serviceTitle}>
              {cc.corpSquareServiceTitle}
            </span>
            <span className={corporateSquare.serviceSub}>
              {cc.corpSquareServiceBody}
            </span>
            <div className={corporateSquare.specRow}>
              <span className={corporateSquare.specMini}>
                {cc.corpSquareSpec1}
              </span>
              <span className={corporateSquare.specMini}>
                {cc.corpSquareSpec2}
              </span>
            </div>
          </div>
          <div className={corporateSquare.divider} />
          <div className={corporateSquare.actionCol}>
            <span className={corporateSquare.actionLbl}>
              {cc.corpSquareActionLbl}
            </span>
            <button type="button" className={corporateSquare.btnContact}>
              <PhoneHandsetSvg size={16} />
              {cc.corpSquarePhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const corporateVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${corporateVertical.root} ${corporateVertical.canvas1080x1920}`}
      aria-label="OTMA Corporate transit vertical export"
    >
      <div className={corporateVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={corporateVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={corporateVertical.blueprintGrid} />
        <div className={corporateVertical.scrim} />
        <div className={corporateVertical.topHud}>
          <div className={corporateVertical.brandLockup}>
            <span className={corporateVertical.brandIcon} aria-hidden />
            <span className={corporateVertical.btName}>
              {cc.corpVerticalBrandName}
            </span>
          </div>
          <div className={corporateVertical.corpBadge}>
            {cc.corpVerticalTopBadge}
          </div>
        </div>
        <div className={corporateVertical.logisticsTerminal}>
          <div className={corporateVertical.specRow}>
            <span className={corporateVertical.specMini}>
              {cc.corpVerticalSpec1}
            </span>
            <span className={corporateVertical.specMini}>
              {cc.corpVerticalSpec2}
            </span>
          </div>
          <h1 className={corporateVertical.headline}>
            {cc.corpVerticalHeadlineL1}
            <br />
            <span className={corporateVertical.headlineAccent}>
              {cc.corpVerticalHeadlineL2Blue}
            </span>
          </h1>
          <p className={corporateVertical.subtext}>
            {cc.corpVerticalSubtext}
          </p>
          <div className={corporateVertical.actionDock}>
            <div className={corporateVertical.serviceId}>
              <span className={corporateVertical.serviceTitle}>
                {cc.corpVerticalServiceTitle}
              </span>
              <span className={corporateVertical.serviceSub}>
                {cc.corpVerticalServiceSub}
              </span>
            </div>
            <button type="button" className={corporateVertical.btnContact}>
              <PhoneHandsetSvg size={14} />
              {cc.corpVerticalPhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvas =
    preset === "relocation-radar"
      ? radarSquareCanvas
      : preset === "waypoint-compact"
        ? waypointSquareCanvas
        : corporateSquareCanvas;
  const verticalCanvas =
    preset === "relocation-radar"
      ? radarVerticalCanvas
      : preset === "waypoint-compact"
        ? waypointVerticalCanvas
        : corporateVerticalCanvas;

  const keysHint =
    preset === "relocation-radar"
      ? RADAR_KEYS.join(", ")
      : preset === "waypoint-compact"
        ? WAYPOINT_KEYS.join(", ")
        : CORP_KEYS.join(", ");

  const jsonRows =
    preset === "relocation-radar" ? 24 : preset === "waypoint-compact" ? 22 : 26;
  const presetShort =
    OTMA_OVERLAY_PRESETS.find((p) => p.id === preset)?.short ?? preset;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/15 bg-black/40 p-3">
          <label
            htmlFor="otma-preset"
            className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]"
          >
            Template preset
          </label>
          <select
            id="otma-preset"
            value={preset}
            onChange={(e) =>
              setPreset(e.target.value as OtmaOverlayPresetId)
            }
            className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {OTMA_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#8E8E93]">
            Sky blue <code className="text-white/80">#0284c7</code>. Separate
            square / vertical heroes per session; copy + JSON are per preset.
          </p>
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

        <div className="space-y-3 rounded-md border border-sky-500/25 bg-sky-500/[0.06] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-200/90">
            AI · JSON workflow
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            <code className="text-white/80">template</code>{" "}
            <code className="text-white/80">{OTMA_OVERLAY_JSON_TEMPLATE_ID}</code>
            , <code className="text-white/80">preset</code>{" "}
            <code className="text-white/80">relocation-radar</code>,{" "}
            <code className="text-white/80">waypoint-compact</code>, or{" "}
            <code className="text-white/80">corporate-transit</code>,{" "}
            <code className="text-white/80">copy</code>. v
            {OTMA_OVERLAY_JSON_VERSION}: infer{" "}
            <code className="text-white/80">corp*</code> /{" "}
            <code className="text-white/80">wp*</code> / radar keys if preset
            omitted.
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#8E8E93]">Current copy (JSON)</span>
              <button
                type="button"
                onClick={copyJsonToClipboard}
                className="rounded-md bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-100 hover:bg-sky-500/30"
              >
                {copyFlash ? "Copied" : "Copy JSON"}
              </button>
            </div>
            <textarea
              readOnly
              value={exportJson}
              rows={jsonRows}
              className="w-full resize-y rounded-md border border-white/15 bg-black/60 px-2 py-2 font-mono text-[11px] leading-relaxed text-[#D1D1D6] focus:outline-none"
              spellCheck={false}
              aria-label="Exported overlay JSON"
            />
          </div>
          <div className="space-y-2 border-t border-white/10 pt-3">
            <span className="text-xs text-[#8E8E93]">
              Paste JSON from AI (fences stripped automatically)
            </span>
            <textarea
              value={jsonPaste}
              onChange={(e) => {
                setJsonPaste(e.target.value);
                setJsonError(null);
              }}
              rows={10}
              placeholder={`{\n  "template": "${OTMA_OVERLAY_JSON_TEMPLATE_ID}",\n  "preset": "waypoint-compact",\n  "copy": { … }\n}`}
              className="w-full resize-y rounded-md border border-white/15 bg-black/50 px-2 py-2 font-mono text-[11px] leading-relaxed text-white placeholder:text-white/25 focus:border-white/35 focus:outline-none"
              spellCheck={false}
              aria-label="Paste JSON from AI"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={applyJsonFromPaste}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Apply JSON to template
              </button>
              {applyFlash ? (
                <span className="text-xs text-emerald-300">Applied.</span>
              ) : null}
            </div>
            {jsonError ? (
              <p className="text-xs text-red-300">{jsonError}</p>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-[#8E8E93]">
          Keys for <strong className="text-white/90">{preset}</strong>:{" "}
          {keysHint}
        </p>

        {preset === "relocation-radar" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Relocation Radar
            </p>
            <Field
              label="Brand pill"
              value={cr.squareBrandPill}
              onChange={(v) => setRadar("squareBrandPill", v)}
            />
            <Field
              label="Hero — line 1 (dark)"
              value={cr.squareHeroL1}
              onChange={(v) => setRadar("squareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (blue)"
              value={cr.squareHeroL2Blue}
              onChange={(v) => setRadar("squareHeroL2Blue", v)}
            />
            <Field
              label="Service title — line 1"
              value={cr.squareServiceL1}
              onChange={(v) => setRadar("squareServiceL1", v)}
            />
            <Field
              label="Service title — line 2"
              value={cr.squareServiceL2}
              onChange={(v) => setRadar("squareServiceL2", v)}
            />
            <Field
              label="Service sub (mono)"
              value={cr.squareServiceSub}
              onChange={(v) => setRadar("squareServiceSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={cr.squareSpec1}
              onChange={(v) => setRadar("squareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={cr.squareSpec2}
              onChange={(v) => setRadar("squareSpec2", v)}
            />
            <Field
              label="CTA button"
              value={cr.squareCta}
              onChange={(v) => setRadar("squareCta", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Relocation Radar
            </p>
            <Field
              label="Top — brand lockup"
              value={cr.verticalBrandName}
              onChange={(v) => setRadar("verticalBrandName", v)}
            />
            <Field
              label="Tracking pill label"
              value={cr.verticalTrackingLabel}
              onChange={(v) => setRadar("verticalTrackingLabel", v)}
            />
            <Field
              label="Spec tag 1"
              value={cr.verticalSpecTag1}
              onChange={(v) => setRadar("verticalSpecTag1", v)}
            />
            <Field
              label="Spec tag 2"
              value={cr.verticalSpecTag2}
              onChange={(v) => setRadar("verticalSpecTag2", v)}
            />
            <Field
              label="Headline — line 1"
              value={cr.verticalHeadlineL1}
              onChange={(v) => setRadar("verticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (blue)"
              value={cr.verticalHeadlineL2Blue}
              onChange={(v) => setRadar("verticalHeadlineL2Blue", v)}
            />
            <Field
              label="Subtext"
              value={cr.verticalSubtext}
              onChange={(v) => setRadar("verticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Service — line 1"
              value={cr.verticalServiceL1}
              onChange={(v) => setRadar("verticalServiceL1", v)}
            />
            <Field
              label="Service — line 2"
              value={cr.verticalServiceL2}
              onChange={(v) => setRadar("verticalServiceL2", v)}
            />
            <Field
              label="Service sub (mono)"
              value={cr.verticalServiceSub}
              onChange={(v) => setRadar("verticalServiceSub", v)}
            />
            <Field
              label="CTA button"
              value={cr.verticalCta}
              onChange={(v) => setRadar("verticalCta", v)}
            />
          </>
        ) : preset === "waypoint-compact" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Waypoint
            </p>
            <Field
              label="Brand — name"
              value={cw.wpSquareBrandName}
              onChange={(v) => setWaypoint("wpSquareBrandName", v)}
            />
            <Field
              label="Brand — sub (mono, blue)"
              value={cw.wpSquareBrandSub}
              onChange={(v) => setWaypoint("wpSquareBrandSub", v)}
            />
            <Field
              label="Hero — line 1"
              value={cw.wpSquareHeroL1}
              onChange={(v) => setWaypoint("wpSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (blue)"
              value={cw.wpSquareHeroL2Blue}
              onChange={(v) => setWaypoint("wpSquareHeroL2Blue", v)}
            />
            <Field
              label="Status pill"
              value={cw.wpSquareStatusPill}
              onChange={(v) => setWaypoint("wpSquareStatusPill", v)}
            />
            <Field
              label="Strip subtext"
              value={cw.wpSquareSubtext}
              onChange={(v) => setWaypoint("wpSquareSubtext", v)}
              rows={4}
            />
            <Field
              label="Trust tag 1"
              value={cw.wpSquareTrust1}
              onChange={(v) => setWaypoint("wpSquareTrust1", v)}
            />
            <Field
              label="Trust tag 2"
              value={cw.wpSquareTrust2}
              onChange={(v) => setWaypoint("wpSquareTrust2", v)}
            />
            <Field
              label="Phone (button)"
              value={cw.wpSquarePhone}
              onChange={(v) => setWaypoint("wpSquarePhone", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Waypoint
            </p>
            <Field
              label="Brand — name"
              value={cw.wpVerticalBrandName}
              onChange={(v) => setWaypoint("wpVerticalBrandName", v)}
            />
            <Field
              label="Brand — sub (mono, blue)"
              value={cw.wpVerticalBrandSub}
              onChange={(v) => setWaypoint("wpVerticalBrandSub", v)}
            />
            <Field
              label="Status pill"
              value={cw.wpVerticalStatusPill}
              onChange={(v) => setWaypoint("wpVerticalStatusPill", v)}
            />
            <Field
              label="Headline — line 1"
              value={cw.wpVerticalHeadlineL1}
              onChange={(v) => setWaypoint("wpVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (blue)"
              value={cw.wpVerticalHeadlineL2Blue}
              onChange={(v) => setWaypoint("wpVerticalHeadlineL2Blue", v)}
            />
            <Field
              label="Subtext"
              value={cw.wpVerticalSubtext}
              onChange={(v) => setWaypoint("wpVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Trust tag 1"
              value={cw.wpVerticalTrust1}
              onChange={(v) => setWaypoint("wpVerticalTrust1", v)}
            />
            <Field
              label="Trust tag 2"
              value={cw.wpVerticalTrust2}
              onChange={(v) => setWaypoint("wpVerticalTrust2", v)}
            />
            <Field
              label="Phone (button)"
              value={cw.wpVerticalPhone}
              onChange={(v) => setWaypoint("wpVerticalPhone", v)}
            />
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Corporate transit
            </p>
            <Field
              label="Brand lockup — name"
              value={cc.corpSquareBrandName}
              onChange={(v) => setCorp("corpSquareBrandName", v)}
            />
            <Field
              label="Hero — line 1"
              value={cc.corpSquareHeroL1}
              onChange={(v) => setCorp("corpSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (blue)"
              value={cc.corpSquareHeroL2Blue}
              onChange={(v) => setCorp("corpSquareHeroL2Blue", v)}
            />
            <Field
              label="Strip — service title"
              value={cc.corpSquareServiceTitle}
              onChange={(v) => setCorp("corpSquareServiceTitle", v)}
            />
            <Field
              label="Strip — body copy"
              value={cc.corpSquareServiceBody}
              onChange={(v) => setCorp("corpSquareServiceBody", v)}
              rows={4}
            />
            <Field
              label="Spec chip 1"
              value={cc.corpSquareSpec1}
              onChange={(v) => setCorp("corpSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={cc.corpSquareSpec2}
              onChange={(v) => setCorp("corpSquareSpec2", v)}
            />
            <Field
              label="Action column label (mono)"
              value={cc.corpSquareActionLbl}
              onChange={(v) => setCorp("corpSquareActionLbl", v)}
            />
            <Field
              label="Phone (button)"
              value={cc.corpSquarePhone}
              onChange={(v) => setCorp("corpSquarePhone", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Corporate transit
            </p>
            <Field
              label="Brand lockup — name"
              value={cc.corpVerticalBrandName}
              onChange={(v) => setCorp("corpVerticalBrandName", v)}
            />
            <Field
              label="Top — B2B badge"
              value={cc.corpVerticalTopBadge}
              onChange={(v) => setCorp("corpVerticalTopBadge", v)}
            />
            <Field
              label="Spec chip 1"
              value={cc.corpVerticalSpec1}
              onChange={(v) => setCorp("corpVerticalSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={cc.corpVerticalSpec2}
              onChange={(v) => setCorp("corpVerticalSpec2", v)}
            />
            <Field
              label="Headline — line 1"
              value={cc.corpVerticalHeadlineL1}
              onChange={(v) => setCorp("corpVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (blue)"
              value={cc.corpVerticalHeadlineL2Blue}
              onChange={(v) => setCorp("corpVerticalHeadlineL2Blue", v)}
            />
            <Field
              label="Subtext"
              value={cc.corpVerticalSubtext}
              onChange={(v) => setCorp("corpVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Dock — service title"
              value={cc.corpVerticalServiceTitle}
              onChange={(v) => setCorp("corpVerticalServiceTitle", v)}
            />
            <Field
              label="Dock — service sub (mono)"
              value={cc.corpVerticalServiceSub}
              onChange={(v) => setCorp("corpVerticalServiceSub", v)}
            />
            <Field
              label="Phone (button)"
              value={cc.corpVerticalPhone}
              onChange={(v) => setCorp("corpVerticalPhone", v)}
            />
          </>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={resetCopy}
            className="rounded-md border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5"
          >
            Reset this preset’s text to defaults
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
            Preview · 1:1 · {presetShort}
          </p>
          <div
            className="overflow-hidden rounded-md border border-white/15 bg-[#e5e7eb]"
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
            Preview · 9:16 · {presetShort}
          </p>
          <div
            className="overflow-hidden rounded-md border border-white/15 bg-[#e5e7eb]"
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
          className={`${base} min-h-[88px] resize-y`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

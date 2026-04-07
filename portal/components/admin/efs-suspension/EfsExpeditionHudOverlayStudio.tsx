"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import expeditionSquare from "./efs-expedition-hud-square.module.css";
import expeditionVertical from "./efs-expedition-hud-vertical.module.css";
import xraySquare from "./efs-xray-chassis-square.module.css";
import scannerVertical from "./efs-overland-scanner-vertical.module.css";
import impactSquare from "./efs-impact-stamp-square.module.css";
import spineVertical from "./efs-vertical-spine-vertical.module.css";
import gridSquare from "./efs-grid-lock-square.module.css";
import longitudeVertical from "./efs-longitude-vertical.module.css";

export type EfsOverlayPresetId =
  | "expedition-hud"
  | "xray-scanner"
  | "impact-stamp"
  | "grid-lock";

export const EFS_OVERLAY_PRESETS: {
  id: EfsOverlayPresetId;
  label: string;
}[] = [
  { id: "expedition-hud", label: "Expedition HUD" },
  { id: "xray-scanner", label: "X-Ray Chassis / Overland Scanner" },
  { id: "impact-stamp", label: "Impact Stamp / Vertical Spine" },
  { id: "grid-lock", label: "Grid-Lock / Longitude" },
];

/** Unified template id (includes preset in JSON). */
export const EFS_SUSPENSION_OVERLAY_TEMPLATE_ID = "efs-suspension-overlay";
export const EFS_SUSPENSION_OVERLAY_VERSION = 2;

/** @deprecated Use EFS_SUSPENSION_OVERLAY_TEMPLATE_ID — kept for older prompts */
export const OVERLAY_JSON_TEMPLATE_ID = EFS_SUSPENSION_OVERLAY_TEMPLATE_ID;
export const OVERLAY_JSON_VERSION = EFS_SUSPENSION_OVERLAY_VERSION;

const LEGACY_TEMPLATE_ID = "efs-expedition-hud-overlay";

const EXPEDITION_KEYS = [
  "brandPrefix",
  "brandSuffixRed",
  "brandSubline",
  "estBadge",
  "seriesBadge",
  "spec1Label",
  "spec1Value",
  "spec2Label",
  "spec2Value",
  "dockTitle",
  "dockSubtitle",
  "headlineLine1",
  "headlineLine2",
  "buttonText",
] as const;

const XRAY_KEYS = [
  "sidebarBadge",
  "seriesLine1",
  "seriesLine2",
  "point1Label",
  "point1Value",
  "point2Label",
  "point2Value",
  "point3Label",
  "point3Value",
  "sidebarFooter",
  "squareHeadlinePrimary",
  "squareHeadlineSecondary",
  "scannerHeaderPrimary",
  "scannerHeaderSecondary",
  "frameTag",
  "frameTitleLine1",
  "frameTitleLine2",
  "grid1Label",
  "grid1Value",
  "grid2Label",
  "grid2Value",
  "buttonText",
] as const;

const IMPACT_STAMP_KEYS = [
  "megaBgText",
  "hardwareTag",
  "verticalBrand",
  "squareHeadlineL1",
  "squareHeadlineL2",
  "squareFooterSubline",
  "spineTopEyebrow",
  "spineTopTitle",
  "spineMidL1",
  "spineMidL2",
  "spineSpecPill",
  "spineBottomL1",
  "spineBottomL2",
  "buttonText",
] as const;

const GRID_LOCK_KEYS = [
  "brandBoxText",
  "projectRefL1",
  "projectRefL2",
  "node1Text",
  "node2Text",
  "dockHeadlineL1",
  "dockHeadlineGreen",
  "rulerMark1",
  "rulerMark2",
  "rulerMark3",
  "rulerMark4",
  "rulerMark5",
  "monolithBadgeText",
  "monolithHeadlineL1",
  "monolithHeadlineGreen",
  "monolithSubtext",
  "buttonText",
] as const;

type ExpeditionCopyKey = (typeof EXPEDITION_KEYS)[number];
type XrayCopyKey = (typeof XRAY_KEYS)[number];
type ImpactStampCopyKey = (typeof IMPACT_STAMP_KEYS)[number];
type GridLockCopyKey = (typeof GRID_LOCK_KEYS)[number];

const DEFAULTS_EXPEDITION: Record<ExpeditionCopyKey, string> = {
  brandPrefix: "EFS",
  brandSuffixRed: "4X4",
  brandSubline: "ACCESSORIES",
  estBadge: "EST. 2003",
  seriesBadge: "ELITE",
  spec1Label: "Internal Valving",
  spec1Value: "Dynamic Motion Control",
  spec2Label: "Construction",
  spec2Value: "Twin-Tube Nitrogen Gas",
  dockTitle: "ELITE SERIES",
  dockSubtitle: "Engineered for the Unforgiving Outback.",
  headlineLine1: "Forged.",
  headlineLine2: "In Australia.",
  buttonText: "SHOP ELITE RANGE",
};

const DEFAULTS_XRAY: Record<XrayCopyKey, string> = {
  sidebarBadge: "EFS 4X4",
  seriesLine1: "ELITE",
  seriesLine2: "SHOCK",
  point1Label: "Piston Size",
  point1Value: "35mm Heavy Duty",
  point2Label: "Control Tech",
  point2Value: "DMC Dynamic Valving",
  point3Label: "Gas Type",
  point3Value: "Low Pressure Nitrogen",
  sidebarFooter: "REF: EFS-ELITE-2026 // AU-ENGINEERED",
  squareHeadlinePrimary: "LIMITLESS.",
  squareHeadlineSecondary: "ADVENTURE.",
  scannerHeaderPrimary: "EFS 4X4 ACCESSORIES",
  scannerHeaderSecondary: "LIVE TELEMETRY // ELITE SERIES",
  frameTag: "SUSPENSION SYSTEM",
  frameTitleLine1: "ELITE",
  frameTitleLine2: "CONTROL.",
  grid1Label: "CORE",
  grid1Value: "Twin-Tube Gas",
  grid2Label: "VALVING",
  grid2Value: "Dynamic Motion",
  buttonText: "GET THE SPEC",
};

const DEFAULTS_IMPACT: Record<ImpactStampCopyKey, string> = {
  megaBgText: "ELITE",
  hardwareTag: "EFS 4X4",
  verticalBrand: "SUSPENSION REVOLUTION",
  squareHeadlineL1: "PURE",
  squareHeadlineL2: "CONTROL.",
  squareFooterSubline: "35mm TWIN-TUBE / NITROGEN CHARGED",
  spineTopEyebrow: "EFS 4X4 ACCESSORIES",
  spineTopTitle: "ELITE SERIES",
  spineMidL1: "OUT",
  spineMidL2: "BACK",
  spineSpecPill: "DYNAMIC MOTION CONTROL",
  spineBottomL1: "BUILT",
  spineBottomL2: "TO LAST.",
  buttonText: "VIEW SPECS",
};

const DEFAULTS_GRID: Record<GridLockCopyKey, string> = {
  brandBoxText: "EFS 4X4 ACCESSORIES",
  projectRefL1: "PROJECT: ELITE",
  projectRefL2: "REF: 2026-AU",
  node1Text: "35MM PISTON",
  node2Text: "DMC VALVING",
  dockHeadlineL1: "TOTAL",
  dockHeadlineGreen: "STABILITY.",
  rulerMark1: "100MM",
  rulerMark2: "75MM",
  rulerMark3: "50MM",
  rulerMark4: "25MM",
  rulerMark5: "0MM",
  monolithBadgeText: "ELITE SERIES 4X4",
  monolithHeadlineL1: "MASTER",
  monolithHeadlineGreen: "THE DUST.",
  monolithSubtext:
    "Engineered for the Unforgiving Terrain of the Great Outback.",
  buttonText: "VIEW SPECIFICATIONS",
};

function initialCopyByPreset(): Record<
  EfsOverlayPresetId,
  Record<string, string>
> {
  return {
    "expedition-hud": { ...DEFAULTS_EXPEDITION },
    "xray-scanner": { ...DEFAULTS_XRAY },
    "impact-stamp": { ...DEFAULTS_IMPACT },
    "grid-lock": { ...DEFAULTS_GRID },
  };
}

function keysForPreset(preset: EfsOverlayPresetId): readonly string[] {
  switch (preset) {
    case "expedition-hud":
      return EXPEDITION_KEYS;
    case "xray-scanner":
      return XRAY_KEYS;
    case "impact-stamp":
      return IMPACT_STAMP_KEYS;
    case "grid-lock":
      return GRID_LOCK_KEYS;
    default: {
      const _x: never = preset;
      return _x;
    }
  }
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

function isPresetId(v: unknown): v is EfsOverlayPresetId {
  return (
    v === "expedition-hud" ||
    v === "xray-scanner" ||
    v === "impact-stamp" ||
    v === "grid-lock"
  );
}

function extractCopyBlock(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const root = data as Record<string, unknown>;
  if (
    root.copy !== undefined &&
    root.copy !== null &&
    typeof root.copy === "object" &&
    !Array.isArray(root.copy)
  ) {
    return root.copy as Record<string, unknown>;
  }
  return root;
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): EfsOverlayPresetId | null {
  const keys = Object.keys(block);
  if (
    keys.includes("dockHeadlineGreen") ||
    keys.includes("projectRefL1") ||
    keys.includes("monolithHeadlineGreen") ||
    keys.includes("rulerMark1")
  ) {
    return "grid-lock";
  }
  if (
    keys.includes("megaBgText") ||
    keys.includes("verticalBrand") ||
    keys.includes("spineMidL1") ||
    keys.includes("spineSpecPill")
  ) {
    return "impact-stamp";
  }
  if (
    keys.includes("sidebarFooter") ||
    keys.includes("point3Label") ||
    keys.includes("scannerHeaderPrimary") ||
    keys.includes("frameTag")
  ) {
    return "xray-scanner";
  }
  if (
    keys.includes("brandPrefix") ||
    keys.includes("estBadge") ||
    keys.includes("dockTitle")
  ) {
    return "expedition-hud";
  }
  return null;
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

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="square"
      aria-hidden
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function exportSlugForPreset(p: EfsOverlayPresetId): string {
  switch (p) {
    case "expedition-hud":
      return "expedition-hud";
    case "xray-scanner":
      return "xray-scanner";
    case "impact-stamp":
      return "impact-stamp";
    case "grid-lock":
      return "grid-lock";
    default: {
      const _x: never = p;
      return _x;
    }
  }
}

export function EfsExpeditionHudOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<EfsOverlayPresetId>("expedition-hud");
  const [copyByPreset, setCopyByPreset] = useState(initialCopyByPreset);

  const e = copyByPreset["expedition-hud"];
  const x = copyByPreset["xray-scanner"];
  const im = copyByPreset["impact-stamp"];
  const g = copyByPreset["grid-lock"];

  const setExpedition = (key: ExpeditionCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "expedition-hud": { ...prev["expedition-hud"], [key]: value },
    }));
  };

  const setXray = (key: XrayCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "xray-scanner": { ...prev["xray-scanner"], [key]: value },
    }));
  };

  const setImpact = (key: ImpactStampCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "impact-stamp": { ...prev["impact-stamp"], [key]: value },
    }));
  };

  const setGrid = (key: GridLockCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "grid-lock": { ...prev["grid-lock"], [key]: value },
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
        template: EFS_SUSPENSION_OVERLAY_TEMPLATE_ID,
        version: EFS_SUSPENSION_OVERLAY_VERSION,
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
    const root =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    const block = extractCopyBlock(parsed);
    if (!block) {
      setJsonError("Expected an object with a \"copy\" field or flat keys.");
      return;
    }

    let targetPreset: EfsOverlayPresetId = preset;
    const tmpl = root?.template;
    if (tmpl === LEGACY_TEMPLATE_ID) {
      targetPreset = "expedition-hud";
    } else if (isPresetId(root?.preset)) {
      targetPreset = root.preset as EfsOverlayPresetId;
    } else {
      const inferred = inferPresetFromBlock(block);
      if (inferred) targetPreset = inferred;
    }

    const keys = keysForPreset(targetPreset);
    const picked: Record<string, string> = {};
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const v = block[key];
        picked[key] = v == null ? "" : String(v);
      }
    }
    if (!Object.keys(picked).length) {
      setJsonError(
        `No recognised fields for this preset. Try: ${keys.join(", ")}`,
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
    setCopyByPreset((prev) => {
      switch (preset) {
        case "expedition-hud":
          return { ...prev, "expedition-hud": { ...DEFAULTS_EXPEDITION } };
        case "xray-scanner":
          return { ...prev, "xray-scanner": { ...DEFAULTS_XRAY } };
        case "impact-stamp":
          return { ...prev, "impact-stamp": { ...DEFAULTS_IMPACT } };
        case "grid-lock":
          return { ...prev, "grid-lock": { ...DEFAULTS_GRID } };
        default: {
          const _x: never = preset;
          return _x;
        }
      }
    });
  };

  const exportSlug = exportSlugForPreset(preset);

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
      a.download = `efs-${exportSlug}-square-1080-${Date.now()}.png`;
      a.click();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not render square PNG.";
      setExportError(message);
    } finally {
      setExporting(null);
    }
  }, [exportSlug]);

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
      a.download = `efs-${exportSlug}-vertical-9x16-${Date.now()}.png`;
      a.click();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not render vertical PNG.";
      setExportError(message);
    } finally {
      setExporting(null);
    }
  }, [exportSlug]);

  const scaleSquare = PREVIEW_SQUARE / 1080;
  const scaleVert = VERT_PREVIEW_W / 1080;

  const jsonTextareaRows =
    preset === "expedition-hud"
      ? 18
      : preset === "xray-scanner"
        ? 26
        : preset === "impact-stamp"
          ? 22
          : 28;

  const squareCanvas = (() => {
    switch (preset) {
      case "expedition-hud":
        return (
          <div
            ref={squareRef}
            className={`${expeditionSquare.root} ${expeditionSquare.canvas1080}`}
            aria-label="EFS Expedition HUD square 1080 export"
          >
            <div className={expeditionSquare.adContainer}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={expeditionSquare.heroBg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : null}
              <div
                className={`${expeditionSquare.corner} ${expeditionSquare.topLeft}`}
              />
              <div
                className={`${expeditionSquare.corner} ${expeditionSquare.bottomRight}`}
              />
              <div className={expeditionSquare.scrim} />
              <div className={expeditionSquare.brandHeader}>
                <div className={expeditionSquare.efsLogoArea}>
                  <span className={expeditionSquare.brandMain}>
                    {e.brandPrefix}{" "}
                    <span className={expeditionSquare.brandMainRed}>
                      {e.brandSuffixRed}
                    </span>
                  </span>
                  <span className={expeditionSquare.brandAccent}>
                    {e.brandSubline}
                  </span>
                </div>
                <div className={expeditionSquare.estBadge}>{e.estBadge}</div>
              </div>
              <div className={expeditionSquare.techSpecs}>
                <div className={expeditionSquare.specItem}>
                  <span className={expeditionSquare.specLabel}>
                    {e.spec1Label}
                  </span>
                  <span className={expeditionSquare.specVal}>
                    {e.spec1Value}
                  </span>
                </div>
                <div className={expeditionSquare.specItem}>
                  <span className={expeditionSquare.specLabel}>
                    {e.spec2Label}
                  </span>
                  <span className={expeditionSquare.specVal}>
                    {e.spec2Value}
                  </span>
                </div>
              </div>
              <div className={expeditionSquare.productDock}>
                <div className={expeditionSquare.productInfo}>
                  <h2>{e.dockTitle}</h2>
                  <p>{e.dockSubtitle}</p>
                </div>
                <button
                  type="button"
                  className={expeditionSquare.ctaAction}
                  aria-label={e.buttonText}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      case "xray-scanner":
        return (
          <div
            ref={squareRef}
            className={`${xraySquare.root} ${xraySquare.canvas1080}`}
            aria-label="EFS X-Ray Chassis square 1080 export"
          >
            <div className={xraySquare.adContainer}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={xraySquare.heroBg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : null}
              <div className={xraySquare.sidebar}>
                <div>
                  <div className={xraySquare.efsBadge}>{x.sidebarBadge}</div>
                  <div className={xraySquare.seriesName}>
                    {x.seriesLine1}
                    <br />
                    {x.seriesLine2}
                  </div>
                  <div className={xraySquare.dataPoints}>
                    <div className={xraySquare.point}>
                      <span className={xraySquare.label}>{x.point1Label}</span>
                      <span className={xraySquare.value}>{x.point1Value}</span>
                    </div>
                    <div className={xraySquare.point}>
                      <span className={xraySquare.label}>{x.point2Label}</span>
                      <span className={xraySquare.value}>{x.point2Value}</span>
                    </div>
                    <div className={xraySquare.point}>
                      <span className={xraySquare.label}>{x.point3Label}</span>
                      <span className={xraySquare.value}>{x.point3Value}</span>
                    </div>
                  </div>
                </div>
                <div className={xraySquare.sidebarFooter}>{x.sidebarFooter}</div>
              </div>
              <div className={xraySquare.actionArea}>
                <h1 className={xraySquare.headlineMain}>
                  {x.squareHeadlinePrimary}
                  <br />
                  <span className={xraySquare.headlineMuted}>
                    {x.squareHeadlineSecondary}
                  </span>
                </h1>
                <button
                  type="button"
                  className={xraySquare.triggerHex}
                  aria-label={x.buttonText}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      case "impact-stamp":
        return (
          <div
            ref={squareRef}
            className={`${impactSquare.root} ${impactSquare.canvas1080}`}
            aria-label="EFS Impact Stamp square 1080 export"
          >
            <div className={impactSquare.adContainer}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={impactSquare.heroBg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : null}
              <div className={impactSquare.bgText}>{im.megaBgText}</div>
              <div className={impactSquare.hardwareTag}>{im.hardwareTag}</div>
              <div className={impactSquare.verticalBrand}>{im.verticalBrand}</div>
              <div className={impactSquare.footerBlock}>
                <div className={impactSquare.headlineGroup}>
                  <h1>
                    {im.squareHeadlineL1}
                    <br />
                    {im.squareHeadlineL2}
                  </h1>
                  <p>{im.squareFooterSubline}</p>
                </div>
                <button
                  type="button"
                  className={impactSquare.actionSquare}
                  aria-label={im.buttonText}
                >
                  <ArrowUpRight />
                </button>
              </div>
            </div>
          </div>
        );
      case "grid-lock":
        return (
          <div
            ref={squareRef}
            className={`${gridSquare.root} ${gridSquare.canvas1080}`}
            aria-label="EFS Grid-Lock square 1080 export"
          >
            <div className={gridSquare.adContainer}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={gridSquare.heroBg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : null}
              <div className={gridSquare.gridOverlay} />
              <div className={gridSquare.specHeader}>
                <div className={gridSquare.brandBox}>{g.brandBoxText}</div>
                <div className={gridSquare.projectRef}>
                  {g.projectRefL1}
                  <br />
                  {g.projectRefL2}
                </div>
              </div>
              <div className={`${gridSquare.node} ${gridSquare.node1}`}>
                <div className={gridSquare.nodeDot} />
                <div className={gridSquare.nodeText}>{g.node1Text}</div>
              </div>
              <div className={`${gridSquare.node} ${gridSquare.node2}`}>
                <div className={gridSquare.nodeDot} />
                <div className={gridSquare.nodeText}>{g.node2Text}</div>
              </div>
              <div className={gridSquare.dataDock}>
                <div className={gridSquare.headlineText}>
                  {g.dockHeadlineL1}
                  <br />
                  <span className={gridSquare.headlineGreen}>
                    {g.dockHeadlineGreen}
                  </span>
                </div>
                <button
                  type="button"
                  className={gridSquare.btnAction}
                  aria-label={g.buttonText}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      default: {
        const _x: never = preset;
        return _x;
      }
    }
  })();

  const verticalCanvas = (() => {
    switch (preset) {
      case "expedition-hud":
        return (
          <div
            ref={verticalRef}
            className={`${expeditionVertical.root} ${expeditionVertical.canvas1080x1920}`}
            aria-label="EFS Expedition HUD vertical 9:16 export"
          >
            <div className={expeditionVertical.adContainer}>
              {bgVerticalDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={expeditionVertical.heroBg}
                  src={bgVerticalDataUrl}
                  alt=""
                />
              ) : null}
              <div className={expeditionVertical.scrimBottom} />
              <div className={expeditionVertical.topBrand}>
                <div className={expeditionVertical.efsLogoVertical}>
                  <span className={expeditionVertical.brandMain}>
                    {e.brandPrefix}{" "}
                    <span className={expeditionVertical.brandMainRed}>
                      {e.brandSuffixRed}
                    </span>
                  </span>
                  <span className={expeditionVertical.brandAccent}>
                    {e.brandSubline}
                  </span>
                </div>
                <div className={expeditionVertical.seriesBadge}>
                  {e.seriesBadge}
                </div>
              </div>
              <div className={expeditionVertical.blueprintDock}>
                <div className={expeditionVertical.dockHeadline}>
                  <h1>
                    {e.headlineLine1}
                    <br />
                    <span className={expeditionVertical.dockHeadlineMuted}>
                      {e.headlineLine2}
                    </span>
                  </h1>
                </div>
                <div className={expeditionVertical.specSpine}>
                  <div className={expeditionVertical.specEntry}>
                    <span className={expeditionVertical.spineLabel}>
                      {e.spec1Label}
                    </span>
                    <span className={expeditionVertical.spineValue}>
                      {e.spec1Value}
                    </span>
                  </div>
                  <div className={expeditionVertical.specEntry}>
                    <span className={expeditionVertical.spineLabel}>
                      {e.spec2Label}
                    </span>
                    <span className={expeditionVertical.spineValue}>
                      {e.spec2Value}
                    </span>
                  </div>
                </div>
                <button type="button" className={expeditionVertical.ctaFull}>
                  {e.buttonText}
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      case "xray-scanner":
        return (
          <div
            ref={verticalRef}
            className={`${scannerVertical.root} ${scannerVertical.canvas1080x1920}`}
            aria-label="EFS Overland Scanner vertical 9:16 export"
          >
            <div className={scannerVertical.adContainer}>
              {bgVerticalDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={scannerVertical.heroBg}
                  src={bgVerticalDataUrl}
                  alt=""
                />
              ) : null}
              <div className={scannerVertical.scannerHeader}>
                <div className={scannerVertical.scannerHeaderInner}>
                  <p className={scannerVertical.scannerHeaderPrimary}>
                    {x.scannerHeaderPrimary}
                  </p>
                  <p className={scannerVertical.scannerHeaderSecondary}>
                    {x.scannerHeaderSecondary}
                  </p>
                </div>
              </div>
              <div className={scannerVertical.dataFrame}>
                <div className={scannerVertical.statusLight} />
                <span className={scannerVertical.efsTag}>{x.frameTag}</span>
                <h1 className={scannerVertical.mainTitle}>
                  {x.frameTitleLine1}
                  <br />
                  <span className={scannerVertical.mainTitleMuted}>
                    {x.frameTitleLine2}
                  </span>
                </h1>
                <div className={scannerVertical.specGrid}>
                  <div>
                    <p className={scannerVertical.gridLabel}>{x.grid1Label}</p>
                    <p className={scannerVertical.gridValue}>{x.grid1Value}</p>
                  </div>
                  <div>
                    <p className={scannerVertical.gridLabel}>{x.grid2Label}</p>
                    <p className={scannerVertical.gridValue}>{x.grid2Value}</p>
                  </div>
                </div>
                <button type="button" className={scannerVertical.ctaWide}>
                  {x.buttonText}
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      case "impact-stamp":
        return (
          <div
            ref={verticalRef}
            className={`${spineVertical.root} ${spineVertical.canvas1080x1920}`}
            aria-label="EFS Vertical Spine 9:16 export"
          >
            <div className={spineVertical.adContainer}>
              {bgVerticalDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={spineVertical.heroBg}
                  src={bgVerticalDataUrl}
                  alt=""
                />
              ) : null}
              <div className={spineVertical.topBanner}>
                <p className={spineVertical.topBannerEyebrow}>
                  {im.spineTopEyebrow}
                </p>
                <h2 className={spineVertical.topBannerTitle}>
                  {im.spineTopTitle}
                </h2>
              </div>
              <div className={spineVertical.midType}>
                <h1>
                  {im.spineMidL1}
                  <br />
                  {im.spineMidL2}
                </h1>
              </div>
              <div className={spineVertical.bottomDock}>
                <div className={spineVertical.specPill}>{im.spineSpecPill}</div>
                <h1 className={spineVertical.bottomHeadline}>
                  {im.spineBottomL1}
                  <br />
                  {im.spineBottomL2}
                </h1>
                <button type="button" className={spineVertical.ctaButton}>
                  {im.buttonText}
                  <ArrowUpRight />
                </button>
              </div>
            </div>
          </div>
        );
      case "grid-lock":
        return (
          <div
            ref={verticalRef}
            className={`${longitudeVertical.root} ${longitudeVertical.canvas1080x1920}`}
            aria-label="EFS Longitude vertical 9:16 export"
          >
            <div className={longitudeVertical.adContainer}>
              {bgVerticalDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={longitudeVertical.heroBg}
                  src={bgVerticalDataUrl}
                  alt=""
                />
              ) : null}
              <div className={longitudeVertical.rulerY}>
                <span>{g.rulerMark1}</span>
                <span>{g.rulerMark2}</span>
                <span>{g.rulerMark3}</span>
                <span>{g.rulerMark4}</span>
                <span>{g.rulerMark5}</span>
              </div>
              <div className={longitudeVertical.monolithBottom}>
                <div className={longitudeVertical.efsBadgeRow}>
                  <div className={longitudeVertical.badgeRed} />
                  <span className={longitudeVertical.badgeText}>
                    {g.monolithBadgeText}
                  </span>
                </div>
                <h1 className={longitudeVertical.mainHeadline}>
                  {g.monolithHeadlineL1}
                  <br />
                  <span className={longitudeVertical.mainHeadlineGreen}>
                    {g.monolithHeadlineGreen}
                  </span>
                </h1>
                <p className={longitudeVertical.subtext}>{g.monolithSubtext}</p>
                <button type="button" className={longitudeVertical.ctaStrip}>
                  {g.buttonText}
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      default: {
        const _x: never = preset;
        return _x;
      }
    }
  })();

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Template preset
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as EfsOverlayPresetId)}
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            aria-label="EFS overlay preset"
          >
            {EFS_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Hero images (separate per format)
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

        <div className="space-y-3 rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
            AI · JSON workflow
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            Template{" "}
            <code className="text-white/80">
              {EFS_SUSPENSION_OVERLAY_TEMPLATE_ID}
            </code>{" "}
            · <code className="text-white/80">preset</code>:{" "}
            <code className="text-white/80">expedition-hud</code>,{" "}
            <code className="text-white/80">xray-scanner</code>,{" "}
            <code className="text-white/80">impact-stamp</code>,{" "}
            <code className="text-white/80">grid-lock</code>. Legacy{" "}
            <code className="text-white/80">{LEGACY_TEMPLATE_ID}</code> →
            Expedition HUD.
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#8E8E93]">Current copy (JSON)</span>
              <button
                type="button"
                onClick={copyJsonToClipboard}
                className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30"
              >
                {copyFlash ? "Copied" : "Copy JSON"}
              </button>
            </div>
            <textarea
              readOnly
              value={exportJson}
              rows={jsonTextareaRows}
              className="w-full resize-y rounded-md border border-white/15 bg-black/60 px-2 py-2 font-mono text-[11px] leading-relaxed text-[#D1D1D6] focus:outline-none"
              spellCheck={false}
              aria-label="Exported overlay copy as JSON"
            />
          </div>
          <div className="space-y-2 border-t border-white/10 pt-3">
            <span className="text-xs text-[#8E8E93]">
              Paste JSON from AI (```json fences stripped)
            </span>
            <textarea
              value={jsonPaste}
              onChange={(ev) => {
                setJsonPaste(ev.target.value);
                setJsonError(null);
              }}
              rows={10}
              placeholder={`{\n  "template": "${EFS_SUSPENSION_OVERLAY_TEMPLATE_ID}",\n  "preset": "impact-stamp",\n  "copy": { … }\n}`}
              className="w-full resize-y rounded-md border border-white/15 bg-black/50 px-2 py-2 font-mono text-[11px] leading-relaxed text-white placeholder:text-white/25 focus:border-white/35 focus:outline-none"
              spellCheck={false}
              aria-label="Paste JSON from AI to apply to overlay"
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
          Copy is stored per preset when you switch. Icon-only CTAs use{" "}
          <code className="text-white/70">buttonText</code> as the accessible
          name.
        </p>

        {preset === "expedition-hud" ? (
          <>
            <Field
              label="Brand prefix (white)"
              value={e.brandPrefix}
              onChange={(v) => setExpedition("brandPrefix", v)}
            />
            <Field
              label="Brand suffix (red)"
              value={e.brandSuffixRed}
              onChange={(v) => setExpedition("brandSuffixRed", v)}
            />
            <Field
              label="Subline under logo"
              value={e.brandSubline}
              onChange={(v) => setExpedition("brandSubline", v)}
            />
            <Field
              label="Square — top-right badge"
              value={e.estBadge}
              onChange={(v) => setExpedition("estBadge", v)}
            />
            <Field
              label="Vertical — series pill"
              value={e.seriesBadge}
              onChange={(v) => setExpedition("seriesBadge", v)}
            />
            <Field
              label="Spec 1 — label"
              value={e.spec1Label}
              onChange={(v) => setExpedition("spec1Label", v)}
            />
            <Field
              label="Spec 1 — value"
              value={e.spec1Value}
              onChange={(v) => setExpedition("spec1Value", v)}
            />
            <Field
              label="Spec 2 — label"
              value={e.spec2Label}
              onChange={(v) => setExpedition("spec2Label", v)}
            />
            <Field
              label="Spec 2 — value"
              value={e.spec2Value}
              onChange={(v) => setExpedition("spec2Value", v)}
            />
            <Field
              label="Square dock — title"
              value={e.dockTitle}
              onChange={(v) => setExpedition("dockTitle", v)}
            />
            <Field
              label="Square dock — subtitle"
              value={e.dockSubtitle}
              onChange={(v) => setExpedition("dockSubtitle", v)}
            />
            <Field
              label="Vertical — headline line 1"
              value={e.headlineLine1}
              onChange={(v) => setExpedition("headlineLine1", v)}
            />
            <Field
              label="Vertical — headline line 2 (muted)"
              value={e.headlineLine2}
              onChange={(v) => setExpedition("headlineLine2", v)}
            />
            <Field
              label="Vertical CTA + square button aria-label"
              value={e.buttonText}
              onChange={(v) => setExpedition("buttonText", v)}
            />
          </>
        ) : preset === "xray-scanner" ? (
          <>
            <Field
              label="Sidebar — red badge line"
              value={x.sidebarBadge}
              onChange={(v) => setXray("sidebarBadge", v)}
            />
            <Field
              label="Sidebar — series line 1"
              value={x.seriesLine1}
              onChange={(v) => setXray("seriesLine1", v)}
            />
            <Field
              label="Sidebar — series line 2"
              value={x.seriesLine2}
              onChange={(v) => setXray("seriesLine2", v)}
            />
            <Field
              label="Point 1 — label"
              value={x.point1Label}
              onChange={(v) => setXray("point1Label", v)}
            />
            <Field
              label="Point 1 — value"
              value={x.point1Value}
              onChange={(v) => setXray("point1Value", v)}
            />
            <Field
              label="Point 2 — label"
              value={x.point2Label}
              onChange={(v) => setXray("point2Label", v)}
            />
            <Field
              label="Point 2 — value"
              value={x.point2Value}
              onChange={(v) => setXray("point2Value", v)}
            />
            <Field
              label="Point 3 — label"
              value={x.point3Label}
              onChange={(v) => setXray("point3Label", v)}
            />
            <Field
              label="Point 3 — value"
              value={x.point3Value}
              onChange={(v) => setXray("point3Value", v)}
            />
            <Field
              label="Sidebar footer (small ref line)"
              value={x.sidebarFooter}
              onChange={(v) => setXray("sidebarFooter", v)}
            />
            <Field
              label="Square — headline line 1"
              value={x.squareHeadlinePrimary}
              onChange={(v) => setXray("squareHeadlinePrimary", v)}
            />
            <Field
              label="Square — headline line 2 (muted)"
              value={x.squareHeadlineSecondary}
              onChange={(v) => setXray("squareHeadlineSecondary", v)}
            />
            <Field
              label="Vertical header — primary"
              value={x.scannerHeaderPrimary}
              onChange={(v) => setXray("scannerHeaderPrimary", v)}
            />
            <Field
              label="Vertical header — secondary (green)"
              value={x.scannerHeaderSecondary}
              onChange={(v) => setXray("scannerHeaderSecondary", v)}
            />
            <Field
              label="Frame — small green tag"
              value={x.frameTag}
              onChange={(v) => setXray("frameTag", v)}
            />
            <Field
              label="Frame — title line 1"
              value={x.frameTitleLine1}
              onChange={(v) => setXray("frameTitleLine1", v)}
            />
            <Field
              label="Frame — title line 2 (muted)"
              value={x.frameTitleLine2}
              onChange={(v) => setXray("frameTitleLine2", v)}
            />
            <Field
              label="Grid left — label"
              value={x.grid1Label}
              onChange={(v) => setXray("grid1Label", v)}
            />
            <Field
              label="Grid left — value"
              value={x.grid1Value}
              onChange={(v) => setXray("grid1Value", v)}
            />
            <Field
              label="Grid right — label"
              value={x.grid2Label}
              onChange={(v) => setXray("grid2Label", v)}
            />
            <Field
              label="Grid right — value"
              value={x.grid2Value}
              onChange={(v) => setXray("grid2Value", v)}
            />
            <Field
              label="Vertical CTA + hex/square aria-label"
              value={x.buttonText}
              onChange={(v) => setXray("buttonText", v)}
            />
          </>
        ) : preset === "impact-stamp" ? (
          <>
            <Field
              label="Square — mega background type (faint)"
              value={im.megaBgText}
              onChange={(v) => setImpact("megaBgText", v)}
            />
            <Field
              label="Square — top-right hardware tag"
              value={im.hardwareTag}
              onChange={(v) => setImpact("hardwareTag", v)}
            />
            <Field
              label="Square — vertical side brand"
              value={im.verticalBrand}
              onChange={(v) => setImpact("verticalBrand", v)}
            />
            <Field
              label="Square — footer headline line 1"
              value={im.squareHeadlineL1}
              onChange={(v) => setImpact("squareHeadlineL1", v)}
            />
            <Field
              label="Square — footer headline line 2"
              value={im.squareHeadlineL2}
              onChange={(v) => setImpact("squareHeadlineL2", v)}
            />
            <Field
              label="Square — footer subline (Inter)"
              value={im.squareFooterSubline}
              onChange={(v) => setImpact("squareFooterSubline", v)}
            />
            <Field
              label="Vertical — top banner eyebrow"
              value={im.spineTopEyebrow}
              onChange={(v) => setImpact("spineTopEyebrow", v)}
            />
            <Field
              label="Vertical — top banner title"
              value={im.spineTopTitle}
              onChange={(v) => setImpact("spineTopTitle", v)}
            />
            <Field
              label="Vertical — center outline type line 1"
              value={im.spineMidL1}
              onChange={(v) => setImpact("spineMidL1", v)}
            />
            <Field
              label="Vertical — center outline type line 2"
              value={im.spineMidL2}
              onChange={(v) => setImpact("spineMidL2", v)}
            />
            <Field
              label="Vertical — spec pill"
              value={im.spineSpecPill}
              onChange={(v) => setImpact("spineSpecPill", v)}
            />
            <Field
              label="Vertical — bottom headline line 1"
              value={im.spineBottomL1}
              onChange={(v) => setImpact("spineBottomL1", v)}
            />
            <Field
              label="Vertical — bottom headline line 2"
              value={im.spineBottomL2}
              onChange={(v) => setImpact("spineBottomL2", v)}
            />
            <Field
              label="Vertical CTA + square button aria-label"
              value={im.buttonText}
              onChange={(v) => setImpact("buttonText", v)}
            />
          </>
        ) : (
          <>
            <Field
              label="Square — brand box text"
              value={g.brandBoxText}
              onChange={(v) => setGrid("brandBoxText", v)}
            />
            <Field
              label="Square — project ref line 1"
              value={g.projectRefL1}
              onChange={(v) => setGrid("projectRefL1", v)}
            />
            <Field
              label="Square — project ref line 2"
              value={g.projectRefL2}
              onChange={(v) => setGrid("projectRefL2", v)}
            />
            <Field
              label="Square — node 1 label"
              value={g.node1Text}
              onChange={(v) => setGrid("node1Text", v)}
            />
            <Field
              label="Square — node 2 label"
              value={g.node2Text}
              onChange={(v) => setGrid("node2Text", v)}
            />
            <Field
              label="Square — dock headline line 1 (white)"
              value={g.dockHeadlineL1}
              onChange={(v) => setGrid("dockHeadlineL1", v)}
            />
            <Field
              label="Square — dock headline green line"
              value={g.dockHeadlineGreen}
              onChange={(v) => setGrid("dockHeadlineGreen", v)}
            />
            <Field
              label="Vertical — ruler mark (top)"
              value={g.rulerMark1}
              onChange={(v) => setGrid("rulerMark1", v)}
            />
            <Field
              label="Vertical — ruler mark 2"
              value={g.rulerMark2}
              onChange={(v) => setGrid("rulerMark2", v)}
            />
            <Field
              label="Vertical — ruler mark 3"
              value={g.rulerMark3}
              onChange={(v) => setGrid("rulerMark3", v)}
            />
            <Field
              label="Vertical — ruler mark 4"
              value={g.rulerMark4}
              onChange={(v) => setGrid("rulerMark4", v)}
            />
            <Field
              label="Vertical — ruler mark (bottom)"
              value={g.rulerMark5}
              onChange={(v) => setGrid("rulerMark5", v)}
            />
            <Field
              label="Vertical — badge row text"
              value={g.monolithBadgeText}
              onChange={(v) => setGrid("monolithBadgeText", v)}
            />
            <Field
              label="Vertical — headline line 1"
              value={g.monolithHeadlineL1}
              onChange={(v) => setGrid("monolithHeadlineL1", v)}
            />
            <Field
              label="Vertical — headline green line"
              value={g.monolithHeadlineGreen}
              onChange={(v) => setGrid("monolithHeadlineGreen", v)}
            />
            <Field
              label="Vertical — supporting paragraph"
              value={g.monolithSubtext}
              onChange={(v) => setGrid("monolithSubtext", v)}
              rows={3}
            />
            <Field
              label="Vertical CTA + square circle aria-label"
              value={g.buttonText}
              onChange={(v) => setGrid("buttonText", v)}
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
            Preview · 1:1
          </p>
          <div
            className="overflow-hidden rounded-md border border-white/15 bg-black"
            style={{
              width: PREVIEW_SQUARE,
              height: PREVIEW_SQUARE,
            }}
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
            Preview · 9:16
          </p>
          <div
            className="overflow-hidden rounded-md border border-white/15 bg-black"
            style={{
              width: VERT_PREVIEW_W,
              height: VERT_PREVIEW_H,
            }}
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

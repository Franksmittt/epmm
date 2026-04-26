"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import industrialSquare from "./mpc-zenith-industrial-monolith-square.module.css";
import industrialVertical from "./mpc-zenith-industrial-monolith-vertical.module.css";
import structuralSquare from "./mpc-structural-hud-square.module.css";
import structuralVertical from "./mpc-structural-hud-vertical.module.css";
import enterpriseSquare from "./mpc-enterprise-ecosystem-square.module.css";
import enterpriseVertical from "./mpc-enterprise-ecosystem-vertical.module.css";
import forensicSquare from "./mpc-forensic-matrix-square.module.css";
import forensicVertical from "./mpc-forensic-matrix-vertical.module.css";

export type MaverickOverlayPresetId =
  | "zenith-industrial-monolith"
  | "structural-hud"
  | "enterprise-ecosystem"
  | "forensic-matrix";

export const MAVERICK_OVERLAY_PRESETS: {
  id: MaverickOverlayPresetId;
  label: string;
}[] = [
  {
    id: "zenith-industrial-monolith",
    label: "Zenith Industrial Monolith",
  },
  { id: "structural-hud", label: "Structural HUD (blueprint)" },
  {
    id: "enterprise-ecosystem",
    label: "Enterprise Ecosystem (violet + trust blue)",
  },
  {
    id: "forensic-matrix",
    label: "Forensic Matrix (green + amber)",
  },
];

const INDUSTRIAL_KEYS = [
  "brandName",
  "squareHeadlineSolid",
  "squareHeadlineOutline",
  "squareMetricVal",
  "squareMetricLbl",
  "squareSubtext",
  "squareCta",
  "verticalLaserCaption",
  "verticalGeoLine1Prefix",
  "verticalGeoLine1Accent",
  "verticalGeoLine2Prefix",
  "verticalGeoLine2Accent",
  "verticalPill1Label",
  "verticalPill1Value",
  "verticalPill2Label",
  "verticalPill2Value",
  "verticalHeadlineSolid",
  "verticalHeadlineMuted",
  "verticalSubtext",
  "verticalMetricLbl",
  "verticalMetricVal",
  "verticalCta",
] as const;

const STRUCTURAL_KEYS = [
  "strSquareIdBox",
  "strSquareBrandLine",
  "strSquareHeadlineL1",
  "strSquareHeadlineL2",
  "strSquareSubtext",
  "strSquareWidgetVal",
  "strSquareWidgetLbl",
  "strVerticalTopHud",
  "strVerticalTagAlert",
  "strVerticalTagSecondary",
  "strVerticalHeadlineSolid",
  "strVerticalHeadlineOutline",
  "strVerticalSubtext",
  "strVerticalReadoutVal",
  "strVerticalReadoutLbl",
  "strVerticalCta",
] as const;

const ENTERPRISE_KEYS = [
  "entVerticalCompanyShield",
  "entVerticalTrust1Val",
  "entVerticalTrust1Lbl",
  "entVerticalTrust2Val",
  "entVerticalTrust2Lbl",
  "entVerticalPill1",
  "entVerticalPill2",
  "entVerticalHeadlineL1",
  "entVerticalHeadlineL2",
  "entVerticalSubtext",
  "entVerticalCgVal",
  "entVerticalCgLbl",
  "entVerticalCta",
  "entSquareLogoMain",
  "entSquareLogoSub",
  "entSquareTrustShield",
  "entSquareHeadlineL1",
  "entSquareHeadlineViolet",
  "entSquareServiceSpecs",
  "entSquareGTitle",
  "entSquareGDesc",
  "entSquareCta",
] as const;

const FORENSIC_KEYS = [
  "frmVerticalCorpName",
  "frmVerticalCorpCreds",
  "frmVerticalTrustShield",
  "frmVerticalTel1Val",
  "frmVerticalTel1Lbl",
  "frmVerticalTel2Val",
  "frmVerticalTel2Lbl",
  "frmVerticalBadgeWarning",
  "frmVerticalHeadlineL1",
  "frmVerticalHeadlineL2",
  "frmVerticalSubtext",
  "frmVerticalSpecLabel",
  "frmVerticalSpecSub",
  "frmVerticalCta",
  "frmSquareCorpName",
  "frmSquareCorpTag",
  "frmSquareTrustL1",
  "frmSquareTrustL2",
  "frmSquareConsoleHeader",
  "frmSquareHeadlineL1",
  "frmSquareHeadlineL2",
  "frmSquareSubtext",
  "frmSquareMetricVal",
  "frmSquareMetricLbl",
  "frmSquareCta",
] as const;

type IndustrialCopyKey = (typeof INDUSTRIAL_KEYS)[number];
type StructuralCopyKey = (typeof STRUCTURAL_KEYS)[number];
type EnterpriseCopyKey = (typeof ENTERPRISE_KEYS)[number];
type ForensicCopyKey = (typeof FORENSIC_KEYS)[number];

export const MAVERICK_OVERLAY_JSON_TEMPLATE_ID = "maverick-painting-overlay";
/** v4 Forensic Matrix; v3 Enterprise; v2 Structural; v1 Industrial. */
export const MAVERICK_OVERLAY_JSON_VERSION = 4;

const DEFAULTS_INDUSTRIAL: Record<IndustrialCopyKey, string> = {
  brandName: "Maverick Painting",
  squareHeadlineSolid: "Absolute.",
  squareHeadlineOutline: "Coverage.",
  squareMetricVal: "5yr",
  squareMetricLbl: "Warranty ready",
  squareSubtext:
    "Interior and exterior finishes for homes and commercial spaces. Prep, paint, and protection—done right the first time.",
  squareCta: "Get a quote",
  verticalLaserCaption: "SITE: READY FOR COAT",
  verticalGeoLine1Prefix: "SCOPE:",
  verticalGeoLine1Accent: "FULL INTERIOR",
  verticalGeoLine2Prefix: "FINISH:",
  verticalGeoLine2Accent: "PREMIUM LATEX",
  verticalPill1Label: "Prep:",
  verticalPill1Value: "Full",
  verticalPill2Label: "Grade:",
  verticalPill2Value: "Pro",
  verticalHeadlineSolid: "Homes.",
  verticalHeadlineMuted: "Transformed.",
  verticalSubtext:
    "Clean lines, durable coatings, and crews who respect your property. Residential and commercial painting across the metro.",
  verticalMetricLbl: "Scheduling",
  verticalMetricVal: "This week",
  verticalCta: "Book estimate",
};

const DEFAULTS_STRUCTURAL: Record<StructuralCopyKey, string> = {
  strSquareIdBox: "SYS",
  strSquareBrandLine: "Maverick Painting",
  strSquareHeadlineL1: "Rooms.",
  strSquareHeadlineL2: "Renewed.",
  strSquareSubtext:
    "Prep-forward interior and exterior painting. We protect trim, floors, and furniture while we transform your space.",
  strSquareWidgetVal: "This week",
  strSquareWidgetLbl: "Typical start",
  strVerticalTopHud: "Moisture check: clear",
  strVerticalTagAlert: "Sun fade risk",
  strVerticalTagSecondary: "Primer locked",
  strVerticalHeadlineSolid: "Weather.",
  strVerticalHeadlineOutline: "Sealed.",
  strVerticalSubtext:
    "Exterior coatings that flex with the substrate and shed water. From stucco to wood—we spec the right system for your building.",
  strVerticalReadoutVal: "10+",
  strVerticalReadoutLbl: "Years experience",
  strVerticalCta: "Book survey",
};

const DEFAULTS_ENTERPRISE: Record<EnterpriseCopyKey, string> = {
  entVerticalCompanyShield: "Maverick — verified crews",
  entVerticalTrust1Val: "Written",
  entVerticalTrust1Lbl: "Scope & warranty",
  entVerticalTrust2Val: "Insured",
  entVerticalTrust2Lbl: "Fully covered",
  entVerticalPill1: "Interior + exterior",
  entVerticalPill2: "Premium coatings",
  entVerticalHeadlineL1: "Finish.",
  entVerticalHeadlineL2: "Locked in.",
  entVerticalSubtext:
    "Residential and commercial painting with disciplined prep, clean lines, and finishes built to hold up to daily wear.",
  entVerticalCgVal: "Local crews",
  entVerticalCgLbl: "On-site estimates",
  entVerticalCta: "Book estimate",
  entSquareLogoMain: "Maverick Painting",
  entSquareLogoSub: "Residential · commercial",
  entSquareTrustShield: "Licensed teams",
  entSquareHeadlineL1: "Absolute",
  entSquareHeadlineViolet: "coverage.",
  entSquareServiceSpecs:
    "Cabinet refinishing, interior repaint, and exterior systems. We protect floors and furniture and leave the site spotless.",
  entSquareGTitle: "Satisfaction focus",
  entSquareGDesc: "Walkthrough before sign-off",
  entSquareCta: "Get a quote",
};

const DEFAULTS_FORENSIC: Record<ForensicCopyKey, string> = {
  frmVerticalCorpName: "Maverick Painting",
  frmVerticalCorpCreds: "Prep · prime · finish",
  frmVerticalTrustShield: "Insured crews",
  frmVerticalTel1Val: "Mapped",
  frmVerticalTel1Lbl: "Surface prep",
  frmVerticalTel2Val: "Locked",
  frmVerticalTel2Lbl: "Color match",
  frmVerticalBadgeWarning: "Walkthrough active",
  frmVerticalHeadlineL1: "Every coat.",
  frmVerticalHeadlineL2: "Accountable.",
  frmVerticalSubtext:
    "We document moisture-prone areas, repair imperfections, and specify coatings for your substrate—so the finish lasts.",
  frmVerticalSpecLabel: "Written scope",
  frmVerticalSpecSub: "Before we start",
  frmVerticalCta: "Book walkthrough",
  frmSquareCorpName: "Maverick Painting",
  frmSquareCorpTag: "Residential · commercial",
  frmSquareTrustL1: "Verified",
  frmSquareTrustL2: "Prep-first",
  frmSquareConsoleHeader: "Phase 1: site review",
  frmSquareHeadlineL1: "Precision.",
  frmSquareHeadlineL2: "Delivered.",
  frmSquareSubtext:
    "From cabinet systems to full exterior repaint—we map the job, protect your property, and finish on schedule.",
  frmSquareMetricVal: "100%",
  frmSquareMetricLbl: "Detail logged",
  frmSquareCta: "Schedule audit",
};

type CopyByPreset = {
  "zenith-industrial-monolith": Record<IndustrialCopyKey, string>;
  "structural-hud": Record<StructuralCopyKey, string>;
  "enterprise-ecosystem": Record<EnterpriseCopyKey, string>;
  "forensic-matrix": Record<ForensicCopyKey, string>;
};

const initialCopyByPreset: CopyByPreset = {
  "zenith-industrial-monolith": { ...DEFAULTS_INDUSTRIAL },
  "structural-hud": { ...DEFAULTS_STRUCTURAL },
  "enterprise-ecosystem": { ...DEFAULTS_ENTERPRISE },
  "forensic-matrix": { ...DEFAULTS_FORENSIC },
};

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

function extractCopyBlock(
  parsed: unknown,
): Record<string, unknown> | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return null;
  const root = parsed as Record<string, unknown>;
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

function isMaverickPresetId(v: unknown): v is MaverickOverlayPresetId {
  return (
    v === "zenith-industrial-monolith" ||
    v === "structural-hud" ||
    v === "enterprise-ecosystem" ||
    v === "forensic-matrix"
  );
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): MaverickOverlayPresetId | null {
  for (const k of FORENSIC_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) return "forensic-matrix";
  }
  for (const k of ENTERPRISE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k))
      return "enterprise-ecosystem";
  }
  for (const k of STRUCTURAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) return "structural-hud";
  }
  for (const k of INDUSTRIAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k))
      return "zenith-industrial-monolith";
  }
  return null;
}

function keysForPreset(p: MaverickOverlayPresetId): readonly string[] {
  if (p === "forensic-matrix") return FORENSIC_KEYS;
  if (p === "structural-hud") return STRUCTURAL_KEYS;
  if (p === "enterprise-ecosystem") return ENTERPRISE_KEYS;
  return INDUSTRIAL_KEYS;
}

function exportSlugForPreset(p: MaverickOverlayPresetId): string {
  if (p === "structural-hud") return "structural-hud";
  if (p === "enterprise-ecosystem") return "enterprise-ecosystem";
  if (p === "forensic-matrix") return "forensic-matrix";
  return "zenith-industrial-monolith";
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

function ChevronRight({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={size <= 16 ? 3 : 2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldOutlineSvg({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckCompactSvg({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShieldOutlineWideSvg({ size = 20 }: { size?: number }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckCircleForensicSvg({ size = 12 }: { size?: number }) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function MaverickPaintingOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<MaverickOverlayPresetId>(
    "zenith-industrial-monolith",
  );
  const [copyByPreset, setCopyByPreset] = useState<CopyByPreset>(
    initialCopyByPreset,
  );
  const ind = copyByPreset["zenith-industrial-monolith"];
  const str = copyByPreset["structural-hud"];
  const ent = copyByPreset["enterprise-ecosystem"];
  const frm = copyByPreset["forensic-matrix"];

  const patchIndustrial = (key: IndustrialCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "zenith-industrial-monolith": {
        ...prev["zenith-industrial-monolith"],
        [key]: value,
      },
    }));
  };

  const patchStructural = (key: StructuralCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "structural-hud": { ...prev["structural-hud"], [key]: value },
    }));
  };

  const patchEnterprise = (key: EnterpriseCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "enterprise-ecosystem": { ...prev["enterprise-ecosystem"], [key]: value },
    }));
  };

  const patchForensic = (key: ForensicCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "forensic-matrix": { ...prev["forensic-matrix"], [key]: value },
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

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          template: MAVERICK_OVERLAY_JSON_TEMPLATE_ID,
          version: MAVERICK_OVERLAY_JSON_VERSION,
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
      setJsonError('Expected an object with a "copy" field or flat keys.');
      return;
    }

    let targetPreset: MaverickOverlayPresetId = preset;
    if (isMaverickPresetId(root?.preset)) {
      targetPreset = root.preset;
    } else {
      targetPreset = inferPresetFromBlock(block) ?? "zenith-industrial-monolith";
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
      setJsonError(
        `No recognised fields for this preset. Try: ${keys.join(", ")}`,
      );
      return;
    }

    setPreset(targetPreset);
    setCopyByPreset((prev) => ({
      ...prev,
      [targetPreset]: {
        ...prev[targetPreset],
        ...picked,
      } as CopyByPreset[typeof targetPreset],
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
      if (preset === "structural-hud") {
        return { ...prev, "structural-hud": { ...DEFAULTS_STRUCTURAL } };
      }
      if (preset === "enterprise-ecosystem") {
        return { ...prev, "enterprise-ecosystem": { ...DEFAULTS_ENTERPRISE } };
      }
      if (preset === "forensic-matrix") {
        return { ...prev, "forensic-matrix": { ...DEFAULTS_FORENSIC } };
      }
      return { ...prev, "zenith-industrial-monolith": { ...DEFAULTS_INDUSTRIAL } };
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
      a.download = `mpc-${exportSlug}-square-1080-${Date.now()}.png`;
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
      a.download = `mpc-${exportSlug}-vertical-9x16-${Date.now()}.png`;
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

  const squareCanvasIndustrial = (
    <div
      ref={squareRef}
      className={`${industrialSquare.root} ${industrialSquare.canvas1080}`}
      aria-label="Maverick Zenith Industrial Monolith square export"
    >
      <div className={industrialSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={industrialSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={industrialSquare.scrim} />
        <div className={industrialSquare.topLayer}>
          <h1 className={industrialSquare.breakoutHeadline}>
            {ind.squareHeadlineSolid}
            <span className={industrialSquare.headlineOutline}>
              {ind.squareHeadlineOutline}
            </span>
          </h1>
          <div className={industrialSquare.floatingMetric}>
            <span className={industrialSquare.metricVal}>
              {ind.squareMetricVal}
            </span>
            <span className={industrialSquare.metricLbl}>
              {ind.squareMetricLbl}
            </span>
          </div>
        </div>
        <div className={industrialSquare.commandStrip}>
          <div className={industrialSquare.stripInfo}>
            <div className={industrialSquare.brandName}>{ind.brandName}</div>
            <p className={industrialSquare.subtext}>{ind.squareSubtext}</p>
          </div>
          <button type="button" className={industrialSquare.btnAction}>
            {ind.squareCta}
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );

  const verticalCanvasIndustrial = (
    <div
      ref={verticalRef}
      className={`${industrialVertical.root} ${industrialVertical.canvas1080x1920}`}
      aria-label="Maverick Zenith Industrial Monolith vertical export"
    >
      <div className={industrialVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={industrialVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={industrialVertical.scrim} />
        <div className={industrialVertical.laserGrid}>
          <div className={industrialVertical.laserLineH}>
            <span className={industrialVertical.laserCaption}>
              {ind.verticalLaserCaption}
            </span>
          </div>
          <div className={industrialVertical.crosshair} />
        </div>
        <div className={industrialVertical.topHud}>
          <div className={industrialVertical.brandLockup}>
            <div className={industrialVertical.statusDot} />
            <div className={industrialVertical.brandText}>{ind.brandName}</div>
          </div>
          <div className={industrialVertical.geoTag}>
            {ind.verticalGeoLine1Prefix}{" "}
            <span className={industrialVertical.geoAccent}>
              {ind.verticalGeoLine1Accent}
            </span>
            <br />
            {ind.verticalGeoLine2Prefix}{" "}
            <span className={industrialVertical.geoAccent}>
              {ind.verticalGeoLine2Accent}
            </span>
          </div>
        </div>
        <div className={industrialVertical.bottomConsole}>
          <div className={industrialVertical.dataRow}>
            <div className={industrialVertical.dataPill}>
              {ind.verticalPill1Label}{" "}
              <span className={industrialVertical.pillValue}>
                {ind.verticalPill1Value}
              </span>
            </div>
            <div className={industrialVertical.dataPill}>
              {ind.verticalPill2Label}{" "}
              <span className={industrialVertical.pillValue}>
                {ind.verticalPill2Value}
              </span>
            </div>
          </div>
          <h1 className={industrialVertical.headline}>
            {ind.verticalHeadlineSolid}
            <br />
            <span className={industrialVertical.headlineMuted}>
              {ind.verticalHeadlineMuted}
            </span>
          </h1>
          <p className={industrialVertical.subtext}>{ind.verticalSubtext}</p>
          <div className={industrialVertical.actionDock}>
            <div className={industrialVertical.metric}>
              <span className={industrialVertical.metricLbl}>
                {ind.verticalMetricLbl}
              </span>
              <span className={industrialVertical.metricVal}>
                {ind.verticalMetricVal}
              </span>
            </div>
            <button type="button" className={industrialVertical.btnCore}>
              {ind.verticalCta}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasStructural = (
    <div
      ref={squareRef}
      className={`${structuralSquare.root} ${structuralSquare.canvas1080}`}
      aria-label="Maverick Structural HUD square export"
    >
      <div className={structuralSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={structuralSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={structuralSquare.blueprintGrid} />
        <div className={structuralSquare.scrimTl} />
        <div className={structuralSquare.scrimBr} />
        <div className={structuralSquare.heroCard}>
          <div className={structuralSquare.brandIdentifier}>
            <span className={structuralSquare.idBox}>{str.strSquareIdBox}</span>
            <span className={structuralSquare.idText}>
              {str.strSquareBrandLine}
            </span>
          </div>
          <h1 className={structuralSquare.headline}>
            {str.strSquareHeadlineL1}
            <br />
            {str.strSquareHeadlineL2}
          </h1>
          <p className={structuralSquare.subtext}>{str.strSquareSubtext}</p>
        </div>
        <div className={structuralSquare.actionWidget}>
          <div className={structuralSquare.widgetData}>
            <span className={structuralSquare.wVal}>{str.strSquareWidgetVal}</span>
            <span className={structuralSquare.wLbl}>{str.strSquareWidgetLbl}</span>
          </div>
          <button type="button" className={structuralSquare.btnCircle}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const verticalCanvasStructural = (
    <div
      ref={verticalRef}
      className={`${structuralVertical.root} ${structuralVertical.canvas1080x1920}`}
      aria-label="Maverick Structural HUD vertical export"
    >
      <div className={structuralVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={structuralVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={structuralVertical.blueprintGrid} />
        <div className={structuralVertical.topHud}>
          <div className={structuralVertical.hudIndicator}>
            <div className={structuralVertical.dot} />
            <span className={structuralVertical.hudText}>
              {str.strVerticalTopHud}
            </span>
          </div>
        </div>
        <div className={structuralVertical.commandTerminal}>
          <div className={structuralVertical.systemTags}>
            <div
              className={`${structuralVertical.tag} ${structuralVertical.tagAlert}`}
            >
              {str.strVerticalTagAlert}
            </div>
            <div className={structuralVertical.tag}>
              {str.strVerticalTagSecondary}
            </div>
          </div>
          <h1 className={structuralVertical.headline}>
            {str.strVerticalHeadlineSolid}
            <br />
            <span className={structuralVertical.headlineOutline}>
              {str.strVerticalHeadlineOutline}
            </span>
          </h1>
          <p className={structuralVertical.subtext}>{str.strVerticalSubtext}</p>
          <div className={structuralVertical.actionRow}>
            <div className={structuralVertical.telemetryReadout}>
              <span className={structuralVertical.readoutVal}>
                {str.strVerticalReadoutVal}
              </span>
              <span className={structuralVertical.readoutLbl}>
                {str.strVerticalReadoutLbl}
              </span>
            </div>
            <button type="button" className={structuralVertical.btnSquircle}>
              {str.strVerticalCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasEnterprise = (
    <div
      ref={squareRef}
      className={`${enterpriseSquare.root} ${enterpriseSquare.canvas1080}`}
      aria-label="Maverick Enterprise Ecosystem square export"
    >
      <div className={enterpriseSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={enterpriseSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={enterpriseSquare.scrim} />
        <div className={enterpriseSquare.topCredibilityBar}>
          <div className={enterpriseSquare.companyLogo}>
            <span className={enterpriseSquare.logoMain}>
              {ent.entSquareLogoMain}
            </span>
            <span className={enterpriseSquare.logoSub}>
              {ent.entSquareLogoSub}
            </span>
          </div>
          <div className={enterpriseSquare.trustShield}>
            <CheckCompactSvg />
            {ent.entSquareTrustShield}
          </div>
        </div>
        <div className={enterpriseSquare.splitTerminal}>
          <div className={enterpriseSquare.serviceSide}>
            <h2 className={enterpriseSquare.serviceHeadline}>
              {ent.entSquareHeadlineL1}
              <br />
              <span className={enterpriseSquare.headlineViolet}>
                {ent.entSquareHeadlineViolet}
              </span>
            </h2>
            <p className={enterpriseSquare.serviceSpecs}>
              {ent.entSquareServiceSpecs}
            </p>
          </div>
          <div className={enterpriseSquare.companySide}>
            <div className={enterpriseSquare.guaranteeBox}>
              <div className={enterpriseSquare.gIcon}>
                <ShieldOutlineWideSvg />
              </div>
              <span className={enterpriseSquare.gTitle}>
                {ent.entSquareGTitle}
              </span>
              <span className={enterpriseSquare.gDesc}>
                {ent.entSquareGDesc}
              </span>
            </div>
            <button type="button" className={enterpriseSquare.btnAction}>
              {ent.entSquareCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasEnterprise = (
    <div
      ref={verticalRef}
      className={`${enterpriseVertical.root} ${enterpriseVertical.canvas1080x1920}`}
      aria-label="Maverick Enterprise Ecosystem vertical export"
    >
      <div className={enterpriseVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={enterpriseVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={enterpriseVertical.scrim} />
        <div className={enterpriseVertical.companyShield}>
          <span className={enterpriseVertical.shieldIcon}>
            <ShieldOutlineSvg />
          </span>
          <span className={enterpriseVertical.companyName}>
            {ent.entVerticalCompanyShield}
          </span>
        </div>
        <div className={enterpriseVertical.trustMetrics}>
          <div className={enterpriseVertical.trustBadge}>
            <span className={enterpriseVertical.trustVal}>
              {ent.entVerticalTrust1Val}
            </span>
            <span className={enterpriseVertical.trustLbl}>
              {ent.entVerticalTrust1Lbl}
            </span>
          </div>
          <div className={enterpriseVertical.trustBadge}>
            <span className={enterpriseVertical.trustVal}>
              {ent.entVerticalTrust2Val}
            </span>
            <span className={enterpriseVertical.trustLbl}>
              {ent.entVerticalTrust2Lbl}
            </span>
          </div>
        </div>
        <div className={enterpriseVertical.serviceConsole}>
          <div className={enterpriseVertical.techRow}>
            <div className={enterpriseVertical.techPill}>
              {ent.entVerticalPill1}
            </div>
            <div className={enterpriseVertical.techPill}>
              {ent.entVerticalPill2}
            </div>
          </div>
          <h1 className={enterpriseVertical.headline}>
            {ent.entVerticalHeadlineL1}
            <br />
            {ent.entVerticalHeadlineL2}
          </h1>
          <p className={enterpriseVertical.subtext}>
            {ent.entVerticalSubtext}
          </p>
          <div className={enterpriseVertical.actionDock}>
            <div className={enterpriseVertical.companyGuarantee}>
              <span className={enterpriseVertical.cgVal}>
                {ent.entVerticalCgVal}
              </span>
              <span className={enterpriseVertical.cgLbl}>
                {ent.entVerticalCgLbl}
              </span>
            </div>
            <button type="button" className={enterpriseVertical.btnSquircle}>
              {ent.entVerticalCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasForensic = (
    <div
      ref={squareRef}
      className={`${forensicSquare.root} ${forensicSquare.canvas1080}`}
      aria-label="Maverick Forensic Matrix square export"
    >
      <div className={forensicSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={forensicSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={forensicSquare.scrim} />
        <div className={forensicSquare.companyGrid}>
          <div className={forensicSquare.corpIdentity}>
            <span className={forensicSquare.corpName}>
              {frm.frmSquareCorpName}
            </span>
            <span className={forensicSquare.corpTag}>
              {frm.frmSquareCorpTag}
            </span>
          </div>
          <div className={forensicSquare.trustBadge}>
            <ShieldOutlineWideSvg size={18} />
            <span className={forensicSquare.trustText}>
              {frm.frmSquareTrustL1}
              <br />
              {frm.frmSquareTrustL2}
            </span>
          </div>
        </div>
        <div className={forensicSquare.serviceConsole}>
          <div className={forensicSquare.consoleInfo}>
            <span className={forensicSquare.cHeader}>
              {frm.frmSquareConsoleHeader}
            </span>
            <h2 className={forensicSquare.headline}>
              {frm.frmSquareHeadlineL1}
              <br />
              {frm.frmSquareHeadlineL2}
            </h2>
            <p className={forensicSquare.subtext}>{frm.frmSquareSubtext}</p>
          </div>
          <div className={forensicSquare.consoleAction}>
            <div className={forensicSquare.dataPoint}>
              <span className={forensicSquare.dpVal}>
                {frm.frmSquareMetricVal}
              </span>
              <span className={forensicSquare.dpLbl}>
                {frm.frmSquareMetricLbl}
              </span>
            </div>
            <button type="button" className={forensicSquare.btnCore}>
              {frm.frmSquareCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasForensic = (
    <div
      ref={verticalRef}
      className={`${forensicVertical.root} ${forensicVertical.canvas1080x1920}`}
      aria-label="Maverick Forensic Matrix vertical export"
    >
      <div className={forensicVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={forensicVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={forensicVertical.scrim} />
        <div className={forensicVertical.authorityBlock}>
          <div className={forensicVertical.companyIdentity}>
            <span className={forensicVertical.corpName}>
              {frm.frmVerticalCorpName}
            </span>
            <span className={forensicVertical.corpCreds}>
              {frm.frmVerticalCorpCreds}
            </span>
          </div>
          <div className={forensicVertical.trustShield}>
            <CheckCircleForensicSvg />
            {frm.frmVerticalTrustShield}
          </div>
        </div>
        <div className={forensicVertical.edgeTelemetry}>
          <div className={forensicVertical.dataNode}>
            <span className={forensicVertical.nodeVal}>
              {frm.frmVerticalTel1Val}
            </span>
            <span className={forensicVertical.nodeLbl}>
              {frm.frmVerticalTel1Lbl}
            </span>
          </div>
          <div className={forensicVertical.dataNode}>
            <span className={forensicVertical.nodeVal}>
              {frm.frmVerticalTel2Val}
            </span>
            <span className={forensicVertical.nodeLbl}>
              {frm.frmVerticalTel2Lbl}
            </span>
          </div>
        </div>
        <div className={forensicVertical.diagnosticCard}>
          <div className={forensicVertical.diagnosticHeader}>
            <div className={forensicVertical.badgeWarning}>
              {frm.frmVerticalBadgeWarning}
            </div>
          </div>
          <h1 className={forensicVertical.headline}>
            {frm.frmVerticalHeadlineL1}
            <br />
            {frm.frmVerticalHeadlineL2}
          </h1>
          <p className={forensicVertical.subtext}>{frm.frmVerticalSubtext}</p>
          <div className={forensicVertical.actionRow}>
            <div className={forensicVertical.specLabel}>
              {frm.frmVerticalSpecLabel}
              <span className={forensicVertical.specSub}>
                {frm.frmVerticalSpecSub}
              </span>
            </div>
            <button type="button" className={forensicVertical.btnForensic}>
              {frm.frmVerticalCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvas =
    preset === "zenith-industrial-monolith"
      ? squareCanvasIndustrial
      : preset === "structural-hud"
        ? squareCanvasStructural
        : preset === "enterprise-ecosystem"
          ? squareCanvasEnterprise
          : squareCanvasForensic;
  const verticalCanvas =
    preset === "zenith-industrial-monolith"
      ? verticalCanvasIndustrial
      : preset === "structural-hud"
        ? verticalCanvasStructural
        : preset === "enterprise-ecosystem"
          ? verticalCanvasEnterprise
          : verticalCanvasForensic;

  const previewLabel =
    preset === "zenith-industrial-monolith"
      ? "Zenith Industrial"
      : preset === "structural-hud"
        ? "Structural HUD"
        : preset === "enterprise-ecosystem"
          ? "Enterprise Ecosystem"
          : "Forensic Matrix";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <label className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Template preset
          </label>
          <select
            value={preset}
            onChange={(e) =>
              setPreset(e.target.value as MaverickOverlayPresetId)
            }
            className="mt-1 w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            aria-label="Maverick overlay template preset"
          >
            {MAVERICK_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            {preset === "structural-hud"
              ? "Blueprint grid + cyan/orange HUD. Vertical has no animated scanner (static PNG export)."
              : preset === "enterprise-ecosystem"
                ? "Trust blue + violet pills, company shield, split terminal square. Aero-Epoxy–style enterprise layout."
                : preset === "forensic-matrix"
                  ? "Forensic green + amber badges, edge telemetry, diagnostic card. Zenith Forensics–style matrix."
                  : "Industrial Monolith: laser line, command strip, safety yellow CTAs."}
          </p>
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

        <div className="space-y-3 rounded-md border border-cyan-500/20 bg-cyan-500/[0.06] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-200/90">
            AI · JSON workflow
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            <code className="text-white/80">
              {MAVERICK_OVERLAY_JSON_TEMPLATE_ID}
            </code>{" "}
            v{MAVERICK_OVERLAY_JSON_VERSION} · include{" "}
            <code className="text-white/80">preset</code> (
            <code className="text-white/80">zenith-industrial-monolith</code>,{" "}
            <code className="text-white/80">structural-hud</code>,{" "}
            <code className="text-white/80">enterprise-ecosystem</code>,{" "}
            <code className="text-white/80">forensic-matrix</code>). JSON
            without <code className="text-white/80">preset</code> still infers
            from keys (Forensic → Enterprise → Structural → Industrial).
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#8E8E93]">Current copy (JSON)</span>
              <button
                type="button"
                onClick={copyJsonToClipboard}
                className="rounded-md bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/30"
              >
                {copyFlash ? "Copied" : "Copy JSON"}
              </button>
            </div>
            <textarea
              readOnly
              value={exportJson}
              rows={
                preset === "forensic-matrix"
                  ? 40
                  : preset === "enterprise-ecosystem"
                    ? 36
                    : preset === "structural-hud"
                      ? 28
                      : 32
              }
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
              placeholder={`{\n  "template": "${MAVERICK_OVERLAY_JSON_TEMPLATE_ID}",\n  "preset": "forensic-matrix",\n  "copy": { … }\n}`}
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
                <span className="text-xs text-cyan-300">Applied.</span>
              ) : null}
            </div>
            {jsonError ? (
              <p className="text-xs text-red-300">{jsonError}</p>
            ) : null}
          </div>
        </div>

        {preset === "zenith-industrial-monolith" ? (
          <>
            <Field
              label="Brand name (square strip + vertical HUD)"
              value={ind.brandName}
              onChange={(x) => patchIndustrial("brandName", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Industrial Monolith
            </p>
            <Field
              label="Headline — solid line"
              value={ind.squareHeadlineSolid}
              onChange={(x) => patchIndustrial("squareHeadlineSolid", x)}
            />
            <Field
              label="Headline — outline line"
              value={ind.squareHeadlineOutline}
              onChange={(x) => patchIndustrial("squareHeadlineOutline", x)}
            />
            <Field
              label="Floating metric — value (cyan)"
              value={ind.squareMetricVal}
              onChange={(x) => patchIndustrial("squareMetricVal", x)}
            />
            <Field
              label="Floating metric — label (mono)"
              value={ind.squareMetricLbl}
              onChange={(x) => patchIndustrial("squareMetricLbl", x)}
            />
            <Field
              label="Command strip — subtext"
              value={ind.squareSubtext}
              onChange={(x) => patchIndustrial("squareSubtext", x)}
              rows={3}
            />
            <Field
              label="Square CTA"
              value={ind.squareCta}
              onChange={(x) => patchIndustrial("squareCta", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Industrial Monolith
            </p>
            <Field
              label="Laser line caption"
              value={ind.verticalLaserCaption}
              onChange={(x) => patchIndustrial("verticalLaserCaption", x)}
            />
            <Field
              label="Geo tag — line 1 prefix"
              value={ind.verticalGeoLine1Prefix}
              onChange={(x) => patchIndustrial("verticalGeoLine1Prefix", x)}
            />
            <Field
              label="Geo tag — line 1 accent (cyan)"
              value={ind.verticalGeoLine1Accent}
              onChange={(x) => patchIndustrial("verticalGeoLine1Accent", x)}
            />
            <Field
              label="Geo tag — line 2 prefix"
              value={ind.verticalGeoLine2Prefix}
              onChange={(x) => patchIndustrial("verticalGeoLine2Prefix", x)}
            />
            <Field
              label="Geo tag — line 2 accent"
              value={ind.verticalGeoLine2Accent}
              onChange={(x) => patchIndustrial("verticalGeoLine2Accent", x)}
            />
            <Field
              label="Data pill 1 — label"
              value={ind.verticalPill1Label}
              onChange={(x) => patchIndustrial("verticalPill1Label", x)}
            />
            <Field
              label="Data pill 1 — value"
              value={ind.verticalPill1Value}
              onChange={(x) => patchIndustrial("verticalPill1Value", x)}
            />
            <Field
              label="Data pill 2 — label"
              value={ind.verticalPill2Label}
              onChange={(x) => patchIndustrial("verticalPill2Label", x)}
            />
            <Field
              label="Data pill 2 — value"
              value={ind.verticalPill2Value}
              onChange={(x) => patchIndustrial("verticalPill2Value", x)}
            />
            <Field
              label="Headline — primary line"
              value={ind.verticalHeadlineSolid}
              onChange={(x) => patchIndustrial("verticalHeadlineSolid", x)}
            />
            <Field
              label="Headline — muted line"
              value={ind.verticalHeadlineMuted}
              onChange={(x) => patchIndustrial("verticalHeadlineMuted", x)}
            />
            <Field
              label="Console subtext"
              value={ind.verticalSubtext}
              onChange={(x) => patchIndustrial("verticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Action dock — metric label"
              value={ind.verticalMetricLbl}
              onChange={(x) => patchIndustrial("verticalMetricLbl", x)}
            />
            <Field
              label="Action dock — metric value"
              value={ind.verticalMetricVal}
              onChange={(x) => patchIndustrial("verticalMetricVal", x)}
            />
            <Field
              label="Vertical CTA"
              value={ind.verticalCta}
              onChange={(x) => patchIndustrial("verticalCta", x)}
            />
          </>
        ) : preset === "structural-hud" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Structural HUD
            </p>
            <Field
              label="ID box (e.g. SYS)"
              value={str.strSquareIdBox}
              onChange={(x) => patchStructural("strSquareIdBox", x)}
            />
            <Field
              label="Brand line (mono, beside ID box)"
              value={str.strSquareBrandLine}
              onChange={(x) => patchStructural("strSquareBrandLine", x)}
            />
            <Field
              label="Headline — line 1"
              value={str.strSquareHeadlineL1}
              onChange={(x) => patchStructural("strSquareHeadlineL1", x)}
            />
            <Field
              label="Headline — line 2"
              value={str.strSquareHeadlineL2}
              onChange={(x) => patchStructural("strSquareHeadlineL2", x)}
            />
            <Field
              label="Card subtext"
              value={str.strSquareSubtext}
              onChange={(x) => patchStructural("strSquareSubtext", x)}
              rows={3}
            />
            <Field
              label="Widget — value (cyan)"
              value={str.strSquareWidgetVal}
              onChange={(x) => patchStructural("strSquareWidgetVal", x)}
            />
            <Field
              label="Widget — label"
              value={str.strSquareWidgetLbl}
              onChange={(x) => patchStructural("strSquareWidgetLbl", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Structural HUD
            </p>
            <Field
              label="Top pill — status text (mono)"
              value={str.strVerticalTopHud}
              onChange={(x) => patchStructural("strVerticalTopHud", x)}
            />
            <Field
              label="Tag — alert style (orange)"
              value={str.strVerticalTagAlert}
              onChange={(x) => patchStructural("strVerticalTagAlert", x)}
            />
            <Field
              label="Tag — cyan style"
              value={str.strVerticalTagSecondary}
              onChange={(x) => patchStructural("strVerticalTagSecondary", x)}
            />
            <Field
              label="Headline — solid line"
              value={str.strVerticalHeadlineSolid}
              onChange={(x) => patchStructural("strVerticalHeadlineSolid", x)}
            />
            <Field
              label="Headline — outline line"
              value={str.strVerticalHeadlineOutline}
              onChange={(x) =>
                patchStructural("strVerticalHeadlineOutline", x)
              }
            />
            <Field
              label="Terminal subtext"
              value={str.strVerticalSubtext}
              onChange={(x) => patchStructural("strVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Readout — value (mono)"
              value={str.strVerticalReadoutVal}
              onChange={(x) => patchStructural("strVerticalReadoutVal", x)}
            />
            <Field
              label="Readout — label"
              value={str.strVerticalReadoutLbl}
              onChange={(x) => patchStructural("strVerticalReadoutLbl", x)}
            />
            <Field
              label="CTA button"
              value={str.strVerticalCta}
              onChange={(x) => patchStructural("strVerticalCta", x)}
            />
          </>
        ) : preset === "enterprise-ecosystem" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Enterprise Ecosystem
            </p>
            <Field
              label="Logo — main line"
              value={ent.entSquareLogoMain}
              onChange={(x) => patchEnterprise("entSquareLogoMain", x)}
            />
            <Field
              label="Logo — sub line (mono)"
              value={ent.entSquareLogoSub}
              onChange={(x) => patchEnterprise("entSquareLogoSub", x)}
            />
            <Field
              label="Trust shield pill (with check icon)"
              value={ent.entSquareTrustShield}
              onChange={(x) => patchEnterprise("entSquareTrustShield", x)}
            />
            <Field
              label="Service headline — line 1 (white)"
              value={ent.entSquareHeadlineL1}
              onChange={(x) => patchEnterprise("entSquareHeadlineL1", x)}
            />
            <Field
              label="Service headline — line 2 (violet)"
              value={ent.entSquareHeadlineViolet}
              onChange={(x) => patchEnterprise("entSquareHeadlineViolet", x)}
            />
            <Field
              label="Service specs paragraph"
              value={ent.entSquareServiceSpecs}
              onChange={(x) => patchEnterprise("entSquareServiceSpecs", x)}
              rows={3}
            />
            <Field
              label="Guarantee — title"
              value={ent.entSquareGTitle}
              onChange={(x) => patchEnterprise("entSquareGTitle", x)}
            />
            <Field
              label="Guarantee — description (caps)"
              value={ent.entSquareGDesc}
              onChange={(x) => patchEnterprise("entSquareGDesc", x)}
            />
            <Field
              label="Square CTA (blue button)"
              value={ent.entSquareCta}
              onChange={(x) => patchEnterprise("entSquareCta", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Enterprise Ecosystem
            </p>
            <Field
              label="Company shield pill (with shield icon)"
              value={ent.entVerticalCompanyShield}
              onChange={(x) => patchEnterprise("entVerticalCompanyShield", x)}
            />
            <Field
              label="Trust badge 1 — value"
              value={ent.entVerticalTrust1Val}
              onChange={(x) => patchEnterprise("entVerticalTrust1Val", x)}
            />
            <Field
              label="Trust badge 1 — label (mono)"
              value={ent.entVerticalTrust1Lbl}
              onChange={(x) => patchEnterprise("entVerticalTrust1Lbl", x)}
            />
            <Field
              label="Trust badge 2 — value"
              value={ent.entVerticalTrust2Val}
              onChange={(x) => patchEnterprise("entVerticalTrust2Val", x)}
            />
            <Field
              label="Trust badge 2 — label"
              value={ent.entVerticalTrust2Lbl}
              onChange={(x) => patchEnterprise("entVerticalTrust2Lbl", x)}
            />
            <Field
              label="Tech pill 1 (violet)"
              value={ent.entVerticalPill1}
              onChange={(x) => patchEnterprise("entVerticalPill1", x)}
            />
            <Field
              label="Tech pill 2"
              value={ent.entVerticalPill2}
              onChange={(x) => patchEnterprise("entVerticalPill2", x)}
            />
            <Field
              label="Headline — line 1"
              value={ent.entVerticalHeadlineL1}
              onChange={(x) => patchEnterprise("entVerticalHeadlineL1", x)}
            />
            <Field
              label="Headline — line 2"
              value={ent.entVerticalHeadlineL2}
              onChange={(x) => patchEnterprise("entVerticalHeadlineL2", x)}
            />
            <Field
              label="Console subtext"
              value={ent.entVerticalSubtext}
              onChange={(x) => patchEnterprise("entVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Action dock — guarantee value (blue)"
              value={ent.entVerticalCgVal}
              onChange={(x) => patchEnterprise("entVerticalCgVal", x)}
            />
            <Field
              label="Action dock — guarantee label"
              value={ent.entVerticalCgLbl}
              onChange={(x) => patchEnterprise("entVerticalCgLbl", x)}
            />
            <Field
              label="Vertical CTA (white button)"
              value={ent.entVerticalCta}
              onChange={(x) => patchEnterprise("entVerticalCta", x)}
            />
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Forensic Matrix
            </p>
            <Field
              label="Corp name (uppercase)"
              value={frm.frmSquareCorpName}
              onChange={(x) => patchForensic("frmSquareCorpName", x)}
            />
            <Field
              label="Corp tag (mono)"
              value={frm.frmSquareCorpTag}
              onChange={(x) => patchForensic("frmSquareCorpTag", x)}
            />
            <Field
              label="Trust badge — line 1 (green box)"
              value={frm.frmSquareTrustL1}
              onChange={(x) => patchForensic("frmSquareTrustL1", x)}
            />
            <Field
              label="Trust badge — line 2"
              value={frm.frmSquareTrustL2}
              onChange={(x) => patchForensic("frmSquareTrustL2", x)}
            />
            <Field
              label="Console amber header (mono)"
              value={frm.frmSquareConsoleHeader}
              onChange={(x) => patchForensic("frmSquareConsoleHeader", x)}
            />
            <Field
              label="Headline — line 1"
              value={frm.frmSquareHeadlineL1}
              onChange={(x) => patchForensic("frmSquareHeadlineL1", x)}
            />
            <Field
              label="Headline — line 2"
              value={frm.frmSquareHeadlineL2}
              onChange={(x) => patchForensic("frmSquareHeadlineL2", x)}
            />
            <Field
              label="Console subtext"
              value={frm.frmSquareSubtext}
              onChange={(x) => patchForensic("frmSquareSubtext", x)}
              rows={3}
            />
            <Field
              label="Right column — metric value (mono)"
              value={frm.frmSquareMetricVal}
              onChange={(x) => patchForensic("frmSquareMetricVal", x)}
            />
            <Field
              label="Right column — metric label"
              value={frm.frmSquareMetricLbl}
              onChange={(x) => patchForensic("frmSquareMetricLbl", x)}
            />
            <Field
              label="Square CTA"
              value={frm.frmSquareCta}
              onChange={(x) => patchForensic("frmSquareCta", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Forensic Matrix
            </p>
            <Field
              label="Authority — corp name"
              value={frm.frmVerticalCorpName}
              onChange={(x) => patchForensic("frmVerticalCorpName", x)}
            />
            <Field
              label="Authority — green creds line (mono)"
              value={frm.frmVerticalCorpCreds}
              onChange={(x) => patchForensic("frmVerticalCorpCreds", x)}
            />
            <Field
              label="Trust shield pill (with check-circle icon)"
              value={frm.frmVerticalTrustShield}
              onChange={(x) => patchForensic("frmVerticalTrustShield", x)}
            />
            <Field
              label="Edge telemetry 1 — value"
              value={frm.frmVerticalTel1Val}
              onChange={(x) => patchForensic("frmVerticalTel1Val", x)}
            />
            <Field
              label="Edge telemetry 1 — label"
              value={frm.frmVerticalTel1Lbl}
              onChange={(x) => patchForensic("frmVerticalTel1Lbl", x)}
            />
            <Field
              label="Edge telemetry 2 — value"
              value={frm.frmVerticalTel2Val}
              onChange={(x) => patchForensic("frmVerticalTel2Val", x)}
            />
            <Field
              label="Edge telemetry 2 — label"
              value={frm.frmVerticalTel2Lbl}
              onChange={(x) => patchForensic("frmVerticalTel2Lbl", x)}
            />
            <Field
              label="Diagnostic amber badge"
              value={frm.frmVerticalBadgeWarning}
              onChange={(x) => patchForensic("frmVerticalBadgeWarning", x)}
            />
            <Field
              label="Headline — line 1"
              value={frm.frmVerticalHeadlineL1}
              onChange={(x) => patchForensic("frmVerticalHeadlineL1", x)}
            />
            <Field
              label="Headline — line 2"
              value={frm.frmVerticalHeadlineL2}
              onChange={(x) => patchForensic("frmVerticalHeadlineL2", x)}
            />
            <Field
              label="Diagnostic subtext"
              value={frm.frmVerticalSubtext}
              onChange={(x) => patchForensic("frmVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Action row — spec label (upper line)"
              value={frm.frmVerticalSpecLabel}
              onChange={(x) => patchForensic("frmVerticalSpecLabel", x)}
            />
            <Field
              label="Action row — spec sub (mono, under label)"
              value={frm.frmVerticalSpecSub}
              onChange={(x) => patchForensic("frmVerticalSpecSub", x)}
            />
            <Field
              label="Vertical CTA"
              value={frm.frmVerticalCta}
              onChange={(x) => patchForensic("frmVerticalCta", x)}
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
            Preview · {previewLabel} · 1:1
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
            Preview · {previewLabel} · 9:16
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

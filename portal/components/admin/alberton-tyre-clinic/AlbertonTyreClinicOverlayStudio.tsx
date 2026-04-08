"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import velocitySquare from "./atc-velocity-precision-square.module.css";
import velocityVertical from "./atc-velocity-fitment-lab-vertical.module.css";
import kineticSquare from "./atc-kinetic-monolith-square.module.css";
import kineticVertical from "./atc-kinetic-monolith-vertical.module.css";
import apexSquare from "./atc-apex-interface-square.module.css";
import apexVertical from "./atc-apex-interface-vertical.module.css";
import calSquare from "./atc-calibration-matrix-square.module.css";
import calVertical from "./atc-calibration-matrix-vertical.module.css";
import gripSquare from "./atc-kinetic-grip-square.module.css";
import gripVertical from "./atc-kinetic-grip-vertical.module.css";
import commSquare from "./atc-commercial-transit-square.module.css";
import commVertical from "./atc-commercial-transit-vertical.module.css";
import duelSquare from "./atc-tectonic-tread-square.module.css";
import duelVertical from "./atc-tectonic-tread-vertical.module.css";

/** Shipped clinic logo beside headline on vertical templates (overridable via upload). */
export const ATC_CLINIC_VERTICAL_HEADLINE_LOGO_SRC =
  "/clients/alberton-tyre-clinic/atclogo.png";

export type AtcOverlayPresetId =
  | "velocity-premium"
  | "kinetic-grip"
  | "commercial-transit"
  | "tectonic-tread"
  | "kinetic-monolith"
  | "apex-interface"
  | "calibration-matrix";

export const ATC_OVERLAY_PRESETS: { id: AtcOverlayPresetId; label: string }[] =
  [
    {
      id: "velocity-premium",
      label: "Velocity Precision / Fitment Laboratory",
    },
    {
      id: "kinetic-grip",
      label: "Kinetic Grip (Dunlop / partner HUD · V30)",
    },
    {
      id: "commercial-transit",
      label: "Commercial Transit (fleet / light UI · V29)",
    },
    {
      id: "tectonic-tread",
      label: "Tectonic Tread · Fusion (clinic + brand + product)",
    },
    { id: "kinetic-monolith", label: "Kinetic Monolith" },
    { id: "apex-interface", label: "Apex Interface" },
    { id: "calibration-matrix", label: "Calibration Matrix" },
  ];

export const TYRE_CLINIC_OVERLAY_JSON_TEMPLATE_ID =
  "alberton-tyre-clinic-overlay";
/** v8: tectonic-tread fusion revamp + `duelSquareBrandBadge`; v7: kinetic grip subline removed. */
export const TYRE_CLINIC_OVERLAY_JSON_VERSION = 8;

const VELOCITY_KEYS = [
  "brandName",
  "squareStatusPill",
  "squareTechHighlight",
  "squareTechLine",
  "headlinePrimary",
  "headlineMuted",
  "squareButtonText",
  "verticalStoreLoc",
  "verticalStatusPill",
  "verticalProductLine",
  "subtext",
  "priceLabel",
  "priceValue",
  "verticalButtonText",
] as const;

const GRIP_KEYS = [
  "gripVerticalClinicName",
  "gripVerticalPartnerBadge",
  "gripVerticalHeadlineSolid",
  "gripVerticalHeadlineOutline",
  "gripVerticalSubtext",
  "gripVerticalProductBrand",
  "gripVerticalProductSub",
  "gripVerticalPhone",
  "gripSquareBrandPill",
  "gripSquareHeroSolid",
  "gripSquareHeroOutline",
  "gripSquareProductTitle",
  "gripSquareProductSub",
  "gripSquarePhone",
] as const;

const COMMERCIAL_KEYS = [
  "commVerticalClinicName",
  "commVerticalCorpBadge",
  "commVerticalSpec1",
  "commVerticalSpec2",
  "commVerticalHeadlineLine1",
  "commVerticalHeadlineLine2",
  "commVerticalSubtext",
  "commVerticalServiceTitle",
  "commVerticalServiceSub",
  "commVerticalPhone",
  "commSquareClinicName",
  "commSquareHeroLine1",
  "commSquareHeroLine2",
  "commSquareServiceTitle",
  "commSquareServiceSub",
  "commSquareSpec1",
  "commSquareSpec2",
  "commSquareActionLbl",
  "commSquarePhone",
] as const;

const KINETIC_KEYS = [
  "kineticTelemetryText",
  "kineticVerticalBrandTag",
  "kineticHeroSolid",
  "kineticHeroOutline",
  "kineticVerticalWidgetBefore",
  "kineticVerticalWidgetStrong",
  "kineticVerticalWidgetAfter",
  "kineticVerticalMetricVal",
  "kineticVerticalMetricLbl",
  "kineticVerticalCta",
  "kineticSquareBrandTag",
  "kineticSquareWidgetBefore",
  "kineticSquareWidgetStrong",
  "kineticSquareWidgetAfter",
  "kineticSquareMetricLbl",
  "kineticSquareMetricVal",
  "kineticSquareCta",
] as const;

const APEX_KEYS = [
  "apexVerticalIslandText",
  "apexVerticalBadge1",
  "apexVerticalBadge2",
  "apexHeadline",
  "apexVerticalSubtext",
  "apexVerticalCta",
  "apexSquareIslandText",
  "apexSquareSubBadge",
  "apexSquareCta",
] as const;

const CALIBRATION_KEYS = [
  "calVerticalSysStatus",
  "calVerticalGeoTag",
  "calVerticalMacroData",
  "calVerticalSpecBadge",
  "calVerticalHeadlineL1",
  "calVerticalHeadlineL2",
  "calVerticalSubtext",
  "calVerticalBrandName",
  "calVerticalBrandSub",
  "calVerticalCtaAria",
  "calSquareHeadlineSolid",
  "calSquareHeadlineOutline",
  "calSquareTelemetryText",
  "calSquareSubtext",
  "calSquareCta",
] as const;

const DUELER_KEYS = [
  "duelSquareBrandPill",
  "duelSquareBrandBadge",
  "duelSquareHeroL1",
  "duelSquareHeroL2Outline",
  "duelSquareProductTitle",
  "duelSquareProductSub",
  "duelSquareSpec1",
  "duelSquareSpec2",
  "duelSquarePhone",
  "duelVerticalLockupName",
  "duelVerticalBrandBadge",
  "duelVerticalSpec1",
  "duelVerticalSpec2",
  "duelVerticalHeadlineL1",
  "duelVerticalHeadlineL2Outline",
  "duelVerticalSubtext",
  "duelVerticalServiceTitle",
  "duelVerticalServiceSub",
  "duelVerticalPhone",
] as const;

type VelocityCopyKey = (typeof VELOCITY_KEYS)[number];
type GripCopyKey = (typeof GRIP_KEYS)[number];
type CommercialCopyKey = (typeof COMMERCIAL_KEYS)[number];
type KineticCopyKey = (typeof KINETIC_KEYS)[number];
type ApexCopyKey = (typeof APEX_KEYS)[number];
type CalibrationCopyKey = (typeof CALIBRATION_KEYS)[number];
type DuelerCopyKey = (typeof DUELER_KEYS)[number];

const DEFAULTS_VELOCITY: Record<VelocityCopyKey, string> = {
  brandName: "ALBERTON TYRE CLINIC",
  squareStatusPill: "Brand",
  squareTechHighlight: "Featured Product",
  squareTechLine: "The actual product",
  headlinePrimary: "Traction.",
  headlineMuted: "Absolute.",
  squareButtonText: "011 907 8495",
  verticalStoreLoc: "ALBERTON TYRE CLINIC",
  verticalStatusPill: "Brand",
  verticalProductLine: "The actual product",
  subtext:
    "Brief product description goes here. This placeholder copy stands in for a short blurb about the featured tyre—wet grip, comfort, sizing, or what makes it a strong pick for your car.",
  priceLabel: "Complete Service",
  priceValue: "Tyre & Fitment",
  verticalButtonText: "011 907 8495",
};

const DEFAULTS_GRIP: Record<GripCopyKey, string> = {
  gripVerticalClinicName: "Alberton Tyre Clinic",
  gripVerticalPartnerBadge: "BRAND",
  gripVerticalHeadlineSolid: "Terrain.",
  gripVerticalHeadlineOutline: "Mastered.",
  gripVerticalSubtext:
    "Uncompromising all-terrain grip engineered for South African roads. Fitted by the experts with exclusive Dunlop Sure protection.",
  gripVerticalProductBrand: "Brand",
  gripVerticalProductSub: "Premium Fitment",
  gripVerticalPhone: "011 907 8495",
  gripSquareBrandPill: "Alberton Tyre Clinic",
  gripSquareHeroSolid: "Absolute.",
  gripSquareHeroOutline: "Grip.",
  gripSquareProductTitle: "Dunlop Grandtrek AT5",
  gripSquareProductSub: "All-Terrain Dominance",
  gripSquarePhone: "011 907 8495",
};

const DEFAULTS_COMMERCIAL: Record<CommercialCopyKey, string> = {
  commVerticalClinicName: "Alberton Tyre Clinic",
  commVerticalCorpBadge: "Dunlop Zone",
  commVerticalSpec1: "Zero Downtime",
  commVerticalSpec2: "Laser Alignment",
  commVerticalHeadlineLine1: "Fleet.",
  commVerticalHeadlineLine2: "Optimized.",
  commVerticalSubtext:
    "Premium Dunlop fitment and precision mechanical alignment. We keep your commercial vehicles on the road with maximum efficiency and absolute grip.",
  commVerticalServiceTitle: "Commercial Fleet Services",
  commVerticalServiceSub: "Alberton Base",
  commVerticalPhone: "011 907 8495",
  commSquareClinicName: "Alberton Tyre Clinic",
  commSquareHeroLine1: "Performance.",
  commSquareHeroLine2: "Uninterrupted.",
  commSquareServiceTitle: "Premium Dunlop Fitment",
  commSquareServiceSub:
    "Authorized Dunlop Zone supplying high-performance tyres and precision 3D laser alignment.",
  commSquareSpec1: "Zero Downtime",
  commSquareSpec2: "Priority Bay Access",
  commSquareActionLbl: "Commercial Services",
  commSquarePhone: "011 907 8495",
};

const DEFAULTS_KINETIC: Record<KineticCopyKey, string> = {
  kineticTelemetryText: "ALBERTON TYRE CLINIC",
  kineticVerticalBrandTag: "Alberton Tyre Clinic",
  kineticHeroSolid: "Grip.",
  kineticHeroOutline: "Defied.",
  kineticVerticalWidgetBefore:
    "Unlock apex performance. We fuse adaptive silica compounds with ",
  kineticVerticalWidgetStrong: "AI Road-Force balancing",
  kineticVerticalWidgetAfter: " for clinical control.",
  kineticVerticalMetricVal: "Expert fitment",
  kineticVerticalMetricLbl: "Road-Force balance",
  kineticVerticalCta: "011 907 8495",
  kineticSquareBrandTag: "Alberton Tyre Clinic",
  kineticSquareWidgetBefore: "Adaptive silica meets ",
  kineticSquareWidgetStrong: "AI Road-Force",
  kineticSquareWidgetAfter:
    " calibration. Clinical precision for absolute control.",
  kineticSquareMetricLbl: "Road-Force bay",
  kineticSquareMetricVal: "Expert fitment",
  kineticSquareCta: "011 907 8495",
};

const DEFAULTS_APEX: Record<ApexCopyKey, string> = {
  apexVerticalIslandText: "Alberton Tyre Clinic",
  apexVerticalBadge1: "Adaptive Tread",
  apexVerticalBadge2: "Road-Force",
  apexHeadline: "Control.",
  apexVerticalSubtext:
    "Engineered for absolute symmetry. Perfected on the balancer. Dominate the asphalt.",
  apexVerticalCta: "011 907 8495",
  apexSquareIslandText: "Alberton Tyre Clinic",
  apexSquareSubBadge: "Road-Force Calibrated",
  apexSquareCta: "011 907 8495",
};

const DEFAULTS_CALIBRATION: Record<CalibrationCopyKey, string> = {
  calVerticalSysStatus: "Calibrating",
  calVerticalGeoTag: "Alberton Tyre Clinic",
  calVerticalMacroData: "0.01",
  calVerticalSpecBadge: "Sub-Millimeter Variance",
  calVerticalHeadlineL1: "Flawless.",
  calVerticalHeadlineL2: "Execution.",
  calVerticalSubtext:
    "AI-driven Road-Force balancing eliminates high-speed vibration before it starts. The ultimate fitment protocol.",
  calVerticalBrandName: "Alberton Tyre Clinic",
  calVerticalBrandSub: "Fitment Protocol",
  calVerticalCtaAria: "011 907 8495",
  calSquareHeadlineSolid: "Zero.",
  calSquareHeadlineOutline: "Tolerance.",
  calSquareTelemetryText: "Road-Force Active",
  calSquareSubtext:
    "Uncompromising grip. Sub-millimeter calibration precision at Alberton Tyre Clinic.",
  calSquareCta: "011 907 8495",
};

const DEFAULTS_DUELER: Record<DuelerCopyKey, string> = {
  duelSquareBrandPill: "Alberton Tyre Clinic",
  duelSquareBrandBadge: "Bridgestone",
  duelSquareHeroL1: "Grip.",
  duelSquareHeroL2Outline: "Elevated.",
  duelSquareProductTitle: "Bridgestone Dueler A/T 002",
  duelSquareProductSub: "Featured all-terrain fitment",
  duelSquareSpec1: "All-terrain confidence",
  duelSquareSpec2: "Mileage focus",
  duelSquarePhone: "011 907 8495",
  duelVerticalLockupName: "Alberton Tyre Clinic",
  duelVerticalBrandBadge: "Bridgestone",
  duelVerticalSpec1: "Dueler A/T 002",
  duelVerticalSpec2: "SUV & bakkie",
  duelVerticalHeadlineL1: "Precision.",
  duelVerticalHeadlineL2Outline: "In motion.",
  duelVerticalSubtext:
    "Premium tread, expert fitment, and a team that answers the phone. Alberton Tyre Clinic — your featured Bridgestone line, mounted and balanced to spec.",
  duelVerticalServiceTitle: "Dueler A/T 002",
  duelVerticalServiceSub: "Featured product",
  duelVerticalPhone: "011 907 8495",
};

function initialCopyByPreset(): Record<
  AtcOverlayPresetId,
  Record<string, string>
> {
  return {
    "velocity-premium": { ...DEFAULTS_VELOCITY },
    "kinetic-grip": { ...DEFAULTS_GRIP },
    "commercial-transit": { ...DEFAULTS_COMMERCIAL },
    "tectonic-tread": { ...DEFAULTS_DUELER },
    "kinetic-monolith": { ...DEFAULTS_KINETIC },
    "apex-interface": { ...DEFAULTS_APEX },
    "calibration-matrix": { ...DEFAULTS_CALIBRATION },
  };
}

/** Merge campaign copy onto defaults for one preset (April pack & similar). */
export function atcMergedCopyForPreset(
  preset: AtcOverlayPresetId,
  patch: Record<string, string>,
): Record<string, string> {
  return { ...initialCopyByPreset()[preset], ...patch };
}

export type AtcStudioCampaignPayload = {
  applyKey: string;
  preset: AtcOverlayPresetId;
  copy: Record<string, string>;
};

function keysForPreset(p: AtcOverlayPresetId): readonly string[] {
  if (p === "velocity-premium") return VELOCITY_KEYS;
  if (p === "kinetic-grip") return GRIP_KEYS;
  if (p === "commercial-transit") return COMMERCIAL_KEYS;
  if (p === "tectonic-tread") return DUELER_KEYS;
  if (p === "kinetic-monolith") return KINETIC_KEYS;
  if (p === "apex-interface") return APEX_KEYS;
  return CALIBRATION_KEYS;
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

function isPresetId(v: unknown): v is AtcOverlayPresetId {
  return (
    v === "velocity-premium" ||
    v === "kinetic-grip" ||
    v === "commercial-transit" ||
    v === "tectonic-tread" ||
    v === "kinetic-monolith" ||
    v === "apex-interface" ||
    v === "calibration-matrix"
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
): AtcOverlayPresetId | null {
  const keys = Object.keys(block);
  if (
    keys.includes("duelSquareBrandPill") ||
    keys.includes("duelSquareBrandBadge") ||
    keys.includes("duelVerticalBrandBadge") ||
    keys.includes("duelSquareProductTitle")
  ) {
    return "tectonic-tread";
  }
  if (
    keys.includes("calVerticalMacroData") ||
    keys.includes("calSquareTelemetryText") ||
    keys.includes("calVerticalSpecBadge")
  ) {
    return "calibration-matrix";
  }
  if (
    keys.includes("apexVerticalIslandText") ||
    keys.includes("apexSquareSubBadge") ||
    keys.includes("apexVerticalBadge1")
  ) {
    return "apex-interface";
  }
  if (
    keys.includes("gripVerticalPartnerBadge") ||
    keys.includes("gripSquareBrandPill") ||
    keys.includes("gripVerticalHeadlineSolid")
  ) {
    return "kinetic-grip";
  }
  if (
    keys.includes("commVerticalCorpBadge") ||
    keys.includes("commSquareActionLbl") ||
    keys.includes("commVerticalHeadlineLine1")
  ) {
    return "commercial-transit";
  }
  if (
    keys.includes("kineticTelemetryText") ||
    keys.includes("kineticSquareBrandTag") ||
    keys.includes("kineticHeroSolid")
  ) {
    return "kinetic-monolith";
  }
  if (
    keys.includes("brandName") ||
    keys.includes("squareStatusPill") ||
    keys.includes("headlinePrimary") ||
    keys.includes("verticalStoreLoc") ||
    keys.includes("verticalProductLine")
  ) {
    return "velocity-premium";
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

function ChevronRight({ size = 18 }: { size?: number }) {
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

function ChevronCompact({ size = 18 }: { size?: number }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function exportSlugForPreset(p: AtcOverlayPresetId): string {
  if (p === "velocity-premium") return "velocity-premium";
  if (p === "kinetic-grip") return "kinetic-grip";
  if (p === "commercial-transit") return "commercial-transit";
  if (p === "tectonic-tread") return "tectonic-tread";
  if (p === "kinetic-monolith") return "kinetic-monolith";
  if (p === "apex-interface") return "apex-interface";
  return "calibration-matrix";
}

function PhoneIcon({ size = 16 }: { size?: number }) {
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

export function AlbertonTyreClinicOverlayStudio({
  campaignApply = null,
}: {
  campaignApply?: AtcStudioCampaignPayload | null;
} = {}) {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);
  const tectonicVerticalLogoFileRef = useRef<HTMLInputElement>(null);
  const kineticGripVerticalLogoFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<AtcOverlayPresetId>("velocity-premium");
  const [copyByPreset, setCopyByPreset] = useState(initialCopyByPreset);

  const v = copyByPreset["velocity-premium"];
  const g = copyByPreset["kinetic-grip"];
  const c = copyByPreset["commercial-transit"];
  const k = copyByPreset["kinetic-monolith"];
  const a = copyByPreset["apex-interface"];
  const cal = copyByPreset["calibration-matrix"];
  const d = copyByPreset["tectonic-tread"];

  useEffect(() => {
    if (!campaignApply) return;
    setPreset(campaignApply.preset);
    setCopyByPreset((prev) => ({
      ...prev,
      [campaignApply.preset]: campaignApply.copy,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-apply only when slot key changes
  }, [campaignApply?.applyKey]);

  const patchVelocity = (key: VelocityCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "velocity-premium": { ...prev["velocity-premium"], [key]: value },
    }));
  };

  const patchGrip = (key: GripCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "kinetic-grip": { ...prev["kinetic-grip"], [key]: value },
    }));
  };

  const patchCommercial = (key: CommercialCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "commercial-transit": { ...prev["commercial-transit"], [key]: value },
    }));
  };

  const patchKinetic = (key: KineticCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "kinetic-monolith": { ...prev["kinetic-monolith"], [key]: value },
    }));
  };

  const patchApex = (key: ApexCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "apex-interface": { ...prev["apex-interface"], [key]: value },
    }));
  };

  const patchCalibration = (key: CalibrationCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "calibration-matrix": { ...prev["calibration-matrix"], [key]: value },
    }));
  };

  const patchDueler = (key: DuelerCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "tectonic-tread": { ...prev["tectonic-tread"], [key]: value },
    }));
  };

  const [bgSquareDataUrl, setBgSquareDataUrl] = useState<string | null>(null);
  const [bgVerticalDataUrl, setBgVerticalDataUrl] = useState<string | null>(
    null,
  );
  /** Tectonic Tread vertical: square beside headline (e.g. clinic logo). */
  const [tectonicHeadlineLogoDataUrl, setTectonicHeadlineLogoDataUrl] =
    useState<string | null>(null);
  /** Kinetic Grip vertical: same logo slot beside headline. */
  const [kineticGripHeadlineLogoDataUrl, setKineticGripHeadlineLogoDataUrl] =
    useState<string | null>(null);

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
          template: TYRE_CLINIC_OVERLAY_JSON_TEMPLATE_ID,
          version: TYRE_CLINIC_OVERLAY_JSON_VERSION,
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
      setJsonError("Expected an object with a \"copy\" field or flat keys.");
      return;
    }

    let targetPreset: AtcOverlayPresetId = preset;
    if (isPresetId(root?.preset)) {
      targetPreset = root.preset as AtcOverlayPresetId;
    } else {
      targetPreset = inferPresetFromBlock(block) ?? "velocity-premium";
    }

    const keys = keysForPreset(targetPreset);
    const picked: Record<string, string> = {};
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const val = block[key];
        picked[key] = val == null ? "" : String(val);
      }
    }
    if (targetPreset === "velocity-premium") {
      const legacy = block as Record<string, unknown>;
      const missingProduct =
        !("verticalProductLine" in picked) ||
        !String(picked.verticalProductLine ?? "").trim();
      if (
        missingProduct &&
        (legacy.verticalBadge1Highlight != null ||
          legacy.verticalBadge1Line != null ||
          legacy.verticalBadge2Line != null)
      ) {
        const h =
          legacy.verticalBadge1Highlight != null
            ? String(legacy.verticalBadge1Highlight).trim()
            : "";
        const l1 =
          legacy.verticalBadge1Line != null
            ? String(legacy.verticalBadge1Line).trim()
            : "";
        const l2 =
          legacy.verticalBadge2Line != null
            ? String(legacy.verticalBadge2Line).trim()
            : "";
        const first = [h, l1].filter(Boolean).join(" ");
        const parts = [first, l2].filter(Boolean);
        picked.verticalProductLine = parts.join(" · ");
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

  const onPickTectonicHeadlineLogo = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, setTectonicHeadlineLogoDataUrl);
  };

  const clearTectonicHeadlineLogo = () => {
    setTectonicHeadlineLogoDataUrl(null);
    if (tectonicVerticalLogoFileRef.current) {
      tectonicVerticalLogoFileRef.current.value = "";
    }
  };

  const onPickKineticGripHeadlineLogo = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, setKineticGripHeadlineLogoDataUrl);
  };

  const clearKineticGripHeadlineLogo = () => {
    setKineticGripHeadlineLogoDataUrl(null);
    if (kineticGripVerticalLogoFileRef.current) {
      kineticGripVerticalLogoFileRef.current.value = "";
    }
  };

  const resetCopy = () => {
    setCopyByPreset((prev) => {
      if (preset === "velocity-premium") {
        return { ...prev, "velocity-premium": { ...DEFAULTS_VELOCITY } };
      }
      if (preset === "kinetic-grip") {
        return { ...prev, "kinetic-grip": { ...DEFAULTS_GRIP } };
      }
      if (preset === "commercial-transit") {
        return {
          ...prev,
          "commercial-transit": { ...DEFAULTS_COMMERCIAL },
        };
      }
      if (preset === "tectonic-tread") {
        return { ...prev, "tectonic-tread": { ...DEFAULTS_DUELER } };
      }
      if (preset === "kinetic-monolith") {
        return { ...prev, "kinetic-monolith": { ...DEFAULTS_KINETIC } };
      }
      if (preset === "apex-interface") {
        return { ...prev, "apex-interface": { ...DEFAULTS_APEX } };
      }
      return { ...prev, "calibration-matrix": { ...DEFAULTS_CALIBRATION } };
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
      a.download = `atc-${exportSlug}-square-1080-${Date.now()}.png`;
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
      a.download = `atc-${exportSlug}-vertical-9x16-${Date.now()}.png`;
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

  const jsonRows =
    preset === "velocity-premium"
      ? 27
      : preset === "kinetic-grip"
        ? 28
        : preset === "commercial-transit"
          ? 38
          : preset === "tectonic-tread"
            ? 28
            : preset === "kinetic-monolith"
            ? 36
            : preset === "apex-interface"
              ? 22
              : 26;

  const squareCanvas =
    preset === "velocity-premium" ? (
      <div
        ref={squareRef}
        className={`${velocitySquare.root} ${velocitySquare.canvas1080}`}
        aria-label="ATC Velocity Precision square 1080 export"
      >
        <div className={velocitySquare.adContainer}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={velocitySquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={velocitySquare.scrim} />
          <div
            className={`${velocitySquare.bracket} ${velocitySquare.bracketTopLeft}`}
          />
          <div
            className={`${velocitySquare.bracket} ${velocitySquare.bracketBottomRight}`}
          />
          <div className={velocitySquare.topBar}>
            <div className={velocitySquare.brandName}>{v.brandName}</div>
            <div className={velocitySquare.statusPill}>
              {v.squareStatusPill}
            </div>
          </div>
          <div className={velocitySquare.bottomDock}>
            <div className={velocitySquare.dockContent}>
              <div className={velocitySquare.techBadge}>
                <span className={velocitySquare.techBadgeHighlight}>
                  {v.squareTechHighlight}
                </span>{" "}
                {v.squareTechLine}
              </div>
              <h1 className={velocitySquare.headline}>
                {v.headlinePrimary}{" "}
                <span className={velocitySquare.headlineMuted}>
                  {v.headlineMuted}
                </span>
              </h1>
            </div>
            <button type="button" className={velocitySquare.ctaBtn}>
              <PhoneIcon size={18} />
              {v.squareButtonText}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "kinetic-grip" ? (
      <div
        ref={squareRef}
        className={`${gripSquare.root} ${gripSquare.canvas1080}`}
        aria-label="ATC Kinetic Grip square 1080 export"
      >
        <div className={gripSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={gripSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={gripSquare.tarmacGrid} />
          <div className={gripSquare.scrimTop} />
          <div className={gripSquare.scrimBottom} />
          <div className={gripSquare.topPerimeter}>
            <div className={gripSquare.brandPill}>{g.gripSquareBrandPill}</div>
            <h1 className={gripSquare.heroType}>
              {g.gripSquareHeroSolid}{" "}
              <span className={gripSquare.heroOutline}>
                {g.gripSquareHeroOutline}
              </span>
            </h1>
          </div>
          <div className={gripSquare.gripStrip}>
            <div className={gripSquare.stripSpecs}>
              <div>
                <span className={gripSquare.productTitle}>
                  {g.gripSquareProductTitle}
                </span>
                <span className={gripSquare.productSub}>
                  {g.gripSquareProductSub}
                </span>
              </div>
            </div>
            <button type="button" className={gripSquare.btnCall}>
              <PhoneIcon size={18} />
              {g.gripSquarePhone}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "commercial-transit" ? (
      <div
        ref={squareRef}
        className={`${commSquare.root} ${commSquare.canvas1080}`}
        aria-label="ATC Commercial Transit square 1080 export"
      >
        <div className={commSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={commSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={commSquare.scrimTop} />
          <div className={commSquare.scrimBottom} />
          <div className={commSquare.topPerimeter}>
            <div className={commSquare.brandLockup}>
              <div className={commSquare.brandIcon} />
              <span className={commSquare.btName}>
                {c.commSquareClinicName}
              </span>
            </div>
            <h1 className={commSquare.heroType}>
              {c.commSquareHeroLine1}
              <br />
              <span className={commSquare.heroAccent}>
                {c.commSquareHeroLine2}
              </span>
            </h1>
          </div>
          <div className={commSquare.logisticsTerminal}>
            <div className={commSquare.terminalInfo}>
              <span className={commSquare.serviceTitle}>
                {c.commSquareServiceTitle}
              </span>
              <span className={commSquare.serviceSub}>
                {c.commSquareServiceSub}
              </span>
              <div className={commSquare.specRow}>
                <span className={commSquare.specMini}>{c.commSquareSpec1}</span>
                <span className={commSquare.specMini}>{c.commSquareSpec2}</span>
              </div>
            </div>
            <div className={commSquare.divider} />
            <div className={commSquare.actionCol}>
              <span className={commSquare.actionLbl}>
                {c.commSquareActionLbl}
              </span>
              <button type="button" className={commSquare.btnContact}>
                <PhoneIcon size={16} />
                {c.commSquarePhone}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "tectonic-tread" ? (
      <div
        ref={squareRef}
        className={`${duelSquare.root} ${duelSquare.canvas1080}`}
        aria-label="ATC Tectonic Tread square 1080 export"
      >
        <div className={duelSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={duelSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={duelSquare.ambientMesh} aria-hidden />
          <div className={duelSquare.vignette} aria-hidden />
          <div className={duelSquare.rimLight} aria-hidden />
          <div className={duelSquare.topZone}>
            <div className={duelSquare.clinicLockup}>{d.duelSquareBrandPill}</div>
            <div className={duelSquare.brandChip}>{d.duelSquareBrandBadge}</div>
          </div>
          <div className={duelSquare.imageSafeZone} aria-hidden />
          <div className={duelSquare.fusionDock}>
            <div className={duelSquare.dockMainRow}>
              <div className={duelSquare.dockProductCol}>
                <div className={duelSquare.productStack}>
                  <span className={duelSquare.productTitle}>
                    {d.duelSquareProductTitle}
                  </span>
                  <span className={duelSquare.productSub}>
                    {d.duelSquareProductSub}
                  </span>
                </div>
                <div className={duelSquare.specRail}>
                  <span className={duelSquare.specPill}>
                    {d.duelSquareSpec1}
                  </span>
                  <span className={duelSquare.specPill}>
                    {d.duelSquareSpec2}
                  </span>
                </div>
              </div>
              <h1 className={duelSquare.dockHero}>
                <span className={duelSquare.dockHeroSolid}>
                  {d.duelSquareHeroL1}
                </span>
                <span className={duelSquare.dockHeroOutline}>
                  {d.duelSquareHeroL2Outline}
                </span>
              </h1>
            </div>
            <button type="button" className={duelSquare.phoneCta}>
              <PhoneIcon size={20} />
              {d.duelSquarePhone}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "kinetic-monolith" ? (
      <div
        ref={squareRef}
        className={`${kineticSquare.root} ${kineticSquare.canvas1080}`}
        aria-label="ATC Kinetic Monolith square 1080 export"
      >
        <div className={kineticSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={kineticSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={kineticSquare.ambientScrim} />
          <div className={kineticSquare.topAnchor}>
            <h1 className={kineticSquare.heroType}>
              {k.kineticHeroSolid}
              <span className={kineticSquare.heroOutline}>
                {k.kineticHeroOutline}
              </span>
            </h1>
            <div className={kineticSquare.brandTag}>
              {k.kineticSquareBrandTag}
            </div>
          </div>
          <div className={kineticSquare.bottomEcosystem}>
            <div className={kineticSquare.infoWidget}>
              <div className={kineticSquare.telemetryLine} />
              <p className={kineticSquare.widgetSubtext}>
                {k.kineticSquareWidgetBefore}
                <strong className={kineticSquare.widgetStrong}>
                  {k.kineticSquareWidgetStrong}
                </strong>
                {k.kineticSquareWidgetAfter}
              </p>
            </div>
            <div className={kineticSquare.actionWidget}>
              <div>
                <div className={kineticSquare.metricLbl}>
                  {k.kineticSquareMetricLbl}
                </div>
                <div className={kineticSquare.metricVal}>
                  {k.kineticSquareMetricVal}
                </div>
              </div>
              <button type="button" className={kineticSquare.btnSquircle}>
                {k.kineticSquareCta}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "apex-interface" ? (
      <div
        ref={squareRef}
        className={`${apexSquare.root} ${apexSquare.canvas1080}`}
        aria-label="ATC Apex Interface square 1080 export"
      >
        <div className={apexSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={apexSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={apexSquare.scrim} />
          <div className={apexSquare.dynamicIsland}>
            <div className={apexSquare.islandDot} />
            <span className={apexSquare.islandText}>
              {a.apexSquareIslandText}
            </span>
          </div>
          <div className={apexSquare.centerReticle}>
            <div className={apexSquare.reticleDot} />
          </div>
          <div className={apexSquare.commandStrip}>
            <div className={apexSquare.textGroup}>
              <span className={apexSquare.subBadge}>{a.apexSquareSubBadge}</span>
              <span className={apexSquare.headline}>{a.apexHeadline}</span>
            </div>
            <button type="button" className={apexSquare.btnAction}>
              <PhoneIcon size={18} />
              {a.apexSquareCta}
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={squareRef}
        className={`${calSquare.root} ${calSquare.canvas1080}`}
        aria-label="ATC Calibration Matrix square 1080 export"
      >
        <div className={calSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={calSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div
            className={`${calSquare.sensorBracket} ${calSquare.sensorTl}`}
          />
          <div
            className={`${calSquare.sensorBracket} ${calSquare.sensorTr}`}
          />
          <h1 className={calSquare.breakoutHeadline}>
            {cal.calSquareHeadlineSolid}
            <span className={calSquare.headlineOutline}>
              {cal.calSquareHeadlineOutline}
            </span>
          </h1>
          <div className={calSquare.horizonDock}>
            <div className={calSquare.dockInfo}>
              <div className={calSquare.telemetry}>
                <div className={calSquare.pulseBar} />
                <span className={calSquare.telemetryText}>
                  {cal.calSquareTelemetryText}
                </span>
              </div>
              <p className={calSquare.subtext}>{cal.calSquareSubtext}</p>
            </div>
            <button type="button" className={calSquare.btnAction}>
              <PhoneIcon size={16} />
              {cal.calSquareCta}
            </button>
          </div>
        </div>
      </div>
    );

  const verticalCanvas =
    preset === "velocity-premium" ? (
      <div
        ref={verticalRef}
        className={`${velocityVertical.root} ${velocityVertical.canvas1080x1920}`}
        aria-label="ATC Fitment Lab vertical 1080 export"
      >
        <div className={velocityVertical.adContainer}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={velocityVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={velocityVertical.scrim} />
          <div className={velocityVertical.topHud}>
            <div className={velocityVertical.locationData}>
              <span className={velocityVertical.brandName}>{v.brandName}</span>
              <span className={velocityVertical.storeLoc}>
                {v.verticalStoreLoc}
              </span>
            </div>
            <div className={velocityVertical.statusPill}>
              {v.verticalStatusPill}
            </div>
          </div>
          <div className={velocityVertical.bottomDock}>
            <p className={velocityVertical.productDock}>
              {v.verticalProductLine}
            </p>
            <h1 className={velocityVertical.headline}>
              {v.headlinePrimary}{" "}
              <span className={velocityVertical.headlineMuted}>
                {v.headlineMuted}
              </span>
            </h1>
            <p className={velocityVertical.subtext}>{v.subtext}</p>
            <div className={velocityVertical.actionRow}>
              <div className={velocityVertical.priceBlock}>
                <span className={velocityVertical.priceLabel}>
                  {v.priceLabel}
                </span>
                <span className={velocityVertical.priceValue}>
                  {v.priceValue}
                </span>
              </div>
              <button type="button" className={velocityVertical.ctaBtn}>
                <PhoneIcon size={16} />
                {v.verticalButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "kinetic-grip" ? (
      <div
        ref={verticalRef}
        className={`${gripVertical.root} ${gripVertical.canvas1080x1920}`}
        aria-label="ATC Kinetic Grip vertical 1080 export"
      >
        <div className={gripVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={gripVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={gripVertical.tarmacGrid} />
          <div className={gripVertical.scrim} />
          <div className={gripVertical.topHud}>
            <div className={gripVertical.brandLockup}>
              <span className={gripVertical.btName}>
                {g.gripVerticalClinicName}
              </span>
            </div>
            <div className={gripVertical.partnerBadge}>
              {g.gripVerticalPartnerBadge}
            </div>
          </div>
          <div className={gripVertical.performanceTerminal}>
            <div className={gripVertical.headlineRow}>
              <h1 className={gripVertical.headline}>
                {g.gripVerticalHeadlineSolid}{" "}
                <span className={gripVertical.headlineOutline}>
                  {g.gripVerticalHeadlineOutline}
                </span>
              </h1>
              <div className={gripVertical.headlineLogoSlot}>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL override or bundled public asset */}
                <img
                  className={gripVertical.headlineLogoImg}
                  src={
                    kineticGripHeadlineLogoDataUrl ??
                    ATC_CLINIC_VERTICAL_HEADLINE_LOGO_SRC
                  }
                  alt="Alberton Tyre Clinic"
                />
              </div>
            </div>
            <p className={gripVertical.subtext}>{g.gripVerticalSubtext}</p>
            <div className={gripVertical.actionDock}>
              <div className={gripVertical.productBlock}>
                <span className={gripVertical.productBrand}>
                  {g.gripVerticalProductBrand}
                </span>
                <span className={gripVertical.productSub}>
                  {g.gripVerticalProductSub}
                </span>
              </div>
              <button type="button" className={gripVertical.btnCall}>
                <PhoneIcon size={16} />
                {g.gripVerticalPhone}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "commercial-transit" ? (
      <div
        ref={verticalRef}
        className={`${commVertical.root} ${commVertical.canvas1080x1920}`}
        aria-label="ATC Commercial Transit vertical 1080 export"
      >
        <div className={commVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={commVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={commVertical.blueprintGrid} />
          <div className={commVertical.scrim} />
          <div className={commVertical.topHud}>
            <div className={commVertical.brandLockup}>
              <div className={commVertical.brandIcon} />
              <span className={commVertical.btName}>
                {c.commVerticalClinicName}
              </span>
            </div>
            <div className={commVertical.corpBadge}>
              {c.commVerticalCorpBadge}
            </div>
          </div>
          <div className={commVertical.logisticsTerminal}>
            <div className={commVertical.specRow}>
              <span className={commVertical.specMini}>
                {c.commVerticalSpec1}
              </span>
              <span className={commVertical.specMini}>
                {c.commVerticalSpec2}
              </span>
            </div>
            <h1 className={commVertical.headline}>
              {c.commVerticalHeadlineLine1}
              <br />
              <span className={commVertical.headlineAccent}>
                {c.commVerticalHeadlineLine2}
              </span>
            </h1>
            <p className={commVertical.subtext}>{c.commVerticalSubtext}</p>
            <div className={commVertical.actionDock}>
              <div className={commVertical.serviceId}>
                <span className={commVertical.serviceTitle}>
                  {c.commVerticalServiceTitle}
                </span>
                <span className={commVertical.serviceSub}>
                  {c.commVerticalServiceSub}
                </span>
              </div>
              <button type="button" className={commVertical.btnContact}>
                <PhoneIcon size={14} />
                {c.commVerticalPhone}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "tectonic-tread" ? (
      <div
        ref={verticalRef}
        className={`${duelVertical.root} ${duelVertical.canvas1080x1920}`}
        aria-label="ATC Tectonic Tread vertical 1080 export"
      >
        <div className={duelVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={duelVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={duelVertical.ambientMesh} aria-hidden />
          <div className={duelVertical.vignette} aria-hidden />
          <div className={duelVertical.rimLight} aria-hidden />
          <div className={duelVertical.topHud}>
            <div className={duelVertical.clinicLockup}>
              <span className={duelVertical.clinicName}>
                {d.duelVerticalLockupName}
              </span>
            </div>
            <div className={duelVertical.brandChip}>
              {d.duelVerticalBrandBadge}
            </div>
          </div>
          <div className={duelVertical.fusionTerminal}>
            <div className={duelVertical.headlineRow}>
              <h1 className={duelVertical.headline}>
                <span className={duelVertical.headlineSolid}>
                  {d.duelVerticalHeadlineL1}
                </span>
                <span className={duelVertical.headlineOutline}>
                  {d.duelVerticalHeadlineL2Outline}
                </span>
              </h1>
              <div className={duelVertical.headlineLogoSlot}>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL override or bundled public asset */}
                <img
                  className={duelVertical.headlineLogoImg}
                  src={
                    tectonicHeadlineLogoDataUrl ??
                    ATC_CLINIC_VERTICAL_HEADLINE_LOGO_SRC
                  }
                  alt="Alberton Tyre Clinic"
                />
              </div>
            </div>
            <p className={duelVertical.subtext}>{d.duelVerticalSubtext}</p>
            <div className={duelVertical.featuredBlock}>
              <span className={duelVertical.serviceTitle}>
                {d.duelVerticalServiceTitle}
              </span>
              <span className={duelVertical.serviceSub}>
                {d.duelVerticalServiceSub}
              </span>
            </div>
            <button type="button" className={duelVertical.phoneCta}>
              <PhoneIcon size={20} />
              {d.duelVerticalPhone}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "kinetic-monolith" ? (
      <div
        ref={verticalRef}
        className={`${kineticVertical.root} ${kineticVertical.canvas1080x1920}`}
        aria-label="ATC Kinetic Monolith vertical 1080 export"
      >
        <div className={kineticVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={kineticVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={kineticVertical.ambientScrim} />
          <div className={kineticVertical.telemetryAxis}>
            <div className={kineticVertical.telemetryLine} />
            <span className={kineticVertical.telemetryText}>
              {k.kineticTelemetryText}
            </span>
          </div>
          <div className={kineticVertical.brandTag}>
            {k.kineticVerticalBrandTag}
          </div>
          <div className={kineticVertical.bottomEcosystem}>
            <h1 className={kineticVertical.heroType}>
              {k.kineticHeroSolid}
              <span className={kineticVertical.heroOutline}>
                {k.kineticHeroOutline}
              </span>
            </h1>
            <div className={kineticVertical.widgetCard}>
              <p className={kineticVertical.widgetSubtext}>
                {k.kineticVerticalWidgetBefore}
                <strong className={kineticVertical.widgetStrong}>
                  {k.kineticVerticalWidgetStrong}
                </strong>
                {k.kineticVerticalWidgetAfter}
              </p>
              <div className={kineticVertical.actionRow}>
                <div className={kineticVertical.metric}>
                  <span className={kineticVertical.metricVal}>
                    {k.kineticVerticalMetricVal}
                  </span>
                  <span className={kineticVertical.metricLbl}>
                    {k.kineticVerticalMetricLbl}
                  </span>
                </div>
                <button type="button" className={kineticVertical.btnSquircle}>
                  <PhoneIcon size={18} />
                  {k.kineticVerticalCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "apex-interface" ? (
      <div
        ref={verticalRef}
        className={`${apexVertical.root} ${apexVertical.canvas1080x1920}`}
        aria-label="ATC Apex Interface vertical 1080 export"
      >
        <div className={apexVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={apexVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={apexVertical.scrim} />
          <div className={apexVertical.dynamicIsland}>
            <div className={apexVertical.islandDot} />
            <span className={apexVertical.islandText}>
              {a.apexVerticalIslandText}
            </span>
          </div>
          <div className={apexVertical.centerReticle} />
          <div className={apexVertical.bottomConsole}>
            <div className={apexVertical.dataBadges}>
              <span className={apexVertical.badge}>{a.apexVerticalBadge1}</span>
              <span className={apexVertical.badge}>{a.apexVerticalBadge2}</span>
            </div>
            <h1 className={apexVertical.headline}>{a.apexHeadline}</h1>
            <p className={apexVertical.subtext}>{a.apexVerticalSubtext}</p>
            <button type="button" className={apexVertical.btnWide}>
              {a.apexVerticalCta}
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={verticalRef}
        className={`${calVertical.root} ${calVertical.canvas1080x1920}`}
        aria-label="ATC Calibration Matrix vertical 1080 export"
      >
        <div className={calVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={calVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={calVertical.edgeGlow} aria-hidden />
          <div className={calVertical.telemetryBar}>
            <div className={calVertical.sysStatus}>
              <div className={calVertical.pulseDot} />
              {cal.calVerticalSysStatus}
            </div>
            <div className={calVertical.geoTag}>{cal.calVerticalGeoTag}</div>
          </div>
          <div className={calVertical.glassVault}>
            <div className={calVertical.macroData} aria-hidden>
              {cal.calVerticalMacroData}
            </div>
            <div className={calVertical.vaultContent}>
              <div className={calVertical.specBadge}>
                {cal.calVerticalSpecBadge}
              </div>
              <h1 className={calVertical.headline}>
                {cal.calVerticalHeadlineL1}
                <br />
                {cal.calVerticalHeadlineL2}
              </h1>
              <p className={calVertical.subtext}>{cal.calVerticalSubtext}</p>
              <div className={calVertical.actionRow}>
                <div className={calVertical.brandLockup}>
                  <span className={calVertical.brandName}>
                    {cal.calVerticalBrandName}
                  </span>
                  <span className={calVertical.brandSub}>
                    {cal.calVerticalBrandSub}
                  </span>
                </div>
                <button
                  type="button"
                  className={calVertical.btnCore}
                  aria-label={`Call ${cal.calVerticalCtaAria}`}
                >
                  <PhoneIcon size={24} />
                  <span className={calVertical.btnCoreNumber}>
                    {cal.calVerticalCtaAria}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const previewSquareLabel =
    preset === "velocity-premium"
      ? "Velocity Precision · 1:1"
      : preset === "kinetic-grip"
        ? "Kinetic Grip · 1:1"
        : preset === "commercial-transit"
          ? "Commercial Transit · 1:1"
          : preset === "tectonic-tread"
            ? "Tectonic Tread · 1:1"
            : preset === "kinetic-monolith"
              ? "Kinetic Monolith · 1:1"
              : preset === "apex-interface"
                ? "Apex Interface · 1:1"
                : "Calibration Matrix · 1:1";
  const previewVertLabel =
    preset === "velocity-premium"
      ? "Fitment Laboratory · 9:16"
      : preset === "kinetic-grip"
        ? "Kinetic Grip · 9:16"
        : preset === "commercial-transit"
          ? "Commercial Transit · 9:16"
          : preset === "tectonic-tread"
            ? "Tectonic Tread · 9:16"
            : preset === "kinetic-monolith"
              ? "Kinetic Monolith · 9:16"
              : preset === "apex-interface"
                ? "Apex Interface · 9:16"
                : "Calibration Matrix · 9:16";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Template preset
          </label>
          <select
            value={preset}
            onChange={(e) =>
              setPreset(e.target.value as AtcOverlayPresetId)
            }
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            aria-label="Alberton Tyre Clinic overlay preset"
          >
            {ATC_OVERLAY_PRESETS.map((p) => (
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
          {preset === "kinetic-grip" ? (
            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="text-xs text-[#8E8E93]">
                Kinetic Grip · square logo beside headline (default: clinic logo;
                upload to replace)
              </label>
              <input
                ref={kineticGripVerticalLogoFileRef}
                type="file"
                accept="image/*"
                onChange={onPickKineticGripHeadlineLogo}
                className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
              />
              {kineticGripHeadlineLogoDataUrl ? (
                <button
                  type="button"
                  onClick={clearKineticGripHeadlineLogo}
                  className="text-xs text-[#8E8E93] underline hover:text-white"
                >
                  Remove custom logo
                </button>
              ) : null}
            </div>
          ) : null}
          {preset === "tectonic-tread" ? (
            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="text-xs text-[#8E8E93]">
                Tectonic Tread · square logo beside headline (default: clinic
                logo; upload to replace)
              </label>
              <input
                ref={tectonicVerticalLogoFileRef}
                type="file"
                accept="image/*"
                onChange={onPickTectonicHeadlineLogo}
                className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
              />
              {tectonicHeadlineLogoDataUrl ? (
                <button
                  type="button"
                  onClick={clearTectonicHeadlineLogo}
                  className="text-xs text-[#8E8E93] underline hover:text-white"
                >
                  Remove custom logo
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
            AI · JSON workflow
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            Template{" "}
            <code className="text-white/80">
              {TYRE_CLINIC_OVERLAY_JSON_TEMPLATE_ID}
            </code>{" "}
            · <code className="text-white/80">preset</code>:{" "}
            <code className="text-white/80">velocity-premium</code>,{" "}
            <code className="text-white/80">kinetic-grip</code>,{" "}
            <code className="text-white/80">commercial-transit</code>,{" "}
            <code className="text-white/80">tectonic-tread</code>,{" "}
            <code className="text-white/80">kinetic-monolith</code>,{" "}
            <code className="text-white/80">apex-interface</code>, or{" "}
            <code className="text-white/80">calibration-matrix</code>. Version
            1 JSON (no preset) still applies to Velocity Premium.
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
              rows={jsonRows}
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
              placeholder={`{\n  "template": "${TYRE_CLINIC_OVERLAY_JSON_TEMPLATE_ID}",\n  "preset": "kinetic-monolith",\n  "copy": { … }\n}`}
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

        {preset === "velocity-premium" ? (
          <>
            <Field
              label="Brand name (square top + vertical HUD)"
              value={v.brandName}
              onChange={(x) => patchVelocity("brandName", x)}
            />
            <Field
              label="Square — status pill (top right, e.g. Brand)"
              value={v.squareStatusPill}
              onChange={(x) => patchVelocity("squareStatusPill", x)}
            />
            <Field
              label="Square — label (orange, e.g. Featured Product)"
              value={v.squareTechHighlight}
              onChange={(x) => patchVelocity("squareTechHighlight", x)}
            />
            <Field
              label="Square — actual product (name line)"
              value={v.squareTechLine}
              onChange={(x) => patchVelocity("squareTechLine", x)}
            />
            <Field
              label="Headline — primary (both formats)"
              value={v.headlinePrimary}
              onChange={(x) => patchVelocity("headlinePrimary", x)}
            />
            <Field
              label="Headline — muted line"
              value={v.headlineMuted}
              onChange={(x) => patchVelocity("headlineMuted", x)}
            />
            <Field
              label="Square — CTA label"
              value={v.squareButtonText}
              onChange={(x) => patchVelocity("squareButtonText", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical only
            </p>
            <Field
              label="Store location line (mono)"
              value={v.verticalStoreLoc}
              onChange={(x) => patchVelocity("verticalStoreLoc", x)}
            />
            <Field
              label="Vertical status pill (e.g. Brand)"
              value={v.verticalStatusPill}
              onChange={(x) => patchVelocity("verticalStatusPill", x)}
            />
            <Field
              label="Vertical — product (single line above headline)"
              value={v.verticalProductLine}
              onChange={(x) => patchVelocity("verticalProductLine", x)}
            />
            <Field
              label="Brief product description (paragraph under headline)"
              value={v.subtext}
              onChange={(x) => patchVelocity("subtext", x)}
              rows={4}
            />
            <Field
              label="Price block — label"
              value={v.priceLabel}
              onChange={(x) => patchVelocity("priceLabel", x)}
            />
            <Field
              label="Price block — value"
              value={v.priceValue}
              onChange={(x) => patchVelocity("priceValue", x)}
            />
            <Field
              label="Vertical — CTA label"
              value={v.verticalButtonText}
              onChange={(x) => patchVelocity("verticalButtonText", x)}
            />
          </>
        ) : preset === "kinetic-grip" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical 9:16 — top HUD + terminal
            </p>
            <Field
              label="Clinic name (lockup)"
              value={g.gripVerticalClinicName}
              onChange={(x) => patchGrip("gripVerticalClinicName", x)}
            />
            <Field
              label="Partner badge (top right, e.g. BRAND)"
              value={g.gripVerticalPartnerBadge}
              onChange={(x) => patchGrip("gripVerticalPartnerBadge", x)}
            />
            <Field
              label="Headline — line 1 (solid)"
              value={g.gripVerticalHeadlineSolid}
              onChange={(x) => patchGrip("gripVerticalHeadlineSolid", x)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={g.gripVerticalHeadlineOutline}
              onChange={(x) => patchGrip("gripVerticalHeadlineOutline", x)}
            />
            <Field
              label="Subtext"
              value={g.gripVerticalSubtext}
              onChange={(x) => patchGrip("gripVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Brand (dock)"
              value={g.gripVerticalProductBrand}
              onChange={(x) => patchGrip("gripVerticalProductBrand", x)}
            />
            <Field
              label="Product subline"
              value={g.gripVerticalProductSub}
              onChange={(x) => patchGrip("gripVerticalProductSub", x)}
            />
            <Field
              label="Phone (terminal button)"
              value={g.gripVerticalPhone}
              onChange={(x) => patchGrip("gripVerticalPhone", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square 1:1 — grip strip
            </p>
            <Field
              label="Brand pill (top left, single line)"
              value={g.gripSquareBrandPill}
              onChange={(x) => patchGrip("gripSquareBrandPill", x)}
            />
            <Field
              label="Hero line 1 (solid)"
              value={g.gripSquareHeroSolid}
              onChange={(x) => patchGrip("gripSquareHeroSolid", x)}
            />
            <Field
              label="Hero line 2 (outline)"
              value={g.gripSquareHeroOutline}
              onChange={(x) => patchGrip("gripSquareHeroOutline", x)}
            />
            <Field
              label="Product title"
              value={g.gripSquareProductTitle}
              onChange={(x) => patchGrip("gripSquareProductTitle", x)}
            />
            <Field
              label="Product subtitle"
              value={g.gripSquareProductSub}
              onChange={(x) => patchGrip("gripSquareProductSub", x)}
            />
            <Field
              label="Phone (square button)"
              value={g.gripSquarePhone}
              onChange={(x) => patchGrip("gripSquarePhone", x)}
            />
          </>
        ) : preset === "commercial-transit" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical 9:16 — logistics terminal
            </p>
            <Field
              label="Clinic name (lockup)"
              value={c.commVerticalClinicName}
              onChange={(x) => patchCommercial("commVerticalClinicName", x)}
            />
            <Field
              label="Corp badge (top right)"
              value={c.commVerticalCorpBadge}
              onChange={(x) => patchCommercial("commVerticalCorpBadge", x)}
            />
            <Field
              label="Spec mini 1"
              value={c.commVerticalSpec1}
              onChange={(x) => patchCommercial("commVerticalSpec1", x)}
            />
            <Field
              label="Spec mini 2"
              value={c.commVerticalSpec2}
              onChange={(x) => patchCommercial("commVerticalSpec2", x)}
            />
            <Field
              label="Headline line 1 (dark)"
              value={c.commVerticalHeadlineLine1}
              onChange={(x) => patchCommercial("commVerticalHeadlineLine1", x)}
            />
            <Field
              label="Headline line 2 (orange)"
              value={c.commVerticalHeadlineLine2}
              onChange={(x) => patchCommercial("commVerticalHeadlineLine2", x)}
            />
            <Field
              label="Subtext"
              value={c.commVerticalSubtext}
              onChange={(x) => patchCommercial("commVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Service title"
              value={c.commVerticalServiceTitle}
              onChange={(x) => patchCommercial("commVerticalServiceTitle", x)}
            />
            <Field
              label="Service sub (mono)"
              value={c.commVerticalServiceSub}
              onChange={(x) => patchCommercial("commVerticalServiceSub", x)}
            />
            <Field
              label="Phone (vertical)"
              value={c.commVerticalPhone}
              onChange={(x) => patchCommercial("commVerticalPhone", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square 1:1 — terminal strip
            </p>
            <Field
              label="Clinic name (lockup)"
              value={c.commSquareClinicName}
              onChange={(x) => patchCommercial("commSquareClinicName", x)}
            />
            <Field
              label="Hero line 1 (dark)"
              value={c.commSquareHeroLine1}
              onChange={(x) => patchCommercial("commSquareHeroLine1", x)}
            />
            <Field
              label="Hero line 2 (orange)"
              value={c.commSquareHeroLine2}
              onChange={(x) => patchCommercial("commSquareHeroLine2", x)}
            />
            <Field
              label="Service title"
              value={c.commSquareServiceTitle}
              onChange={(x) => patchCommercial("commSquareServiceTitle", x)}
            />
            <Field
              label="Service description"
              value={c.commSquareServiceSub}
              onChange={(x) => patchCommercial("commSquareServiceSub", x)}
              rows={3}
            />
            <Field
              label="Spec mini 1"
              value={c.commSquareSpec1}
              onChange={(x) => patchCommercial("commSquareSpec1", x)}
            />
            <Field
              label="Spec mini 2"
              value={c.commSquareSpec2}
              onChange={(x) => patchCommercial("commSquareSpec2", x)}
            />
            <Field
              label="Action label (mono)"
              value={c.commSquareActionLbl}
              onChange={(x) => patchCommercial("commSquareActionLbl", x)}
            />
            <Field
              label="Phone (square)"
              value={c.commSquarePhone}
              onChange={(x) => patchCommercial("commSquarePhone", x)}
            />
          </>
        ) : preset === "tectonic-tread" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical 9:16 — fusion panel
            </p>
            <Field
              label="Clinic (top HUD)"
              value={d.duelVerticalLockupName}
              onChange={(x) => patchDueler("duelVerticalLockupName", x)}
            />
            <Field
              label="Featured brand (top right)"
              value={d.duelVerticalBrandBadge}
              onChange={(x) => patchDueler("duelVerticalBrandBadge", x)}
            />
            <Field
              label="Headline line 1 (solid)"
              value={d.duelVerticalHeadlineL1}
              onChange={(x) => patchDueler("duelVerticalHeadlineL1", x)}
            />
            <Field
              label="Headline line 2 (outline)"
              value={d.duelVerticalHeadlineL2Outline}
              onChange={(x) =>
                patchDueler("duelVerticalHeadlineL2Outline", x)
              }
            />
            <Field
              label="Subtext"
              value={d.duelVerticalSubtext}
              onChange={(x) => patchDueler("duelVerticalSubtext", x)}
              rows={4}
            />
            <Field
              label="Service title"
              value={d.duelVerticalServiceTitle}
              onChange={(x) => patchDueler("duelVerticalServiceTitle", x)}
            />
            <Field
              label="Service sub (mono)"
              value={d.duelVerticalServiceSub}
              onChange={(x) => patchDueler("duelVerticalServiceSub", x)}
            />
            <Field
              label="Phone (vertical)"
              value={d.duelVerticalPhone}
              onChange={(x) => patchDueler("duelVerticalPhone", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square 1:1 — fusion dock
            </p>
            <Field
              label="Clinic (top bar, left)"
              value={d.duelSquareBrandPill}
              onChange={(x) => patchDueler("duelSquareBrandPill", x)}
            />
            <Field
              label="Featured brand (top bar, right)"
              value={d.duelSquareBrandBadge}
              onChange={(x) => patchDueler("duelSquareBrandBadge", x)}
            />
            <Field
              label="Hero line 1 (solid, bottom dock — centre stays for image)"
              value={d.duelSquareHeroL1}
              onChange={(x) => patchDueler("duelSquareHeroL1", x)}
            />
            <Field
              label="Hero line 2 (outline, bottom dock)"
              value={d.duelSquareHeroL2Outline}
              onChange={(x) => patchDueler("duelSquareHeroL2Outline", x)}
            />
            <Field
              label="Product title"
              value={d.duelSquareProductTitle}
              onChange={(x) => patchDueler("duelSquareProductTitle", x)}
            />
            <Field
              label="Product subtitle"
              value={d.duelSquareProductSub}
              onChange={(x) => patchDueler("duelSquareProductSub", x)}
            />
            <Field
              label="Highlight 1 (dock)"
              value={d.duelSquareSpec1}
              onChange={(x) => patchDueler("duelSquareSpec1", x)}
            />
            <Field
              label="Highlight 2 (dock)"
              value={d.duelSquareSpec2}
              onChange={(x) => patchDueler("duelSquareSpec2", x)}
            />
            <Field
              label="Phone (square)"
              value={d.duelSquarePhone}
              onChange={(x) => patchDueler("duelSquarePhone", x)}
            />
          </>
        ) : preset === "kinetic-monolith" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Shared hero type (square + vertical)
            </p>
            <Field
              label="Hero line 1 (solid white)"
              value={k.kineticHeroSolid}
              onChange={(x) => patchKinetic("kineticHeroSolid", x)}
            />
            <Field
              label="Hero line 2 (outline stroke)"
              value={k.kineticHeroOutline}
              onChange={(x) => patchKinetic("kineticHeroOutline", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical — Kinetic
            </p>
            <Field
              label="Telemetry axis label (mono, rotated)"
              value={k.kineticTelemetryText}
              onChange={(x) => patchKinetic("kineticTelemetryText", x)}
            />
            <Field
              label="Top-right brand pill"
              value={k.kineticVerticalBrandTag}
              onChange={(x) => patchKinetic("kineticVerticalBrandTag", x)}
            />
            <Field
              label="Widget — text before orange phrase"
              value={k.kineticVerticalWidgetBefore}
              onChange={(x) => patchKinetic("kineticVerticalWidgetBefore", x)}
            />
            <Field
              label="Widget — orange strong phrase"
              value={k.kineticVerticalWidgetStrong}
              onChange={(x) => patchKinetic("kineticVerticalWidgetStrong", x)}
            />
            <Field
              label="Widget — text after orange phrase"
              value={k.kineticVerticalWidgetAfter}
              onChange={(x) => patchKinetic("kineticVerticalWidgetAfter", x)}
            />
            <Field
              label="Metric value (large)"
              value={k.kineticVerticalMetricVal}
              onChange={(x) => patchKinetic("kineticVerticalMetricVal", x)}
            />
            <Field
              label="Metric label (small caps)"
              value={k.kineticVerticalMetricLbl}
              onChange={(x) => patchKinetic("kineticVerticalMetricLbl", x)}
            />
            <Field
              label="Vertical CTA"
              value={k.kineticVerticalCta}
              onChange={(x) => patchKinetic("kineticVerticalCta", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square — Kinetic
            </p>
            <Field
              label="Top-right orange brand tag"
              value={k.kineticSquareBrandTag}
              onChange={(x) => patchKinetic("kineticSquareBrandTag", x)}
            />
            <Field
              label="Info widget — text before strong"
              value={k.kineticSquareWidgetBefore}
              onChange={(x) => patchKinetic("kineticSquareWidgetBefore", x)}
            />
            <Field
              label="Info widget — strong (white)"
              value={k.kineticSquareWidgetStrong}
              onChange={(x) => patchKinetic("kineticSquareWidgetStrong", x)}
            />
            <Field
              label="Info widget — text after strong"
              value={k.kineticSquareWidgetAfter}
              onChange={(x) => patchKinetic("kineticSquareWidgetAfter", x)}
            />
            <Field
              label="Metric label (right stack)"
              value={k.kineticSquareMetricLbl}
              onChange={(x) => patchKinetic("kineticSquareMetricLbl", x)}
            />
            <Field
              label="Metric value"
              value={k.kineticSquareMetricVal}
              onChange={(x) => patchKinetic("kineticSquareMetricVal", x)}
            />
            <Field
              label="Square CTA"
              value={k.kineticSquareCta}
              onChange={(x) => patchKinetic("kineticSquareCta", x)}
            />
          </>
        ) : preset === "apex-interface" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical 9:16 — Apex console
            </p>
            <Field
              label="Dynamic island (clinic)"
              value={a.apexVerticalIslandText}
              onChange={(x) => patchApex("apexVerticalIslandText", x)}
            />
            <Field
              label="Badge 1"
              value={a.apexVerticalBadge1}
              onChange={(x) => patchApex("apexVerticalBadge1", x)}
            />
            <Field
              label="Badge 2"
              value={a.apexVerticalBadge2}
              onChange={(x) => patchApex("apexVerticalBadge2", x)}
            />
            <Field
              label="Headline (shared with square)"
              value={a.apexHeadline}
              onChange={(x) => patchApex("apexHeadline", x)}
            />
            <Field
              label="Subtext"
              value={a.apexVerticalSubtext}
              onChange={(x) => patchApex("apexVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Vertical CTA"
              value={a.apexVerticalCta}
              onChange={(x) => patchApex("apexVerticalCta", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square 1:1 — command strip
            </p>
            <Field
              label="Island label"
              value={a.apexSquareIslandText}
              onChange={(x) => patchApex("apexSquareIslandText", x)}
            />
            <Field
              label="Sub-badge (orange)"
              value={a.apexSquareSubBadge}
              onChange={(x) => patchApex("apexSquareSubBadge", x)}
            />
            <Field
              label="Square CTA"
              value={a.apexSquareCta}
              onChange={(x) => patchApex("apexSquareCta", x)}
            />
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical 9:16 — calibration vault
            </p>
            <Field
              label="System status (left)"
              value={cal.calVerticalSysStatus}
              onChange={(x) => patchCalibration("calVerticalSysStatus", x)}
            />
            <Field
              label="Geo / clinic tag (right)"
              value={cal.calVerticalGeoTag}
              onChange={(x) => patchCalibration("calVerticalGeoTag", x)}
            />
            <Field
              label="Macro watermark number"
              value={cal.calVerticalMacroData}
              onChange={(x) => patchCalibration("calVerticalMacroData", x)}
            />
            <Field
              label="Spec badge"
              value={cal.calVerticalSpecBadge}
              onChange={(x) => patchCalibration("calVerticalSpecBadge", x)}
            />
            <Field
              label="Headline line 1"
              value={cal.calVerticalHeadlineL1}
              onChange={(x) => patchCalibration("calVerticalHeadlineL1", x)}
            />
            <Field
              label="Headline line 2"
              value={cal.calVerticalHeadlineL2}
              onChange={(x) => patchCalibration("calVerticalHeadlineL2", x)}
            />
            <Field
              label="Subtext"
              value={cal.calVerticalSubtext}
              onChange={(x) => patchCalibration("calVerticalSubtext", x)}
              rows={3}
            />
            <Field
              label="Brand name"
              value={cal.calVerticalBrandName}
              onChange={(x) => patchCalibration("calVerticalBrandName", x)}
            />
            <Field
              label="Brand subline"
              value={cal.calVerticalBrandSub}
              onChange={(x) => patchCalibration("calVerticalBrandSub", x)}
            />
            <Field
              label="Vertical phone (shown on orange CTA)"
              value={cal.calVerticalCtaAria}
              onChange={(x) => patchCalibration("calVerticalCtaAria", x)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square 1:1 — sensor breakout
            </p>
            <Field
              label="Headline solid"
              value={cal.calSquareHeadlineSolid}
              onChange={(x) => patchCalibration("calSquareHeadlineSolid", x)}
            />
            <Field
              label="Headline outline"
              value={cal.calSquareHeadlineOutline}
              onChange={(x) =>
                patchCalibration("calSquareHeadlineOutline", x)
              }
            />
            <Field
              label="Telemetry label"
              value={cal.calSquareTelemetryText}
              onChange={(x) =>
                patchCalibration("calSquareTelemetryText", x)
              }
            />
            <Field
              label="Dock subtext"
              value={cal.calSquareSubtext}
              onChange={(x) => patchCalibration("calSquareSubtext", x)}
              rows={3}
            />
            <Field
              label="Square CTA"
              value={cal.calSquareCta}
              onChange={(x) => patchCalibration("calSquareCta", x)}
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
            Preview · {previewSquareLabel}
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
            Preview · {previewVertLabel}
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

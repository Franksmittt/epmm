"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import energySquare from "./abm-master-battery-square.module.css";
import energyVertical from "./abm-master-battery-vertical.module.css";
import tacticalSquare from "./abm-tactical-square.module.css";
import tacticalVertical from "./abm-tactical-vertical.module.css";
import ignitionSquare from "./abm-ignition-square.module.css";
import ignitionVertical from "./abm-ignition-vertical.module.css";
import surgeSquare from "./abm-surge-matrix-square.module.css";
import surgeVertical from "./abm-surge-matrix-vertical.module.css";
import rejuvenationSquare from "./abm-rejuvenation-cell-square.module.css";
import rejuvenationVertical from "./abm-rejuvenation-cell-vertical.module.css";
import dataMatrixSquare from "./abm-data-matrix-square.module.css";
import dataMatrixVertical from "./abm-data-matrix-vertical.module.css";

export type AbmOverlayPresetId =
  | "energy-core"
  | "tactical"
  | "ignition-core"
  | "surge-matrix"
  | "rejuvenation-cell"
  | "data-matrix";

export const ABM_OVERLAY_PRESETS: {
  id: AbmOverlayPresetId;
  label: string;
  short: string;
}[] = [
  { id: "energy-core", label: "Master Battery — Energy Core", short: "Energy Core" },
  { id: "tactical", label: "Master Battery — Tactical HUD", short: "Tactical" },
  {
    id: "ignition-core",
    label: "Ignition Core — emergency red glass UI",
    short: "Ignition Core",
  },
  {
    id: "surge-matrix",
    label: "Surge Matrix — industrial hash + jumper strip",
    short: "Surge Matrix",
  },
  {
    id: "rejuvenation-cell",
    label: "Rejuvenation Cell — charging vertical + slim square (static)",
    short: "Rejuvenation Cell",
  },
  {
    id: "data-matrix",
    label: "Data Matrix — Did You Know (SLA vs AGM compare)",
    short: "Data Matrix",
  },
];

export const BATTERY_OVERLAY_JSON_TEMPLATE_ID = "alberton-battery-mart-overlay";
export const BATTERY_OVERLAY_JSON_VERSION = 5;

const ENERGY_KEYS = [
  "clinicName",
  "clinicStatus",
  "contactPhone",
  "batteryBrandLine",
  "headlinePrimary",
  "headlineAccent",
  "techSpecs",
  "buttonText",
] as const;

const TACTICAL_KEYS = [
  "dealerLabel",
  "dealerName",
  "dealerContact",
  "productCode",
  "headlinePrimary",
  "headlineSecondary",
  "techSpec",
  "buttonText",
] as const;

const IGNITION_KEYS = [
  "ignSquareBrandPill",
  "ignSquareHeroL1",
  "ignSquareHeroL2",
  "ignSquareProductTitle",
  "ignSquareProductSub",
  "ignSquareSpec1",
  "ignSquareSpec2",
  "ignSquareSpec3",
  "ignSquarePhone",
  "ignVerticalHqName",
  "ignVerticalSpec1",
  "ignVerticalSpec2",
  "ignVerticalSpec3",
  "ignVerticalHeadlineL1",
  "ignVerticalHeadlineL2",
  "ignVerticalSubtext",
  "ignVerticalProductBrand",
  "ignVerticalProductSub",
  "ignVerticalPhone",
] as const;

const SURGE_KEYS = [
  "surgeSquareBrandPill",
  "surgeSquareHeroL1",
  "surgeSquareHeroL2",
  "surgeSquareProductL1",
  "surgeSquareProductL2",
  "surgeSquareProductSub",
  "surgeSquareSpec1",
  "surgeSquareSpec2",
  "surgeSquareSpec3",
  "surgeSquarePhone",
  "surgeVerticalHqName",
  "surgeVerticalSpec1",
  "surgeVerticalSpec2",
  "surgeVerticalSpec3",
  "surgeVerticalHeadlineL1",
  "surgeVerticalHeadlineL2",
  "surgeVerticalSubtext",
  "surgeVerticalProductL1",
  "surgeVerticalProductL2",
  "surgeVerticalProductSub",
  "surgeVerticalPhone",
] as const;

const REJUVENATION_KEYS = [
  "rejBrandName",
  "rejTechBadge",
  "rejVerticalSpec1",
  "rejVerticalSpec2",
  "rejHeadlineL1",
  "rejHeadlineL2",
  "rejVerticalSubtext",
  "rejVerticalServiceTitle",
  "rejVerticalServiceSub",
  "rejSquareSpec1",
  "rejSquareSpec2",
  "rejSquareServiceTitle",
  "rejSquareServiceSub",
  "rejPhone",
] as const;

const DATA_MATRIX_KEYS = [
  "dmBrandName",
  "dmSquareBrandSub",
  "dmHeadlineL1",
  "dmHeadlineL2",
  "dmVerticalInsightBadge",
  "dmVerticalHeroSub",
  "dmLeftTitle",
  "dmLeftSpec1",
  "dmLeftSpec2",
  "dmLeftSpec3",
  "dmRightTitle",
  "dmRightSpec1",
  "dmRightSpec2",
  "dmRightSpec3",
  "dmVsLabel",
  "dmSquareFootnote",
  "dmSquarePhone",
  "dmVerticalCallLabel",
] as const;

type EnergyCopyKey = (typeof ENERGY_KEYS)[number];
type TacticalCopyKey = (typeof TACTICAL_KEYS)[number];
type IgnitionCopyKey = (typeof IGNITION_KEYS)[number];
type SurgeCopyKey = (typeof SURGE_KEYS)[number];
type RejuvenationCopyKey = (typeof REJUVENATION_KEYS)[number];
type DataMatrixCopyKey = (typeof DATA_MATRIX_KEYS)[number];

const DEFAULTS_ENERGY: Record<EnergyCopyKey, string> = {
  clinicName: "YOUR BATTERY CLINIC",
  clinicStatus: "Authorized Energy Center",
  contactPhone: "011 XXX XXXX",
  batteryBrandLine: "PARTNER BRAND // AGM",
  headlinePrimary: "Absolute.",
  headlineAccent: "Surge.",
  techSpecs:
    "Zero maintenance. Relentless deep-cycle endurance engineered for extreme conditions.",
  buttonText: "Power Up",
};

const DEFAULTS_TACTICAL: Record<TacticalCopyKey, string> = {
  dealerLabel: "Authorized Supplier",
  dealerName: "YOUR CLINIC LTD",
  dealerContact: "TEL: 011 XXX XXXX",
  productCode: "PARTNER BRAND // HIGH YIELD",
  headlinePrimary: "Critical",
  headlineSecondary: "Capacity.",
  techSpec:
    "Surgical precision. Maximum surge. Engineered to dominate high-demand electrical environments.",
  buttonText: "Initiate",
};

const DEFAULTS_IGNITION: Record<IgnitionCopyKey, string> = {
  ignSquareBrandPill: "Alberton Battery Mart",
  ignSquareHeroL1: "Power.",
  ignSquareHeroL2: "Unleashed.",
  ignSquareProductTitle: "Enertec YTX12-BS",
  ignSquareProductSub: "(Motorcycle Series)",
  ignSquareSpec1: "12V / 12Ah",
  ignSquareSpec2: "155 CCA",
  ignSquareSpec3: "AGM Tech",
  ignSquarePhone: "010 109 6211",
  ignVerticalHqName: "Alberton Battery Mart",
  ignVerticalSpec1: "12V 12Ah",
  ignVerticalSpec2: "155 CCA",
  ignVerticalSpec3: "AGM Tech",
  ignVerticalHeadlineL1: "Instant.",
  ignVerticalHeadlineL2: "Ignition.",
  ignVerticalSubtext:
    "Reliable, consistent starting power. Designed for everyday riders who demand flawless execution the second they hit the starter.",
  ignVerticalProductBrand: "Enertec YTX12-BS",
  ignVerticalProductSub: "(Motorcycle Series)",
  ignVerticalPhone: "010 109 6211",
};

const DEFAULTS_SURGE: Record<SurgeCopyKey, string> = {
  surgeSquareBrandPill: "Alberton Battery Mart",
  surgeSquareHeroL1: "Raw.",
  surgeSquareHeroL2: "Surge.",
  surgeSquareProductL1: "Heavy Duty",
  surgeSquareProductL2: "Jumper Cables",
  surgeSquareProductSub: "(Industrial Grade)",
  surgeSquareSpec1: "35mm² Copper",
  surgeSquareSpec2: "600A Peak",
  surgeSquareSpec3: "2.5m Reach",
  surgeSquarePhone: "010 109 6211",
  surgeVerticalHqName: "Alberton Battery Mart",
  surgeVerticalSpec1: "35mm² Copper Core",
  surgeVerticalSpec2: "600A Peak",
  surgeVerticalSpec3: "2.5m Reach",
  surgeVerticalHeadlineL1: "Raw.",
  surgeVerticalHeadlineL2: "Surge.",
  surgeVerticalSubtext:
    "Zero bottleneck. Industrial-grade welding cable paired with heavy-duty clamps designed to deliver pure, uninterrupted cranking power.",
  surgeVerticalProductL1: "Heavy Duty",
  surgeVerticalProductL2: "Jumper Cables",
  surgeVerticalProductSub: "(Industrial Series)",
  surgeVerticalPhone: "010 109 6211",
};

const DEFAULTS_REJUVENATION: Record<RejuvenationCopyKey, string> = {
  rejBrandName: "Alberton Battery Mart",
  rejTechBadge: "Service Centre",
  rejVerticalSpec1: "Deep Cycle Charging",
  rejVerticalSpec2: "Desulfation Tech",
  rejHeadlineL1: "Flat?",
  rejHeadlineL2: "Charged.",
  rejVerticalSubtext:
    "Advanced battery diagnostics and professional capacity recovery. We don't just charge it; we condition it for maximum lifespan.",
  rejVerticalServiceTitle: "Professional Charging",
  rejVerticalServiceSub: "Drop-off & Collect",
  rejSquareSpec1: "Deep Cycle Charging",
  rejSquareSpec2: "Capacity Recovery",
  rejSquareServiceTitle: "Professional Charging",
  rejSquareServiceSub: "Drop-off & Collect Service",
  rejPhone: "010 109 6211",
};

const DEFAULTS_DATA_MATRIX: Record<DataMatrixCopyKey, string> = {
  dmBrandName: "Alberton Battery Mart",
  dmSquareBrandSub: "Tech Insight Center",
  dmHeadlineL1: "Did You",
  dmHeadlineL2: "Know?",
  dmVerticalInsightBadge: "Tech Insight",
  dmVerticalHeroSub:
    "Not all batteries are created equal. Upgrading your tech changes everything.",
  dmLeftTitle: "Standard Lead Acid",
  dmLeftSpec1: "Basic Cranking Power",
  dmLeftSpec2: "Vibration Sensitive",
  dmLeftSpec3: "Requires Maintenance",
  dmRightTitle: "AGM Technology",
  dmRightSpec1: "Massive CCA Output",
  dmRightSpec2: "100% Vibration Proof",
  dmRightSpec3: "Up to 3x Longer Life",
  dmVsLabel: "VS",
  dmSquareFootnote:
    "Upgrading to an AGM battery completely changes your vehicle's reliability.",
  dmSquarePhone: "010 109 6211",
  dmVerticalCallLabel: "Upgrade to AGM: 010 109 6211",
};

function initialCopyByPreset(): Record<AbmOverlayPresetId, Record<string, string>> {
  return {
    "energy-core": { ...DEFAULTS_ENERGY },
    tactical: { ...DEFAULTS_TACTICAL },
    "ignition-core": { ...DEFAULTS_IGNITION },
    "surge-matrix": { ...DEFAULTS_SURGE },
    "rejuvenation-cell": { ...DEFAULTS_REJUVENATION },
    "data-matrix": { ...DEFAULTS_DATA_MATRIX },
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

function isPresetId(v: unknown): v is AbmOverlayPresetId {
  return (
    v === "energy-core" ||
    v === "tactical" ||
    v === "ignition-core" ||
    v === "surge-matrix" ||
    v === "rejuvenation-cell" ||
    v === "data-matrix"
  );
}

/** If JSON omits `preset`, guess from which copy keys appear. */
function inferPresetFromBlock(
  block: Record<string, unknown>,
): AbmOverlayPresetId | null {
  const keys = Object.keys(block);
  const rejHit = keys.some((k) =>
    (REJUVENATION_KEYS as readonly string[]).includes(k),
  );
  const dmHit = keys.some((k) =>
    (DATA_MATRIX_KEYS as readonly string[]).includes(k),
  );
  const surgeHit = keys.some((k) =>
    (SURGE_KEYS as readonly string[]).includes(k),
  );
  const ignitionHit = keys.some((k) =>
    (IGNITION_KEYS as readonly string[]).includes(k),
  );
  const tacticalHit = keys.some((k) =>
    (TACTICAL_KEYS as readonly string[]).includes(k),
  );
  const energyHit = keys.some((k) =>
    (ENERGY_KEYS as readonly string[]).includes(k),
  );
  if (rejHit && !dmHit && !surgeHit && !ignitionHit && !tacticalHit && !energyHit)
    return "rejuvenation-cell";
  if (dmHit && !rejHit && !surgeHit && !ignitionHit && !tacticalHit && !energyHit)
    return "data-matrix";
  if (
    surgeHit &&
    !ignitionHit &&
    !tacticalHit &&
    !energyHit &&
    !rejHit &&
    !dmHit
  )
    return "surge-matrix";
  if (
    ignitionHit &&
    !tacticalHit &&
    !energyHit &&
    !surgeHit &&
    !rejHit &&
    !dmHit
  )
    return "ignition-core";
  if (tacticalHit && !energyHit && !ignitionHit && !surgeHit && !rejHit && !dmHit)
    return "tactical";
  if (energyHit && !tacticalHit && !ignitionHit && !surgeHit && !rejHit && !dmHit)
    return "energy-core";
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

function LightningBoltSvg() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
  );
}

function PlayTriangleSvg() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5 3L19 12L5 21V3Z" />
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

export function AbmMasterBatteryOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<AbmOverlayPresetId>("energy-core");
  const [copyByPreset, setCopyByPreset] = useState(initialCopyByPreset);

  const setEnergy = (key: EnergyCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "energy-core": { ...prev["energy-core"], [key]: value },
    }));
  };

  const setTactical = (key: TacticalCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      tactical: { ...prev.tactical, [key]: value },
    }));
  };

  const setIgnition = (key: IgnitionCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "ignition-core": { ...prev["ignition-core"], [key]: value },
    }));
  };

  const setSurge = (key: SurgeCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "surge-matrix": { ...prev["surge-matrix"], [key]: value },
    }));
  };

  const setRejuvenation = (key: RejuvenationCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "rejuvenation-cell": { ...prev["rejuvenation-cell"], [key]: value },
    }));
  };

  const setDataMatrix = (key: DataMatrixCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "data-matrix": { ...prev["data-matrix"], [key]: value },
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
    const body: Record<string, unknown> = {
      template: BATTERY_OVERLAY_JSON_TEMPLATE_ID,
      version: BATTERY_OVERLAY_JSON_VERSION,
      preset,
      copy: copyByPreset[preset],
    };
    return JSON.stringify(body, null, 2);
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

    const targetPreset: AbmOverlayPresetId =
      (isPresetId(root.preset) ? root.preset : null) ??
      inferPresetFromBlock(block) ??
      preset;

    const keys =
      targetPreset === "energy-core"
        ? ENERGY_KEYS
        : targetPreset === "tactical"
          ? TACTICAL_KEYS
          : targetPreset === "surge-matrix"
            ? SURGE_KEYS
            : targetPreset === "rejuvenation-cell"
              ? REJUVENATION_KEYS
              : targetPreset === "data-matrix"
                ? DATA_MATRIX_KEYS
                : IGNITION_KEYS;
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
    if (preset === "energy-core") {
      setCopyByPreset((p) => ({ ...p, "energy-core": { ...DEFAULTS_ENERGY } }));
    } else if (preset === "tactical") {
      setCopyByPreset((p) => ({ ...p, tactical: { ...DEFAULTS_TACTICAL } }));
    } else if (preset === "surge-matrix") {
      setCopyByPreset((p) => ({ ...p, "surge-matrix": { ...DEFAULTS_SURGE } }));
    } else if (preset === "rejuvenation-cell") {
      setCopyByPreset((p) => ({
        ...p,
        "rejuvenation-cell": { ...DEFAULTS_REJUVENATION },
      }));
    } else if (preset === "data-matrix") {
      setCopyByPreset((p) => ({
        ...p,
        "data-matrix": { ...DEFAULTS_DATA_MATRIX },
      }));
    } else {
      setCopyByPreset((p) => ({
        ...p,
        "ignition-core": { ...DEFAULTS_IGNITION },
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
      a.download = `abm-${preset}-square-1080-${Date.now()}.png`;
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
      a.download = `abm-${preset}-vertical-9x16-${Date.now()}.png`;
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

  const ce = copyByPreset["energy-core"];
  const ct = copyByPreset.tactical;
  const ci = copyByPreset["ignition-core"];
  const cs = copyByPreset["surge-matrix"] as typeof DEFAULTS_SURGE;
  const crj =
    copyByPreset["rejuvenation-cell"] as typeof DEFAULTS_REJUVENATION;
  const cdm = copyByPreset["data-matrix"] as typeof DEFAULTS_DATA_MATRIX;

  const energySquareCanvas = (
    <div
      ref={squareRef}
      className={`${energySquare.root} ${energySquare.canvas1080}`}
      aria-label="Energy Core square export"
    >
      <div className={energySquare.adContainer}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={energySquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={energySquare.scrimTop} />
        <div className={energySquare.powerGlow} />
        <div className={energySquare.dealerHud}>
          <div className={energySquare.clinicInfo}>
            <div className={energySquare.clinicName}>{ce.clinicName}</div>
            <div className={energySquare.clinicStatus}>
              <span className={energySquare.statusDot} />
              <span>{ce.clinicStatus}</span>
            </div>
          </div>
          <div className={energySquare.hudPhone}>{ce.contactPhone}</div>
        </div>
        <div className={energySquare.heroStage} />
        <div className={energySquare.powerConsole}>
          <div className={energySquare.copyStack}>
            <div className={energySquare.batteryBrand}>{ce.batteryBrandLine}</div>
            <h1 className={energySquare.headline}>
              {ce.headlinePrimary}
              {ce.headlinePrimary && ce.headlineAccent ? <br /> : null}
              {ce.headlineAccent ? (
                <span className={energySquare.headlineAccent}>
                  {ce.headlineAccent}
                </span>
              ) : null}
            </h1>
            <div className={energySquare.techSpecs}>{ce.techSpecs}</div>
          </div>
          <button type="button" className={energySquare.surgeButton}>
            {ce.buttonText}
            <LightningBoltSvg />
          </button>
        </div>
      </div>
    </div>
  );

  const energyVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${energyVertical.root} ${energyVertical.canvas1080x1920}`}
      aria-label="Energy Core vertical export"
    >
      <div className={energyVertical.adContainer}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={energyVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={energyVertical.scrimTop} />
        <div className={energyVertical.scrimBottom} />
        <div className={energyVertical.powerGlow} />
        <div className={energyVertical.dealerHud}>
          <div className={energyVertical.clinicInfo}>
            <div className={energyVertical.clinicName}>{ce.clinicName}</div>
            <div className={energyVertical.clinicStatus}>
              <span className={energyVertical.statusDot} />
              <span>{ce.clinicStatus}</span>
            </div>
          </div>
          <div className={energyVertical.contactNumber}>{ce.contactPhone}</div>
        </div>
        <div className={energyVertical.heroStage} />
        <div className={energyVertical.powerConsole}>
          <div className={energyVertical.copyStack}>
            <div className={energyVertical.batteryBrand}>
              {ce.batteryBrandLine}
            </div>
            <h1 className={energyVertical.headline}>
              {ce.headlinePrimary}
              {ce.headlinePrimary && ce.headlineAccent ? <br /> : null}
              {ce.headlineAccent ? (
                <span className={energyVertical.headlineAccent}>
                  {ce.headlineAccent}
                </span>
              ) : null}
            </h1>
            <p className={energyVertical.techSpecs}>{ce.techSpecs}</p>
          </div>
          <button type="button" className={energyVertical.surgeButton}>
            <span>{ce.buttonText}</span>
            <LightningBoltSvg />
          </button>
        </div>
      </div>
    </div>
  );

  const tacticalSquareCanvas = (
    <div
      ref={squareRef}
      className={`${tacticalSquare.root} ${tacticalSquare.canvas1080}`}
      aria-label="Tactical square export"
    >
      <div className={tacticalSquare.adContainer}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={tacticalSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={tacticalSquare.scrimTop} />
        <div className={tacticalSquare.scrimBottom} />
        <div className={`${tacticalSquare.bracket} ${tacticalSquare.bTopLeft}`} />
        <div className={`${tacticalSquare.bracket} ${tacticalSquare.bTopRight}`} />
        <div
          className={`${tacticalSquare.bracket} ${tacticalSquare.bBottomLeft}`}
        />
        <div
          className={`${tacticalSquare.bracket} ${tacticalSquare.bBottomRight}`}
        />
        <div className={tacticalSquare.scannerGrid} />
        <div className={tacticalSquare.dealerBlock}>
          <span className={tacticalSquare.dealerLabel}>{ct.dealerLabel}</span>
          <span className={tacticalSquare.dealerName}>{ct.dealerName}</span>
          <span className={tacticalSquare.dealerContact}>
            {ct.dealerContact}
          </span>
        </div>
        <div className={tacticalSquare.heroStage} />
        <div className={tacticalSquare.tacticalConsole}>
          <div className={tacticalSquare.consoleData}>
            <div className={tacticalSquare.productCode}>{ct.productCode}</div>
            <h1 className={tacticalSquare.headline}>
              {ct.headlinePrimary}
              {ct.headlinePrimary && ct.headlineSecondary ? <br /> : null}
              {ct.headlineSecondary}
            </h1>
            <p className={tacticalSquare.techSpec}>{ct.techSpec}</p>
          </div>
          <button type="button" className={tacticalSquare.strikeAction}>
            <span className={tacticalSquare.strikeText}>{ct.buttonText}</span>
            <PlayTriangleSvg />
          </button>
        </div>
      </div>
    </div>
  );

  const tacticalVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${tacticalVertical.root} ${tacticalVertical.canvas1080x1920}`}
      aria-label="Tactical vertical export"
    >
      <div className={tacticalVertical.adContainer}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={tacticalVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={tacticalVertical.scrimTop} />
        <div className={tacticalVertical.scrimBottom} />
        <div
          className={`${tacticalVertical.bracket} ${tacticalVertical.bTopLeft}`}
        />
        <div
          className={`${tacticalVertical.bracket} ${tacticalVertical.bTopRight}`}
        />
        <div
          className={`${tacticalVertical.bracket} ${tacticalVertical.bBottomLeft}`}
        />
        <div
          className={`${tacticalVertical.bracket} ${tacticalVertical.bBottomRight}`}
        />
        <div className={tacticalVertical.scannerGrid} />
        <div className={tacticalVertical.dealerBlock}>
          <span className={tacticalVertical.dealerLabel}>{ct.dealerLabel}</span>
          <span className={tacticalVertical.dealerName}>{ct.dealerName}</span>
          <span className={tacticalVertical.dealerContact}>
            {ct.dealerContact}
          </span>
        </div>
        <div className={tacticalVertical.heroStage} />
        <div className={tacticalVertical.tacticalConsole}>
          <div className={tacticalVertical.consoleData}>
            <div className={tacticalVertical.productCodeRow}>
              <span className={tacticalVertical.productCodeDot} aria-hidden />
              <span>{ct.productCode}</span>
            </div>
            <h1 className={tacticalVertical.headline}>
              {ct.headlinePrimary}
              {ct.headlinePrimary && ct.headlineSecondary ? <br /> : null}
              {ct.headlineSecondary}
            </h1>
            <p className={tacticalVertical.techSpec}>{ct.techSpec}</p>
          </div>
          <button type="button" className={tacticalVertical.strikeAction}>
            <span className={tacticalVertical.strikeText}>{ct.buttonText}</span>
            <PlayTriangleSvg />
          </button>
        </div>
      </div>
    </div>
  );

  const ignitionSquareCanvas = (
    <div
      ref={squareRef}
      className={`${ignitionSquare.root} ${ignitionSquare.canvas1080}`}
      aria-label="Ignition Core square export"
    >
      <div className={ignitionSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={ignitionSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={ignitionSquare.scrimTop} />
        <div className={ignitionSquare.scrimBottom} />
        <div className={ignitionSquare.topPerimeter}>
          <div className={ignitionSquare.brandPill}>
            {ci.ignSquareBrandPill}
          </div>
          <h1 className={ignitionSquare.heroType}>
            {ci.ignSquareHeroL1}
            <br />
            <span className={ignitionSquare.heroOutline}>
              {ci.ignSquareHeroL2}
            </span>
          </h1>
        </div>
        <div className={ignitionSquare.ignitionStrip}>
          <div className={ignitionSquare.stripSpecs}>
            <div>
              <div className={ignitionSquare.productTitle}>
                {ci.ignSquareProductTitle}
              </div>
              <span className={ignitionSquare.productSub}>
                {ci.ignSquareProductSub}
              </span>
            </div>
            <div className={ignitionSquare.specRow}>
              <span className={ignitionSquare.specMini}>
                {ci.ignSquareSpec1}
              </span>
              <span className={ignitionSquare.specMini}>
                {ci.ignSquareSpec2}
              </span>
              <span className={ignitionSquare.specMini}>
                {ci.ignSquareSpec3}
              </span>
            </div>
          </div>
          <div className={ignitionSquare.divider} />
          <div className={ignitionSquare.stripCompany}>
            <button type="button" className={ignitionSquare.btnCall}>
              <PhoneHandsetSvg size={18} />
              {ci.ignSquarePhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ignitionVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${ignitionVertical.root} ${ignitionVertical.canvas1080x1920}`}
      aria-label="Ignition Core vertical export"
    >
      <div className={ignitionVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={ignitionVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={ignitionVertical.energySurge} />
        <div className={ignitionVertical.scrim} />
        <div className={ignitionVertical.topHud}>
          <div className={ignitionVertical.brandLockup}>
            <span className={ignitionVertical.btName}>
              {ci.ignVerticalHqName}
            </span>
          </div>
        </div>
        <div className={ignitionVertical.ignitionTerminal}>
          <div className={ignitionVertical.specGrid}>
            <div className={ignitionVertical.specTag}>
              {ci.ignVerticalSpec1}
            </div>
            <div className={ignitionVertical.specTag}>
              {ci.ignVerticalSpec2}
            </div>
            <div className={ignitionVertical.specTag}>
              {ci.ignVerticalSpec3}
            </div>
          </div>
          <h1 className={ignitionVertical.headline}>
            {ci.ignVerticalHeadlineL1}
            <br />
            <span className={ignitionVertical.headlineOutline}>
              {ci.ignVerticalHeadlineL2}
            </span>
          </h1>
          <p className={ignitionVertical.subtext}>{ci.ignVerticalSubtext}</p>
          <div className={ignitionVertical.actionDock}>
            <div className={ignitionVertical.productId}>
              <span className={ignitionVertical.productBrand}>
                {ci.ignVerticalProductBrand}
              </span>
              <span className={ignitionVertical.productSub}>
                {ci.ignVerticalProductSub}
              </span>
            </div>
            <button type="button" className={ignitionVertical.btnCall}>
              <PhoneHandsetSvg size={16} />
              {ci.ignVerticalPhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const surgeSquareCanvas = (
    <div
      ref={squareRef}
      className={`${surgeSquare.root} ${surgeSquare.canvas1080}`}
      aria-label="Surge Matrix square export"
    >
      <div className={surgeSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={surgeSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={surgeSquare.industrialGrid} />
        <div className={surgeSquare.scrimTop} />
        <div className={surgeSquare.scrimBottom} />
        <div className={surgeSquare.topPerimeter}>
          <div className={surgeSquare.brandPill}>{cs.surgeSquareBrandPill}</div>
          <h1 className={surgeSquare.heroType}>
            {cs.surgeSquareHeroL1}
            <br />
            <span className={surgeSquare.heroOutline}>
              {cs.surgeSquareHeroL2}
            </span>
          </h1>
        </div>
        <div className={surgeSquare.surgeStrip}>
          <div className={surgeSquare.stripSpecs}>
            <div>
              <div className={surgeSquare.productTitle}>
                {cs.surgeSquareProductL1}
                {cs.surgeSquareProductL1 && cs.surgeSquareProductL2 ? (
                  <br />
                ) : null}
                {cs.surgeSquareProductL2}
              </div>
              <span className={surgeSquare.productSub}>
                {cs.surgeSquareProductSub}
              </span>
            </div>
            <div className={surgeSquare.specRow}>
              <span className={surgeSquare.specMini}>{cs.surgeSquareSpec1}</span>
              <span className={surgeSquare.specMini}>{cs.surgeSquareSpec2}</span>
              <span className={surgeSquare.specMini}>{cs.surgeSquareSpec3}</span>
            </div>
          </div>
          <div className={surgeSquare.divider} />
          <div className={surgeSquare.stripCompany}>
            <button type="button" className={surgeSquare.btnCall}>
              <PhoneHandsetSvg size={18} />
              {cs.surgeSquarePhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const surgeVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${surgeVertical.root} ${surgeVertical.canvas1080x1920}`}
      aria-label="Surge Matrix vertical export"
    >
      <div className={surgeVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={surgeVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={surgeVertical.industrialGrid} />
        <div className={surgeVertical.scrim} />
        <div className={surgeVertical.topHud}>
          <div className={surgeVertical.brandLockup}>
            <span className={surgeVertical.btName}>
              {cs.surgeVerticalHqName}
            </span>
          </div>
        </div>
        <div className={surgeVertical.surgeTerminal}>
          <div className={surgeVertical.specGrid}>
            <div className={surgeVertical.specTag}>
              {cs.surgeVerticalSpec1}
            </div>
            <div className={surgeVertical.specTag}>
              {cs.surgeVerticalSpec2}
            </div>
            <div className={surgeVertical.specTag}>
              {cs.surgeVerticalSpec3}
            </div>
          </div>
          <h1 className={surgeVertical.headline}>
            {cs.surgeVerticalHeadlineL1}
            <br />
            <span className={surgeVertical.headlineOutline}>
              {cs.surgeVerticalHeadlineL2}
            </span>
          </h1>
          <p className={surgeVertical.subtext}>{cs.surgeVerticalSubtext}</p>
          <div className={surgeVertical.actionDock}>
            <div className={surgeVertical.productId}>
              <span className={surgeVertical.productBrand}>
                {cs.surgeVerticalProductL1}
                {cs.surgeVerticalProductL1 && cs.surgeVerticalProductL2 ? (
                  <br />
                ) : null}
                {cs.surgeVerticalProductL2}
              </span>
              <span className={surgeVertical.productSub}>
                {cs.surgeVerticalProductSub}
              </span>
            </div>
            <button type="button" className={surgeVertical.btnCall}>
              <PhoneHandsetSvg size={16} />
              {cs.surgeVerticalPhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const rejuvenationSquareCanvas = (
    <div
      ref={squareRef}
      className={`${rejuvenationSquare.root} ${rejuvenationSquare.canvas1080}`}
      aria-label="Rejuvenation Cell square export"
    >
      <div className={rejuvenationSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={rejuvenationSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={rejuvenationSquare.scrimTop} />
        <div className={rejuvenationSquare.scrimBottom} />
        <div className={rejuvenationSquare.topPerimeter}>
          <div className={rejuvenationSquare.brandPill}>{crj.rejBrandName}</div>
          <h1 className={rejuvenationSquare.heroType}>
            {crj.rejHeadlineL1}
            <br />
            <span className={rejuvenationSquare.heroOutline}>
              {crj.rejHeadlineL2}
            </span>
          </h1>
        </div>
        <div className={rejuvenationSquare.slimTerminal}>
          <div className={rejuvenationSquare.serviceInfo}>
            <span className={rejuvenationSquare.serviceTitle}>
              {crj.rejSquareServiceTitle}
            </span>
            <span className={rejuvenationSquare.serviceSub}>
              {crj.rejSquareServiceSub}
            </span>
          </div>
          <div className={rejuvenationSquare.techTags}>
            <span className={rejuvenationSquare.specMini}>
              {crj.rejSquareSpec1}
            </span>
            <span className={rejuvenationSquare.specMini}>
              {crj.rejSquareSpec2}
            </span>
          </div>
          <div className={rejuvenationSquare.actionBlock}>
            <button type="button" className={rejuvenationSquare.btnCall}>
              <PhoneHandsetSvg size={18} />
              {crj.rejPhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const rejuvenationVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${rejuvenationVertical.root} ${rejuvenationVertical.canvas1080x1920}`}
      aria-label="Rejuvenation Cell vertical export"
    >
      <div className={rejuvenationVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={rejuvenationVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={rejuvenationVertical.powerCore} />
        <div className={rejuvenationVertical.powerPulse} />
        <div className={rejuvenationVertical.scrim} />
        <div className={rejuvenationVertical.topHud}>
          <div className={rejuvenationVertical.brandLockup}>
            <span className={rejuvenationVertical.btName}>
              {crj.rejBrandName}
            </span>
          </div>
          <div className={rejuvenationVertical.techBadge}>
            {crj.rejTechBadge}
          </div>
        </div>
        <div className={rejuvenationVertical.chargeTerminal}>
          <div className={rejuvenationVertical.specGrid}>
            <div className={rejuvenationVertical.specTag}>
              {crj.rejVerticalSpec1}
            </div>
            <div className={rejuvenationVertical.specTag}>
              {crj.rejVerticalSpec2}
            </div>
          </div>
          <h1 className={rejuvenationVertical.headline}>
            {crj.rejHeadlineL1}
            <br />
            <span className={rejuvenationVertical.headlineOutline}>
              {crj.rejHeadlineL2}
            </span>
          </h1>
          <p className={rejuvenationVertical.subtext}>
            {crj.rejVerticalSubtext}
          </p>
          <div className={rejuvenationVertical.actionDock}>
            <div className={rejuvenationVertical.serviceId}>
              <span className={rejuvenationVertical.serviceTitle}>
                {crj.rejVerticalServiceTitle}
              </span>
              <span className={rejuvenationVertical.serviceSub}>
                {crj.rejVerticalServiceSub}
              </span>
            </div>
            <button type="button" className={rejuvenationVertical.btnCall}>
              <PhoneHandsetSvg size={16} />
              {crj.rejPhone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const dataMatrixSquareCanvas = (
    <div
      ref={squareRef}
      className={`${dataMatrixSquare.root} ${dataMatrixSquare.canvas1080}`}
      aria-label="Data Matrix square export"
    >
      <div className={dataMatrixSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={dataMatrixSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={dataMatrixSquare.diagnosticGrid} />
        <div className={dataMatrixSquare.ambientGlow} />
        <div className={dataMatrixSquare.topPerimeter}>
          <div className={dataMatrixSquare.brandLockup}>
            <span className={dataMatrixSquare.btName}>{cdm.dmBrandName}</span>
            <span className={dataMatrixSquare.btSub}>
              {cdm.dmSquareBrandSub}
            </span>
          </div>
          <h1 className={dataMatrixSquare.heroType}>
            {cdm.dmHeadlineL1}
            <br />
            <span className={dataMatrixSquare.heroAccent}>
              {cdm.dmHeadlineL2}
            </span>
          </h1>
        </div>
        <div className={dataMatrixSquare.comparisonSplit}>
          <div className={`${dataMatrixSquare.techCol} ${dataMatrixSquare.colSla}`}>
            <div className={dataMatrixSquare.techTitle}>{cdm.dmLeftTitle}</div>
            <div className={dataMatrixSquare.specList}>
              <div className={dataMatrixSquare.specMini}>{cdm.dmLeftSpec1}</div>
              <div className={dataMatrixSquare.specMini}>{cdm.dmLeftSpec2}</div>
              <div className={dataMatrixSquare.specMini}>{cdm.dmLeftSpec3}</div>
            </div>
          </div>
          <div className={dataMatrixSquare.vsBadge}>{cdm.dmVsLabel}</div>
          <div className={`${dataMatrixSquare.techCol} ${dataMatrixSquare.colAgm}`}>
            <div className={dataMatrixSquare.techTitle}>{cdm.dmRightTitle}</div>
            <div className={dataMatrixSquare.specList}>
              <div className={dataMatrixSquare.specMini}>
                {cdm.dmRightSpec1}
              </div>
              <div className={dataMatrixSquare.specMini}>
                {cdm.dmRightSpec2}
              </div>
              <div className={dataMatrixSquare.specMini}>
                {cdm.dmRightSpec3}
              </div>
            </div>
          </div>
        </div>
        <div className={dataMatrixSquare.slimTerminal}>
          <div className={dataMatrixSquare.insightText}>
            {cdm.dmSquareFootnote}
          </div>
          <button type="button" className={dataMatrixSquare.btnCall}>
            <PhoneHandsetSvg size={18} />
            {cdm.dmSquarePhone}
          </button>
        </div>
      </div>
    </div>
  );

  const dataMatrixVerticalCanvas = (
    <div
      ref={verticalRef}
      className={`${dataMatrixVertical.root} ${dataMatrixVertical.canvas1080x1920}`}
      aria-label="Data Matrix vertical export"
    >
      <div className={dataMatrixVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={dataMatrixVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={dataMatrixVertical.diagnosticGrid} />
        <div className={dataMatrixVertical.ambientGlow} />
        <div className={dataMatrixVertical.topHud}>
          <div className={dataMatrixVertical.brandLockup}>
            <span className={dataMatrixVertical.btName}>
              {cdm.dmBrandName}
            </span>
          </div>
          <div className={dataMatrixVertical.insightBadge}>
            {cdm.dmVerticalInsightBadge}
          </div>
        </div>
        <div className={dataMatrixVertical.headerSection}>
          <h1 className={dataMatrixVertical.heroType}>
            {cdm.dmHeadlineL1}
            <br />
            <span className={dataMatrixVertical.heroAccent}>
              {cdm.dmHeadlineL2}
            </span>
          </h1>
          <p className={dataMatrixVertical.heroSub}>
            {cdm.dmVerticalHeroSub}
          </p>
        </div>
        <div className={dataMatrixVertical.comparisonBoard}>
          <div
            className={`${dataMatrixVertical.techCard} ${dataMatrixVertical.cardSla}`}
          >
            <div className={dataMatrixVertical.cardHeader}>
              <span className={dataMatrixVertical.techTitle}>
                {cdm.dmLeftTitle}
              </span>
            </div>
            <div className={dataMatrixVertical.specList}>
              <div className={dataMatrixVertical.specMini}>
                {cdm.dmLeftSpec1}
              </div>
              <div className={dataMatrixVertical.specMini}>
                {cdm.dmLeftSpec2}
              </div>
              <div className={dataMatrixVertical.specMini}>
                {cdm.dmLeftSpec3}
              </div>
            </div>
          </div>
          <div className={dataMatrixVertical.vsBadge}>{cdm.dmVsLabel}</div>
          <div
            className={`${dataMatrixVertical.techCard} ${dataMatrixVertical.cardAgm}`}
          >
            <div className={dataMatrixVertical.cardHeader}>
              <span className={dataMatrixVertical.techTitle}>
                {cdm.dmRightTitle}
              </span>
            </div>
            <div className={dataMatrixVertical.specList}>
              <div className={dataMatrixVertical.specMini}>
                {cdm.dmRightSpec1}
              </div>
              <div className={dataMatrixVertical.specMini}>
                {cdm.dmRightSpec2}
              </div>
              <div className={dataMatrixVertical.specMini}>
                {cdm.dmRightSpec3}
              </div>
            </div>
          </div>
        </div>
        <div className={dataMatrixVertical.actionDock}>
          <button type="button" className={dataMatrixVertical.btnCall}>
            <PhoneHandsetSvg size={18} />
            {cdm.dmVerticalCallLabel}
          </button>
        </div>
      </div>
    </div>
  );

  const squareCanvas =
    preset === "energy-core"
      ? energySquareCanvas
      : preset === "tactical"
        ? tacticalSquareCanvas
        : preset === "surge-matrix"
          ? surgeSquareCanvas
          : preset === "rejuvenation-cell"
            ? rejuvenationSquareCanvas
            : preset === "data-matrix"
              ? dataMatrixSquareCanvas
              : ignitionSquareCanvas;
  const verticalCanvas =
    preset === "energy-core"
      ? energyVerticalCanvas
      : preset === "tactical"
        ? tacticalVerticalCanvas
        : preset === "surge-matrix"
          ? surgeVerticalCanvas
          : preset === "rejuvenation-cell"
            ? rejuvenationVerticalCanvas
            : preset === "data-matrix"
              ? dataMatrixVerticalCanvas
              : ignitionVerticalCanvas;

  const expectedKeysHint =
    preset === "energy-core"
      ? ENERGY_KEYS.join(", ")
      : preset === "tactical"
        ? TACTICAL_KEYS.join(", ")
        : preset === "surge-matrix"
          ? SURGE_KEYS.join(", ")
          : preset === "rejuvenation-cell"
            ? REJUVENATION_KEYS.join(", ")
            : preset === "data-matrix"
              ? DATA_MATRIX_KEYS.join(", ")
              : IGNITION_KEYS.join(", ");

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,380px)]">
        <div className="space-y-2 rounded-md border border-white/15 bg-black/40 p-3">
          <label
            htmlFor="abm-preset"
            className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]"
          >
            Template preset
          </label>
          <select
            id="abm-preset"
            value={preset}
            onChange={(e) =>
              setPreset(e.target.value as AbmOverlayPresetId)
            }
            className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {ABM_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#8E8E93]">
            Each preset has its own copy fields and layout. Hero images are
            shared. Add more presets later (up to ~5).
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

        <div className="space-y-3 rounded-md border border-red-500/25 bg-red-500/[0.06] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-red-200/90">
            AI · JSON workflow
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            JSON includes <code className="text-white/80">preset</code> (
            <code className="text-white/80">energy-core</code>,{" "}
            <code className="text-white/80">tactical</code>,{" "}
            <code className="text-white/80">ignition-core</code>,{" "}
            <code className="text-white/80">surge-matrix</code>,{" "}
            <code className="text-white/80">rejuvenation-cell</code>, or{" "}
            <code className="text-white/80">data-matrix</code>) and{" "}
            <code className="text-white/80">copy</code>. v
            {BATTERY_OVERLAY_JSON_VERSION}: infer Rejuvenation (rej*) → Data
            Matrix (dm*) → Surge → Ignition → Tactical → Energy if preset
            omitted.
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#8E8E93]">Current copy (JSON)</span>
              <button
                type="button"
                onClick={copyJsonToClipboard}
                className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-500/30"
              >
                {copyFlash ? "Copied" : "Copy JSON"}
              </button>
            </div>
            <textarea
              readOnly
              value={exportJson}
              rows={
                preset === "ignition-core" ||
                preset === "surge-matrix" ||
                preset === "rejuvenation-cell" ||
                preset === "data-matrix"
                  ? 26
                  : 18
              }
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
              placeholder={`{\n  "template": "${BATTERY_OVERLAY_JSON_TEMPLATE_ID}",\n  "preset": "tactical",\n  "copy": { … }\n}`}
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
          Fields for <strong className="text-white/90">{preset}</strong> · keys:{" "}
          {expectedKeysHint}
        </p>

        {preset === "energy-core" ? (
          <>
            <Field
              label="Clinic name"
              value={ce.clinicName}
              onChange={(v) => setEnergy("clinicName", v)}
            />
            <Field
              label="Status line (red, next to dot)"
              value={ce.clinicStatus}
              onChange={(v) => setEnergy("clinicStatus", v)}
            />
            <Field
              label="Contact phone"
              value={ce.contactPhone}
              onChange={(v) => setEnergy("contactPhone", v)}
            />
            <Field
              label="Battery / partner line (small caps)"
              value={ce.batteryBrandLine}
              onChange={(v) => setEnergy("batteryBrandLine", v)}
            />
            <Field
              label="Headline — primary line"
              value={ce.headlinePrimary}
              onChange={(v) => setEnergy("headlinePrimary", v)}
            />
            <Field
              label="Headline — accent (red)"
              value={ce.headlineAccent}
              onChange={(v) => setEnergy("headlineAccent", v)}
            />
            <Field
              label="Tech / supporting copy"
              value={ce.techSpecs}
              onChange={(v) => setEnergy("techSpecs", v)}
              rows={4}
            />
            <Field
              label="Button label"
              value={ce.buttonText}
              onChange={(v) => setEnergy("buttonText", v)}
            />
          </>
        ) : preset === "tactical" ? (
          <>
            <Field
              label="Dealer label (small, above name)"
              value={ct.dealerLabel}
              onChange={(v) => setTactical("dealerLabel", v)}
            />
            <Field
              label="Clinic / dealer name"
              value={ct.dealerName}
              onChange={(v) => setTactical("dealerName", v)}
            />
            <Field
              label="Contact line (e.g. TEL: …)"
              value={ct.dealerContact}
              onChange={(v) => setTactical("dealerContact", v)}
            />
            <Field
              label="Product code line (red, caps)"
              value={ct.productCode}
              onChange={(v) => setTactical("productCode", v)}
            />
            <Field
              label="Headline — line 1 (uppercase)"
              value={ct.headlinePrimary}
              onChange={(v) => setTactical("headlinePrimary", v)}
            />
            <Field
              label="Headline — line 2"
              value={ct.headlineSecondary}
              onChange={(v) => setTactical("headlineSecondary", v)}
            />
            <Field
              label="Tech / supporting copy"
              value={ct.techSpec}
              onChange={(v) => setTactical("techSpec", v)}
              rows={4}
            />
            <Field
              label="Button label"
              value={ct.buttonText}
              onChange={(v) => setTactical("buttonText", v)}
            />
          </>
        ) : preset === "surge-matrix" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Surge Matrix
            </p>
            <Field
              label="Brand pill"
              value={cs.surgeSquareBrandPill}
              onChange={(v) => setSurge("surgeSquareBrandPill", v)}
            />
            <Field
              label="Hero — line 1 (solid)"
              value={cs.surgeSquareHeroL1}
              onChange={(v) => setSurge("surgeSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (outline)"
              value={cs.surgeSquareHeroL2}
              onChange={(v) => setSurge("surgeSquareHeroL2", v)}
            />
            <Field
              label="Product title — line 1"
              value={cs.surgeSquareProductL1}
              onChange={(v) => setSurge("surgeSquareProductL1", v)}
            />
            <Field
              label="Product title — line 2"
              value={cs.surgeSquareProductL2}
              onChange={(v) => setSurge("surgeSquareProductL2", v)}
            />
            <Field
              label="Product sub (mono)"
              value={cs.surgeSquareProductSub}
              onChange={(v) => setSurge("surgeSquareProductSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={cs.surgeSquareSpec1}
              onChange={(v) => setSurge("surgeSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={cs.surgeSquareSpec2}
              onChange={(v) => setSurge("surgeSquareSpec2", v)}
            />
            <Field
              label="Spec chip 3"
              value={cs.surgeSquareSpec3}
              onChange={(v) => setSurge("surgeSquareSpec3", v)}
            />
            <Field
              label="Strip — phone number"
              value={cs.surgeSquarePhone}
              onChange={(v) => setSurge("surgeSquarePhone", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Surge Matrix
            </p>
            <Field
              label="Top HUD — brand name"
              value={cs.surgeVerticalHqName}
              onChange={(v) => setSurge("surgeVerticalHqName", v)}
            />
            <Field
              label="Spec tag 1"
              value={cs.surgeVerticalSpec1}
              onChange={(v) => setSurge("surgeVerticalSpec1", v)}
            />
            <Field
              label="Spec tag 2"
              value={cs.surgeVerticalSpec2}
              onChange={(v) => setSurge("surgeVerticalSpec2", v)}
            />
            <Field
              label="Spec tag 3"
              value={cs.surgeVerticalSpec3}
              onChange={(v) => setSurge("surgeVerticalSpec3", v)}
            />
            <Field
              label="Headline — line 1"
              value={cs.surgeVerticalHeadlineL1}
              onChange={(v) => setSurge("surgeVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={cs.surgeVerticalHeadlineL2}
              onChange={(v) => setSurge("surgeVerticalHeadlineL2", v)}
            />
            <Field
              label="Subtext (body)"
              value={cs.surgeVerticalSubtext}
              onChange={(v) => setSurge("surgeVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Product — line 1"
              value={cs.surgeVerticalProductL1}
              onChange={(v) => setSurge("surgeVerticalProductL1", v)}
            />
            <Field
              label="Product — line 2"
              value={cs.surgeVerticalProductL2}
              onChange={(v) => setSurge("surgeVerticalProductL2", v)}
            />
            <Field
              label="Product sub (mono)"
              value={cs.surgeVerticalProductSub}
              onChange={(v) => setSurge("surgeVerticalProductSub", v)}
            />
            <Field
              label="Dock — phone number"
              value={cs.surgeVerticalPhone}
              onChange={(v) => setSurge("surgeVerticalPhone", v)}
            />
          </>
        ) : preset === "rejuvenation-cell" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Shared
            </p>
            <Field
              label="Brand name (vertical lockup + square pill)"
              value={crj.rejBrandName}
              onChange={(v) => setRejuvenation("rejBrandName", v)}
            />
            <Field
              label="Vertical — tech badge (top right)"
              value={crj.rejTechBadge}
              onChange={(v) => setRejuvenation("rejTechBadge", v)}
            />
            <Field
              label="Headline — line 1"
              value={crj.rejHeadlineL1}
              onChange={(v) => setRejuvenation("rejHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={crj.rejHeadlineL2}
              onChange={(v) => setRejuvenation("rejHeadlineL2", v)}
            />
            <Field
              label="Phone (square + vertical)"
              value={crj.rejPhone}
              onChange={(v) => setRejuvenation("rejPhone", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Rejuvenation Cell
            </p>
            <Field
              label="Spec tag 1"
              value={crj.rejVerticalSpec1}
              onChange={(v) => setRejuvenation("rejVerticalSpec1", v)}
            />
            <Field
              label="Spec tag 2"
              value={crj.rejVerticalSpec2}
              onChange={(v) => setRejuvenation("rejVerticalSpec2", v)}
            />
            <Field
              label="Subtext (body)"
              value={crj.rejVerticalSubtext}
              onChange={(v) => setRejuvenation("rejVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Dock — service title"
              value={crj.rejVerticalServiceTitle}
              onChange={(v) => setRejuvenation("rejVerticalServiceTitle", v)}
            />
            <Field
              label="Dock — service sub (mono)"
              value={crj.rejVerticalServiceSub}
              onChange={(v) => setRejuvenation("rejVerticalServiceSub", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Rejuvenation Cell (slim ribbon)
            </p>
            <Field
              label="Ribbon — service title"
              value={crj.rejSquareServiceTitle}
              onChange={(v) => setRejuvenation("rejSquareServiceTitle", v)}
            />
            <Field
              label="Ribbon — service sub"
              value={crj.rejSquareServiceSub}
              onChange={(v) => setRejuvenation("rejSquareServiceSub", v)}
            />
            <Field
              label="Spec mini 1"
              value={crj.rejSquareSpec1}
              onChange={(v) => setRejuvenation("rejSquareSpec1", v)}
            />
            <Field
              label="Spec mini 2"
              value={crj.rejSquareSpec2}
              onChange={(v) => setRejuvenation("rejSquareSpec2", v)}
            />
          </>
        ) : preset === "data-matrix" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Shared
            </p>
            <Field
              label="Brand name"
              value={cdm.dmBrandName}
              onChange={(v) => setDataMatrix("dmBrandName", v)}
            />
            <Field
              label="Square — lockup subline (mono)"
              value={cdm.dmSquareBrandSub}
              onChange={(v) => setDataMatrix("dmSquareBrandSub", v)}
            />
            <Field
              label="Headline — line 1"
              value={cdm.dmHeadlineL1}
              onChange={(v) => setDataMatrix("dmHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (red)"
              value={cdm.dmHeadlineL2}
              onChange={(v) => setDataMatrix("dmHeadlineL2", v)}
            />
            <Field
              label="VS badge label"
              value={cdm.dmVsLabel}
              onChange={(v) => setDataMatrix("dmVsLabel", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical only
            </p>
            <Field
              label="Top insight badge"
              value={cdm.dmVerticalInsightBadge}
              onChange={(v) => setDataMatrix("dmVerticalInsightBadge", v)}
            />
            <Field
              label="Subhead under headline"
              value={cdm.dmVerticalHeroSub}
              onChange={(v) => setDataMatrix("dmVerticalHeroSub", v)}
              rows={3}
            />
            <Field
              label="Full-width CTA button text"
              value={cdm.dmVerticalCallLabel}
              onChange={(v) => setDataMatrix("dmVerticalCallLabel", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square only
            </p>
            <Field
              label="Bottom insight line"
              value={cdm.dmSquareFootnote}
              onChange={(v) => setDataMatrix("dmSquareFootnote", v)}
              rows={3}
            />
            <Field
              label="Square — phone (button)"
              value={cdm.dmSquarePhone}
              onChange={(v) => setDataMatrix("dmSquarePhone", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Compare columns (both layouts)
            </p>
            <Field
              label="Left column title"
              value={cdm.dmLeftTitle}
              onChange={(v) => setDataMatrix("dmLeftTitle", v)}
            />
            <Field
              label="Left spec 1"
              value={cdm.dmLeftSpec1}
              onChange={(v) => setDataMatrix("dmLeftSpec1", v)}
            />
            <Field
              label="Left spec 2"
              value={cdm.dmLeftSpec2}
              onChange={(v) => setDataMatrix("dmLeftSpec2", v)}
            />
            <Field
              label="Left spec 3"
              value={cdm.dmLeftSpec3}
              onChange={(v) => setDataMatrix("dmLeftSpec3", v)}
            />
            <Field
              label="Right column title"
              value={cdm.dmRightTitle}
              onChange={(v) => setDataMatrix("dmRightTitle", v)}
            />
            <Field
              label="Right spec 1"
              value={cdm.dmRightSpec1}
              onChange={(v) => setDataMatrix("dmRightSpec1", v)}
            />
            <Field
              label="Right spec 2"
              value={cdm.dmRightSpec2}
              onChange={(v) => setDataMatrix("dmRightSpec2", v)}
            />
            <Field
              label="Right spec 3"
              value={cdm.dmRightSpec3}
              onChange={(v) => setDataMatrix("dmRightSpec3", v)}
            />
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Ignition Core
            </p>
            <Field
              label="Brand pill"
              value={ci.ignSquareBrandPill}
              onChange={(v) => setIgnition("ignSquareBrandPill", v)}
            />
            <Field
              label="Hero — line 1 (solid)"
              value={ci.ignSquareHeroL1}
              onChange={(v) => setIgnition("ignSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (outline)"
              value={ci.ignSquareHeroL2}
              onChange={(v) => setIgnition("ignSquareHeroL2", v)}
            />
            <Field
              label="Product title"
              value={ci.ignSquareProductTitle}
              onChange={(v) => setIgnition("ignSquareProductTitle", v)}
            />
            <Field
              label="Product sub (mono)"
              value={ci.ignSquareProductSub}
              onChange={(v) => setIgnition("ignSquareProductSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={ci.ignSquareSpec1}
              onChange={(v) => setIgnition("ignSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={ci.ignSquareSpec2}
              onChange={(v) => setIgnition("ignSquareSpec2", v)}
            />
            <Field
              label="Spec chip 3"
              value={ci.ignSquareSpec3}
              onChange={(v) => setIgnition("ignSquareSpec3", v)}
            />
            <Field
              label="Strip — phone number"
              value={ci.ignSquarePhone}
              onChange={(v) => setIgnition("ignSquarePhone", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Ignition Core
            </p>
            <Field
              label="Top HUD — brand name"
              value={ci.ignVerticalHqName}
              onChange={(v) => setIgnition("ignVerticalHqName", v)}
            />
            <Field
              label="Spec tag 1"
              value={ci.ignVerticalSpec1}
              onChange={(v) => setIgnition("ignVerticalSpec1", v)}
            />
            <Field
              label="Spec tag 2"
              value={ci.ignVerticalSpec2}
              onChange={(v) => setIgnition("ignVerticalSpec2", v)}
            />
            <Field
              label="Spec tag 3"
              value={ci.ignVerticalSpec3}
              onChange={(v) => setIgnition("ignVerticalSpec3", v)}
            />
            <Field
              label="Headline — line 1"
              value={ci.ignVerticalHeadlineL1}
              onChange={(v) => setIgnition("ignVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={ci.ignVerticalHeadlineL2}
              onChange={(v) => setIgnition("ignVerticalHeadlineL2", v)}
            />
            <Field
              label="Subtext (body)"
              value={ci.ignVerticalSubtext}
              onChange={(v) => setIgnition("ignVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Product brand (single line)"
              value={ci.ignVerticalProductBrand}
              onChange={(v) => setIgnition("ignVerticalProductBrand", v)}
            />
            <Field
              label="Product sub (mono)"
              value={ci.ignVerticalProductSub}
              onChange={(v) => setIgnition("ignVerticalProductSub", v)}
            />
            <Field
              label="Dock — phone number"
              value={ci.ignVerticalPhone}
              onChange={(v) => setIgnition("ignVerticalPhone", v)}
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
            Preview · 1:1 · {ABM_OVERLAY_PRESETS.find((p) => p.id === preset)?.short}
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
            Preview · 9:16 · {ABM_OVERLAY_PRESETS.find((p) => p.id === preset)?.short}
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

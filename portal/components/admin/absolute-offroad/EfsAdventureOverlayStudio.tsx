"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import adventureSquare from "./efs-adventure-square-pro.module.css";
import adventureVertical from "./efs-adventure-vertical-pro.module.css";
import oncaSquare from "./ao-onca-armor-square.module.css";
import oncaVertical from "./ao-onca-armor-vertical.module.css";
import rockSquare from "./ao-rock-sliders-square.module.css";
import rockVertical from "./ao-rock-sliders-vertical.module.css";
import photonSquare from "./ao-photon-lux-square.module.css";
import photonVertical from "./ao-photon-lux-vertical.module.css";
import degraafSquare from "./ao-degraaf-square.module.css";
import degraafVertical from "./ao-degraaf-vertical.module.css";

export type AoOverlayPresetId =
  | "adventure-pro"
  | "onca-armor"
  | "rock-sliders"
  | "photon-lux"
  | "degraaf-performance";

export const AO_OVERLAY_PRESETS: { id: AoOverlayPresetId; label: string }[] = [
  { id: "adventure-pro", label: "EFS Adventure — Square + Vertical Pro" },
  { id: "onca-armor", label: "Onca Armor — Tactical UI (A/O yellow)" },
  {
    id: "rock-sliders",
    label: "Rock Sliders — Chassis Armored (strip + reticle)",
  },
  {
    id: "photon-lux",
    label:
      "Photon Lux — Lighting beacon (centered hero, AO blue + yellow, beam field)",
  },
  {
    id: "degraaf-performance",
    label: "DeGraaf Performance — cyan performance UI",
  },
];

const ADVENTURE_KEYS = [
  "brandLogo",
  "seriesBadge",
  "headlinePrimary",
  "headlineMuted",
  "techLabel",
  "buttonText",
] as const;

const ONCA_KEYS = [
  "oncaSquareBrandPill",
  "oncaSquareHeroL1",
  "oncaSquareHeroL2",
  "oncaSquareProductMain",
  "oncaSquareProductSub",
  "oncaSquareSpec1",
  "oncaSquareSpec2",
  "oncaSquareWa",
  "oncaVerticalHqName",
  "oncaVerticalSpec1",
  "oncaVerticalSpec2",
  "oncaVerticalHeadlineL1",
  "oncaVerticalHeadlineL2",
  "oncaVerticalSubtextBefore",
  "oncaVerticalSubtextStrong",
  "oncaVerticalSubtextAfter",
  "oncaVerticalProductL1",
  "oncaVerticalProductL2",
  "oncaVerticalProductSub",
  "oncaVerticalWa",
] as const;

const ROCK_KEYS = [
  "rockSquareBrandPill",
  "rockSquareHeroL1",
  "rockSquareHeroL2",
  "rockSquareProductL1",
  "rockSquareProductL2",
  "rockSquareProductSub",
  "rockSquareSpec1",
  "rockSquareSpec2",
  "rockSquareCommsLbl",
  "rockSquareWa",
  "rockVerticalHqName",
  "rockVerticalHeadlineL1",
  "rockVerticalHeadlineL2",
  "rockVerticalSubtext",
  "rockVerticalProductL1",
  "rockVerticalProductL2",
  "rockVerticalProductSub",
  "rockVerticalWa",
] as const;

const PHOTON_KEYS = [
  "photonSquareBrandPill",
  "photonSquareHeroL1",
  "photonSquareHeroL2",
  "photonSquareProductL1",
  "photonSquareProductL2",
  "photonSquareProductSub",
  "photonSquareSpec1",
  "photonSquareSpec2",
  "photonSquareCommsLbl",
  "photonSquareWa",
  "photonVerticalHqName",
  "photonVerticalHeadlineL1",
  "photonVerticalHeadlineL2",
  "photonVerticalSubtext",
  "photonVerticalProductL1",
  "photonVerticalProductL2",
  "photonVerticalProductSub",
  "photonVerticalWa",
] as const;

const DEGRAAF_KEYS = [
  "degraafSquareBrandPill",
  "degraafSquareHeroL1",
  "degraafSquareHeroL2",
  "degraafSquareProductL1",
  "degraafSquareProductL2",
  "degraafSquareProductSub",
  "degraafSquareSpec1",
  "degraafSquareSpec2",
  "degraafSquareWa",
  "degraafVerticalHqName",
  "degraafVerticalSpec1",
  "degraafVerticalSpec2",
  "degraafVerticalHeadlineL1",
  "degraafVerticalHeadlineL2",
  "degraafVerticalSubtext",
  "degraafVerticalProductBrand",
  "degraafVerticalProductSub",
  "degraafVerticalWa",
] as const;

type AdventureCopyKey = (typeof ADVENTURE_KEYS)[number];
type OncaCopyKey = (typeof ONCA_KEYS)[number];
type RockCopyKey = (typeof ROCK_KEYS)[number];
type PhotonCopyKey = (typeof PHOTON_KEYS)[number];
type DegraafCopyKey = (typeof DEGRAAF_KEYS)[number];

/** Stable id for prompts. */
export const OVERLAY_JSON_TEMPLATE_ID = "efs-adventure-overlay";
/** v9: Photon Lux unique beacon/beam layouts; AO blue+yellow (not Rock clone). */
export const OVERLAY_JSON_VERSION = 10;

const DEFAULTS_ADVENTURE: Record<AdventureCopyKey, string> = {
  brandLogo: "EFS 4x4",
  seriesBadge: "Adventure Series",
  headlinePrimary: "Defiant.",
  headlineMuted: "Protection.",
  techLabel:
    "63mm side tubing. Winch ready. Robotically welded precision for the ultimate overland assault.",
  buttonText: "079 507 0901",
};

const DEFAULTS_ONCA: Record<OncaCopyKey, string> = {
  oncaSquareBrandPill: "Absolute Offroad",
  oncaSquareHeroL1: "Structural.",
  oncaSquareHeroL2: "Defense.",
  oncaSquareProductMain: "Onca Extreme LDX-GEN2",
  oncaSquareProductSub: "(70 Series)",
  oncaSquareSpec1: "Airbag Crumple Zone",
  oncaSquareSpec2: "Winch Compatible",
  oncaSquareWa: "079 507 0901",
  oncaVerticalHqName: "Absolute Offroad",
  oncaVerticalSpec1: "Airbag Crumple Zone",
  oncaVerticalSpec2: "Winch Compatible",
  oncaVerticalHeadlineL1: "Impact.",
  oncaVerticalHeadlineL2: "Absorbed.",
  oncaVerticalSubtextBefore:
    "The definitive frontal defense system. Engineered with dedicated crumple zones and recessed LED mounts for absolute survival in the Veld.",
  oncaVerticalSubtextStrong: "",
  oncaVerticalSubtextAfter: "",
  oncaVerticalProductL1: "Onca",
  oncaVerticalProductL2: "Extreme LDX-GEN2",
  oncaVerticalProductSub: "(70 Series)",
  oncaVerticalWa: "079 507 0901",
};

const DEFAULTS_ROCK: Record<RockCopyKey, string> = {
  rockSquareBrandPill: "Absolute Offroad",
  rockSquareHeroL1: "Chassis.",
  rockSquareHeroL2: "Armored.",
  rockSquareProductL1: "Onca",
  rockSquareProductL2: "Extreme Rock Sliders",
  rockSquareProductSub: "(70 Series D/Cab)",
  rockSquareSpec1: "D50x2 Tube Construct",
  rockSquareSpec2: "3-Point Chassis Mount",
  rockSquareCommsLbl: "Call or WhatsApp",
  rockSquareWa: "079 507 0901",
  rockVerticalHqName: "Absolute Offroad",
  rockVerticalHeadlineL1: "Chassis.",
  rockVerticalHeadlineL2: "Armored.",
  rockVerticalSubtext:
    "Heavy-duty lower body defense engineered for absolute protection. Laser-cut and CNC bent for a flawless fit on your rig.",
  rockVerticalProductL1: "Onca",
  rockVerticalProductL2: "Extreme Rock Sliders",
  rockVerticalProductSub: "(70 Series D/Cab)",
  rockVerticalWa: "079 507 0901",
};

const DEFAULTS_PHOTON: Record<PhotonCopyKey, string> = {
  photonSquareBrandPill: "Absolute Offroad",
  photonSquareHeroL1: "Illuminate.",
  photonSquareHeroL2: "Path.",
  photonSquareProductL1: "Rigid LED Light Bar",
  photonSquareProductL2: "",
  photonSquareProductSub: "(Auxiliary)",
  photonSquareSpec1: "IP68 Rated",
  photonSquareSpec2: "Combo Beam",
  photonSquareCommsLbl: "Call or WhatsApp",
  photonSquareWa: "079 507 0901",
  photonVerticalHqName: "Absolute Offroad",
  photonVerticalHeadlineL1: "Night.",
  photonVerticalHeadlineL2: "Dominance.",
  photonVerticalSubtext:
    "Premium auxiliary lighting and harnesses. We supply and fit LED bars, spots, and intelligent switching for overland rigs.",
  photonVerticalProductL1: "Rigid Industries SR-Series Pro",
  photonVerticalProductL2: "",
  photonVerticalProductSub: "(Combo / Flood)",
  photonVerticalWa: "079 507 0901",
};

const DEFAULTS_DEGRAAF: Record<DegraafCopyKey, string> = {
  degraafSquareBrandPill: "Absolute Offroad",
  degraafSquareHeroL1: "Let It.",
  degraafSquareHeroL2: "Breathe.",
  degraafSquareProductL1: "DeGraaf Performance",
  degraafSquareProductL2: "Exhaust System",
  degraafSquareProductSub: "(79 Series V8)",
  degraafSquareSpec1: "76mm Stainless Steel",
  degraafSquareSpec2: "Reduced EGTs",
  degraafSquareWa: "079 507 0901",
  degraafVerticalHqName: "Absolute Offroad",
  degraafVerticalSpec1: "76mm Stainless",
  degraafVerticalSpec2: "Lower EGTs",
  degraafVerticalHeadlineL1: "V8.",
  degraafVerticalHeadlineL2: "Unleashed.",
  degraafVerticalSubtext:
    "Zero restriction. Immediate throttle response. We supply and fit optimal performance systems for the Land Cruiser V8.",
  degraafVerticalProductBrand: "DeGraaf Exhaust",
  degraafVerticalProductSub: "(79 Series 4.5L)",
  degraafVerticalWa: "079 507 0901",
};

type CopyByPreset = {
  "adventure-pro": Record<AdventureCopyKey, string>;
  "onca-armor": Record<OncaCopyKey, string>;
  "rock-sliders": Record<RockCopyKey, string>;
  "photon-lux": Record<PhotonCopyKey, string>;
  "degraaf-performance": Record<DegraafCopyKey, string>;
};

const initialCopyByPreset: CopyByPreset = {
  "adventure-pro": { ...DEFAULTS_ADVENTURE },
  "onca-armor": { ...DEFAULTS_ONCA },
  "rock-sliders": { ...DEFAULTS_ROCK },
  "photon-lux": { ...DEFAULTS_PHOTON },
  "degraaf-performance": { ...DEFAULTS_DEGRAAF },
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

function extractCopyBlock(parsed: unknown): Record<string, unknown> | null {
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

function isAoPresetId(v: unknown): v is AoOverlayPresetId {
  return (
    v === "adventure-pro" ||
    v === "onca-armor" ||
    v === "rock-sliders" ||
    v === "photon-lux" ||
    v === "degraaf-performance"
  );
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): AoOverlayPresetId | null {
  for (const k of DEGRAAF_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) {
      return "degraaf-performance";
    }
  }
  for (const k of PHOTON_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) return "photon-lux";
  }
  for (const k of ROCK_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) return "rock-sliders";
  }
  for (const k of ONCA_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) return "onca-armor";
  }
  for (const k of ADVENTURE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(block, k)) return "adventure-pro";
  }
  return null;
}

function keysForPreset(p: AoOverlayPresetId): readonly string[] {
  if (p === "degraaf-performance") return DEGRAAF_KEYS;
  if (p === "photon-lux") return PHOTON_KEYS;
  if (p === "rock-sliders") return ROCK_KEYS;
  if (p === "onca-armor") return ONCA_KEYS;
  return ADVENTURE_KEYS;
}

function exportSlugForPreset(p: AoOverlayPresetId): string {
  if (p === "degraaf-performance") return "degraaf-performance";
  if (p === "photon-lux") return "photon-lux";
  if (p === "rock-sliders") return "rock-sliders";
  if (p === "onca-armor") return "onca-armor";
  return "adventure-pro";
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

export function EfsAdventureOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<AoOverlayPresetId>("adventure-pro");
  const [copyByPreset, setCopyByPreset] = useState<CopyByPreset>(
    initialCopyByPreset,
  );

  const adv = copyByPreset["adventure-pro"];
  const onca = copyByPreset["onca-armor"];
  const rock = copyByPreset["rock-sliders"];
  const photon = copyByPreset["photon-lux"];
  const degraaf = copyByPreset["degraaf-performance"];

  const patchAdventure = (key: AdventureCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "adventure-pro": { ...prev["adventure-pro"], [key]: value },
    }));
  };

  const patchOnca = (key: OncaCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "onca-armor": { ...prev["onca-armor"], [key]: value },
    }));
  };

  const patchRock = (key: RockCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "rock-sliders": { ...prev["rock-sliders"], [key]: value },
    }));
  };

  const patchPhoton = (key: PhotonCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "photon-lux": { ...prev["photon-lux"], [key]: value },
    }));
  };

  const patchDegraaf = (key: DegraafCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "degraaf-performance": { ...prev["degraaf-performance"], [key]: value },
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
          template: OVERLAY_JSON_TEMPLATE_ID,
          version: OVERLAY_JSON_VERSION,
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

    let targetPreset: AoOverlayPresetId = preset;
    if (isAoPresetId(root?.preset)) {
      targetPreset = root.preset;
    } else {
      targetPreset = inferPresetFromBlock(block) ?? "adventure-pro";
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
      if (preset === "onca-armor") {
        return { ...prev, "onca-armor": { ...DEFAULTS_ONCA } };
      }
      if (preset === "rock-sliders") {
        return { ...prev, "rock-sliders": { ...DEFAULTS_ROCK } };
      }
      if (preset === "degraaf-performance") {
        return { ...prev, "degraaf-performance": { ...DEFAULTS_DEGRAAF } };
      }
      if (preset === "photon-lux") {
        return { ...prev, "photon-lux": { ...DEFAULTS_PHOTON } };
      }
      return { ...prev, "adventure-pro": { ...DEFAULTS_ADVENTURE } };
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
      a.download = `ao-${exportSlug}-square-1080-${Date.now()}.png`;
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
      a.download = `ao-${exportSlug}-vertical-9x16-${Date.now()}.png`;
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

  const squareCanvasAdventure = (
    <div
      ref={squareRef}
      className={`${adventureSquare.root} ${adventureSquare.canvas1080}`}
      aria-label="EFS Adventure square export"
    >
      <div className={adventureSquare.adContainer}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={adventureSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={adventureSquare.topScrim} />
        <div className={adventureSquare.statusBar}>
          <div className={adventureSquare.brandLogo}>{adv.brandLogo}</div>
          <div className={adventureSquare.seriesBadge}>{adv.seriesBadge}</div>
        </div>
        <div className={adventureSquare.heroWindow} />
        <div className={adventureSquare.commandDock}>
          <h1
            className={`${adventureSquare.headline} ${adventureSquare.headlineSquareOneLine}`}
          >
            {adv.headlinePrimary ? (
              <span>{adv.headlinePrimary}</span>
            ) : null}
            {adv.headlinePrimary && adv.headlineMuted ? (
              <>
                {" "}
                <span className={adventureSquare.headlineMuted}>
                  {adv.headlineMuted}
                </span>
              </>
            ) : adv.headlineMuted ? (
              <span className={adventureSquare.headlineMuted}>
                {adv.headlineMuted}
              </span>
            ) : null}
          </h1>
          <div className={adventureSquare.metaRow}>
            <p className={adventureSquare.techLabel}>{adv.techLabel}</p>
            <button
              type="button"
              className={`${adventureSquare.actionButton} ${adventureSquare.actionButtonSolo}`}
            >
              {adv.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasAdventure = (
    <div
      ref={verticalRef}
      className={`${adventureVertical.root} ${adventureVertical.canvas1080x1920}`}
      aria-label="EFS Adventure vertical export"
    >
      <div className={adventureVertical.adContainer}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={adventureVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={adventureVertical.topScrim} />
        <div className={adventureVertical.bottomScrim} />
        <div className={adventureVertical.statusBar}>
          <div className={adventureVertical.brandLogo}>{adv.brandLogo}</div>
          <div className={adventureVertical.seriesBadge}>{adv.seriesBadge}</div>
        </div>
        <div className={adventureVertical.heroMid}>
          <div className={adventureVertical.storyMidCenter}>
            <div className={adventureVertical.storyMidSlot}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={adventureVertical.storyMidImg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : (
                <div
                  className={adventureVertical.storyMidPlaceholder}
                  aria-hidden
                >
                  Square image
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={adventureVertical.commandDock}>
          <h1 className={adventureVertical.headline}>
            {adv.headlinePrimary}
            {adv.headlinePrimary && adv.headlineMuted ? <br /> : null}
            {adv.headlineMuted ? (
              <span className={adventureVertical.headlineMuted}>
                {adv.headlineMuted}
              </span>
            ) : null}
          </h1>
          <div className={adventureVertical.metaColumn}>
            <p className={adventureVertical.techLabel}>{adv.techLabel}</p>
            <button
              type="button"
              className={`${adventureVertical.actionButton} ${adventureVertical.actionButtonSolo}`}
            >
              {adv.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasOnca = (
    <div
      ref={squareRef}
      className={`${oncaSquare.root} ${oncaSquare.canvas1080}`}
      aria-label="Absolute Offroad Onca Armor square export"
    >
      <div className={oncaSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={oncaSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={oncaSquare.scrimTop} />
        <div className={oncaSquare.scrimBottom} />
        <div className={oncaSquare.topPerimeter}>
          <div className={oncaSquare.brandPill}>{onca.oncaSquareBrandPill}</div>
          <h1 className={oncaSquare.heroType}>
            {onca.oncaSquareHeroL1}
            <br />
            <span className={oncaSquare.heroOutline}>
              {onca.oncaSquareHeroL2}
            </span>
          </h1>
        </div>
        <div className={oncaSquare.armorStrip}>
          <div className={oncaSquare.stripSpecs}>
            <div className={oncaSquare.productId}>
              {onca.oncaSquareProductMain}
              <br />
              <span className={oncaSquare.productIdSub}>
                {onca.oncaSquareProductSub}
              </span>
            </div>
            <div className={oncaSquare.specRow}>
              <span className={oncaSquare.specMini}>{onca.oncaSquareSpec1}</span>
              <span className={oncaSquare.specMini}>{onca.oncaSquareSpec2}</span>
            </div>
          </div>
          <div className={oncaSquare.divider} />
          <div className={oncaSquare.stripCompany}>
            <button type="button" className={oncaSquare.btnWa}>
              <PhoneHandsetSvg size={18} />
              {onca.oncaSquareWa}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasOnca = (
    <div
      ref={verticalRef}
      className={`${oncaVertical.root} ${oncaVertical.canvas1080x1920}`}
      aria-label="Absolute Offroad Onca Armor vertical export"
    >
      <div className={oncaVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={oncaVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={oncaVertical.cadGrid} />
        <div className={oncaVertical.scrim} />
        <div className={oncaVertical.columnShell}>
          <div className={oncaVertical.topCommand}>
            <div className={oncaVertical.hqLockup}>
              <span className={oncaVertical.hqName}>
                {onca.oncaVerticalHqName}
              </span>
            </div>
          </div>
          <div className={oncaVertical.midColumn}>
            <div className={oncaVertical.midImageSlot}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={oncaVertical.midImageImg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : (
                <div
                  className={oncaVertical.midImagePlaceholder}
                  aria-hidden
                >
                  Square image
                </div>
              )}
            </div>
          </div>
          <div className={oncaVertical.armorTerminal}>
            <div className={oncaVertical.specGrid}>
              <div className={oncaVertical.specTag}>
                {onca.oncaVerticalSpec1}
              </div>
              <div className={oncaVertical.specTag}>
                {onca.oncaVerticalSpec2}
              </div>
            </div>
            <h1 className={oncaVertical.headline}>
              {onca.oncaVerticalHeadlineL1}
              <br />
              <span className={oncaVertical.headlineOutline}>
                {onca.oncaVerticalHeadlineL2}
              </span>
            </h1>
            <p className={oncaVertical.subtext}>
              {onca.oncaVerticalSubtextBefore}
              {onca.oncaVerticalSubtextStrong.trim() ? (
                <strong>{onca.oncaVerticalSubtextStrong}</strong>
              ) : null}
              {onca.oncaVerticalSubtextAfter}
            </p>
            <div className={oncaVertical.actionDock}>
              <div className={oncaVertical.productId}>
                <span className={oncaVertical.productTitle}>
                  {onca.oncaVerticalProductL1}
                  <br />
                  {onca.oncaVerticalProductL2}
                </span>
                <span className={oncaVertical.productSub}>
                  {onca.oncaVerticalProductSub}
                </span>
              </div>
              <button type="button" className={oncaVertical.btnWa}>
                <PhoneHandsetSvg size={16} />
                {onca.oncaVerticalWa}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasRock = (
    <div
      ref={squareRef}
      className={`${rockSquare.root} ${rockSquare.canvas1080}`}
      aria-label="Absolute Offroad Rock Sliders square export"
    >
      <div className={rockSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={rockSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={rockSquare.scrimTop} />
        <div className={rockSquare.scrimBottom} />
        <div className={rockSquare.topPerimeter}>
          <div className={rockSquare.brandPill}>
            {rock.rockSquareBrandPill}
          </div>
          <h1 className={rockSquare.heroType}>
            {rock.rockSquareHeroL1}
            <br />
            <span className={rockSquare.heroOutline}>
              {rock.rockSquareHeroL2}
            </span>
          </h1>
        </div>
        <div className={rockSquare.armorStrip}>
          <div className={rockSquare.stripSpecs}>
            <div className={rockSquare.productId}>
              {rock.rockSquareProductL1}
              <br />
              {rock.rockSquareProductL2}
              <span className={rockSquare.productIdSub}>
                {rock.rockSquareProductSub}
              </span>
            </div>
            <div className={rockSquare.specRow}>
              <span className={rockSquare.specMini}>
                {rock.rockSquareSpec1}
              </span>
              <span className={rockSquare.specMini}>
                {rock.rockSquareSpec2}
              </span>
            </div>
          </div>
          <div className={rockSquare.divider} />
          <div className={rockSquare.stripCompany}>
            <span className={rockSquare.commsLbl}>
              {rock.rockSquareCommsLbl}
            </span>
            <button type="button" className={rockSquare.btnWa}>
              <PhoneHandsetSvg size={18} />
              {rock.rockSquareWa}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasRock = (
    <div
      ref={verticalRef}
      className={`${rockVertical.root} ${rockVertical.canvas1080x1920}`}
      aria-label="Absolute Offroad Rock Sliders vertical export"
    >
      <div className={rockVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={rockVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={rockVertical.cadGrid} />
        <div className={rockVertical.scrim} />
        <div className={rockVertical.columnShell}>
          <div className={rockVertical.topCommand}>
            <div className={rockVertical.hqLockup}>
              <span className={rockVertical.hqName}>
                {rock.rockVerticalHqName}
              </span>
            </div>
          </div>
          <div className={rockVertical.midColumn}>
            <div className={rockVertical.midImageSlot}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={rockVertical.midImageImg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : (
                <div
                  className={rockVertical.midImagePlaceholder}
                  aria-hidden
                >
                  Square image
                </div>
              )}
            </div>
          </div>
          <div className={rockVertical.armorTerminal}>
            <h1 className={rockVertical.headline}>
              {rock.rockVerticalHeadlineL1}
              <br />
              <span className={rockVertical.headlineOutline}>
                {rock.rockVerticalHeadlineL2}
              </span>
            </h1>
            <p className={rockVertical.subtext}>{rock.rockVerticalSubtext}</p>
            <div className={rockVertical.actionDock}>
              <div className={rockVertical.productId}>
                <span className={rockVertical.productTitle}>
                  {rock.rockVerticalProductL1}
                  <br />
                  {rock.rockVerticalProductL2}
                </span>
                <span className={rockVertical.productSub}>
                  {rock.rockVerticalProductSub}
                </span>
              </div>
              <button type="button" className={rockVertical.btnWa}>
                <PhoneHandsetSvg size={16} />
                {rock.rockVerticalWa}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasPhoton = (
    <div
      ref={squareRef}
      className={`${photonSquare.root} ${photonSquare.canvas1080}`}
      aria-label="Absolute Offroad Photon Lux square export"
    >
      <div className={photonSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={photonSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={photonSquare.scrimTop} />
        <div className={photonSquare.scrimBottom} />
        <div className={photonSquare.topPerimeter}>
          <div className={photonSquare.luxTicks} aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className={photonSquare.brandPill}>
            {photon.photonSquareBrandPill}
          </div>
          <h1 className={photonSquare.heroType}>
            {photon.photonSquareHeroL1}
            <br />
            <span className={photonSquare.heroOutline}>
              {photon.photonSquareHeroL2}
            </span>
          </h1>
        </div>
        <div className={photonSquare.armorStrip}>
          <div className={photonSquare.stripSpecs}>
            <div className={photonSquare.productId}>
              <span className={photonSquare.productLine}>
                {[photon.photonSquareProductL1, photon.photonSquareProductL2]
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .join(" ")}
              </span>
              <span className={photonSquare.productIdSub}>
                {photon.photonSquareProductSub}
              </span>
            </div>
            <div className={photonSquare.specRow}>
              <span className={photonSquare.specMini}>
                {photon.photonSquareSpec1}
              </span>
              <span className={photonSquare.specMini}>
                {photon.photonSquareSpec2}
              </span>
            </div>
          </div>
          <div className={photonSquare.divider} />
          <div className={photonSquare.stripCompany}>
            <span className={photonSquare.commsLbl}>
              {photon.photonSquareCommsLbl}
            </span>
            <button type="button" className={photonSquare.btnWa}>
              <PhoneHandsetSvg size={18} />
              {photon.photonSquareWa}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasPhoton = (
    <div
      ref={verticalRef}
      className={`${photonVertical.root} ${photonVertical.canvas1080x1920}`}
      aria-label="Absolute Offroad Photon Lux vertical export"
    >
      <div className={photonVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={photonVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={photonVertical.beamField} />
        <div className={photonVertical.scrim} />
        <div className={photonVertical.columnShell}>
          <div className={photonVertical.topCommand}>
            <div className={photonVertical.hqLockup}>
              <span className={photonVertical.hqName}>
                {photon.photonVerticalHqName}
              </span>
            </div>
            <div className={photonVertical.outputLadder} aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={photonVertical.midColumn}>
            <div className={photonVertical.midImageSlot}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={photonVertical.midImageImg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : (
                <div
                  className={photonVertical.midImagePlaceholder}
                  aria-hidden
                >
                  Square image
                </div>
              )}
            </div>
          </div>
          <div className={photonVertical.armorTerminal}>
            <div className={photonVertical.stageRail}>
              <h1 className={photonVertical.headline}>
                {photon.photonVerticalHeadlineL1}
                <br />
                <span className={photonVertical.headlineOutline}>
                  {photon.photonVerticalHeadlineL2}
                </span>
              </h1>
              <p className={photonVertical.subtext}>
                {photon.photonVerticalSubtext}
              </p>
            </div>
            <div className={photonVertical.actionDock}>
              <div className={photonVertical.productId}>
                <span className={photonVertical.productTitle}>
                  {[photon.photonVerticalProductL1, photon.photonVerticalProductL2]
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(" ")}
                </span>
                <span className={photonVertical.productSub}>
                  {photon.photonVerticalProductSub}
                </span>
              </div>
              <button type="button" className={photonVertical.btnWa}>
                <PhoneHandsetSvg size={16} />
                {photon.photonVerticalWa}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvasDegraaf = (
    <div
      ref={squareRef}
      className={`${degraafSquare.root} ${degraafSquare.canvas1080}`}
      aria-label="Absolute Offroad DeGraaf Performance square export"
    >
      <div className={degraafSquare.adCanvas}>
        {bgSquareDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={degraafSquare.heroBg}
            src={bgSquareDataUrl}
            alt=""
          />
        ) : null}
        <div className={degraafSquare.scrimTop} />
        <div className={degraafSquare.scrimBottom} />
        <div className={degraafSquare.topPerimeter}>
          <div className={degraafSquare.brandPill}>
            {degraaf.degraafSquareBrandPill}
          </div>
          <h1 className={degraafSquare.heroType}>
            {degraaf.degraafSquareHeroL1}
            <br />
            <span className={degraafSquare.heroOutline}>
              {degraaf.degraafSquareHeroL2}
            </span>
          </h1>
        </div>
        <div className={degraafSquare.performanceStrip}>
          <div className={degraafSquare.stripSpecs}>
            <div className={degraafSquare.productId}>
              {degraaf.degraafSquareProductL1}
              <br />
              {degraaf.degraafSquareProductL2}
              <span className={degraafSquare.productIdSub}>
                {degraaf.degraafSquareProductSub}
              </span>
            </div>
            <div className={degraafSquare.specRow}>
              <span className={degraafSquare.specMini}>
                {degraaf.degraafSquareSpec1}
              </span>
              <span className={degraafSquare.specMini}>
                {degraaf.degraafSquareSpec2}
              </span>
            </div>
          </div>
          <div className={degraafSquare.divider} />
          <div className={degraafSquare.stripCompany}>
            <button type="button" className={degraafSquare.btnWa}>
              <PhoneHandsetSvg size={18} />
              {degraaf.degraafSquareWa}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const verticalCanvasDegraaf = (
    <div
      ref={verticalRef}
      className={`${degraafVertical.root} ${degraafVertical.canvas1080x1920}`}
      aria-label="Absolute Offroad DeGraaf Performance vertical export"
    >
      <div className={degraafVertical.adCanvas}>
        {bgVerticalDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={degraafVertical.heroBg}
            src={bgVerticalDataUrl}
            alt=""
          />
        ) : null}
        <div className={degraafVertical.performanceGlow} />
        <div className={degraafVertical.scrim} />
        <div className={degraafVertical.columnShell}>
          <div className={degraafVertical.topHud}>
            <div className={degraafVertical.brandLockup}>
              <span className={degraafVertical.btName}>
                {degraaf.degraafVerticalHqName}
              </span>
            </div>
          </div>
          <div className={degraafVertical.midColumn}>
            <div className={degraafVertical.midImageSlot}>
              {bgSquareDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={degraafVertical.midImageImg}
                  src={bgSquareDataUrl}
                  alt=""
                />
              ) : (
                <div
                  className={degraafVertical.midImagePlaceholder}
                  aria-hidden
                >
                  Square image
                </div>
              )}
            </div>
          </div>
          <div className={degraafVertical.performanceTerminal}>
            <div className={degraafVertical.specGrid}>
              <div className={degraafVertical.specTag}>
                {degraaf.degraafVerticalSpec1}
              </div>
              <div className={degraafVertical.specTag}>
                {degraaf.degraafVerticalSpec2}
              </div>
            </div>
            <h1 className={degraafVertical.headline}>
              {degraaf.degraafVerticalHeadlineL1}
              <br />
              <span className={degraafVertical.headlineOutline}>
                {degraaf.degraafVerticalHeadlineL2}
              </span>
            </h1>
            <p className={degraafVertical.subtext}>
              {degraaf.degraafVerticalSubtext}
            </p>
            <div className={degraafVertical.actionDock}>
              <div className={degraafVertical.productId}>
                <span className={degraafVertical.productBrand}>
                  {degraaf.degraafVerticalProductBrand}
                </span>
                <span className={degraafVertical.productSub}>
                  {degraaf.degraafVerticalProductSub}
                </span>
              </div>
              <button type="button" className={degraafVertical.btnWa}>
                <PhoneHandsetSvg size={16} />
                {degraaf.degraafVerticalWa}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const squareCanvas =
    preset === "adventure-pro"
      ? squareCanvasAdventure
      : preset === "onca-armor"
        ? squareCanvasOnca
        : preset === "rock-sliders"
          ? squareCanvasRock
          : preset === "photon-lux"
            ? squareCanvasPhoton
            : squareCanvasDegraaf;
  const verticalCanvas =
    preset === "adventure-pro"
      ? verticalCanvasAdventure
      : preset === "onca-armor"
        ? verticalCanvasOnca
        : preset === "rock-sliders"
          ? verticalCanvasRock
          : preset === "photon-lux"
            ? verticalCanvasPhoton
            : verticalCanvasDegraaf;

  const previewLabel =
    preset === "adventure-pro"
      ? "Adventure Pro"
      : preset === "onca-armor"
        ? "Onca Armor"
        : preset === "rock-sliders"
          ? "Rock Sliders"
          : preset === "photon-lux"
            ? "Photon Lux"
            : "DeGraaf Performance";

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
              setPreset(e.target.value as AoOverlayPresetId)
            }
            className="mt-1 w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            aria-label="Absolute Offroad overlay preset"
          >
            {AO_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            {preset === "degraaf-performance"
              ? "Performance cyan UI: carbon glass strip with blue accent + yellow phone; vertical adds bottom glow (screen blend), blue spec tags, and product dock."
              : preset === "photon-lux"
                ? "Lighting-only layout: square uses centered beacon (meter ticks + pill + hero + stacked dock), not the Rock strip. Vertical uses beam-field scrim, HQ + output ladder, mid square frame, and asymmetric stage card with full-width CTA — AO navy + yellow."
                : preset === "rock-sliders"
                  ? "Chassis Armored: square strip with “Call or WhatsApp” label + phone button; vertical uses CAD grid scrim and uppercase CTA (no spec tag row)."
                  : preset === "onca-armor"
                    ? "Tactical yellow/blue glass: brand pill + hero type, armor strip with specs and WhatsApp-style call button; vertical adds CAD grid and a mid-frame slot for the square 1:1 image."
                    : "EFS Adventure: square headline on one line; vertical story matches command-dock width with height ~10% less than a square; optional vertical full-bleed; CTA defaults to phone."}
          </p>
        </div>

        <div className="space-y-4 rounded-md border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Hero images (separate per format)
          </p>
          <div className="space-y-2">
            <label className="text-xs text-[#8E8E93]">
              Square 1:1
              <span className="mt-1 block font-normal normal-case tracking-normal text-[#8E8E93]/85">
                Also fills the framed mid-frame on the vertical layout (between
                header and bottom card), same as Alberton Tyre Clinic style
                templates.
              </span>
            </label>
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
            <code className="text-white/80">{OVERLAY_JSON_TEMPLATE_ID}</code> v
            {OVERLAY_JSON_VERSION} · set{" "}
            <code className="text-white/80">preset</code> to{" "}
            <code className="text-white/80">adventure-pro</code>,{" "}
            <code className="text-white/80">onca-armor</code>,{" "}
            <code className="text-white/80">rock-sliders</code>,{" "}
            <code className="text-white/80">photon-lux</code>, or{" "}
            <code className="text-white/80">degraaf-performance</code>. Without{" "}
            <code className="text-white/80">preset</code>, keys infer DeGraaf →
            Photon → Rock → Onca → Adventure.
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
              rows={
                preset === "degraaf-performance"
                  ? 30
                  : preset === "rock-sliders" || preset === "photon-lux"
                    ? 28
                    : preset === "onca-armor"
                      ? 28
                      : 16
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
              onChange={(e) => {
                setJsonPaste(e.target.value);
                setJsonError(null);
              }}
              rows={10}
              placeholder={`{\n  "template": "${OVERLAY_JSON_TEMPLATE_ID}",\n  "preset": "onca-armor",\n  "copy": { … }\n}`}
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
          Fields below match the selected preset. Export 1080×1080 and 1080×1920
          separately.
        </p>

        {preset === "adventure-pro" ? (
          <>
            <Field
              label="Brand (top left)"
              value={adv.brandLogo}
              onChange={(v) => patchAdventure("brandLogo", v)}
            />
            <Field
              label="Series badge"
              value={adv.seriesBadge}
              onChange={(v) => patchAdventure("seriesBadge", v)}
            />
            <Field
              label="Headline — primary line"
              value={adv.headlinePrimary}
              onChange={(v) => patchAdventure("headlinePrimary", v)}
            />
            <Field
              label="Headline — muted (square: same line as primary; story: line below)"
              value={adv.headlineMuted}
              onChange={(v) => patchAdventure("headlineMuted", v)}
            />
            <Field
              label="Supporting copy"
              value={adv.techLabel}
              onChange={(v) => patchAdventure("techLabel", v)}
              rows={4}
            />
            <Field
              label="CTA (phone / WhatsApp number)"
              value={adv.buttonText}
              onChange={(v) => patchAdventure("buttonText", v)}
            />
          </>
        ) : preset === "onca-armor" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Onca Armor
            </p>
            <Field
              label="Brand pill (yellow border)"
              value={onca.oncaSquareBrandPill}
              onChange={(v) => patchOnca("oncaSquareBrandPill", v)}
            />
            <Field
              label="Hero type — line 1 (solid)"
              value={onca.oncaSquareHeroL1}
              onChange={(v) => patchOnca("oncaSquareHeroL1", v)}
            />
            <Field
              label="Hero type — line 2 (outline)"
              value={onca.oncaSquareHeroL2}
              onChange={(v) => patchOnca("oncaSquareHeroL2", v)}
            />
            <Field
              label="Product ID — main line"
              value={onca.oncaSquareProductMain}
              onChange={(v) => patchOnca("oncaSquareProductMain", v)}
            />
            <Field
              label="Product ID — sub (mono)"
              value={onca.oncaSquareProductSub}
              onChange={(v) => patchOnca("oncaSquareProductSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={onca.oncaSquareSpec1}
              onChange={(v) => patchOnca("oncaSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={onca.oncaSquareSpec2}
              onChange={(v) => patchOnca("oncaSquareSpec2", v)}
            />
            <Field
              label="Strip button — phone / WA number"
              value={onca.oncaSquareWa}
              onChange={(v) => patchOnca("oncaSquareWa", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Onca Armor
            </p>
            <Field
              label="HQ lockup name"
              value={onca.oncaVerticalHqName}
              onChange={(v) => patchOnca("oncaVerticalHqName", v)}
            />
            <Field
              label="Terminal spec tag 1"
              value={onca.oncaVerticalSpec1}
              onChange={(v) => patchOnca("oncaVerticalSpec1", v)}
            />
            <Field
              label="Terminal spec tag 2"
              value={onca.oncaVerticalSpec2}
              onChange={(v) => patchOnca("oncaVerticalSpec2", v)}
            />
            <Field
              label="Headline — line 1"
              value={onca.oncaVerticalHeadlineL1}
              onChange={(v) => patchOnca("oncaVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={onca.oncaVerticalHeadlineL2}
              onChange={(v) => patchOnca("oncaVerticalHeadlineL2", v)}
            />
            <Field
              label="Subtext — before yellow strong"
              value={onca.oncaVerticalSubtextBefore}
              onChange={(v) => patchOnca("oncaVerticalSubtextBefore", v)}
              rows={2}
            />
            <Field
              label="Subtext — strong (yellow)"
              value={onca.oncaVerticalSubtextStrong}
              onChange={(v) => patchOnca("oncaVerticalSubtextStrong", v)}
            />
            <Field
              label="Subtext — after strong"
              value={onca.oncaVerticalSubtextAfter}
              onChange={(v) => patchOnca("oncaVerticalSubtextAfter", v)}
              rows={2}
            />
            <Field
              label="Product title — line 1"
              value={onca.oncaVerticalProductL1}
              onChange={(v) => patchOnca("oncaVerticalProductL1", v)}
            />
            <Field
              label="Product title — line 2"
              value={onca.oncaVerticalProductL2}
              onChange={(v) => patchOnca("oncaVerticalProductL2", v)}
            />
            <Field
              label="Product sub (mono)"
              value={onca.oncaVerticalProductSub}
              onChange={(v) => patchOnca("oncaVerticalProductSub", v)}
            />
            <Field
              label="Dock button — phone / WA number"
              value={onca.oncaVerticalWa}
              onChange={(v) => patchOnca("oncaVerticalWa", v)}
            />
          </>
        ) : preset === "rock-sliders" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Rock Sliders
            </p>
            <Field
              label="Brand pill"
              value={rock.rockSquareBrandPill}
              onChange={(v) => patchRock("rockSquareBrandPill", v)}
            />
            <Field
              label="Hero — line 1 (solid)"
              value={rock.rockSquareHeroL1}
              onChange={(v) => patchRock("rockSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (outline)"
              value={rock.rockSquareHeroL2}
              onChange={(v) => patchRock("rockSquareHeroL2", v)}
            />
            <Field
              label="Product — line 1"
              value={rock.rockSquareProductL1}
              onChange={(v) => patchRock("rockSquareProductL1", v)}
            />
            <Field
              label="Product — line 2"
              value={rock.rockSquareProductL2}
              onChange={(v) => patchRock("rockSquareProductL2", v)}
            />
            <Field
              label="Product sub (mono)"
              value={rock.rockSquareProductSub}
              onChange={(v) => patchRock("rockSquareProductSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={rock.rockSquareSpec1}
              onChange={(v) => patchRock("rockSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={rock.rockSquareSpec2}
              onChange={(v) => patchRock("rockSquareSpec2", v)}
            />
            <Field
              label="Comms label (above button)"
              value={rock.rockSquareCommsLbl}
              onChange={(v) => patchRock("rockSquareCommsLbl", v)}
            />
            <Field
              label="Phone / WhatsApp number"
              value={rock.rockSquareWa}
              onChange={(v) => patchRock("rockSquareWa", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Rock Sliders
            </p>
            <Field
              label="HQ lockup name"
              value={rock.rockVerticalHqName}
              onChange={(v) => patchRock("rockVerticalHqName", v)}
            />
            <Field
              label="Headline — line 1"
              value={rock.rockVerticalHeadlineL1}
              onChange={(v) => patchRock("rockVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={rock.rockVerticalHeadlineL2}
              onChange={(v) => patchRock("rockVerticalHeadlineL2", v)}
            />
            <Field
              label="Subtext (body)"
              value={rock.rockVerticalSubtext}
              onChange={(v) => patchRock("rockVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Product title — line 1"
              value={rock.rockVerticalProductL1}
              onChange={(v) => patchRock("rockVerticalProductL1", v)}
            />
            <Field
              label="Product title — line 2"
              value={rock.rockVerticalProductL2}
              onChange={(v) => patchRock("rockVerticalProductL2", v)}
            />
            <Field
              label="Product sub (mono)"
              value={rock.rockVerticalProductSub}
              onChange={(v) => patchRock("rockVerticalProductSub", v)}
            />
            <Field
              label="Dock button — phone number"
              value={rock.rockVerticalWa}
              onChange={(v) => patchRock("rockVerticalWa", v)}
            />
          </>
        ) : preset === "photon-lux" ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · Photon Lux
            </p>
            <Field
              label="Brand pill"
              value={photon.photonSquareBrandPill}
              onChange={(v) => patchPhoton("photonSquareBrandPill", v)}
            />
            <Field
              label="Hero — line 1 (solid)"
              value={photon.photonSquareHeroL1}
              onChange={(v) => patchPhoton("photonSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (outline)"
              value={photon.photonSquareHeroL2}
              onChange={(v) => patchPhoton("photonSquareHeroL2", v)}
            />
            <Field
              label="Product title (one line in strip)"
              value={[photon.photonSquareProductL1, photon.photonSquareProductL2]
                .map((s) => s.trim())
                .filter(Boolean)
                .join(" ")}
              onChange={(v) => {
                setCopyByPreset((prev) => ({
                  ...prev,
                  "photon-lux": {
                    ...prev["photon-lux"],
                    photonSquareProductL1: v,
                    photonSquareProductL2: "",
                  },
                }));
              }}
            />
            <Field
              label="Product sub (mono)"
              value={photon.photonSquareProductSub}
              onChange={(v) => patchPhoton("photonSquareProductSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={photon.photonSquareSpec1}
              onChange={(v) => patchPhoton("photonSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={photon.photonSquareSpec2}
              onChange={(v) => patchPhoton("photonSquareSpec2", v)}
            />
            <Field
              label="Comms label (above button)"
              value={photon.photonSquareCommsLbl}
              onChange={(v) => patchPhoton("photonSquareCommsLbl", v)}
            />
            <Field
              label="Phone / WhatsApp number"
              value={photon.photonSquareWa}
              onChange={(v) => patchPhoton("photonSquareWa", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · Photon Lux
            </p>
            <Field
              label="HQ lockup name"
              value={photon.photonVerticalHqName}
              onChange={(v) => patchPhoton("photonVerticalHqName", v)}
            />
            <Field
              label="Headline — line 1"
              value={photon.photonVerticalHeadlineL1}
              onChange={(v) => patchPhoton("photonVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={photon.photonVerticalHeadlineL2}
              onChange={(v) => patchPhoton("photonVerticalHeadlineL2", v)}
            />
            <Field
              label="Subtext (body)"
              value={photon.photonVerticalSubtext}
              onChange={(v) => patchPhoton("photonVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Product title (one line in dock)"
              value={[photon.photonVerticalProductL1, photon.photonVerticalProductL2]
                .map((s) => s.trim())
                .filter(Boolean)
                .join(" ")}
              onChange={(v) => {
                setCopyByPreset((prev) => ({
                  ...prev,
                  "photon-lux": {
                    ...prev["photon-lux"],
                    photonVerticalProductL1: v,
                    photonVerticalProductL2: "",
                  },
                }));
              }}
            />
            <Field
              label="Product sub (mono)"
              value={photon.photonVerticalProductSub}
              onChange={(v) => patchPhoton("photonVerticalProductSub", v)}
            />
            <Field
              label="Dock button — phone number"
              value={photon.photonVerticalWa}
              onChange={(v) => patchPhoton("photonVerticalWa", v)}
            />
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Square · DeGraaf Performance
            </p>
            <Field
              label="Brand pill"
              value={degraaf.degraafSquareBrandPill}
              onChange={(v) => patchDegraaf("degraafSquareBrandPill", v)}
            />
            <Field
              label="Hero — line 1 (solid)"
              value={degraaf.degraafSquareHeroL1}
              onChange={(v) => patchDegraaf("degraafSquareHeroL1", v)}
            />
            <Field
              label="Hero — line 2 (outline)"
              value={degraaf.degraafSquareHeroL2}
              onChange={(v) => patchDegraaf("degraafSquareHeroL2", v)}
            />
            <Field
              label="Product — line 1"
              value={degraaf.degraafSquareProductL1}
              onChange={(v) => patchDegraaf("degraafSquareProductL1", v)}
            />
            <Field
              label="Product — line 2"
              value={degraaf.degraafSquareProductL2}
              onChange={(v) => patchDegraaf("degraafSquareProductL2", v)}
            />
            <Field
              label="Product sub (mono)"
              value={degraaf.degraafSquareProductSub}
              onChange={(v) => patchDegraaf("degraafSquareProductSub", v)}
            />
            <Field
              label="Spec chip 1"
              value={degraaf.degraafSquareSpec1}
              onChange={(v) => patchDegraaf("degraafSquareSpec1", v)}
            />
            <Field
              label="Spec chip 2"
              value={degraaf.degraafSquareSpec2}
              onChange={(v) => patchDegraaf("degraafSquareSpec2", v)}
            />
            <Field
              label="Strip button — phone number"
              value={degraaf.degraafSquareWa}
              onChange={(v) => patchDegraaf("degraafSquareWa", v)}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vertical · DeGraaf Performance
            </p>
            <Field
              label="Top HUD — brand name"
              value={degraaf.degraafVerticalHqName}
              onChange={(v) => patchDegraaf("degraafVerticalHqName", v)}
            />
            <Field
              label="Spec tag 1"
              value={degraaf.degraafVerticalSpec1}
              onChange={(v) => patchDegraaf("degraafVerticalSpec1", v)}
            />
            <Field
              label="Spec tag 2"
              value={degraaf.degraafVerticalSpec2}
              onChange={(v) => patchDegraaf("degraafVerticalSpec2", v)}
            />
            <Field
              label="Headline — line 1"
              value={degraaf.degraafVerticalHeadlineL1}
              onChange={(v) => patchDegraaf("degraafVerticalHeadlineL1", v)}
            />
            <Field
              label="Headline — line 2 (outline)"
              value={degraaf.degraafVerticalHeadlineL2}
              onChange={(v) => patchDegraaf("degraafVerticalHeadlineL2", v)}
            />
            <Field
              label="Subtext (body)"
              value={degraaf.degraafVerticalSubtext}
              onChange={(v) => patchDegraaf("degraafVerticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Product brand (single line)"
              value={degraaf.degraafVerticalProductBrand}
              onChange={(v) => patchDegraaf("degraafVerticalProductBrand", v)}
            />
            <Field
              label="Product sub (mono)"
              value={degraaf.degraafVerticalProductSub}
              onChange={(v) => patchDegraaf("degraafVerticalProductSub", v)}
            />
            <Field
              label="Dock button — phone number"
              value={degraaf.degraafVerticalWa}
              onChange={(v) => patchDegraaf("degraafVerticalWa", v)}
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

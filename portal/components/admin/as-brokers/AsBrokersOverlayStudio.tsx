"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import glassSquare from "./asb-glass-vault-square.module.css";
import glassVertical from "./asb-glass-vault-vertical.module.css";
import ledgerSquare from "./asb-executive-ledger-square.module.css";
import dossierVertical from "./asb-executive-dossier-vertical.module.css";
import onyxSquare from "./asb-onyx-typographic-square.module.css";
import onyxVertical from "./asb-onyx-typographic-vertical.module.css";
import titaniumSquare from "./asb-titanium-vault-square.module.css";
import titaniumVertical from "./asb-titanium-vault-vertical.module.css";
import wealthSquare from "./asb-wealth-terminal-square.module.css";
import wealthVertical from "./asb-wealth-terminal-vertical.module.css";
import institutionalSquare from "./asb-institutional-matrix-square.module.css";
import institutionalVertical from "./asb-institutional-matrix-vertical.module.css";

export type AsbOverlayPresetId =
  | "glass-vault"
  | "executive-ledger"
  | "onyx-typographic"
  | "wealth-terminal"
  | "institutional-matrix"
  | "titanium-vault";

export const ASB_OVERLAY_PRESETS: {
  id: AsbOverlayPresetId;
  label: string;
  short: string;
}[] = [
  { id: "glass-vault", label: "Glass Vault", short: "Glass Vault" },
  {
    id: "executive-ledger",
    label: "Executive Ledger / Dossier",
    short: "Executive Ledger",
  },
  {
    id: "onyx-typographic",
    label: "Onyx Typographic (text-only)",
    short: "Onyx Typographic",
  },
  {
    id: "wealth-terminal",
    label: "Wealth Terminal (actuarial teal)",
    short: "Wealth Terminal",
  },
  {
    id: "institutional-matrix",
    label: "Institutional Matrix (photo + HUD)",
    short: "Institutional Matrix",
  },
  {
    id: "titanium-vault",
    label: "Titanium Vault (quiet luxury)",
    short: "Titanium Vault",
  },
];

export const OVERLAY_JSON_TEMPLATE_ID = "as-brokers-overlay";
export const OVERLAY_JSON_VERSION = 1;

const GLASS_KEYS = [
  "firmName",
  "firmCredentials",
  "contactPillBefore",
  "contactPhone",
  "serviceCategory",
  "headlinePrimary",
  "headlineSecondary",
  "valueProp",
  "buttonText",
] as const;

const LEDGER_KEYS = [
  "trustBadge",
  "companyName",
  "companyBio",
  "headlinePrimary",
  "headlineAccent",
  "serviceDesc",
  "feature1",
  "feature2",
  "feature3",
  "contactLabel",
  "contactPhone",
  "buttonText",
] as const;

const ONYX_KEYS = [
  "trustTag",
  "firmName",
  "contactPlate",
  "megaLine1",
  "megaLine2",
  "serviceTitle",
  "serviceDesc",
  "dataPoint1Value",
  "dataPoint1Label",
  "dataPoint2Value",
  "dataPoint2Label",
  "buttonText",
] as const;

const TITANIUM_KEYS = [
  "brandName",
  "authTag",
  "contactPhone",
  "contactFooterPrefix",
  "headlinePrimary",
  "headlineSecondary",
  "serviceLabel",
  "serviceTitle",
  "serviceDesc",
  "buttonText",
] as const;

/** Square + vertical variants share FSP block, yield card, CTA; headlines differ by format. */
const TERMINAL_KEYS = [
  "brandName",
  "brandSub",
  "trustLine1",
  "trustLine2",
  "squareHeadline1",
  "squareHeadline2",
  "verticalHeadline1",
  "verticalHeadline2",
  "verticalHeroSub",
  "yieldLabel",
  "yieldPercent",
  "tag1",
  "tag2",
  "contactLabel",
  "website",
  "phone",
] as const;

const INSTITUTIONAL_KEYS = [
  "brandName",
  "brandSub",
  "verticalTopBadge",
  "verticalTag1",
  "verticalTag2",
  "headlineLine1",
  "headlineLine2",
  "verticalSubtext",
  "yieldLabel",
  "squareYieldSub",
  "yieldPercent",
  "squareRibbonTag1",
  "squareRibbonTag2",
  "phone",
] as const;

type GlassCopyKey = (typeof GLASS_KEYS)[number];
type LedgerCopyKey = (typeof LEDGER_KEYS)[number];
type OnyxCopyKey = (typeof ONYX_KEYS)[number];
type TitaniumCopyKey = (typeof TITANIUM_KEYS)[number];
type TerminalCopyKey = (typeof TERMINAL_KEYS)[number];
type InstitutionalCopyKey = (typeof INSTITUTIONAL_KEYS)[number];

const DEFAULTS_GLASS: Record<GlassCopyKey, string> = {
  firmName: "YOUR FIRM LTD",
  firmCredentials: "Authorized FSP",
  contactPillBefore: "Call",
  contactPhone: "011 XXX XXXX",
  serviceCategory: "Wealth Management",
  headlinePrimary: "Generational.",
  headlineSecondary: "Security.",
  valueProp:
    "Bespoke financial architecture. Data-driven, tax-optimized, and fiercely protected for the future.",
  buttonText: "Schedule Consultation",
};

const DEFAULTS_LEDGER: Record<LedgerCopyKey, string> = {
  trustBadge: "Authorized FSP",
  companyName: "YOUR FIRM LTD.",
  companyBio:
    "Elite financial stewardship and advisory for high-net-worth individuals and corporate entities.",
  headlinePrimary: "Legacy.",
  headlineAccent: "Secured.",
  serviceDesc:
    "Comprehensive Portfolio Management tailored to your risk profile. We navigate market volatility to ensure sustained generational growth.",
  feature1: "Tax-Optimized Asset Allocation",
  feature2: "Global Market Intelligence",
  feature3: "Bespoke Fiduciary Care",
  contactLabel: "Direct Line:",
  contactPhone: "011 XXX XXXX",
  buttonText: "Schedule Private Consultation",
};

const DEFAULTS_ONYX: Record<OnyxCopyKey, string> = {
  trustTag: "Authorized FSP",
  firmName: "YOUR FIRM LTD.",
  contactPlate: "011 XXX XXXX",
  megaLine1: "PRIVATE",
  megaLine2: "WEALTH.",
  serviceTitle: "Generational Portfolio Management",
  serviceDesc:
    "Bespoke financial architecture. We navigate market volatility with surgical precision to ensure sustained legacy growth.",
  dataPoint1Value: "Tax",
  dataPoint1Label: "Optimized",
  dataPoint2Value: "Global",
  dataPoint2Label: "Intelligence",
  buttonText: "Consult",
};

const DEFAULTS_TITANIUM: Record<TitaniumCopyKey, string> = {
  brandName: "PRIVATE // WEALTH",
  authTag: "Authorized Fiduciary Asset Manager",
  contactPhone: "011 XXX XXXX",
  contactFooterPrefix: "Direct Line:",
  headlinePrimary: "Bespoke.",
  headlineSecondary: "Legacies.",
  serviceLabel: "Capital Management",
  serviceTitle: "Discretion. Yield. Security.",
  serviceDesc:
    "Sophisticated preservation for ultra-high-net-worth portfolios. Absolute transparency, fiercely protected for the next generation.",
  buttonText: "Initiate Protocol",
};

const DEFAULTS_TERMINAL: Record<TerminalCopyKey, string> = {
  brandName: "AS Brokers",
  brandSub: "Wealth Engineering",
  trustLine1: "FSP 17273",
  trustLine2: "Category 1.8",
  squareHeadline1: "Protecting Your Legacy.",
  squareHeadline2: "Engineering Your Wealth.",
  verticalHeadline1: "Wealth.",
  verticalHeadline2: "Engineered.",
  verticalHeroSub:
    "Stop guessing your capital lifespan. Access institutional-grade Everest Wealth private equity structures designed for absolute certainty.",
  yieldLabel: "Everest Wealth Strategic Growth",
  yieldPercent: "14.5",
  tag1: "20% DWT Tax Arbitrage",
  tag2: "Zero Advice Fees",
  contactLabel: "Consult Albert Directly",
  website: "asbrokers.co.za",
  phone: "082 377 3894",
};

const DEFAULTS_INSTITUTIONAL: Record<InstitutionalCopyKey, string> = {
  brandName: "AS Brokers",
  brandSub: "FSP 17273 | Category 1.8",
  verticalTopBadge: "Private Equity",
  verticalTag1: "Everest Wealth",
  verticalTag2: "20% DWT Arbitrage",
  headlineLine1: "Public Volatility.",
  headlineLine2: "Private Certainty.",
  verticalSubtext:
    "Bypass the structural flaws of the public market. Access institutional-grade, unlisted private equity portfolios engineered for absolute yield.",
  yieldLabel: "Targeted Yield",
  squareYieldSub: "Everest Wealth",
  yieldPercent: "14.5",
  squareRibbonTag1: "Unlisted Private Equity",
  squareRibbonTag2: "20% DWT Arbitrage",
  phone: "082 377 3894",
};

function initialCopyByPreset(): Record<
  AsbOverlayPresetId,
  Record<string, string>
> {
  return {
    "glass-vault": { ...DEFAULTS_GLASS },
    "executive-ledger": { ...DEFAULTS_LEDGER },
    "onyx-typographic": { ...DEFAULTS_ONYX },
    "wealth-terminal": { ...DEFAULTS_TERMINAL },
    "institutional-matrix": { ...DEFAULTS_INSTITUTIONAL },
    "titanium-vault": { ...DEFAULTS_TITANIUM },
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

function isPresetId(v: unknown): v is AsbOverlayPresetId {
  return (
    v === "glass-vault" ||
    v === "executive-ledger" ||
    v === "onyx-typographic" ||
    v === "wealth-terminal" ||
    v === "institutional-matrix" ||
    v === "titanium-vault"
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
): AsbOverlayPresetId | null {
  const keys = Object.keys(block);

  const onyxHit =
    keys.includes("megaLine1") ||
    keys.includes("megaLine2") ||
    keys.includes("trustTag") ||
    keys.includes("contactPlate") ||
    keys.includes("dataPoint1Value") ||
    keys.includes("dataPoint1Label");
  if (onyxHit) return "onyx-typographic";

  const titaniumHit =
    keys.includes("contactFooterPrefix") ||
    (keys.includes("brandName") && keys.includes("serviceLabel"));
  if (titaniumHit) return "titanium-vault";

  const institutionalHit =
    keys.includes("verticalTopBadge") ||
    keys.includes("verticalSubtext") ||
    keys.includes("squareRibbonTag1");
  if (institutionalHit) return "institutional-matrix";

  const terminalHit =
    keys.includes("yieldPercent") ||
    keys.includes("verticalHeroSub") ||
    keys.includes("squareHeadline1") ||
    keys.includes("trustLine1");
  if (terminalHit) return "wealth-terminal";

  const ledgerHit = keys.some((k) =>
    (LEDGER_KEYS as readonly string[]).includes(k),
  );
  const glassHit = keys.some((k) =>
    (GLASS_KEYS as readonly string[]).includes(k),
  );
  if (ledgerHit && !glassHit) return "executive-ledger";
  if (glassHit && !ledgerHit) return "glass-vault";
  if (keys.includes("companyBio") || keys.includes("feature1"))
    return "executive-ledger";
  if (keys.includes("serviceCategory")) return "glass-vault";
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

function TrustShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      />
    </svg>
  );
}

function BtnChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PhoneHandsetIcon({
  className,
  width = 18,
  height = 18,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function FeatureCheckSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlayTriangleSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
    </svg>
  );
}

export function AsBrokersOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<AsbOverlayPresetId>("glass-vault");
  const [copyByPreset, setCopyByPreset] = useState(initialCopyByPreset);

  const g = copyByPreset["glass-vault"];
  const l = copyByPreset["executive-ledger"];
  const o = copyByPreset["onyx-typographic"];
  const tv = copyByPreset["titanium-vault"];
  const wt = copyByPreset["wealth-terminal"];
  const im = copyByPreset["institutional-matrix"];

  const setGlass = (key: GlassCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "glass-vault": { ...prev["glass-vault"], [key]: value },
    }));
  };

  const setLedger = (key: LedgerCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "executive-ledger": { ...prev["executive-ledger"], [key]: value },
    }));
  };

  const setOnyx = (key: OnyxCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "onyx-typographic": { ...prev["onyx-typographic"], [key]: value },
    }));
  };

  const setTitanium = (key: TitaniumCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "titanium-vault": { ...prev["titanium-vault"], [key]: value },
    }));
  };

  const setTerminal = (key: TerminalCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "wealth-terminal": { ...prev["wealth-terminal"], [key]: value },
    }));
  };

  const setInstitutional = (key: InstitutionalCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "institutional-matrix": { ...prev["institutional-matrix"], [key]: value },
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
        template: OVERLAY_JSON_TEMPLATE_ID,
        version: OVERLAY_JSON_VERSION,
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
    const block = extractCopyBlock(parsed);
    if (!block) {
      setJsonError("Expected an object with a \"copy\" field or flat keys.");
      return;
    }

    let targetPreset: AsbOverlayPresetId = preset;
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      isPresetId((parsed as Record<string, unknown>).preset)
    ) {
      targetPreset = (parsed as Record<string, unknown>).preset as AsbOverlayPresetId;
    } else {
      const inferred = inferPresetFromBlock(block);
      if (inferred) targetPreset = inferred;
    }

    const keys: readonly string[] =
      targetPreset === "glass-vault"
        ? GLASS_KEYS
        : targetPreset === "executive-ledger"
          ? LEDGER_KEYS
          : targetPreset === "onyx-typographic"
            ? ONYX_KEYS
            : targetPreset === "wealth-terminal"
              ? TERMINAL_KEYS
              : targetPreset === "institutional-matrix"
                ? INSTITUTIONAL_KEYS
                : TITANIUM_KEYS;
    const picked: Record<string, string> = {};
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const v = block[key];
        picked[key] = v == null ? "" : String(v);
      }
    }
    if (!Object.keys(picked).length) {
      const hint =
        targetPreset === "glass-vault"
          ? GLASS_KEYS.join(", ")
          : targetPreset === "executive-ledger"
            ? LEDGER_KEYS.join(", ")
            : targetPreset === "onyx-typographic"
              ? ONYX_KEYS.join(", ")
              : targetPreset === "wealth-terminal"
                ? TERMINAL_KEYS.join(", ")
                : targetPreset === "institutional-matrix"
                  ? INSTITUTIONAL_KEYS.join(", ")
                  : TITANIUM_KEYS.join(", ");
      setJsonError(`No recognised fields for this preset. Try: ${hint}`);
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
    if (preset === "glass-vault") {
      setCopyByPreset((prev) => ({
        ...prev,
        "glass-vault": { ...DEFAULTS_GLASS },
      }));
    } else if (preset === "executive-ledger") {
      setCopyByPreset((prev) => ({
        ...prev,
        "executive-ledger": { ...DEFAULTS_LEDGER },
      }));
    } else if (preset === "onyx-typographic") {
      setCopyByPreset((prev) => ({
        ...prev,
        "onyx-typographic": { ...DEFAULTS_ONYX },
      }));
    } else if (preset === "wealth-terminal") {
      setCopyByPreset((prev) => ({
        ...prev,
        "wealth-terminal": { ...DEFAULTS_TERMINAL },
      }));
    } else if (preset === "institutional-matrix") {
      setCopyByPreset((prev) => ({
        ...prev,
        "institutional-matrix": { ...DEFAULTS_INSTITUTIONAL },
      }));
    } else {
      setCopyByPreset((prev) => ({
        ...prev,
        "titanium-vault": { ...DEFAULTS_TITANIUM },
      }));
    }
  };

  const exportSlug =
    preset === "glass-vault"
      ? "glass-vault"
      : preset === "executive-ledger"
        ? "executive-ledger"
        : preset === "onyx-typographic"
          ? "onyx-typographic"
          : preset === "wealth-terminal"
            ? "wealth-terminal"
            : preset === "institutional-matrix"
              ? "institutional-matrix"
              : "titanium-vault";

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
      a.download = `as-brokers-${exportSlug}-square-1080-${Date.now()}.png`;
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
      a.download = `as-brokers-${exportSlug}-vertical-9x16-${Date.now()}.png`;
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

  const squareCanvas =
    preset === "glass-vault" ? (
      <div
        ref={squareRef}
        className={`${glassSquare.root} ${glassSquare.canvas1080}`}
        aria-label="AS Brokers Glass Vault square 1080 export"
      >
        <div className={glassSquare.adContainer}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={glassSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={glassSquare.scrimTop} />
          <div className={glassSquare.wealthAura} />
          <div className={glassSquare.advisorHud}>
            <div className={glassSquare.firmIdentity}>
              <div className={glassSquare.firmName}>{g.firmName}</div>
              <div className={glassSquare.firmCredentials}>
                <TrustShield className={glassSquare.trustShield} />
                {g.firmCredentials}
              </div>
            </div>
            <div className={glassSquare.contactPill}>
              {g.contactPillBefore}{" "}
              <span className={glassSquare.contactPillHighlight}>
                {g.contactPhone}
              </span>
            </div>
          </div>
          <div className={glassSquare.heroStage} />
          <div className={glassSquare.vaultConsole}>
            <div className={glassSquare.growthLine} />
            <div className={glassSquare.vaultInfo}>
              <div className={glassSquare.serviceCategory}>
                {g.serviceCategory}
              </div>
              <h1 className={glassSquare.headline}>
                {g.headlinePrimary}
                {g.headlinePrimary && g.headlineSecondary ? <br /> : null}
                {g.headlineSecondary ? (
                  <span className={glassSquare.headlineLight}>
                    {g.headlineSecondary}
                  </span>
                ) : null}
              </h1>
              <p className={glassSquare.valueProp}>{g.valueProp}</p>
            </div>
            <button type="button" className={glassSquare.secureButton}>
              {g.buttonText}
              <div className={glassSquare.btnIconCircle}>
                <BtnChevron />
              </div>
            </button>
          </div>
        </div>
      </div>
    ) : preset === "executive-ledger" ? (
      <div
        ref={squareRef}
        className={`${ledgerSquare.root} ${ledgerSquare.canvas1080}`}
        aria-label="AS Brokers Executive Ledger square 1080 export"
      >
        <div className={ledgerSquare.adContainer}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={ledgerSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={ledgerSquare.imageScrim} />
          <div className={ledgerSquare.executiveLedger}>
            <div className={ledgerSquare.ledgerEdgeGlow} />
            <div className={ledgerSquare.companyProfile}>
              <div className={ledgerSquare.trustBadge}>
                <TrustShield />
                {l.trustBadge}
              </div>
              <h2 className={ledgerSquare.companyName}>{l.companyName}</h2>
              <p className={ledgerSquare.companyBio}>{l.companyBio}</p>
            </div>
            <div className={ledgerSquare.divider} />
            <div className={ledgerSquare.serviceSection}>
              <h1 className={ledgerSquare.serviceHeadline}>
                {l.headlinePrimary}
                {l.headlinePrimary && l.headlineAccent ? <br /> : null}
                {l.headlineAccent ? (
                  <span className={ledgerSquare.serviceHeadlineAccent}>
                    {l.headlineAccent}
                  </span>
                ) : null}
              </h1>
              <p className={ledgerSquare.serviceDesc}>{l.serviceDesc}</p>
              <ul className={ledgerSquare.featureList}>
                {[l.feature1, l.feature2, l.feature3].map((text, i) => (
                  <li key={i} className={ledgerSquare.featureItem}>
                    <FeatureCheckSvg />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className={ledgerSquare.actionSection}>
              <div className={ledgerSquare.contactInfo}>
                <span className={ledgerSquare.contactInfoMuted}>
                  {l.contactLabel}
                </span>{" "}
                {l.contactPhone}
              </div>
              <button type="button" className={ledgerSquare.secureButton}>
                {l.buttonText}
                <BtnChevron />
              </button>
            </div>
          </div>
          <div className={ledgerSquare.heroStage} />
        </div>
      </div>
    ) : preset === "onyx-typographic" ? (
      <div
        ref={squareRef}
        className={`${onyxSquare.root} ${onyxSquare.canvas1080}`}
        aria-label="AS Brokers Onyx Typographic square 1080 export"
      >
        <div className={onyxSquare.adContainer}>
          <div className={onyxSquare.dataGrid} />
          <div className={onyxSquare.ambientGlow} />
          <div className={onyxSquare.topHud}>
            <div className={onyxSquare.firmBrand}>
              <div className={onyxSquare.trustTag}>
                <div className={onyxSquare.pulseDot} />
                {o.trustTag}
              </div>
              <div className={onyxSquare.firmName}>{o.firmName}</div>
            </div>
            <div className={onyxSquare.contactPlate}>{o.contactPlate}</div>
          </div>
          <div className={onyxSquare.megaTextContainer}>
            <h1 className={onyxSquare.megaText}>
              <span className={onyxSquare.megaLine1}>{o.megaLine1}</span>
              <span className={onyxSquare.megaLine2}>{o.megaLine2}</span>
            </h1>
          </div>
          <div className={onyxSquare.glassDatacard}>
            <div className={onyxSquare.datacardInfo}>
              <div className={onyxSquare.serviceTitle}>{o.serviceTitle}</div>
              <p className={onyxSquare.serviceDesc}>{o.serviceDesc}</p>
              <div className={onyxSquare.dataPoints}>
                <div className={onyxSquare.dataPoint}>
                  <span className={onyxSquare.dpValue}>{o.dataPoint1Value}</span>
                  <span className={onyxSquare.dpLabel}>{o.dataPoint1Label}</span>
                </div>
                <div className={onyxSquare.dataPoint}>
                  <span className={onyxSquare.dpValue}>{o.dataPoint2Value}</span>
                  <span className={onyxSquare.dpLabel}>{o.dataPoint2Label}</span>
                </div>
              </div>
            </div>
            <button type="button" className={onyxSquare.actionPill}>
              {o.buttonText}
              <PlayTriangleSvg />
            </button>
          </div>
        </div>
      </div>
    ) : preset === "wealth-terminal" ? (
      <div
        ref={squareRef}
        className={`${wealthSquare.root} ${wealthSquare.canvas1080}`}
        aria-label="AS Brokers Wealth Terminal square 1080 export"
      >
        <div className={wealthSquare.adContainer}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={wealthSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={wealthSquare.engineeringGrid} />
          <div
            className={`${wealthSquare.ambientOrb} ${wealthSquare.orbRight}`}
          />
          <div
            className={`${wealthSquare.ambientOrb} ${wealthSquare.orbLeft}`}
          />
          <div className={wealthSquare.topSection}>
            <div className={wealthSquare.headerRow}>
              <div className={wealthSquare.brandLockup}>
                <span className={wealthSquare.btName}>{wt.brandName}</span>
                <span className={wealthSquare.btSub}>{wt.brandSub}</span>
              </div>
              <div className={wealthSquare.trustHallmark}>
                <span>{wt.trustLine1}</span>
                <span>{wt.trustLine2}</span>
              </div>
            </div>
            <h1 className={wealthSquare.heroType}>
              {wt.squareHeadline1}
              <br />
              <span className={wealthSquare.heroGradient}>
                {wt.squareHeadline2}
              </span>
            </h1>
          </div>
          <div className={wealthSquare.wealthTerminal}>
            <div
              className={`${wealthSquare.bentoCard} ${wealthSquare.yieldCard}`}
            >
              <div className={wealthSquare.yieldData}>
                <span className={wealthSquare.yieldLbl}>{wt.yieldLabel}</span>
                <span className={wealthSquare.yieldVal}>
                  {wt.yieldPercent}
                  <span className={wealthSquare.yieldSuffix}>%</span>
                </span>
              </div>
              <div className={wealthSquare.tagsCol}>
                <span className={wealthSquare.dataTag}>{wt.tag1}</span>
                <span className={wealthSquare.dataTag}>{wt.tag2}</span>
              </div>
            </div>
            <div className={wealthSquare.actionRow}>
              <div className={wealthSquare.contactInfo}>
                <span className={wealthSquare.contactAgent}>
                  {wt.contactLabel}
                </span>
                <span className={wealthSquare.webLink}>{wt.website}</span>
              </div>
              <button type="button" className={wealthSquare.btnPrimary}>
                <PhoneHandsetIcon width={20} height={20} />
                {wt.phone}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "institutional-matrix" ? (
      <div
        ref={squareRef}
        className={`${institutionalSquare.root} ${institutionalSquare.canvas1080}`}
        aria-label="AS Brokers Institutional Matrix square 1080 export"
      >
        <div className={institutionalSquare.adContainer}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={institutionalSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={institutionalSquare.scrimTop} />
          <div className={institutionalSquare.scrimBottom} />
          <div className={institutionalSquare.topPerimeter}>
            <div className={institutionalSquare.brandLockup}>
              <span className={institutionalSquare.btName}>{im.brandName}</span>
              <span className={institutionalSquare.btSub}>{im.brandSub}</span>
            </div>
            <h1 className={institutionalSquare.heroType}>
              {im.headlineLine1}
              <br />
              <span>{im.headlineLine2}</span>
            </h1>
          </div>
          <div className={institutionalSquare.slimTerminal}>
            <div className={institutionalSquare.yieldBlock}>
              <div className={institutionalSquare.yieldVal}>
                {im.yieldPercent}
                <span>%</span>
              </div>
              <div className={institutionalSquare.yieldText}>
                <span className={institutionalSquare.ytMain}>{im.yieldLabel}</span>
                <span className={institutionalSquare.ytSub}>
                  {im.squareYieldSub}
                </span>
              </div>
            </div>
            <div className={institutionalSquare.techTags}>
              <span className={institutionalSquare.specMini}>
                {im.squareRibbonTag1}
              </span>
              <span className={institutionalSquare.specMini}>
                {im.squareRibbonTag2}
              </span>
            </div>
            <div className={institutionalSquare.actionBlock}>
              <button type="button" className={institutionalSquare.btnContact}>
                <PhoneHandsetIcon width={16} height={16} />
                {im.phone}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={squareRef}
        className={`${titaniumSquare.root} ${titaniumSquare.canvas1080}`}
        aria-label="AS Brokers Titanium Vault square 1080 export"
      >
        <div className={titaniumSquare.adContainer}>
          <div className={titaniumSquare.metalGrain} />
          <div className={titaniumSquare.fiduciaryBar}>
            <div className={titaniumSquare.brandBlock}>
              <div className={titaniumSquare.brandName}>{tv.brandName}</div>
              <div className={titaniumSquare.authTag}>{tv.authTag}</div>
            </div>
            <div className={titaniumSquare.contactNumber}>
              {tv.contactPhone}
            </div>
          </div>
          <div className={titaniumSquare.monolithContent}>
            <h1 className={titaniumSquare.mainHeadline}>
              {tv.headlinePrimary}
              <span className={titaniumSquare.mainHeadlineLight}>
                {tv.headlineSecondary}
              </span>
            </h1>
          </div>
          <div className={titaniumSquare.machinedDeck}>
            <div className={titaniumSquare.sapphireDot} />
            <div className={titaniumSquare.deckInfo}>
              <div className={titaniumSquare.serviceLabel}>
                {tv.serviceLabel}
              </div>
              <h2 className={titaniumSquare.serviceTitle}>
                {tv.serviceTitle}
              </h2>
              <p className={titaniumSquare.serviceDesc}>{tv.serviceDesc}</p>
            </div>
            <button
              type="button"
              className={titaniumSquare.ignitionBtn}
              aria-label={tv.buttonText}
            >
              <BtnChevron />
            </button>
          </div>
        </div>
      </div>
    );

  const verticalCanvas =
    preset === "glass-vault" ? (
      <div
        ref={verticalRef}
        className={`${glassVertical.root} ${glassVertical.canvas1080x1920}`}
        aria-label="AS Brokers Glass Vault vertical 9:16 export"
      >
        <div className={glassVertical.adContainer}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={glassVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={glassVertical.scrimTop} />
          <div className={glassVertical.wealthAura} />
          <div className={glassVertical.advisorHud}>
            <div className={glassVertical.firmIdentity}>
              <div className={glassVertical.firmName}>{g.firmName}</div>
              <div className={glassVertical.firmCredentials}>
                <TrustShield className={glassVertical.trustShield} />
                {g.firmCredentials}
              </div>
            </div>
            <div className={glassVertical.contactPill}>
              {g.contactPillBefore}{" "}
              <span className={glassVertical.contactPillHighlight}>
                {g.contactPhone}
              </span>
            </div>
          </div>
          <div className={glassVertical.heroStage} />
          <div className={glassVertical.vaultConsole}>
            <div className={glassVertical.growthLine} />
            <div className={glassVertical.serviceCategory}>
              {g.serviceCategory}
            </div>
            <h1 className={glassVertical.headline}>
              {g.headlinePrimary}
              {g.headlineSecondary ? (
                <span className={glassVertical.headlineLight}>
                  {g.headlineSecondary}
                </span>
              ) : null}
            </h1>
            <p className={glassVertical.valueProp}>{g.valueProp}</p>
            <button type="button" className={glassVertical.secureButton}>
              {g.buttonText}
              <div className={glassVertical.btnIconCircle}>
                <BtnChevron />
              </div>
            </button>
          </div>
        </div>
      </div>
    ) : preset === "executive-ledger" ? (
      <div
        ref={verticalRef}
        className={`${dossierVertical.root} ${dossierVertical.canvas1080x1920}`}
        aria-label="AS Brokers Executive Dossier vertical 9:16 export"
      >
        <div className={dossierVertical.adContainer}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={dossierVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={dossierVertical.companyHeader}>
            <div className={dossierVertical.trustBadge}>
              <TrustShield />
              {l.trustBadge}
            </div>
            <div className={dossierVertical.companyNameRow}>
              <span className={dossierVertical.companyName}>
                {l.companyName}
              </span>
              <span className={dossierVertical.contactPill}>
                {l.contactPhone}
              </span>
            </div>
            <p className={dossierVertical.companyBio}>{l.companyBio}</p>
          </div>
          <div className={dossierVertical.heroStage} />
          <div className={dossierVertical.serviceDossier}>
            <div className={dossierVertical.dossierLipGlow} />
            <h1 className={dossierVertical.serviceHeadline}>
              {l.headlinePrimary}
              {l.headlinePrimary && l.headlineAccent ? <br /> : null}
              {l.headlineAccent ? (
                <span className={dossierVertical.serviceHeadlineAccent}>
                  {l.headlineAccent}
                </span>
              ) : null}
            </h1>
            <p className={dossierVertical.serviceDesc}>{l.serviceDesc}</p>
            <ul className={dossierVertical.featureList}>
              {[l.feature1, l.feature2, l.feature3].map((text, i) => (
                <li key={i} className={dossierVertical.featureItem}>
                  <span className={dossierVertical.featureIconWrap}>
                    <FeatureCheckSvg />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <button type="button" className={dossierVertical.secureButton}>
              <span>{l.buttonText}</span>
              <BtnChevron />
            </button>
          </div>
        </div>
      </div>
    ) : preset === "onyx-typographic" ? (
      <div
        ref={verticalRef}
        className={`${onyxVertical.root} ${onyxVertical.canvas1080x1920}`}
        aria-label="AS Brokers Onyx Typographic vertical 9:16 export"
      >
        <div className={onyxVertical.adContainer}>
          <div className={onyxVertical.dataGrid} />
          <div className={onyxVertical.ambientGlow} />
          <div className={onyxVertical.topHud}>
            <div className={onyxVertical.firmBrand}>
              <div className={onyxVertical.trustTag}>
                <div className={onyxVertical.pulseDot} />
                {o.trustTag}
              </div>
              <div className={onyxVertical.firmName}>{o.firmName}</div>
            </div>
            <div className={onyxVertical.contactPlate}>{o.contactPlate}</div>
          </div>
          <div className={onyxVertical.megaTextContainer}>
            <h1 className={onyxVertical.megaText}>
              <span className={onyxVertical.megaLine1}>{o.megaLine1}</span>
              <span className={onyxVertical.megaLine2}>{o.megaLine2}</span>
            </h1>
          </div>
          <div className={onyxVertical.glassDatacard}>
            <div className={onyxVertical.datacardInfo}>
              <div className={onyxVertical.serviceTitle}>{o.serviceTitle}</div>
              <p className={onyxVertical.serviceDesc}>{o.serviceDesc}</p>
              <div className={onyxVertical.dataPoints}>
                <div className={onyxVertical.dataPoint}>
                  <span className={onyxVertical.dpValue}>
                    {o.dataPoint1Value}
                  </span>
                  <span className={onyxVertical.dpLabel}>
                    {o.dataPoint1Label}
                  </span>
                </div>
                <div className={onyxVertical.dataPoint}>
                  <span className={onyxVertical.dpValue}>
                    {o.dataPoint2Value}
                  </span>
                  <span className={onyxVertical.dpLabel}>
                    {o.dataPoint2Label}
                  </span>
                </div>
              </div>
            </div>
            <button type="button" className={onyxVertical.actionPill}>
              <span>{o.buttonText}</span>
              <PlayTriangleSvg />
            </button>
          </div>
        </div>
      </div>
    ) : preset === "wealth-terminal" ? (
      <div
        ref={verticalRef}
        className={`${wealthVertical.root} ${wealthVertical.canvas1080x1920}`}
        aria-label="AS Brokers Wealth Terminal vertical 9:16 export"
      >
        <div className={wealthVertical.adContainer}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={wealthVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={wealthVertical.engineeringGrid} />
          <div
            className={`${wealthVertical.ambientOrb} ${wealthVertical.orbTop}`}
          />
          <div
            className={`${wealthVertical.ambientOrb} ${wealthVertical.orbBottom}`}
          />
          <div className={wealthVertical.topHud}>
            <div className={wealthVertical.brandLockup}>
              <span className={wealthVertical.btName}>{wt.brandName}</span>
              <span className={wealthVertical.btSub}>{wt.brandSub}</span>
            </div>
            <div className={wealthVertical.trustHallmark}>
              <span>{wt.trustLine1}</span>
              <span>{wt.trustLine2}</span>
            </div>
          </div>
          <div className={wealthVertical.heroSection}>
            <h1 className={wealthVertical.heroType}>
              {wt.verticalHeadline1}
              <br />
              <span className={wealthVertical.heroGradient}>
                {wt.verticalHeadline2}
              </span>
            </h1>
            <p className={wealthVertical.heroSub}>{wt.verticalHeroSub}</p>
          </div>
          <div className={wealthVertical.wealthTerminal}>
            <div
              className={`${wealthVertical.bentoCard} ${wealthVertical.yieldCard}`}
            >
              <div className={wealthVertical.yieldData}>
                <span className={wealthVertical.yieldLbl}>{wt.yieldLabel}</span>
                <span className={wealthVertical.yieldVal}>
                  {wt.yieldPercent}
                  <span className={wealthVertical.yieldSuffix}>%</span>
                </span>
              </div>
              <div className={wealthVertical.tagsCol}>
                <span className={wealthVertical.dataTag}>{wt.tag1}</span>
                <span className={wealthVertical.dataTag}>{wt.tag2}</span>
              </div>
            </div>
            <div className={wealthVertical.actionRow}>
              <span className={wealthVertical.contactAgent}>{wt.contactLabel}</span>
              <button type="button" className={wealthVertical.btnPrimary}>
                <PhoneHandsetIcon width={18} height={18} />
                {wt.phone}
              </button>
              <div className={wealthVertical.webLink}>{wt.website}</div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "institutional-matrix" ? (
      <div
        ref={verticalRef}
        className={`${institutionalVertical.root} ${institutionalVertical.canvas1080x1920}`}
        aria-label="AS Brokers Institutional Matrix vertical 9:16 export"
      >
        <div className={institutionalVertical.adContainer}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={institutionalVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={institutionalVertical.matrixGrid} />
          <div className={institutionalVertical.scrim} />
          <div className={institutionalVertical.focusBracket} />
          <div className={institutionalVertical.topHud}>
            <div className={institutionalVertical.brandLockup}>
              <span className={institutionalVertical.btName}>
                {im.brandName}
              </span>
              <span className={institutionalVertical.btSub}>{im.brandSub}</span>
            </div>
            <div className={institutionalVertical.fspBadge}>
              {im.verticalTopBadge}
            </div>
          </div>
          <div className={institutionalVertical.wealthTerminal}>
            <div className={institutionalVertical.specGrid}>
              <div className={institutionalVertical.specTag}>
                {im.verticalTag1}
              </div>
              <div className={institutionalVertical.specTag}>
                {im.verticalTag2}
              </div>
            </div>
            <h1 className={institutionalVertical.headline}>
              {im.headlineLine1}
              <br />
              <span>{im.headlineLine2}</span>
            </h1>
            <p className={institutionalVertical.subtext}>{im.verticalSubtext}</p>
            <div className={institutionalVertical.actionDock}>
              <div className={institutionalVertical.yieldDisplay}>
                <span className={institutionalVertical.yieldLbl}>
                  {im.yieldLabel}
                </span>
                <span className={institutionalVertical.yieldVal}>
                  {im.yieldPercent}
                  <span>%</span>
                </span>
              </div>
              <button type="button" className={institutionalVertical.btnContact}>
                <PhoneHandsetIcon width={16} height={16} />
                {im.phone}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={verticalRef}
        className={`${titaniumVertical.root} ${titaniumVertical.canvas1080x1920}`}
        aria-label="AS Brokers Titanium Vault vertical 9:16 export"
      >
        <div className={titaniumVertical.adContainer}>
          <div className={titaniumVertical.metalGrain} />
          <div className={titaniumVertical.fiduciaryHeader}>
            <div className={titaniumVertical.brandName}>{tv.brandName}</div>
            <div className={titaniumVertical.authTag}>{tv.authTag}</div>
          </div>
          <div className={titaniumVertical.monolithCenter}>
            <h1 className={titaniumVertical.mainHeadline}>
              {tv.headlinePrimary}
              <span className={titaniumVertical.mainHeadlineLight}>
                {tv.headlineSecondary}
              </span>
            </h1>
          </div>
          <div className={titaniumVertical.machinedConsole}>
            <div className={titaniumVertical.sapphireIndicator} />
            <div className={titaniumVertical.deckInfo}>
              <div className={titaniumVertical.serviceLabel}>
                {tv.serviceLabel}
              </div>
              <h2 className={titaniumVertical.serviceTitle}>
                {tv.serviceTitle}
              </h2>
              <p className={titaniumVertical.serviceDesc}>{tv.serviceDesc}</p>
            </div>
            <button type="button" className={titaniumVertical.ignitionBar}>
              <span className={titaniumVertical.btnText}>{tv.buttonText}</span>
              <BtnChevron />
            </button>
            <div className={titaniumVertical.contactFooter}>
              {tv.contactFooterPrefix} {tv.contactPhone}
            </div>
          </div>
        </div>
      </div>
    );

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
              setPreset(e.target.value as AsbOverlayPresetId)
            }
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            aria-label="Overlay template preset"
          >
            {ASB_OVERLAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            Glass Vault, Executive Ledger, and Institutional Matrix use photo
            heroes. Wealth Terminal and Titanium default to built-in art (optional
            photo for Wealth Terminal). Each preset keeps its own copy in JSON.
          </p>
        </div>

        {preset === "onyx-typographic" || preset === "titanium-vault" ? (
          <div className="rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Hero images
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#8E8E93]">
              {preset === "onyx-typographic"
                ? "Not used — blueprint grid and electric glow only."
                : "Not used — brushed metal grain and typographic layout only."}
            </p>
          </div>
        ) : preset === "wealth-terminal" ? (
          <div className="rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Hero images (optional)
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#8E8E93]">
              Teal glass layout works without a photo. Add a hero underneath if
              you want photography behind the grid and orbs.
            </p>
            <div className="mt-3 space-y-2">
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
            <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
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
        ) : (
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
        )}

        <div className="space-y-3 rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
            AI · JSON workflow
          </p>
          <p className="text-xs leading-relaxed text-[#8E8E93]">
            JSON includes <code className="text-white/80">preset</code>:{" "}
            <code className="text-white/80">glass-vault</code>,{" "}
            <code className="text-white/80">executive-ledger</code>,{" "}
            <code className="text-white/80">onyx-typographic</code>,{" "}
            <code className="text-white/80">wealth-terminal</code>,{" "}
            <code className="text-white/80">institutional-matrix</code>,{" "}
            <code className="text-white/80">titanium-vault</code>. Template:{" "}
            <code className="text-white/80">{OVERLAY_JSON_TEMPLATE_ID}</code>.
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
                preset === "glass-vault"
                  ? 16
                  : preset === "executive-ledger"
                    ? 20
                    : preset === "onyx-typographic"
                      ? 22
                      : preset === "wealth-terminal"
                        ? 26
                        : preset === "institutional-matrix"
                          ? 24
                          : 18
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
              placeholder={`{\n  "template": "${OVERLAY_JSON_TEMPLATE_ID}",\n  "preset": "titanium-vault",\n  "copy": { … }\n}`}
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
          Copy is saved per preset when you switch. Export filenames include the
          preset slug.
        </p>

        {preset === "glass-vault" ? (
          <>
            <Field
              label="Firm name (top left)"
              value={g.firmName}
              onChange={(v) => setGlass("firmName", v)}
            />
            <Field
              label="Credentials line (with shield)"
              value={g.firmCredentials}
              onChange={(v) => setGlass("firmCredentials", v)}
            />
            <Field
              label="Contact pill — prefix (e.g. Call)"
              value={g.contactPillBefore}
              onChange={(v) => setGlass("contactPillBefore", v)}
            />
            <Field
              label="Contact pill — highlighted number"
              value={g.contactPhone}
              onChange={(v) => setGlass("contactPhone", v)}
            />
            <Field
              label="Service category (vault label)"
              value={g.serviceCategory}
              onChange={(v) => setGlass("serviceCategory", v)}
            />
            <Field
              label="Headline — primary line"
              value={g.headlinePrimary}
              onChange={(v) => setGlass("headlinePrimary", v)}
            />
            <Field
              label="Headline — light second line"
              value={g.headlineSecondary}
              onChange={(v) => setGlass("headlineSecondary", v)}
            />
            <Field
              label="Value proposition"
              value={g.valueProp}
              onChange={(v) => setGlass("valueProp", v)}
              rows={4}
            />
            <Field
              label="Button label"
              value={g.buttonText}
              onChange={(v) => setGlass("buttonText", v)}
            />
          </>
        ) : preset === "executive-ledger" ? (
          <>
            <Field
              label="Trust badge (with shield)"
              value={l.trustBadge}
              onChange={(v) => setLedger("trustBadge", v)}
            />
            <Field
              label="Company / firm name"
              value={l.companyName}
              onChange={(v) => setLedger("companyName", v)}
            />
            <Field
              label="Company bio"
              value={l.companyBio}
              onChange={(v) => setLedger("companyBio", v)}
              rows={3}
            />
            <Field
              label="Service headline — first line"
              value={l.headlinePrimary}
              onChange={(v) => setLedger("headlinePrimary", v)}
            />
            <Field
              label="Service headline — accent line (blue)"
              value={l.headlineAccent}
              onChange={(v) => setLedger("headlineAccent", v)}
            />
            <Field
              label="Service description"
              value={l.serviceDesc}
              onChange={(v) => setLedger("serviceDesc", v)}
              rows={4}
            />
            <Field
              label="Feature bullet 1"
              value={l.feature1}
              onChange={(v) => setLedger("feature1", v)}
            />
            <Field
              label="Feature bullet 2"
              value={l.feature2}
              onChange={(v) => setLedger("feature2", v)}
            />
            <Field
              label="Feature bullet 3"
              value={l.feature3}
              onChange={(v) => setLedger("feature3", v)}
            />
            <Field
              label="Contact label (square only — e.g. Direct Line:)"
              value={l.contactLabel}
              onChange={(v) => setLedger("contactLabel", v)}
            />
            <Field
              label="Phone number"
              value={l.contactPhone}
              onChange={(v) => setLedger("contactPhone", v)}
            />
            <Field
              label="Button label"
              value={l.buttonText}
              onChange={(v) => setLedger("buttonText", v)}
            />
          </>
        ) : preset === "onyx-typographic" ? (
          <>
            <Field
              label="Trust tag (with pulse dot)"
              value={o.trustTag}
              onChange={(v) => setOnyx("trustTag", v)}
            />
            <Field
              label="Firm name"
              value={o.firmName}
              onChange={(v) => setOnyx("firmName", v)}
            />
            <Field
              label="Contact plate (phone)"
              value={o.contactPlate}
              onChange={(v) => setOnyx("contactPlate", v)}
            />
            <Field
              label="Mega headline — line 1 (solid white)"
              value={o.megaLine1}
              onChange={(v) => setOnyx("megaLine1", v)}
            />
            <Field
              label="Mega headline — line 2 (gradient)"
              value={o.megaLine2}
              onChange={(v) => setOnyx("megaLine2", v)}
            />
            <Field
              label="Datacard — service title"
              value={o.serviceTitle}
              onChange={(v) => setOnyx("serviceTitle", v)}
            />
            <Field
              label="Datacard — description"
              value={o.serviceDesc}
              onChange={(v) => setOnyx("serviceDesc", v)}
              rows={4}
            />
            <Field
              label="Data point 1 — value"
              value={o.dataPoint1Value}
              onChange={(v) => setOnyx("dataPoint1Value", v)}
            />
            <Field
              label="Data point 1 — label"
              value={o.dataPoint1Label}
              onChange={(v) => setOnyx("dataPoint1Label", v)}
            />
            <Field
              label="Data point 2 — value"
              value={o.dataPoint2Value}
              onChange={(v) => setOnyx("dataPoint2Value", v)}
            />
            <Field
              label="Data point 2 — label"
              value={o.dataPoint2Label}
              onChange={(v) => setOnyx("dataPoint2Label", v)}
            />
            <Field
              label="Button label (e.g. Consult / Secure Consultation)"
              value={o.buttonText}
              onChange={(v) => setOnyx("buttonText", v)}
            />
          </>
        ) : preset === "wealth-terminal" ? (
          <>
            <Field
              label="Brand name (header)"
              value={wt.brandName}
              onChange={(v) => setTerminal("brandName", v)}
            />
            <Field
              label="Brand subline (teal mono)"
              value={wt.brandSub}
              onChange={(v) => setTerminal("brandSub", v)}
            />
            <Field
              label="Trust hallmark — line 1 (e.g. FSP)"
              value={wt.trustLine1}
              onChange={(v) => setTerminal("trustLine1", v)}
            />
            <Field
              label="Trust hallmark — line 2"
              value={wt.trustLine2}
              onChange={(v) => setTerminal("trustLine2", v)}
            />
            <Field
              label="Square headline — line 1"
              value={wt.squareHeadline1}
              onChange={(v) => setTerminal("squareHeadline1", v)}
            />
            <Field
              label="Square headline — line 2 (gradient)"
              value={wt.squareHeadline2}
              onChange={(v) => setTerminal("squareHeadline2", v)}
            />
            <Field
              label="Vertical headline — line 1"
              value={wt.verticalHeadline1}
              onChange={(v) => setTerminal("verticalHeadline1", v)}
            />
            <Field
              label="Vertical headline — line 2 (gradient)"
              value={wt.verticalHeadline2}
              onChange={(v) => setTerminal("verticalHeadline2", v)}
            />
            <Field
              label="Vertical body copy (under headline)"
              value={wt.verticalHeroSub}
              onChange={(v) => setTerminal("verticalHeroSub", v)}
              rows={4}
            />
            <Field
              label="Yield card — product label"
              value={wt.yieldLabel}
              onChange={(v) => setTerminal("yieldLabel", v)}
            />
            <Field
              label="Yield figure (number only, % added in design)"
              value={wt.yieldPercent}
              onChange={(v) => setTerminal("yieldPercent", v)}
            />
            <Field
              label="Tag 1"
              value={wt.tag1}
              onChange={(v) => setTerminal("tag1", v)}
            />
            <Field
              label="Tag 2"
              value={wt.tag2}
              onChange={(v) => setTerminal("tag2", v)}
            />
            <Field
              label="Contact label"
              value={wt.contactLabel}
              onChange={(v) => setTerminal("contactLabel", v)}
            />
            <Field
              label="Website"
              value={wt.website}
              onChange={(v) => setTerminal("website", v)}
            />
            <Field
              label="Phone (button)"
              value={wt.phone}
              onChange={(v) => setTerminal("phone", v)}
            />
          </>
        ) : preset === "institutional-matrix" ? (
          <>
            <Field
              label="Brand name"
              value={im.brandName}
              onChange={(v) => setInstitutional("brandName", v)}
            />
            <Field
              label="Brand subline (square: neon · vertical: grey mono)"
              value={im.brandSub}
              onChange={(v) => setInstitutional("brandSub", v)}
            />
            <Field
              label="Vertical — top-right badge"
              value={im.verticalTopBadge}
              onChange={(v) => setInstitutional("verticalTopBadge", v)}
            />
            <Field
              label="Vertical — spec chip 1"
              value={im.verticalTag1}
              onChange={(v) => setInstitutional("verticalTag1", v)}
            />
            <Field
              label="Vertical — spec chip 2"
              value={im.verticalTag2}
              onChange={(v) => setInstitutional("verticalTag2", v)}
            />
            <Field
              label="Headline — line 1 (both formats)"
              value={im.headlineLine1}
              onChange={(v) => setInstitutional("headlineLine1", v)}
            />
            <Field
              label="Headline — line 2 (teal)"
              value={im.headlineLine2}
              onChange={(v) => setInstitutional("headlineLine2", v)}
            />
            <Field
              label="Vertical — body copy (console)"
              value={im.verticalSubtext}
              onChange={(v) => setInstitutional("verticalSubtext", v)}
              rows={4}
            />
            <Field
              label="Yield — label (Targeted Yield)"
              value={im.yieldLabel}
              onChange={(v) => setInstitutional("yieldLabel", v)}
            />
            <Field
              label="Square — yield subline (under label, e.g. Everest Wealth)"
              value={im.squareYieldSub}
              onChange={(v) => setInstitutional("squareYieldSub", v)}
            />
            <Field
              label="Yield figure (number only)"
              value={im.yieldPercent}
              onChange={(v) => setInstitutional("yieldPercent", v)}
            />
            <Field
              label="Square — ribbon tech tag 1"
              value={im.squareRibbonTag1}
              onChange={(v) => setInstitutional("squareRibbonTag1", v)}
            />
            <Field
              label="Square — ribbon tech tag 2"
              value={im.squareRibbonTag2}
              onChange={(v) => setInstitutional("squareRibbonTag2", v)}
            />
            <Field
              label="Phone (button)"
              value={im.phone}
              onChange={(v) => setInstitutional("phone", v)}
            />
          </>
        ) : (
          <>
            <Field
              label="Brand line (header)"
              value={tv.brandName}
              onChange={(v) => setTitanium("brandName", v)}
            />
            <Field
              label="Authority / auth tag"
              value={tv.authTag}
              onChange={(v) => setTitanium("authTag", v)}
            />
            <Field
              label="Phone (square header plate + vertical footer)"
              value={tv.contactPhone}
              onChange={(v) => setTitanium("contactPhone", v)}
            />
            <Field
              label="Vertical footer prefix (before phone)"
              value={tv.contactFooterPrefix}
              onChange={(v) => setTitanium("contactFooterPrefix", v)}
            />
            <Field
              label="Monolith — primary line (uppercase white)"
              value={tv.headlinePrimary}
              onChange={(v) => setTitanium("headlinePrimary", v)}
            />
            <Field
              label="Monolith — second line (slate, lighter weight)"
              value={tv.headlineSecondary}
              onChange={(v) => setTitanium("headlineSecondary", v)}
            />
            <Field
              label="Deck — service label (small caps)"
              value={tv.serviceLabel}
              onChange={(v) => setTitanium("serviceLabel", v)}
            />
            <Field
              label="Deck — service title"
              value={tv.serviceTitle}
              onChange={(v) => setTitanium("serviceTitle", v)}
            />
            <Field
              label="Deck — description"
              value={tv.serviceDesc}
              onChange={(v) => setTitanium("serviceDesc", v)}
              rows={4}
            />
            <Field
              label="Vertical CTA text (square button is icon-only; label used for a11y + export)"
              value={tv.buttonText}
              onChange={(v) => setTitanium("buttonText", v)}
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

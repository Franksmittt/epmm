"use client";

import { Inter, JetBrains_Mono, Montserrat, Playfair_Display } from "next/font/google";
import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import goldSquare from "./evw-gold-square.module.css";
import goldVertical from "./evw-gold-vertical.module.css";
import vaultSquare from "./evw-vault-square.module.css";
import vaultVertical from "./evw-vault-vertical.module.css";
import cobaltSquare from "./evw-cobalt-square.module.css";
import cobaltVertical from "./evw-cobalt-vertical.module.css";
import horologySquare from "./evw-horology-square.module.css";
import horologyVertical from "./evw-horology-vertical.module.css";
import titaniumSquare from "./evw-titanium-square.module.css";
import titaniumVertical from "./evw-titanium-vertical.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-evw-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-evw-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-evw-mono",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600"],
  variable: "--font-evw-montserrat",
  display: "swap",
});

const fontWrap = `${inter.variable} ${playfair.variable} ${jetbrains.variable} ${montserrat.variable}`;

export const EVW_OVERLAY_JSON_TEMPLATE_ID = "everest-wealth-overlay";
export const EVW_OVERLAY_JSON_VERSION = 1;

export type EvwPresetId =
  | "gold-fintech"
  | "swiss-vault"
  | "cobalt-terminal"
  | "horology-crystal"
  | "titanium-sapphire";

export const EVW_OVERLAY_PRESETS: { id: EvwPresetId; label: string }[] = [
  { id: "gold-fintech", label: "Gold fintech — hero + gold data grid" },
  { id: "swiss-vault", label: "Swiss vault — emerald + Playfair yield card" },
  { id: "cobalt-terminal", label: "Cobalt terminal — HUD + JetBrains specs" },
  {
    id: "horology-crystal",
    label: "Horology / crystal — midnight + Montserrat + Playfair",
  },
  { id: "titanium-sapphire", label: "Titanium & sapphire — glass widget + dashboard" },
];

/* ─── Gold fintech ─── */
const GOLD_KEYS = [
  "trustBadge",
  "brandName",
  "productTitle",
  "tagline",
  "squareTagline",
  "w1Label",
  "w1Value",
  "w1Highlight",
  "w2Label",
  "w2Value",
  "w3Label",
  "w3Value",
  "w4Label",
  "w4Value",
  "spec1Label",
  "spec1Value",
  "spec2Label",
  "spec2Value",
  "spec3Label",
  "spec3Value",
  "ctaLabel",
  "ctaLabelSquare",
] as const;

type GoldCopyKey = (typeof GOLD_KEYS)[number];

const DEFAULT_GOLD: Record<GoldCopyKey, string> = {
  trustBadge: "FSP 795 & 17273",
  brandName: "Everest Wealth",
  productTitle: "Onyx 14.2%",
  tagline:
    "Private equity yields. Monthly liquidity. Shielded from public market volatility.",
  squareTagline:
    "Escape public market volatility. Access institutional private equity yields with zero upfront broker fees.",
  w1Label: "Targeted Yield",
  w1Value: "14.2% P.A.",
  w1Highlight: "true",
  w2Label: "Distribution",
  w2Value: "Monthly",
  w3Label: "Broker Fees",
  w3Value: "0% Upfront",
  w4Label: "Tax Structure",
  w4Value: "20% DWT",
  spec1Label: "Target Yield",
  spec1Value: "14.2% P.A.",
  spec2Label: "Distribution",
  spec2Value: "Monthly Income",
  spec3Label: "Tax Benefit",
  spec3Value: "20% DWT Structure",
  ctaLabel: "Secure Your Capital",
  ctaLabelSquare: "View Portfolio",
};

/* ─── Swiss vault ─── */
const VAULT_KEYS = [
  "brandName",
  "fspBadge",
  "cardSubtitle",
  "yieldMain",
  "yieldPctSymbol",
  "yieldLabel",
  "vSpec1Title",
  "vSpec1Value",
  "vSpec2Title",
  "vSpec2Value",
  "vSpec3Title",
  "vSpec3Value",
  "footerTagline",
  "ctaLabel",
  "portfolioName",
  "yieldLabelSquare",
  "fspFooter",
  "ledger1Title",
  "ledger1Value",
  "ledger2Title",
  "ledger2Value",
  "ledger3Title",
  "ledger3Value",
  "ctaLabelSquare",
] as const;

type VaultCopyKey = (typeof VAULT_KEYS)[number];

const DEFAULT_VAULT: Record<VaultCopyKey, string> = {
  brandName: "Everest Wealth",
  fspBadge: "FSP 795",
  cardSubtitle: "Onyx Income+ Portfolio",
  yieldMain: "14.2",
  yieldPctSymbol: "%",
  yieldLabel: "Targeted Annual Yield",
  vSpec1Title: "Income Distribution",
  vSpec1Value: "Monthly",
  vSpec2Title: "Upfront Broker Fees",
  vSpec2Value: "0.00%",
  vSpec3Title: "Tax Efficiency",
  vSpec3Value: "20% DWT",
  footerTagline:
    "Bypass public market volatility. Access strictly managed private equity.",
  ctaLabel: "Initiate Transfer",
  portfolioName: "Onyx Income+",
  yieldLabelSquare:
    "Targeted Annual Yield.\nShielded from public volatility.",
  fspFooter: "FSP 795 & 17273",
  ledger1Title: "Income Distribution",
  ledger1Value: "Monthly",
  ledger2Title: "Upfront Broker Fees",
  ledger2Value: "0.00%",
  ledger3Title: "Tax Structure",
  ledger3Value: "20% DWT",
  ctaLabelSquare: "Review Portfolio",
};

/* ─── Cobalt terminal ─── */
const COBALT_KEYS = [
  "brandName",
  "licenseBadge",
  "productClass",
  "productTitle",
  "tagline",
  "spec1Label",
  "spec1Value",
  "spec1Highlight",
  "spec2Label",
  "spec2Value",
  "ctaLabel",
  "productTitleLine1",
  "productTitleLine2",
  "squareTagline",
  "d1Label",
  "d1Value",
  "d1Highlight",
  "d2Label",
  "d2Value",
  "d3Label",
  "d3Value",
  "ctaLabelSquare",
] as const;

type CobaltCopyKey = (typeof COBALT_KEYS)[number];

const DEFAULT_COBALT: Record<CobaltCopyKey, string> = {
  brandName: "Everest Wealth",
  licenseBadge: "FSP_795",
  productClass: "Class B Share",
  productTitle: "Strategic Growth 14.5%",
  tagline:
    "Pure capital compounding. Absolute liquidity lock for aggressive multi-year expansion.",
  spec1Label: "Target Return",
  spec1Value: "14.50% P.A.",
  spec1Highlight: "true",
  spec2Label: "Distribution",
  spec2Value: "Maturity (Year 5)",
  ctaLabel: "Initialize Investment",
  productTitleLine1: "Strategic",
  productTitleLine2: "Growth.",
  squareTagline:
    "Zero monthly withdrawals permitted. Built exclusively for aggressive 5-year capital compounding.",
  d1Label: "Target_Yield",
  d1Value: "14.50% P.A.",
  d1Highlight: "true",
  d2Label: "Distribution",
  d2Value: "At Maturity (Yr 5)",
  d3Label: "Upfront_Fees",
  d3Value: "0.00%",
  ctaLabelSquare: "Initialize",
};

/* ─── Horology / crystal ─── */
const HOROLOGY_KEYS = [
  "horologyBrandName",
  "horologyProductName",
  "horologyYieldNumber",
  "horologyYieldLabel",
  "hSpec1Title",
  "hSpec1Value",
  "hSpec2Title",
  "hSpec2Value",
  "hSpec3Title",
  "hSpec3Value",
  "horologyCta",
  "crystalBrandName",
  "crystalProductName",
  "crystalYieldNumber",
  "crystalYieldLabel",
  "crystalCta",
  "crystalFspText",
] as const;

type HorologyCopyKey = (typeof HOROLOGY_KEYS)[number];

const DEFAULT_HOROLOGY: Record<HorologyCopyKey, string> = {
  horologyBrandName: "Everest Private",
  horologyProductName: "The Onyx Portfolio",
  horologyYieldNumber: "14.2%",
  horologyYieldLabel: "Targeted Annual Yield",
  hSpec1Title: "Liquidity",
  hSpec1Value: "Monthly",
  hSpec2Title: "Volatility",
  hSpec2Value: "Uncorrelated",
  hSpec3Title: "Broker Fees",
  hSpec3Value: "0.00%",
  horologyCta: "Request Prospectus",
  crystalBrandName: "Everest Wealth",
  crystalProductName: "The Onyx Income+ Portfolio",
  crystalYieldNumber: "14.2%",
  crystalYieldLabel:
    "Absolute private equity returns.\nZero public market volatility.",
  crystalCta: "Private Access",
  crystalFspText: "Authorised FSP 795 & 17273",
};

/* ─── Titanium ─── */
const TITANIUM_KEYS = [
  "brandName",
  "badge",
  "portfolioName",
  "yieldText",
  "yieldSubtext",
  "tSpec1Label",
  "tSpec1Value",
  "tSpec2Label",
  "tSpec2Value",
  "tSpec3Label",
  "tSpec3Value",
  "ctaLabel",
  "portfolioLabel",
  "yieldNumber",
  "tagline",
  "feeLabel",
  "ctaLabelSquare",
] as const;

type TitaniumCopyKey = (typeof TITANIUM_KEYS)[number];

const DEFAULT_TITANIUM: Record<TitaniumCopyKey, string> = {
  brandName: "Everest Wealth",
  badge: "FSP 795",
  portfolioName: "Onyx Income+",
  yieldText: "14.2%",
  yieldSubtext:
    "Targeted Annual Yield.\nShielded from public volatility.",
  tSpec1Label: "Liquidity",
  tSpec1Value: "Monthly",
  tSpec2Label: "Broker Fees",
  tSpec2Value: "0.00%",
  tSpec3Label: "Tax Base",
  tSpec3Value: "20% DWT",
  ctaLabel: "Initialize Transfer",
  portfolioLabel: "Onyx Income+",
  yieldNumber: "14.2%",
  tagline:
    "Escape market volatility. Access strictly managed private equity with monthly distributions.",
  feeLabel: "0% Upfront Fees",
  ctaLabelSquare: "Review Portfolio",
};

type CopyByPreset = {
  "gold-fintech": Record<GoldCopyKey, string>;
  "swiss-vault": Record<VaultCopyKey, string>;
  "cobalt-terminal": Record<CobaltCopyKey, string>;
  "horology-crystal": Record<HorologyCopyKey, string>;
  "titanium-sapphire": Record<TitaniumCopyKey, string>;
};

function initialCopyByPreset(): CopyByPreset {
  return {
    "gold-fintech": { ...DEFAULT_GOLD },
    "swiss-vault": { ...DEFAULT_VAULT },
    "cobalt-terminal": { ...DEFAULT_COBALT },
    "horology-crystal": { ...DEFAULT_HOROLOGY },
    "titanium-sapphire": { ...DEFAULT_TITANIUM },
  };
}

function keysForPreset(p: EvwPresetId): readonly string[] {
  if (p === "gold-fintech") return GOLD_KEYS;
  if (p === "swiss-vault") return VAULT_KEYS;
  if (p === "cobalt-terminal") return COBALT_KEYS;
  if (p === "horology-crystal") return HOROLOGY_KEYS;
  return TITANIUM_KEYS;
}

function isPresetId(x: unknown): x is EvwPresetId {
  return (
    x === "gold-fintech" ||
    x === "swiss-vault" ||
    x === "cobalt-terminal" ||
    x === "horology-crystal" ||
    x === "titanium-sapphire"
  );
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

function lines(text: string): string[] {
  return text.split("\n").filter(Boolean);
}

function hl(v: string): boolean {
  return v === "true" || v === "1" || v.toLowerCase() === "yes";
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

function exportSlug(p: EvwPresetId): string {
  if (p === "gold-fintech") return "gold";
  if (p === "swiss-vault") return "vault";
  if (p === "cobalt-terminal") return "cobalt";
  if (p === "horology-crystal") return "horology";
  return "titanium";
}

export function EverestWealthOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<EvwPresetId>("gold-fintech");
  const [copyByPreset, setCopyByPreset] = useState<CopyByPreset>(
    initialCopyByPreset,
  );

  const g = copyByPreset["gold-fintech"];
  const v = copyByPreset["swiss-vault"];
  const c = copyByPreset["cobalt-terminal"];
  const h = copyByPreset["horology-crystal"];
  const t = copyByPreset["titanium-sapphire"];

  const patchGold = useCallback((key: GoldCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "gold-fintech": { ...prev["gold-fintech"], [key]: value },
    }));
  }, []);

  const patchVault = useCallback((key: VaultCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "swiss-vault": { ...prev["swiss-vault"], [key]: value },
    }));
  }, []);

  const patchCobalt = useCallback((key: CobaltCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "cobalt-terminal": { ...prev["cobalt-terminal"], [key]: value },
    }));
  }, []);

  const patchHorology = useCallback((key: HorologyCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "horology-crystal": { ...prev["horology-crystal"], [key]: value },
    }));
  }, []);

  const patchTitanium = useCallback((key: TitaniumCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "titanium-sapphire": { ...prev["titanium-sapphire"], [key]: value },
    }));
  }, []);

  const [bgSquareDataUrl, setBgSquareDataUrl] = useState<string | null>(null);
  const [bgVerticalDataUrl, setBgVerticalDataUrl] = useState<string | null>(
    null,
  );
  const [vaultTextureUrl, setVaultTextureUrl] = useState<string | null>(null);

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
          template: EVW_OVERLAY_JSON_TEMPLATE_ID,
          version: EVW_OVERLAY_JSON_VERSION,
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
      tmpl !== EVW_OVERLAY_JSON_TEMPLATE_ID
    ) {
      setJsonError(
        `Unknown template "${tmpl}". Use ${EVW_OVERLAY_JSON_TEMPLATE_ID}.`,
      );
      return;
    }

    const targetPreset: EvwPresetId = isPresetId(root?.preset)
      ? root.preset
      : preset;

    const keys = keysForPreset(targetPreset);
    const picked: Record<string, string> = {};
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(block, key)) {
        const val = block[key];
        picked[key] = val == null ? "" : String(val);
      }
    }
    if (!Object.keys(picked).length) {
      setJsonError(`No recognised fields. Try: ${keys.slice(0, 6).join(", ")}…`);
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

  const onPickVaultTexture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    readFileAsDataUrl(file, setVaultTextureUrl);
  };

  const clearVaultTexture = () => setVaultTextureUrl(null);

  const resetCopy = () => {
    setCopyByPreset((prev) => ({
      ...prev,
      [preset]:
        preset === "gold-fintech"
          ? { ...DEFAULT_GOLD }
          : preset === "swiss-vault"
            ? { ...DEFAULT_VAULT }
            : preset === "cobalt-terminal"
              ? { ...DEFAULT_COBALT }
              : preset === "horology-crystal"
                ? { ...DEFAULT_HOROLOGY }
                : { ...DEFAULT_TITANIUM },
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
      a.download = `evw-${slug}-square-1080-${Date.now()}.png`;
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
      a.download = `evw-${slug}-vertical-9x16-${Date.now()}.png`;
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

  const vaultTexture =
    preset === "swiss-vault" && vaultTextureUrl ? vaultTextureUrl : null;

  const squareCanvas =
    preset === "gold-fintech" ? (
      <div
        ref={squareRef}
        className={`${fontWrap} ${goldSquare.root}`}
        aria-label="Everest gold fintech square"
      >
        <div className={goldSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={goldSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={goldSquare.fadeLayer} aria-hidden />
          <div className={goldSquare.goldAura} aria-hidden />
          <div className={goldSquare.content}>
            <div className={goldSquare.trustBadge}>{g.trustBadge}</div>
            <div className={goldSquare.brandName}>{g.brandName}</div>
            <h1 className={goldSquare.productTitle}>{g.productTitle}</h1>
            <p className={goldSquare.tagline}>{g.squareTagline}</p>
            <div className={goldSquare.specList}>
              <div className={goldSquare.specItem}>
                <span className={goldSquare.specLabel}>{g.spec1Label}</span>
                <span
                  className={`${goldSquare.specValue} ${hl(g.w1Highlight) ? goldSquare.highlight : ""}`}
                >
                  {g.spec1Value}
                </span>
              </div>
              <div className={goldSquare.specItem}>
                <span className={goldSquare.specLabel}>{g.spec2Label}</span>
                <span className={goldSquare.specValue}>{g.spec2Value}</span>
              </div>
              <div className={goldSquare.specItem}>
                <span className={goldSquare.specLabel}>{g.spec3Label}</span>
                <span className={goldSquare.specValue}>{g.spec3Value}</span>
              </div>
            </div>
            <button type="button" className={goldSquare.ctaBtn}>
              {g.ctaLabelSquare}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "swiss-vault" ? (
      <div
        ref={squareRef}
        className={`${fontWrap} ${vaultSquare.root}`}
        aria-label="Everest Swiss vault square"
      >
        <div className={vaultSquare.adCanvas}>
          {vaultTexture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={vaultSquare.textureLayer}
              src={vaultTexture}
              alt=""
              style={{ objectFit: "cover" }}
            />
          ) : null}
          <div className={vaultSquare.leftPanel}>
            <div className={vaultSquare.brandName}>{v.brandName}</div>
            <div className={vaultSquare.yieldContainer}>
              <div className={vaultSquare.portfolioName}>{v.portfolioName}</div>
              <div className={vaultSquare.yieldNumber}>
                {v.yieldMain}
                <span className={vaultSquare.yieldPercent}>
                  {v.yieldPctSymbol}
                </span>
              </div>
              <div className={vaultSquare.yieldLabel}>
                {lines(v.yieldLabelSquare).map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < lines(v.yieldLabelSquare).length - 1 ? <br /> : null}
                  </span>
                ))}
              </div>
            </div>
            <div className={vaultSquare.fspFooter}>{v.fspFooter}</div>
          </div>
          <div className={vaultSquare.rightPanel}>
            <div className={vaultSquare.ledgerTable}>
              <div className={vaultSquare.ledgerRow}>
                <span className={vaultSquare.ledgerTitle}>{v.ledger1Title}</span>
                <span className={vaultSquare.ledgerValue}>{v.ledger1Value}</span>
              </div>
              <div className={vaultSquare.ledgerRow}>
                <span className={vaultSquare.ledgerTitle}>{v.ledger2Title}</span>
                <span className={vaultSquare.ledgerValue}>{v.ledger2Value}</span>
              </div>
              <div
                className={`${vaultSquare.ledgerRow} ${vaultSquare.ledgerRowLast}`}
              >
                <span className={vaultSquare.ledgerTitle}>{v.ledger3Title}</span>
                <span className={vaultSquare.ledgerValue}>{v.ledger3Value}</span>
              </div>
            </div>
            <button type="button" className={vaultSquare.ctaBtn}>
              {v.ctaLabelSquare}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "cobalt-terminal" ? (
      <div
        ref={squareRef}
        className={`${fontWrap} ${cobaltSquare.root}`}
        aria-label="Everest cobalt terminal square"
      >
        <div className={cobaltSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={cobaltSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={cobaltSquare.fadeLayer} aria-hidden />
          <div className={cobaltSquare.cobaltAura} aria-hidden />
          <div className={cobaltSquare.content}>
            <div className={cobaltSquare.systemHeader}>
              <div className={cobaltSquare.brandName}>{c.brandName}</div>
              <div className={cobaltSquare.licenseBadge}>{c.licenseBadge}</div>
            </div>
            <div className={cobaltSquare.productClass}>{c.productClass}</div>
            <h1 className={cobaltSquare.productTitle}>
              <span className={cobaltSquare.titleLine}>{c.productTitleLine1}</span>
              <span className={cobaltSquare.titleLine}>{c.productTitleLine2}</span>
            </h1>
            <p className={cobaltSquare.tagline}>{c.squareTagline}</p>
            <div className={cobaltSquare.dataGrid}>
              <div className={cobaltSquare.dataRow}>
                <span className={cobaltSquare.dataLabel}>{c.d1Label}</span>
                <span
                  className={`${cobaltSquare.dataValue} ${hl(c.d1Highlight) ? cobaltSquare.highlight : ""}`}
                >
                  {c.d1Value}
                </span>
              </div>
              <div className={cobaltSquare.dataRow}>
                <span className={cobaltSquare.dataLabel}>{c.d2Label}</span>
                <span className={cobaltSquare.dataValue}>{c.d2Value}</span>
              </div>
              <div className={cobaltSquare.dataRow}>
                <span className={cobaltSquare.dataLabel}>{c.d3Label}</span>
                <span className={cobaltSquare.dataValue}>{c.d3Value}</span>
              </div>
            </div>
            <button type="button" className={cobaltSquare.ctaBtn}>
              {c.ctaLabelSquare}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "horology-crystal" ? (
      <div
        ref={squareRef}
        className={`${fontWrap} ${horologySquare.root}`}
        aria-label="Everest crystal plaque square"
      >
        <div className={horologySquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={horologySquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={horologySquare.vignette} aria-hidden />
          <div className={horologySquare.crystalCard}>
            <div className={horologySquare.brandName}>{h.crystalBrandName}</div>
            <div className={horologySquare.productName}>{h.crystalProductName}</div>
            <div className={horologySquare.yieldNumber}>{h.crystalYieldNumber}</div>
            <div className={horologySquare.yieldLabel}>
              {lines(h.crystalYieldLabel).map((line, i) => (
                <span key={i}>
                  {line}
                  {i < lines(h.crystalYieldLabel).length - 1 ? <br /> : null}
                </span>
              ))}
            </div>
            <button type="button" className={horologySquare.ctaBtn}>
              {h.crystalCta}
            </button>
            <div className={horologySquare.fspText}>{h.crystalFspText}</div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={squareRef}
        className={`${fontWrap} ${titaniumSquare.root}`}
        aria-label="Everest titanium sapphire square"
      >
        <div className={titaniumSquare.adCanvas}>
          <div className={titaniumSquare.ambientGlow} aria-hidden />
          <div className={titaniumSquare.dashboardUi}>
            <div className={titaniumSquare.header}>
              <span className={titaniumSquare.brandName}>{t.brandName}</span>
              <span className={titaniumSquare.badge}>{t.badge}</span>
            </div>
            <div className={titaniumSquare.dataDisplay}>
              <span className={titaniumSquare.portfolioLabel}>
                {t.portfolioLabel}
              </span>
              <h1 className={titaniumSquare.yieldNumber}>{t.yieldNumber}</h1>
              <p className={titaniumSquare.tagline}>{t.tagline}</p>
            </div>
            <div className={titaniumSquare.actionRow}>
              <button type="button" className={titaniumSquare.ctaBtn}>
                {t.ctaLabelSquare}
              </button>
              <span className={titaniumSquare.feeLabel}>{t.feeLabel}</span>
            </div>
          </div>
          <div className={titaniumSquare.imageWidget}>
            {bgSquareDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={titaniumSquare.imageWidgetImg}
                src={bgSquareDataUrl}
                alt=""
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#1a1a1c",
                  borderRadius: "inherit",
                }}
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>
    );

  const verticalCanvas =
    preset === "gold-fintech" ? (
      <div
        ref={verticalRef}
        className={`${fontWrap} ${goldVertical.root}`}
        aria-label="Everest gold fintech vertical"
      >
        <div className={goldVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={goldVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={goldVertical.goldAura} aria-hidden />
          <div className={goldVertical.trustBadge}>{g.trustBadge}</div>
          <div className={goldVertical.content}>
            <div className={goldVertical.brandName}>{g.brandName}</div>
            <h1 className={goldVertical.productTitle}>{g.productTitle}</h1>
            <p className={goldVertical.tagline}>{g.tagline}</p>
            <div className={goldVertical.dataGrid}>
              {[
                [g.w1Label, g.w1Value, g.w1Highlight],
                [g.w2Label, g.w2Value, "false"],
                [g.w3Label, g.w3Value, "false"],
                [g.w4Label, g.w4Value, "false"],
              ].map(([lab, val, hi], i) => (
                <div key={i} className={goldVertical.dataWidget}>
                  <span className={goldVertical.widgetLabel}>{lab}</span>
                  <span
                    className={`${goldVertical.widgetValue} ${hl(hi as string) ? goldVertical.widgetHighlight : ""}`}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <div className={goldVertical.actionRow}>
              <button type="button" className={goldVertical.ctaBtn}>
                {g.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "swiss-vault" ? (
      <div
        ref={verticalRef}
        className={`${fontWrap} ${vaultVertical.root}`}
        aria-label="Everest Swiss vault vertical"
      >
        <div className={vaultVertical.adCanvas}>
          {vaultTexture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={vaultVertical.textureLayer}
              src={vaultTexture}
              alt=""
              style={{ objectFit: "cover" }}
            />
          ) : null}
          <div className={vaultVertical.header}>
            <div className={vaultVertical.brandName}>{v.brandName}</div>
            <div className={vaultVertical.fspBadge}>{v.fspBadge}</div>
          </div>
          <div className={vaultVertical.vaultCard}>
            <div className={vaultVertical.cardSubtitle}>{v.cardSubtitle}</div>
            <div className={vaultVertical.yieldRow}>
              <span className={vaultVertical.yieldNumber}>{v.yieldMain}</span>
              <span className={vaultVertical.yieldPct}>{v.yieldPctSymbol}</span>
            </div>
            <div className={vaultVertical.yieldLabel}>{v.yieldLabel}</div>
            <div className={vaultVertical.divider} aria-hidden />
            <div className={vaultVertical.ledgerSpecs}>
              <div className={vaultVertical.specRow}>
                <span className={vaultVertical.specTitle}>{v.vSpec1Title}</span>
                <span className={vaultVertical.specValue}>{v.vSpec1Value}</span>
              </div>
              <div className={vaultVertical.specRow}>
                <span className={vaultVertical.specTitle}>{v.vSpec2Title}</span>
                <span className={vaultVertical.specValue}>{v.vSpec2Value}</span>
              </div>
              <div className={vaultVertical.specRow}>
                <span className={vaultVertical.specTitle}>{v.vSpec3Title}</span>
                <span className={vaultVertical.specValue}>{v.vSpec3Value}</span>
              </div>
            </div>
          </div>
          <div className={vaultVertical.footer}>
            <p className={vaultVertical.tagline}>{v.footerTagline}</p>
            <button type="button" className={vaultVertical.ctaBtn}>
              {v.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "cobalt-terminal" ? (
      <div
        ref={verticalRef}
        className={`${fontWrap} ${cobaltVertical.root}`}
        aria-label="Everest cobalt vertical"
      >
        <div className={cobaltVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={cobaltVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={cobaltVertical.gradientFloor} aria-hidden />
          <div className={cobaltVertical.topHud}>
            <div className={cobaltVertical.brandName}>{c.brandName}</div>
            <div className={cobaltVertical.licenseBadge}>{c.licenseBadge}</div>
          </div>
          <div className={cobaltVertical.content}>
            <div className={cobaltVertical.accentLine} aria-hidden />
            <div className={cobaltVertical.productClass}>{c.productClass}</div>
            <h1 className={cobaltVertical.productTitle}>{c.productTitle}</h1>
            <p className={cobaltVertical.tagline}>{c.tagline}</p>
            <div className={cobaltVertical.specContainer}>
              <div className={cobaltVertical.specItem}>
                <span className={cobaltVertical.specLabel}>{c.spec1Label}</span>
                <span
                  className={`${cobaltVertical.specValue} ${hl(c.spec1Highlight) ? cobaltVertical.highlight : ""}`}
                >
                  {c.spec1Value}
                </span>
              </div>
              <div className={cobaltVertical.specItem}>
                <span className={cobaltVertical.specLabel}>{c.spec2Label}</span>
                <span className={cobaltVertical.specValue}>{c.spec2Value}</span>
              </div>
            </div>
            <button type="button" className={cobaltVertical.ctaBtn}>
              {c.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    ) : preset === "horology-crystal" ? (
      <div
        ref={verticalRef}
        className={`${fontWrap} ${horologyVertical.root}`}
        aria-label="Everest horology vertical"
      >
        <div className={horologyVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={horologyVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={horologyVertical.innerBezel} aria-hidden />
          <div className={horologyVertical.vignette} aria-hidden />
          <div className={horologyVertical.content}>
            <div className={horologyVertical.brandBlock}>
              <span className={horologyVertical.brandName}>
                {h.horologyBrandName}
              </span>
              <div className={horologyVertical.brandLine} aria-hidden />
            </div>
            <div className={horologyVertical.offerBlock}>
              <div className={horologyVertical.productName}>
                {h.horologyProductName}
              </div>
              <div className={horologyVertical.yieldNumber}>
                {h.horologyYieldNumber}
              </div>
              <div className={horologyVertical.yieldLabel}>
                {h.horologyYieldLabel}
              </div>
            </div>
            <div className={horologyVertical.detailsBlock}>
              <div className={horologyVertical.specList}>
                <div className={horologyVertical.specItem}>
                  <span className={horologyVertical.specTitle}>
                    {h.hSpec1Title}
                  </span>
                  <span className={horologyVertical.specValue}>
                    {h.hSpec1Value}
                  </span>
                </div>
                <div className={horologyVertical.specItem}>
                  <span className={horologyVertical.specTitle}>
                    {h.hSpec2Title}
                  </span>
                  <span className={horologyVertical.specValue}>
                    {h.hSpec2Value}
                  </span>
                </div>
                <div className={horologyVertical.specItem}>
                  <span className={horologyVertical.specTitle}>
                    {h.hSpec3Title}
                  </span>
                  <span className={horologyVertical.specValue}>
                    {h.hSpec3Value}
                  </span>
                </div>
              </div>
              <button type="button" className={horologyVertical.ctaBtn}>
                {h.horologyCta}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={verticalRef}
        className={`${fontWrap} ${titaniumVertical.root}`}
        aria-label="Everest titanium vertical"
      >
        <div className={titaniumVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={titaniumVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={titaniumVertical.fadeFloor} aria-hidden />
          <div className={titaniumVertical.techGlow} aria-hidden />
          <div className={titaniumVertical.topBar}>
            <span className={titaniumVertical.brandName}>{t.brandName}</span>
            <span className={titaniumVertical.badge}>{t.badge}</span>
          </div>
          <div className={titaniumVertical.widgetCard}>
            <div className={titaniumVertical.portfolioName}>{t.portfolioName}</div>
            <div className={titaniumVertical.yieldText}>{t.yieldText}</div>
            <p className={titaniumVertical.yieldSubtext}>
              {lines(t.yieldSubtext).map((line, i) => (
                <span key={i}>
                  {line}
                  {i < lines(t.yieldSubtext).length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <div className={titaniumVertical.specsRow}>
              <div className={titaniumVertical.spec}>
                <span className={titaniumVertical.specLabel}>
                  {t.tSpec1Label}
                </span>
                <span className={titaniumVertical.specValue}>
                  {t.tSpec1Value}
                </span>
              </div>
              <div className={titaniumVertical.spec}>
                <span className={titaniumVertical.specLabel}>
                  {t.tSpec2Label}
                </span>
                <span className={titaniumVertical.specValue}>
                  {t.tSpec2Value}
                </span>
              </div>
              <div className={titaniumVertical.spec}>
                <span className={titaniumVertical.specLabel}>
                  {t.tSpec3Label}
                </span>
                <span className={titaniumVertical.specValue}>
                  {t.tSpec3Value}
                </span>
              </div>
            </div>
            <button type="button" className={titaniumVertical.ctaBtn}>
              {t.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    );

  const previewLabel = EVW_OVERLAY_PRESETS.find((x) => x.id === preset)?.label ?? "";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[min(100%,400px)]">
        <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Template preset
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as EvwPresetId)}
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {EVW_OVERLAY_PRESETS.map((p) => (
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
                onClick={() => {
                  setBgSquareDataUrl(null);
                  if (squareFileRef.current) squareFileRef.current.value = "";
                }}
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
                onClick={() => {
                  setBgVerticalDataUrl(null);
                  if (verticalFileRef.current) verticalFileRef.current.value = "";
                }}
                className="text-xs text-[#8E8E93] underline hover:text-white"
              >
                Remove vertical image
              </button>
            ) : null}
          </div>
          {preset === "swiss-vault" ? (
            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="text-xs text-[#8E8E93]">
                Swiss vault texture (both ratios; optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onPickVaultTexture}
                className="block w-full text-sm text-[#8E8E93] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
              />
              {vaultTextureUrl ? (
                <button
                  type="button"
                  onClick={clearVaultTexture}
                  className="text-xs text-[#8E8E93] underline hover:text-white"
                >
                  Remove texture
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <EvwFields
          preset={preset}
          g={g}
          v={v}
          c={c}
          h={h}
          t={t}
          patchGold={patchGold}
          patchVault={patchVault}
          patchCobalt={patchCobalt}
          patchHorology={patchHorology}
          patchTitanium={patchTitanium}
        />

        <div className="space-y-3 rounded-md border border-amber-500/25 bg-amber-500/[0.07] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-200/90">
            JSON
          </p>
          <p className="text-xs text-[#8E8E93]">
            <code className="text-white/80">{EVW_OVERLAY_JSON_TEMPLATE_ID}</code>{" "}
            · v{EVW_OVERLAY_JSON_VERSION} · include{" "}
            <code className="text-white/80">preset</code> when applying.
          </p>
          <button
            type="button"
            onClick={copyJsonToClipboard}
            className="rounded-md bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-500/30"
          >
            {copyFlash ? "Copied" : "Copy JSON"}
          </button>
          <textarea
            readOnly
            value={exportJson}
            rows={18}
            className="w-full resize-y rounded-md border border-white/15 bg-black/60 px-2 py-2 font-mono text-[11px] leading-relaxed text-[#D1D1D6] focus:outline-none"
            spellCheck={false}
          />
          <textarea
            value={jsonPaste}
            onChange={(ev) => {
              setJsonPaste(ev.target.value);
              setJsonError(null);
            }}
            rows={6}
            placeholder={`{ "template": "${EVW_OVERLAY_JSON_TEMPLATE_ID}", "preset": "gold-fintech", "copy": { } }`}
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
              <span className="text-xs text-amber-300">Applied.</span>
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

function EvwFields({
  preset,
  g,
  v,
  c,
  h,
  t,
  patchGold,
  patchVault,
  patchCobalt,
  patchHorology,
  patchTitanium,
}: {
  preset: EvwPresetId;
  g: Record<GoldCopyKey, string>;
  v: Record<VaultCopyKey, string>;
  c: Record<CobaltCopyKey, string>;
  h: Record<HorologyCopyKey, string>;
  t: Record<TitaniumCopyKey, string>;
  patchGold: (k: GoldCopyKey, v: string) => void;
  patchVault: (k: VaultCopyKey, v: string) => void;
  patchCobalt: (k: CobaltCopyKey, v: string) => void;
  patchHorology: (k: HorologyCopyKey, v: string) => void;
  patchTitanium: (k: TitaniumCopyKey, v: string) => void;
}) {
  if (preset === "gold-fintech") {
    return (
      <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
        <Field label="Trust badge (centred)" value={g.trustBadge} onChange={(x) => patchGold("trustBadge", x)} />
        <Field label="Brand name" value={g.brandName} onChange={(x) => patchGold("brandName", x)} />
        <Field label="Product title" value={g.productTitle} onChange={(x) => patchGold("productTitle", x)} />
        <Field label="Tagline (vertical)" value={g.tagline} onChange={(x) => patchGold("tagline", x)} rows={3} />
        <Field label="Tagline (square)" value={g.squareTagline} onChange={(x) => patchGold("squareTagline", x)} rows={3} />
        <p className="text-xs text-[#8E8E93]">Widgets (vertical 2×2)</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="W1 label" value={g.w1Label} onChange={(x) => patchGold("w1Label", x)} />
          <Field label="W1 value" value={g.w1Value} onChange={(x) => patchGold("w1Value", x)} />
          <Field label="W1 highlight (true/false)" value={g.w1Highlight} onChange={(x) => patchGold("w1Highlight", x)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="W2 label" value={g.w2Label} onChange={(x) => patchGold("w2Label", x)} />
          <Field label="W2 value" value={g.w2Value} onChange={(x) => patchGold("w2Value", x)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="W3 label" value={g.w3Label} onChange={(x) => patchGold("w3Label", x)} />
          <Field label="W3 value" value={g.w3Value} onChange={(x) => patchGold("w3Value", x)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="W4 label" value={g.w4Label} onChange={(x) => patchGold("w4Label", x)} />
          <Field label="W4 value" value={g.w4Value} onChange={(x) => patchGold("w4Value", x)} />
        </div>
        <p className="text-xs text-[#8E8E93]">Spec list (square)</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Spec 1 label" value={g.spec1Label} onChange={(x) => patchGold("spec1Label", x)} />
          <Field label="Spec 1 value" value={g.spec1Value} onChange={(x) => patchGold("spec1Value", x)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Spec 2 label" value={g.spec2Label} onChange={(x) => patchGold("spec2Label", x)} />
          <Field label="Spec 2 value" value={g.spec2Value} onChange={(x) => patchGold("spec2Value", x)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Spec 3 label" value={g.spec3Label} onChange={(x) => patchGold("spec3Label", x)} />
          <Field label="Spec 3 value" value={g.spec3Value} onChange={(x) => patchGold("spec3Value", x)} />
        </div>
        <Field label="CTA (vertical)" value={g.ctaLabel} onChange={(x) => patchGold("ctaLabel", x)} />
        <Field label="CTA (square)" value={g.ctaLabelSquare} onChange={(x) => patchGold("ctaLabelSquare", x)} />
      </div>
    );
  }
  if (preset === "swiss-vault") {
    return (
      <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
        <Field label="Brand name" value={v.brandName} onChange={(x) => patchVault("brandName", x)} />
        <Field label="FSP badge (header)" value={v.fspBadge} onChange={(x) => patchVault("fspBadge", x)} />
        <Field label="Card subtitle" value={v.cardSubtitle} onChange={(x) => patchVault("cardSubtitle", x)} />
        <Field label="Yield number (main)" value={v.yieldMain} onChange={(x) => patchVault("yieldMain", x)} />
        <Field label="Yield % symbol" value={v.yieldPctSymbol} onChange={(x) => patchVault("yieldPctSymbol", x)} />
        <Field label="Yield label (under number)" value={v.yieldLabel} onChange={(x) => patchVault("yieldLabel", x)} />
        <Field label="Vault spec 1 title" value={v.vSpec1Title} onChange={(x) => patchVault("vSpec1Title", x)} />
        <Field label="Vault spec 1 value" value={v.vSpec1Value} onChange={(x) => patchVault("vSpec1Value", x)} />
        <Field label="Vault spec 2 title" value={v.vSpec2Title} onChange={(x) => patchVault("vSpec2Title", x)} />
        <Field label="Vault spec 2 value" value={v.vSpec2Value} onChange={(x) => patchVault("vSpec2Value", x)} />
        <Field label="Vault spec 3 title" value={v.vSpec3Title} onChange={(x) => patchVault("vSpec3Title", x)} />
        <Field label="Vault spec 3 value" value={v.vSpec3Value} onChange={(x) => patchVault("vSpec3Value", x)} />
        <Field label="Footer tagline" value={v.footerTagline} onChange={(x) => patchVault("footerTagline", x)} rows={2} />
        <Field label="CTA (vertical)" value={v.ctaLabel} onChange={(x) => patchVault("ctaLabel", x)} />
        <p className="text-xs font-medium text-[#8E8E93] pt-2 border-t border-white/10">Square</p>
        <Field label="Portfolio name" value={v.portfolioName} onChange={(x) => patchVault("portfolioName", x)} />
        <Field label="Yield label (square, line breaks)" value={v.yieldLabelSquare} onChange={(x) => patchVault("yieldLabelSquare", x)} rows={3} />
        <Field label="FSP footer (left column)" value={v.fspFooter} onChange={(x) => patchVault("fspFooter", x)} />
        <Field label="Ledger 1 title" value={v.ledger1Title} onChange={(x) => patchVault("ledger1Title", x)} />
        <Field label="Ledger 1 value" value={v.ledger1Value} onChange={(x) => patchVault("ledger1Value", x)} />
        <Field label="Ledger 2 title" value={v.ledger2Title} onChange={(x) => patchVault("ledger2Title", x)} />
        <Field label="Ledger 2 value" value={v.ledger2Value} onChange={(x) => patchVault("ledger2Value", x)} />
        <Field label="Ledger 3 title" value={v.ledger3Title} onChange={(x) => patchVault("ledger3Title", x)} />
        <Field label="Ledger 3 value" value={v.ledger3Value} onChange={(x) => patchVault("ledger3Value", x)} />
        <Field label="CTA (square)" value={v.ctaLabelSquare} onChange={(x) => patchVault("ctaLabelSquare", x)} />
      </div>
    );
  }
  if (preset === "cobalt-terminal") {
    return (
      <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
        <Field label="Brand name" value={c.brandName} onChange={(x) => patchCobalt("brandName", x)} />
        <Field label="License badge" value={c.licenseBadge} onChange={(x) => patchCobalt("licenseBadge", x)} />
        <Field label="Product class" value={c.productClass} onChange={(x) => patchCobalt("productClass", x)} />
        <Field label="Product title (vertical, one line)" value={c.productTitle} onChange={(x) => patchCobalt("productTitle", x)} />
        <Field label="Tagline (vertical)" value={c.tagline} onChange={(x) => patchCobalt("tagline", x)} rows={2} />
        <Field label="Spec 1 label" value={c.spec1Label} onChange={(x) => patchCobalt("spec1Label", x)} />
        <Field label="Spec 1 value" value={c.spec1Value} onChange={(x) => patchCobalt("spec1Value", x)} />
        <Field label="Spec 1 highlight (true/false)" value={c.spec1Highlight} onChange={(x) => patchCobalt("spec1Highlight", x)} />
        <Field label="Spec 2 label" value={c.spec2Label} onChange={(x) => patchCobalt("spec2Label", x)} />
        <Field label="Spec 2 value" value={c.spec2Value} onChange={(x) => patchCobalt("spec2Value", x)} />
        <Field label="CTA (vertical)" value={c.ctaLabel} onChange={(x) => patchCobalt("ctaLabel", x)} />
        <p className="text-xs font-medium text-[#8E8E93] pt-2 border-t border-white/10">Square terminal</p>
        <Field label="Title line 1" value={c.productTitleLine1} onChange={(x) => patchCobalt("productTitleLine1", x)} />
        <Field label="Title line 2" value={c.productTitleLine2} onChange={(x) => patchCobalt("productTitleLine2", x)} />
        <Field label="Tagline" value={c.squareTagline} onChange={(x) => patchCobalt("squareTagline", x)} rows={3} />
        <Field label="Data row 1 label" value={c.d1Label} onChange={(x) => patchCobalt("d1Label", x)} />
        <Field label="Data row 1 value" value={c.d1Value} onChange={(x) => patchCobalt("d1Value", x)} />
        <Field label="Data row 1 highlight (true/false)" value={c.d1Highlight} onChange={(x) => patchCobalt("d1Highlight", x)} />
        <Field label="Data row 2 label" value={c.d2Label} onChange={(x) => patchCobalt("d2Label", x)} />
        <Field label="Data row 2 value" value={c.d2Value} onChange={(x) => patchCobalt("d2Value", x)} />
        <Field label="Data row 3 label" value={c.d3Label} onChange={(x) => patchCobalt("d3Label", x)} />
        <Field label="Data row 3 value" value={c.d3Value} onChange={(x) => patchCobalt("d3Value", x)} />
        <Field label="CTA (square)" value={c.ctaLabelSquare} onChange={(x) => patchCobalt("ctaLabelSquare", x)} />
      </div>
    );
  }
  if (preset === "horology-crystal") {
    return (
      <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
        <p className="text-xs font-medium text-[#8E8E93]">Vertical (horology)</p>
        <Field label="Brand name" value={h.horologyBrandName} onChange={(x) => patchHorology("horologyBrandName", x)} />
        <Field label="Product name" value={h.horologyProductName} onChange={(x) => patchHorology("horologyProductName", x)} />
        <Field label="Yield number" value={h.horologyYieldNumber} onChange={(x) => patchHorology("horologyYieldNumber", x)} />
        <Field label="Yield label" value={h.horologyYieldLabel} onChange={(x) => patchHorology("horologyYieldLabel", x)} />
        <Field label="Spec 1 title" value={h.hSpec1Title} onChange={(x) => patchHorology("hSpec1Title", x)} />
        <Field label="Spec 1 value" value={h.hSpec1Value} onChange={(x) => patchHorology("hSpec1Value", x)} />
        <Field label="Spec 2 title" value={h.hSpec2Title} onChange={(x) => patchHorology("hSpec2Title", x)} />
        <Field label="Spec 2 value" value={h.hSpec2Value} onChange={(x) => patchHorology("hSpec2Value", x)} />
        <Field label="Spec 3 title" value={h.hSpec3Title} onChange={(x) => patchHorology("hSpec3Title", x)} />
        <Field label="Spec 3 value" value={h.hSpec3Value} onChange={(x) => patchHorology("hSpec3Value", x)} />
        <Field label="CTA (vertical)" value={h.horologyCta} onChange={(x) => patchHorology("horologyCta", x)} />
        <p className="text-xs font-medium text-[#8E8E93] pt-2 border-t border-white/10">Square (crystal)</p>
        <Field label="Brand name" value={h.crystalBrandName} onChange={(x) => patchHorology("crystalBrandName", x)} />
        <Field label="Product name" value={h.crystalProductName} onChange={(x) => patchHorology("crystalProductName", x)} />
        <Field label="Yield number" value={h.crystalYieldNumber} onChange={(x) => patchHorology("crystalYieldNumber", x)} />
        <Field label="Yield label (line breaks OK)" value={h.crystalYieldLabel} onChange={(x) => patchHorology("crystalYieldLabel", x)} rows={3} />
        <Field label="CTA" value={h.crystalCta} onChange={(x) => patchHorology("crystalCta", x)} />
        <Field label="FSP footer" value={h.crystalFspText} onChange={(x) => patchHorology("crystalFspText", x)} />
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
      <p className="text-xs font-medium text-[#8E8E93]">Vertical widget</p>
      <Field label="Brand name" value={t.brandName} onChange={(x) => patchTitanium("brandName", x)} />
      <Field label="Badge" value={t.badge} onChange={(x) => patchTitanium("badge", x)} />
      <Field label="Portfolio name" value={t.portfolioName} onChange={(x) => patchTitanium("portfolioName", x)} />
      <Field label="Yield text" value={t.yieldText} onChange={(x) => patchTitanium("yieldText", x)} />
      <Field label="Yield subtext (line breaks)" value={t.yieldSubtext} onChange={(x) => patchTitanium("yieldSubtext", x)} rows={2} />
      <Field label="Spec 1 label" value={t.tSpec1Label} onChange={(x) => patchTitanium("tSpec1Label", x)} />
      <Field label="Spec 1 value" value={t.tSpec1Value} onChange={(x) => patchTitanium("tSpec1Value", x)} />
      <Field label="Spec 2 label" value={t.tSpec2Label} onChange={(x) => patchTitanium("tSpec2Label", x)} />
      <Field label="Spec 2 value" value={t.tSpec2Value} onChange={(x) => patchTitanium("tSpec2Value", x)} />
      <Field label="Spec 3 label" value={t.tSpec3Label} onChange={(x) => patchTitanium("tSpec3Label", x)} />
      <Field label="Spec 3 value" value={t.tSpec3Value} onChange={(x) => patchTitanium("tSpec3Value", x)} />
      <Field label="CTA (vertical)" value={t.ctaLabel} onChange={(x) => patchTitanium("ctaLabel", x)} />
      <p className="text-xs font-medium text-[#8E8E93] pt-2 border-t border-white/10">Square dashboard</p>
      <Field label="Portfolio label" value={t.portfolioLabel} onChange={(x) => patchTitanium("portfolioLabel", x)} />
      <Field label="Yield number" value={t.yieldNumber} onChange={(x) => patchTitanium("yieldNumber", x)} />
      <Field label="Tagline" value={t.tagline} onChange={(x) => patchTitanium("tagline", x)} rows={3} />
      <Field label="Fee label" value={t.feeLabel} onChange={(x) => patchTitanium("feeLabel", x)} />
      <Field label="CTA (square)" value={t.ctaLabelSquare} onChange={(x) => patchTitanium("ctaLabelSquare", x)} />
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
  if (!label) {
    return rows > 1 ? (
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
    );
  }
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

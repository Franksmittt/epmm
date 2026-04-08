"use client";

import { Inter } from "next/font/google";
import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import framedSquare from "./emm-framed-square.module.css";
import framedVertical from "./emm-framed-vertical.module.css";
import cinematicSquare from "./emm-cinematic-square.module.css";
import cinematicVertical from "./emm-cinematic-vertical.module.css";
import tactileSquare from "./emm-tactile-square.module.css";
import tactileVertical from "./emm-tactile-vertical.module.css";
import floatingSquare from "./emm-floating-square.module.css";
import floatingVertical from "./emm-floating-vertical.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-emm-framed",
  display: "swap",
});

export const EMM_OVERLAY_JSON_TEMPLATE_ID = "endpoint-media-overlay";
/** Legacy exports (v1) used this id without preset. */
export const EMM_LEGACY_TEMPLATE_ID = "endpoint-media-framed-overlay";
export const EMM_OVERLAY_JSON_VERSION = 2;

export type EmmOverlayPresetId =
  | "framed-glass"
  | "cinematic-aura"
  | "tactile-hud"
  | "floating-slate";

export const EMM_OVERLAY_PRESETS: { id: EmmOverlayPresetId; label: string }[] =
  [
    {
      id: "framed-glass",
      label: "Framed glass — OLED pill + squircle footer",
    },
    {
      id: "cinematic-aura",
      label: "Cinematic aura — full bleed + cyan glow floor",
    },
    {
      id: "tactile-hud",
      label: "Tactile HUD — top pill + glass widget cluster",
    },
    {
      id: "floating-slate",
      label: "Floating slate — aura + image slate + floating CTA",
    },
  ];

const FRAMED_KEYS = [
  "campaignPill",
  "topHeadline",
  "fitterName",
  "brandName",
  "productTitle",
  "productTagline",
  "priceTag",
  "ctaLabel",
] as const;

const CINEMATIC_KEYS = [
  "partnerName",
  "subBrand",
  "productTitle",
  "productTagline",
  "ctaLabel",
  "priceTag",
] as const;

const TACTILE_KEYS = [
  "pillText",
  "subBrand",
  "productTitle",
  "productTagline",
  "priceTag",
  "ctaLabel",
] as const;

const FLOATING_KEYS = [
  "internalBadge",
  "subBrand",
  "productTitle",
  "productTagline",
  "ctaLabel",
] as const;

type FramedCopyKey = (typeof FRAMED_KEYS)[number];
type CinematicCopyKey = (typeof CINEMATIC_KEYS)[number];
type TactileCopyKey = (typeof TACTILE_KEYS)[number];
type FloatingCopyKey = (typeof FLOATING_KEYS)[number];

const DEFAULTS_FRAMED: Record<FramedCopyKey, string> = {
  campaignPill: "Track Series '26",
  topHeadline: "Precision calibrated.",
  fitterName: "Endpoint Media",
  brandName: "Featured brand",
  productTitle: "Aero-Grip Pro.",
  productTagline: "Engineered for the apex.",
  priceTag: "From $299",
  ctaLabel: "Book fitting",
};

const DEFAULTS_CINEMATIC: Record<CinematicCopyKey, string> = {
  partnerName: "Endpoint Media",
  subBrand: "Kratos Performance",
  productTitle: "Aero-Grip\nPro.",
  productTagline: "Tear the asphalt.\nNot your limits.",
  ctaLabel: "Book now",
  priceTag: "From $299",
};

const DEFAULTS_TACTILE: Record<TactileCopyKey, string> = {
  pillText: "Endpoint Media",
  subBrand: "Kratos Series",
  productTitle: "Aero-Grip Pro.",
  productTagline: "Absolute control. Defy the asphalt.",
  priceTag: "From $299",
  ctaLabel: "Book fitting",
};

const DEFAULTS_FLOATING: Record<FloatingCopyKey, string> = {
  internalBadge: "TreadHaus Auto",
  subBrand: "Kratos Series",
  productTitle: "Aero-Grip Pro.",
  productTagline: "Absolute control. Defy the asphalt.",
  ctaLabel: "Book Fitting",
};

type CopyByPreset = {
  "framed-glass": Record<FramedCopyKey, string>;
  "cinematic-aura": Record<CinematicCopyKey, string>;
  "tactile-hud": Record<TactileCopyKey, string>;
  "floating-slate": Record<FloatingCopyKey, string>;
};

function initialCopyByPreset(): CopyByPreset {
  return {
    "framed-glass": { ...DEFAULTS_FRAMED },
    "cinematic-aura": { ...DEFAULTS_CINEMATIC },
    "tactile-hud": { ...DEFAULTS_TACTILE },
    "floating-slate": { ...DEFAULTS_FLOATING },
  };
}

function keysForPreset(p: EmmOverlayPresetId): readonly string[] {
  if (p === "framed-glass") return FRAMED_KEYS;
  if (p === "cinematic-aura") return CINEMATIC_KEYS;
  if (p === "tactile-hud") return TACTILE_KEYS;
  return FLOATING_KEYS;
}

function isPresetId(x: unknown): x is EmmOverlayPresetId {
  return (
    x === "framed-glass" ||
    x === "cinematic-aura" ||
    x === "tactile-hud" ||
    x === "floating-slate"
  );
}

function inferPresetFromBlock(
  block: Record<string, unknown>,
): EmmOverlayPresetId | null {
  const keys = Object.keys(block);
  if (keys.includes("pillText")) return "tactile-hud";
  if (keys.includes("internalBadge")) return "floating-slate";
  if (keys.includes("campaignPill")) return "framed-glass";
  if (keys.includes("partnerName")) return "cinematic-aura";
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

function exportSlugForPreset(p: EmmOverlayPresetId): string {
  if (p === "framed-glass") return "framed-glass";
  if (p === "cinematic-aura") return "cinematic-aura";
  if (p === "tactile-hud") return "tactile-hud";
  return "floating-slate";
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

export function EndpointMediaOverlayStudio() {
  const squareRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const squareFileRef = useRef<HTMLInputElement>(null);
  const verticalFileRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<EmmOverlayPresetId>("framed-glass");
  const [copyByPreset, setCopyByPreset] = useState<CopyByPreset>(
    initialCopyByPreset,
  );

  const f = copyByPreset["framed-glass"];
  const c = copyByPreset["cinematic-aura"];
  const t = copyByPreset["tactile-hud"];
  const fl = copyByPreset["floating-slate"];

  const patchFramed = useCallback((key: FramedCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "framed-glass": { ...prev["framed-glass"], [key]: value },
    }));
  }, []);

  const patchCinematic = useCallback((key: CinematicCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "cinematic-aura": { ...prev["cinematic-aura"], [key]: value },
    }));
  }, []);

  const patchTactile = useCallback((key: TactileCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "tactile-hud": { ...prev["tactile-hud"], [key]: value },
    }));
  }, []);

  const patchFloating = useCallback((key: FloatingCopyKey, value: string) => {
    setCopyByPreset((prev) => ({
      ...prev,
      "floating-slate": { ...prev["floating-slate"], [key]: value },
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
          template: EMM_OVERLAY_JSON_TEMPLATE_ID,
          version: EMM_OVERLAY_JSON_VERSION,
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
    const legacyOk =
      tmpl === EMM_OVERLAY_JSON_TEMPLATE_ID ||
      tmpl === EMM_LEGACY_TEMPLATE_ID;
    if (tmpl != null && typeof tmpl === "string" && !legacyOk) {
      setJsonError(
        `Unknown template "${tmpl}". Use ${EMM_OVERLAY_JSON_TEMPLATE_ID}.`,
      );
      return;
    }

    let targetPreset: EmmOverlayPresetId = preset;
    if (isPresetId(root?.preset)) {
      targetPreset = root.preset;
    } else {
      targetPreset = inferPresetFromBlock(block) ?? "framed-glass";
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
        preset === "framed-glass"
          ? { ...DEFAULTS_FRAMED }
          : preset === "cinematic-aura"
            ? { ...DEFAULTS_CINEMATIC }
            : preset === "tactile-hud"
              ? { ...DEFAULTS_TACTILE }
              : { ...DEFAULTS_FLOATING },
    }));
  };

  const slug = exportSlugForPreset(preset);

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
      a.download = `emm-${slug}-square-1080-${Date.now()}.png`;
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
      a.download = `emm-${slug}-vertical-9x16-${Date.now()}.png`;
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
    preset === "framed-glass" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${framedSquare.root}`}
        aria-label="Endpoint Media framed square export"
      >
        <div className={framedSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={framedSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={framedSquare.topShadow} aria-hidden />
          <div className={framedSquare.bottomShadow} aria-hidden />
          <div className={framedSquare.topHeader}>
            <div className={framedSquare.campaignPill}>{f.campaignPill}</div>
            <h2 className={framedSquare.topHeadline}>{f.topHeadline}</h2>
          </div>
          <div className={framedSquare.glassFooter}>
            <div className={framedSquare.footerLeft}>
              <div className={framedSquare.partnershipTag}>
                <span className={framedSquare.fitterName}>{f.fitterName}</span>
                <div className={framedSquare.divider} aria-hidden />
                <span className={framedSquare.brandName}>{f.brandName}</span>
              </div>
              <h1 className={framedSquare.productTitle}>{f.productTitle}</h1>
              <p className={framedSquare.productTagline}>{f.productTagline}</p>
            </div>
            <div className={framedSquare.footerRight}>
              <div className={framedSquare.priceTag}>{f.priceTag}</div>
              <button type="button" className={framedSquare.ctaButton}>
                {f.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "cinematic-aura" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${cinematicSquare.root}`}
        aria-label="Endpoint Media cinematic square export"
      >
        <div className={cinematicSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={cinematicSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={cinematicSquare.topFade} aria-hidden />
          <div className={cinematicSquare.bottomFade} aria-hidden />
          <div className={cinematicSquare.oledAura} aria-hidden />
          <div className={cinematicSquare.topBadge}>
            <span className={cinematicSquare.partnerName}>{c.partnerName}</span>
          </div>
          <div className={cinematicSquare.content}>
            <div className={cinematicSquare.subBrand}>{c.subBrand}</div>
            <h1 className={cinematicSquare.productTitle}>{c.productTitle}</h1>
            <div className={cinematicSquare.bottomActionRow}>
              <p className={cinematicSquare.productTagline}>
                {c.productTagline}
              </p>
              <button type="button" className={cinematicSquare.ctaBtn}>
                {c.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "tactile-hud" ? (
      <div
        ref={squareRef}
        className={`${inter.variable} ${tactileSquare.root}`}
        aria-label="Endpoint Media tactile square export"
      >
        <div className={tactileSquare.adCanvas}>
          {bgSquareDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={tactileSquare.heroBg}
              src={bgSquareDataUrl}
              alt=""
            />
          ) : null}
          <div className={tactileSquare.vignette} aria-hidden />
          <div className={tactileSquare.topPill}>
            <div className={tactileSquare.pillDot} aria-hidden />
            <span className={tactileSquare.pillText}>{t.pillText}</span>
          </div>
          <div className={tactileSquare.widgetCluster}>
            <div className={tactileSquare.infoWidget}>
              <div className={tactileSquare.subBrand}>{t.subBrand}</div>
              <h1 className={tactileSquare.title}>{t.productTitle}</h1>
              <p className={tactileSquare.tagline}>{t.productTagline}</p>
            </div>
            <div className={tactileSquare.actionColumn}>
              <div className={tactileSquare.priceWidget}>{t.priceTag}</div>
              <button type="button" className={tactileSquare.ctaWidget}>
                {t.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={squareRef}
        className={`${inter.variable} ${floatingSquare.root}`}
        aria-label="Endpoint Media floating slate square export"
      >
        <div className={floatingSquare.adCanvas}>
          <div className={floatingSquare.auraGlow} aria-hidden />
          <div className={floatingSquare.slateWindow}>
            {bgSquareDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={floatingSquare.heroBg}
                src={bgSquareDataUrl}
                alt=""
              />
            ) : null}
            <div className={floatingSquare.internalBadge}>{fl.internalBadge}</div>
          </div>
          <div className={floatingSquare.textStage}>
            <div className={floatingSquare.subBrand}>{fl.subBrand}</div>
            <h1 className={floatingSquare.productTitle}>
              {titleLines(fl.productTitle).map((line, i) => (
                <span key={i} className={floatingSquare.productTitleLine}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={floatingSquare.productTagline}>{fl.productTagline}</p>
            <button type="button" className={floatingSquare.floatingCta}>
              {fl.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    );

  const verticalCanvas =
    preset === "framed-glass" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${framedVertical.root}`}
        aria-label="Endpoint Media framed vertical export"
      >
        <div className={framedVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={framedVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={framedVertical.topShadow} aria-hidden />
          <div className={framedVertical.bottomShadow} aria-hidden />
          <div className={framedVertical.topHeader}>
            <div className={framedVertical.campaignPill}>{f.campaignPill}</div>
            <h2 className={framedVertical.topHeadline}>{f.topHeadline}</h2>
          </div>
          <div className={framedVertical.glassFooter}>
            <div className={framedVertical.partnershipTag}>
              <span className={framedVertical.fitterName}>{f.fitterName}</span>
              <div className={framedVertical.divider} aria-hidden />
              <span className={framedVertical.brandName}>{f.brandName}</span>
            </div>
            <h1 className={framedVertical.productTitle}>{f.productTitle}</h1>
            <p className={framedVertical.productTagline}>{f.productTagline}</p>
            <div className={framedVertical.ctaRow}>
              <button type="button" className={framedVertical.ctaButton}>
                {f.ctaLabel}
              </button>
              <div className={framedVertical.priceTag}>{f.priceTag}</div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "cinematic-aura" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${cinematicVertical.root}`}
        aria-label="Endpoint Media cinematic vertical export"
      >
        <div className={cinematicVertical.adCanvas}>
          <div className={cinematicVertical.imageStack}>
            {bgVerticalDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={cinematicVertical.heroBg}
                src={bgVerticalDataUrl}
                alt=""
              />
            ) : null}
            <div className={cinematicVertical.imageFade} aria-hidden />
          </div>
          <div className={cinematicVertical.oledAura} aria-hidden />
          <div className={cinematicVertical.topBadge}>
            <span className={cinematicVertical.partnerName}>
              {c.partnerName}
            </span>
          </div>
          <div className={cinematicVertical.content}>
            <div className={cinematicVertical.subBrand}>{c.subBrand}</div>
            <h1 className={cinematicVertical.productTitle}>
              {titleLines(c.productTitle).map((line, i) => (
                <span key={i} className={cinematicVertical.productTitleLine}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={cinematicVertical.productTagline}>
              {c.productTagline}
            </p>
            <div className={cinematicVertical.ctaRow}>
              <button type="button" className={cinematicVertical.ctaBtn}>
                {c.ctaLabel}
              </button>
              <div className={cinematicVertical.price}>{c.priceTag}</div>
            </div>
          </div>
        </div>
      </div>
    ) : preset === "tactile-hud" ? (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${tactileVertical.root}`}
        aria-label="Endpoint Media tactile vertical export"
      >
        <div className={tactileVertical.adCanvas}>
          {bgVerticalDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={tactileVertical.heroBg}
              src={bgVerticalDataUrl}
              alt=""
            />
          ) : null}
          <div className={tactileVertical.vignette} aria-hidden />
          <div className={tactileVertical.topPill}>
            <div className={tactileVertical.pillDot} aria-hidden />
            <span className={tactileVertical.pillText}>{t.pillText}</span>
          </div>
          <div className={tactileVertical.widgetCluster}>
            <div className={tactileVertical.infoWidget}>
              <div className={tactileVertical.subBrand}>{t.subBrand}</div>
              <h1 className={tactileVertical.title}>{t.productTitle}</h1>
              <p className={tactileVertical.tagline}>{t.productTagline}</p>
            </div>
            <div className={tactileVertical.actionRow}>
              <div className={tactileVertical.priceWidget}>{t.priceTag}</div>
              <button type="button" className={tactileVertical.ctaWidget}>
                {t.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={verticalRef}
        className={`${inter.variable} ${floatingVertical.root}`}
        aria-label="Endpoint Media floating slate vertical export"
      >
        <div className={floatingVertical.adCanvas}>
          <div className={floatingVertical.auraGlow} aria-hidden />
          <div className={floatingVertical.slateWindow}>
            {bgVerticalDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={floatingVertical.heroBg}
                src={bgVerticalDataUrl}
                alt=""
              />
            ) : null}
            <div className={floatingVertical.internalBadge}>{fl.internalBadge}</div>
          </div>
          <div className={floatingVertical.textStage}>
            <button type="button" className={floatingVertical.floatingCta}>
              {fl.ctaLabel}
            </button>
            <div className={floatingVertical.subBrand}>{fl.subBrand}</div>
            <h1 className={floatingVertical.productTitle}>
              {titleLines(fl.productTitle).map((line, i) => (
                <span key={i} className={floatingVertical.productTitleLine}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={floatingVertical.productTagline}>{fl.productTagline}</p>
          </div>
        </div>
      </div>
    );

  const previewLabel =
    preset === "framed-glass"
      ? "Framed glass"
      : preset === "cinematic-aura"
        ? "Cinematic aura"
        : preset === "tactile-hud"
          ? "Tactile HUD"
          : "Floating slate";

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
              setPreset(e.target.value as EmmOverlayPresetId)
            }
            className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {EMM_OVERLAY_PRESETS.map((p) => (
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
          {preset === "framed-glass" ? (
            <>
              <Field
                label="Campaign pill (cyan, top)"
                value={f.campaignPill}
                onChange={(x) => patchFramed("campaignPill", x)}
              />
              <Field
                label="Top headline (light weight)"
                value={f.topHeadline}
                onChange={(x) => patchFramed("topHeadline", x)}
              />
              <Field
                label="Fitter / clinic name (footer)"
                value={f.fitterName}
                onChange={(x) => patchFramed("fitterName", x)}
              />
              <Field
                label="Brand name (footer, muted)"
                value={f.brandName}
                onChange={(x) => patchFramed("brandName", x)}
              />
              <Field
                label="Product title"
                value={f.productTitle}
                onChange={(x) => patchFramed("productTitle", x)}
              />
              <Field
                label="Product tagline"
                value={f.productTagline}
                onChange={(x) => patchFramed("productTagline", x)}
                rows={2}
              />
              <Field
                label="Price or offer line"
                value={f.priceTag}
                onChange={(x) => patchFramed("priceTag", x)}
              />
              <Field
                label="CTA button label"
                value={f.ctaLabel}
                onChange={(x) => patchFramed("ctaLabel", x)}
              />
            </>
          ) : preset === "cinematic-aura" ? (
            <>
              <Field
                label="Partner name (top-left badge)"
                value={c.partnerName}
                onChange={(x) => patchCinematic("partnerName", x)}
              />
              <Field
                label="Sub-brand (cyan, above title)"
                value={c.subBrand}
                onChange={(x) => patchCinematic("subBrand", x)}
              />
              <Field
                label="Product title (use line breaks for stacked lines on vertical)"
                value={c.productTitle}
                onChange={(x) => patchCinematic("productTitle", x)}
                rows={2}
              />
              <Field
                label="Tagline (line breaks OK on square)"
                value={c.productTagline}
                onChange={(x) => patchCinematic("productTagline", x)}
                rows={3}
              />
              <Field
                label="CTA label (vertical: left of price)"
                value={c.ctaLabel}
                onChange={(x) => patchCinematic("ctaLabel", x)}
              />
              <Field
                label="Price (vertical only; hidden on square layout)"
                value={c.priceTag}
                onChange={(x) => patchCinematic("priceTag", x)}
              />
            </>
          ) : preset === "tactile-hud" ? (
            <>
              <Field
                label="Top pill text (centred on vertical)"
                value={t.pillText}
                onChange={(x) => patchTactile("pillText", x)}
              />
              <Field
                label="Sub-brand (cyan, in info widget)"
                value={t.subBrand}
                onChange={(x) => patchTactile("subBrand", x)}
              />
              <Field
                label="Product title"
                value={t.productTitle}
                onChange={(x) => patchTactile("productTitle", x)}
              />
              <Field
                label="Tagline"
                value={t.productTagline}
                onChange={(x) => patchTactile("productTagline", x)}
                rows={2}
              />
              <Field
                label="Price (price widget)"
                value={t.priceTag}
                onChange={(x) => patchTactile("priceTag", x)}
              />
              <Field
                label="CTA label"
                value={t.ctaLabel}
                onChange={(x) => patchTactile("ctaLabel", x)}
              />
            </>
          ) : (
            <>
              <Field
                label="Badge on image slate"
                value={fl.internalBadge}
                onChange={(x) => patchFloating("internalBadge", x)}
              />
              <Field
                label="Sub-brand (cyan, above title)"
                value={fl.subBrand}
                onChange={(x) => patchFloating("subBrand", x)}
              />
              <Field
                label="Product title (line breaks for square split title)"
                value={fl.productTitle}
                onChange={(x) => patchFloating("productTitle", x)}
                rows={2}
              />
              <Field
                label="Tagline"
                value={fl.productTagline}
                onChange={(x) => patchFloating("productTagline", x)}
                rows={2}
              />
              <Field
                label="CTA label"
                value={fl.ctaLabel}
                onChange={(x) => patchFloating("ctaLabel", x)}
              />
            </>
          )}
        </div>

        <div className="space-y-3 rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
            JSON
          </p>
          <p className="text-xs text-[#8E8E93]">
            <code className="text-white/80">{EMM_OVERLAY_JSON_TEMPLATE_ID}</code>{" "}
            · v{EMM_OVERLAY_JSON_VERSION} ·{" "}
            <code className="text-white/80">preset</code>:{" "}
            <code className="text-white/80">framed-glass</code>,{" "}
            <code className="text-white/80">cinematic-aura</code>,{" "}
            <code className="text-white/80">tactile-hud</code>,{" "}
            <code className="text-white/80">floating-slate</code>. Legacy{" "}
            <code className="text-white/80">{EMM_LEGACY_TEMPLATE_ID}</code> v1
            still applies.
          </p>
          <div className="flex flex-wrap items-center gap-2">
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
            rows={16}
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
            placeholder={`{ "template": "${EMM_OVERLAY_JSON_TEMPLATE_ID}", "preset": "cinematic-aura", "copy": { ... } }`}
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

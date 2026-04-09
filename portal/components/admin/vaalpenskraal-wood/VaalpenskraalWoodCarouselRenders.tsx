"use client";

import { Inter } from "next/font/google";
import type { ReactNode, Ref } from "react";
import sh from "./vpb-carousel-shared.module.css";
import apple from "./vpb-carousel-apple-glass.module.css";
import samsung from "./vpb-carousel-samsung-night.module.css";
import vision from "./vpb-carousel-vision-spatial.module.css";
import nothing from "./vpb-carousel-nothing-tech.module.css";
import cyber from "./vpb-carousel-cyber-hud.module.css";
import mock from "./vpb-carousel-mock-square.module.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-vpb",
  display: "swap",
});

export type VkwCarouselPresetId =
  | "carousel-mock"
  | "apple-glass"
  | "samsung-night"
  | "vision-spatial"
  | "nothing-tech"
  | "cyber-hud";

export const VKW_CAROUSEL_PRESETS: {
  id: VkwCarouselPresetId;
  /** Short title — shown in the visible preset list */
  name: string;
  /** One-line description */
  blurb: string;
}[] = [
  {
    id: "apple-glass",
    name: "1 · Apple glassmorphism",
    blurb: "Frosted panels + 2×2 offer grid + WhatsApp bar",
  },
  {
    id: "samsung-night",
    name: "2 · Samsung Nightography",
    blurb: "OLED rail, cobalt accent, price slab",
  },
  {
    id: "vision-spatial",
    name: "3 · Vision OS spatial",
    blurb: "Glass pills, spec bar, green offer card",
  },
  {
    id: "nothing-tech",
    name: "4 · Nothing / monospace",
    blurb: "Tags, spec grid, red price block",
  },
  {
    id: "cyber-hud",
    name: "5 · Cyber HUD",
    blurb: "Brackets, data bar, dashboard, transmit ring",
  },
  {
    id: "carousel-mock",
    name: "Legacy mock",
    blurb: "Simple gradient strip (early placeholder)",
  },
];

const CAROUSEL_MOCK_KEYS = [
  "carouselCard1Eyebrow",
  "carouselCard1Headline",
  "carouselCard1Body",
  "carouselCard1Cta",
  "carouselCard2Eyebrow",
  "carouselCard2Headline",
  "carouselCard2Body",
  "carouselCard2Cta",
  "carouselCard3Eyebrow",
  "carouselCard3Headline",
  "carouselCard3Body",
  "carouselCard3Cta",
  "carouselCard4Eyebrow",
  "carouselCard4Headline",
  "carouselCard4Body",
  "carouselCard4Cta",
  "carouselCard5Eyebrow",
  "carouselCard5Headline",
  "carouselCard5Body",
  "carouselCard5Cta",
] as const;

const APPLE_GLASS_KEYS = [
  "appleC1Title",
  "appleC2Heading",
  "appleC2Title",
  "appleC2Sub",
  "appleC3Top",
  "appleC3Bot",
  "appleC4Box1L",
  "appleC4Box1V",
  "appleC4Box2L",
  "appleC4Box2V",
  "appleC4Box3L",
  "appleC4Box3V",
  "appleC4Box4L",
  "appleC4Box4V",
  "appleC5Title",
  "appleC5Sub",
  "appleC5Phone",
] as const;

const SAMSUNG_KEYS = [
  "samC1Brand",
  "samC1Title",
  "samC2Tag",
  "samC2Title",
  "samC3Top",
  "samC3Bot",
  "samC4Sub",
  "samC4Price",
  "samC4Del",
  "samC5Title",
  "samC5Phone",
] as const;

const VISION_KEYS = [
  "visC1Brand",
  "visC1Title",
  "visC2Top",
  "visC2Bot",
  "visC3L1",
  "visC3V1",
  "visC3L2",
  "visC3V2",
  "visC4Sub",
  "visC4Price",
  "visC4Del",
  "visC5Top",
  "visC5Phone",
] as const;

const NOTHING_KEYS = [
  "notC1Sys",
  "notC1Title",
  "notC2Tag1",
  "notC2Tag2",
  "notC2Tag3",
  "notC3L1",
  "notC3V1",
  "notC3L2",
  "notC3V2",
  "notC4Label",
  "notC4Price",
  "notC4Foot",
  "notC5Action",
  "notC5Title",
  "notC5Phone",
] as const;

const CYBER_KEYS = [
  "hudC1Brand",
  "hudC1Sub",
  "hudC2L1",
  "hudC2V1",
  "hudC2L2",
  "hudC2V2",
  "hudC2L3",
  "hudC2V3",
  "hudC3L1",
  "hudC3V1",
  "hudC3L2",
  "hudC3V2",
  "hudC4Label",
  "hudC4Sub",
  "hudC4Price",
  "hudC5Title",
  "hudC5Phone",
] as const;

export const CAROUSEL_KEYS_BY_PRESET: Record<
  VkwCarouselPresetId,
  readonly string[]
> = {
  "carousel-mock": CAROUSEL_MOCK_KEYS,
  "apple-glass": APPLE_GLASS_KEYS,
  "samsung-night": SAMSUNG_KEYS,
  "vision-spatial": VISION_KEYS,
  "nothing-tech": NOTHING_KEYS,
  "cyber-hud": CYBER_KEYS,
};

function titleLines(text: string): string[] {
  return text.split("\n").filter((l) => l.length > 0);
}

const DEFAULT_CAROUSEL_MOCK: Record<
  (typeof CAROUSEL_MOCK_KEYS)[number],
  string
> = {
  carouselCard1Eyebrow: "Card 01 / 05",
  carouselCard1Headline: "The Ultimate Braai Mix",
  carouselCard1Body:
    "Kiln-dry hardwood from Thabazimbi—serious heat, less smoke.",
  carouselCard1Cta: "Swipe →",
  carouselCard2Eyebrow: "Card 02 / 05",
  carouselCard2Headline: "Farm direct",
  carouselCard2Body:
    "The Ultimate Braai Mix from Vaalpenskraal. Bushveld origin you can pin on the map.",
  carouselCard2Cta: "Next →",
  carouselCard3Eyebrow: "Card 03 / 05",
  carouselCard3Headline: "The mix",
  carouselCard3Body:
    "Swarthaak · Geelhaak · Kameeldoring. Built for the long burn.",
  carouselCard3Cta: "Keep going →",
  carouselCard4Eyebrow: "Card 04 / 05",
  carouselCard4Headline: "Wholesale stack",
  carouselCard4Body:
    "50 × 10kg bags. Free Gauteng delivery on the full load.",
  carouselCard4Cta: "See the deal →",
  carouselCard5Eyebrow: "Card 05 / 05",
  carouselCard5Headline: "WhatsApp us",
  carouselCard5Body: "Tap to message. COD. Same-day routing where we can.",
  carouselCard5Cta: "063 184 1939",
};

const DEFAULT_APPLE: Record<(typeof APPLE_GLASS_KEYS)[number], string> = {
  appleC1Title: "The\nUltimate\nBraai\nMix",
  appleC2Heading: "The Ultimate Blend",
  appleC2Title: "Swarthaak, Geelhaak & Kameeldoring.",
  appleC2Sub: "",
  appleC3Top: "10kg Bags.",
  appleC3Bot: "Zero Moisture.",
  appleC4Box1L: "Total Price",
  appleC4Box1V: "R1250",
  appleC4Box2L: "Per Bag",
  appleC4Box2V: "R25",
  appleC4Box3L: "Min Order",
  appleC4Box3V: "50 Bags",
  appleC4Box4L: "Delivery GP",
  appleC4Box4V: "FREE",
  appleC5Title: "Secure your load.",
  appleC5Sub: "Order instantly on WhatsApp",
  appleC5Phone: "063 184 1939",
};

const DEFAULT_SAMSUNG: Record<(typeof SAMSUNG_KEYS)[number], string> = {
  samC1Brand: "Vaalpenskraal",
  samC1Title: "The\nUltimate\nBraai\nMix",
  samC2Tag: "The Holy Trinity",
  samC2Title: "Swarthaak\nGeelhaak\nKameeldoring",
  samC3Top: "10KG Bags",
  samC3Bot: "Bone Dry",
  samC4Sub: "50 Bags @ R25 each",
  samC4Price: "R1250",
  samC4Del: "Free Delivery in Gauteng",
  samC5Title: "WhatsApp to Order",
  samC5Phone: "063 184 1939",
};

const DEFAULT_VISION: Record<(typeof VISION_KEYS)[number], string> = {
  visC1Brand: "Vaalpenskraal",
  visC1Title: "The\nUltimate\nBraai\nMix",
  visC2Top: "Swarthaak & Geelhaak",
  visC2Bot: "& Kameeldoring",
  visC3L1: "Bag Size",
  visC3V1: "10KG",
  visC3L2: "Minimum",
  visC3V2: "50 Bags",
  visC4Sub: "50 Bags @ R25 each",
  visC4Price: "R1250",
  visC4Del: "Including Free Delivery in Gauteng",
  visC5Top: "Order Instantly",
  visC5Phone: "063 184 1939",
};

const DEFAULT_NOTHING: Record<(typeof NOTHING_KEYS)[number], string> = {
  notC1Sys: "SYS.VAALPENSKRAAL",
  notC1Title: "The Ultimate Braai Mix",
  notC2Tag1: "Swarthaak",
  notC2Tag2: "Geelhaak",
  notC2Tag3: "Kameeldoring",
  notC3L1: "Volume",
  notC3V1: "10KG",
  notC3L2: "Req.QTY",
  notC3V2: "50_UNIT",
  notC4Label: "TOTAL_PRICE",
  notC4Price: "R1250",
  notC4Foot: "[INC. DEL GAUTENG]",
  notC5Action: "ACTION_REQUIRED",
  notC5Title: "Initiate Order.",
  notC5Phone: "063 184 1939",
};

const DEFAULT_CYBER: Record<(typeof CYBER_KEYS)[number], string> = {
  hudC1Brand: "Vaalpenskraal",
  hudC1Sub: "The Ultimate Braai Mix",
  hudC2L1: "Log 01",
  hudC2V1: "Swarthaak",
  hudC2L2: "Log 02",
  hudC2V2: "Geelhaak",
  hudC2L3: "Log 03",
  hudC2V3: "Kameeldoring",
  hudC3L1: "Mass",
  hudC3V1: "10 KG",
  hudC3L2: "Min_Load",
  hudC3V2: "50 BGS",
  hudC4Label: "System Total",
  hudC4Sub: "Free Del [GP]",
  hudC4Price: "R1250",
  hudC5Title: "Transmit Order",
  hudC5Phone: "063 184 1939",
};

export function defaultCopyForPreset(
  p: VkwCarouselPresetId,
): Record<string, string> {
  if (p === "carousel-mock") return { ...DEFAULT_CAROUSEL_MOCK };
  if (p === "apple-glass") return { ...DEFAULT_APPLE };
  if (p === "samsung-night") return { ...DEFAULT_SAMSUNG };
  if (p === "vision-spatial") return { ...DEFAULT_VISION };
  if (p === "nothing-tech") return { ...DEFAULT_NOTHING };
  return { ...DEFAULT_CYBER };
}

export function initialCopyByPreset(): Record<
  VkwCarouselPresetId,
  Record<string, string>
> {
  return {
    "carousel-mock": { ...DEFAULT_CAROUSEL_MOCK },
    "apple-glass": { ...DEFAULT_APPLE },
    "samsung-night": { ...DEFAULT_SAMSUNG },
    "vision-spatial": { ...DEFAULT_VISION },
    "nothing-tech": { ...DEFAULT_NOTHING },
    "cyber-hud": { ...DEFAULT_CYBER },
  };
}

export function isCarouselPresetId(x: unknown): x is VkwCarouselPresetId {
  return (
    x === "carousel-mock" ||
    x === "apple-glass" ||
    x === "samsung-night" ||
    x === "vision-spatial" ||
    x === "nothing-tech" ||
    x === "cyber-hud"
  );
}

export function inferCarouselPresetFromBlock(
  block: Record<string, unknown>,
): VkwCarouselPresetId | null {
  const k = Object.keys(block);
  if (k.some((key) => APPLE_GLASS_KEYS.includes(key as never))) {
    return "apple-glass";
  }
  if (k.some((key) => SAMSUNG_KEYS.includes(key as never))) {
    return "samsung-night";
  }
  if (k.some((key) => VISION_KEYS.includes(key as never))) {
    return "vision-spatial";
  }
  if (k.some((key) => NOTHING_KEYS.includes(key as never))) {
    return "nothing-tech";
  }
  if (k.some((key) => CYBER_KEYS.includes(key as never))) {
    return "cyber-hud";
  }
  if (k.some((key) => CAROUSEL_MOCK_KEYS.includes(key as never))) {
    return "carousel-mock";
  }
  return null;
}

function g(copy: Record<string, string>, key: string): string {
  return copy[key] ?? "";
}

type CardProps = {
  preset: VkwCarouselPresetId;
  card: 1 | 2 | 3 | 4 | 5;
  copy: Record<string, string>;
  bgDataUrl: string | null;
  rootRef?: Ref<HTMLDivElement>;
};

export function CarouselCardCanvas({
  preset,
  card,
  copy,
  bgDataUrl,
  rootRef,
}: CardProps) {
  const shell = (
    inner: ReactNode,
    presetRootClass: string,
    gradTop?: boolean,
    gradBot?: boolean,
  ) => (
    <div
      ref={rootRef}
      className={`${inter.variable} ${sh.root}`}
      aria-label={`Vaalpenskraal carousel ${preset} card ${card}`}
    >
      <div className={`${sh.adCanvas} ${presetRootClass}`}>
        {bgDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={sh.heroBg} src={bgDataUrl} alt="" />
        ) : null}
        {gradTop ? <div className={sh.gradTop} aria-hidden /> : null}
        {gradBot !== false ? <div className={sh.gradBot} aria-hidden /> : null}
        {inner}
      </div>
    </div>
  );

  if (preset === "carousel-mock") {
    const p = `carouselCard${card}` as const;
    const slice = {
      eyebrow: g(copy, `${p}Eyebrow`),
      headline: g(copy, `${p}Headline`),
      body: g(copy, `${p}Body`),
      cta: g(copy, `${p}Cta`),
    };
    return (
      <div
        ref={rootRef}
        className={`${inter.variable} ${mock.root}`}
        aria-label={`Vaalpenskraal carousel mock card ${card}`}
      >
        <div className={mock.adCanvas}>
          {bgDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={mock.heroBg} src={bgDataUrl} alt="" />
          ) : null}
          <div className={mock.scrim} aria-hidden />
          <div className={mock.accentBar} aria-hidden />
          <div className={mock.content}>
            <div className={mock.topRow}>
              <span className={mock.brandLockup}>Vaalpenskraal</span>
              <span className={mock.cardIndex}>{slice.eyebrow}</span>
            </div>
            <div className={mock.copyBlock}>
              <h2 className={mock.headline}>{slice.headline}</h2>
              <p className={mock.body}>{slice.body}</p>
            </div>
            <div className={mock.footer}>
              <div className={mock.cta}>{slice.cta}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (preset === "apple-glass") {
    if (card === 1) {
      return shell(
        <div className={`${apple.r1Glass} ${sh.posCenter}`}>
          <div className={apple.r1c1Title}>
            {titleLines(g(copy, "appleC1Title")).map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
        </div>,
        apple.appleRoot,
        false,
        true,
      );
    }
    if (card === 2) {
      return shell(
        <>
          <p className={apple.r1c2HeadingTop}>{g(copy, "appleC2Heading")}</p>
          <div className={`${apple.r1Glass} ${apple.r1c2Wrap}`}>
            <div className={apple.r1c2Title}>
              {g(copy, "appleC2Title").replace(/\s*\n\s*/g, " ").trim()}
            </div>
            {g(copy, "appleC2Sub").trim() ? (
              <p className={apple.r1c2Sub}>{g(copy, "appleC2Sub")}</p>
            ) : null}
          </div>
        </>,
        apple.appleRoot,
        false,
        true,
      );
    }
    if (card === 3) {
      return shell(
        <>
          <div className={`${apple.r1Glass} ${apple.r1c3Title} ${sh.posTr}`}>
            {titleLines(g(copy, "appleC3Top")).map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
          <div className={`${apple.r1Glass} ${apple.r1c3Title} ${sh.posBl}`}>
            {titleLines(g(copy, "appleC3Bot")).map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
        </>,
        apple.appleRoot,
        true,
        true,
      );
    }
    if (card === 4) {
      const boxes: [string, string][] = [
        [g(copy, "appleC4Box1L"), g(copy, "appleC4Box1V")],
        [g(copy, "appleC4Box2L"), g(copy, "appleC4Box2V")],
        [g(copy, "appleC4Box3L"), g(copy, "appleC4Box3V")],
        [g(copy, "appleC4Box4L"), g(copy, "appleC4Box4V")],
      ];
      return shell(
        <div className={`${apple.r1c4Grid} ${sh.posCenter}`}>
          {boxes.map(([lbl, val], i) => (
            <div key={i} className={`${apple.r1Glass} ${apple.r1c4Box}`}>
              <div className={apple.r1c4BoxLabel}>{lbl}</div>
              <div className={apple.r1c4BoxValue}>{val}</div>
            </div>
          ))}
        </div>,
        apple.appleRoot,
        false,
        true,
      );
    }
    return shell(
      <div className={`${apple.r1c5Bar} ${sh.posBotBar}`}>
        <div>
          <div className={apple.r1c5Title}>{g(copy, "appleC5Title")}</div>
          <p className={apple.r1c5Sub}>{g(copy, "appleC5Sub")}</p>
        </div>
        <div className={apple.r1c5Phone}>
          <span className={sh.waIcon} aria-hidden />
          {g(copy, "appleC5Phone")}
        </div>
      </div>,
      apple.appleRoot,
      false,
      true,
    );
  }

  if (preset === "samsung-night") {
    if (card === 1) {
      return shell(
        <div className={`${samsung.r2Oled} ${samsung.r2c1Panel}`}>
          <div className={samsung.r2c1Brand}>{g(copy, "samC1Brand")}</div>
          <div className={samsung.r2c1Title}>
            {titleLines(g(copy, "samC1Title")).map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
        </div>,
        samsung.samsungRoot,
        false,
        true,
      );
    }
    if (card === 2) {
      return shell(
        <div className={`${samsung.r2Oled} ${samsung.r2c2Block} ${sh.posBr}`}>
          <p className={samsung.r2c2Tag}>{g(copy, "samC2Tag")}</p>
          <div className={samsung.r2c2Title}>
            {titleLines(g(copy, "samC2Title")).map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
        </div>,
        samsung.samsungRoot,
        false,
        true,
      );
    }
    if (card === 3) {
      return shell(
        <>
          <div
            className={`${samsung.r2Oled} ${samsung.r2c3Top} ${sh.posTl}`}
          >
            <div className={samsung.r2c3Title}>{g(copy, "samC3Top")}</div>
          </div>
          <div
            className={`${samsung.r2Oled} ${samsung.r2c3Bot} ${sh.posBr}`}
          >
            <div className={samsung.r2c3Title}>{g(copy, "samC3Bot")}</div>
          </div>
        </>,
        samsung.samsungRoot,
        true,
        true,
      );
    }
    if (card === 4) {
      return shell(
        <div className={`${samsung.r2Oled} ${samsung.r2c4Block} ${sh.posCenter}`}>
          <div className={samsung.r2c4Sub}>{g(copy, "samC4Sub")}</div>
          <div className={samsung.r2c4Price}>{g(copy, "samC4Price")}</div>
          <p className={samsung.r2c4Del}>{g(copy, "samC4Del")}</p>
        </div>,
        samsung.samsungRoot,
        false,
        true,
      );
    }
    return shell(
      <div className={`${samsung.r2Oled} ${samsung.r2c5Bar} ${sh.posBotBar}`}>
        <div className={samsung.r2c5Title}>{g(copy, "samC5Title")}</div>
        <div className={samsung.r2c5Phone}>
          <span className={sh.waIcon} aria-hidden />
          {g(copy, "samC5Phone").replace(/\s*\n\s*/g, " ").trim()}
        </div>
      </div>,
      samsung.samsungRoot,
      false,
      true,
    );
  }

  if (preset === "vision-spatial") {
    if (card === 1) {
      return shell(
        <div className={`${vision.r3Pill} ${vision.r3c1Circle} ${sh.posCenter}`}>
          <div className={vision.r3c1Brand}>{g(copy, "visC1Brand")}</div>
          <div className={vision.r3c1Title}>
            {titleLines(g(copy, "visC1Title")).map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
        </div>,
        vision.visionRoot,
        false,
        true,
      );
    }
    if (card === 2) {
      return shell(
        <>
          <div className={`${vision.r3Pill} ${sh.posTl}`}>
            <div className={vision.r3c2Title}>{g(copy, "visC2Top")}</div>
          </div>
          <div className={`${vision.r3Pill} ${sh.posBr}`}>
            <div className={vision.r3c2Title}>{g(copy, "visC2Bot")}</div>
          </div>
        </>,
        vision.visionRoot,
        true,
        true,
      );
    }
    if (card === 3) {
      return shell(
        <div className={`${vision.r3Pill} ${vision.r3c3Bar}`}>
          <div className={vision.r3c3Col}>
            <div className={vision.r3c3Label}>{g(copy, "visC3L1")}</div>
            <div className={vision.r3c3Value}>{g(copy, "visC3V1")}</div>
          </div>
          <div className={vision.r3c3Divider} aria-hidden />
          <div className={vision.r3c3Col}>
            <div className={vision.r3c3Label}>{g(copy, "visC3L2")}</div>
            <div className={vision.r3c3Value}>{g(copy, "visC3V2")}</div>
          </div>
        </div>,
        vision.visionRoot,
        false,
        true,
      );
    }
    if (card === 4) {
      return shell(
        <div className={`${vision.r3Pill} ${vision.r3c4Block} ${sh.posCenter}`}>
          <div className={vision.r3c4Sub}>{g(copy, "visC4Sub")}</div>
          <div className={vision.r3c4Price}>{g(copy, "visC4Price")}</div>
          <p className={vision.r3c4Del}>{g(copy, "visC4Del")}</p>
        </div>,
        vision.visionRoot,
        false,
        true,
      );
    }
    return shell(
      <>
        <div className={`${vision.r3Pill} ${vision.r3c5Top}`}>
          <div className={vision.r3c5TopTitle}>{g(copy, "visC5Top")}</div>
        </div>
        <div className={`${vision.r3Pill} ${vision.r3c5Bot}`}>
          <div className={vision.r3c5PhoneRow}>
            <span className={sh.waIcon} aria-hidden />
            {g(copy, "visC5Phone")}
          </div>
        </div>
      </>,
      vision.visionRoot,
      true,
      true,
    );
  }

  if (preset === "nothing-tech") {
    if (card === 1) {
      return shell(
        <div
          className={`${nothing.r4Box} ${nothing.r4c1Hub} ${nothing.hudBrackets} ${sh.posCenter}`}
        >
          <div className={nothing.r4c1Dot} aria-hidden />
          <div className={`${nothing.r4c1Sys} ${nothing.r4Mono}`}>
            {g(copy, "notC1Sys")}
          </div>
          <div className={`${nothing.r4c1Title} ${nothing.r4Mono}`}>
            {g(copy, "notC1Title")}
          </div>
        </div>,
        nothing.nothingRoot,
        false,
        true,
      );
    }
    if (card === 2) {
      return shell(
        <div className={sh.posBl}>
          <div className={nothing.r4Tag}>{g(copy, "notC2Tag1")}</div>
          <br />
          <div className={nothing.r4Tag}>{g(copy, "notC2Tag2")}</div>
          <br />
          <div className={`${nothing.r4Tag} ${nothing.r4TagAccent}`}>
            {g(copy, "notC2Tag3")}
          </div>
        </div>,
        nothing.nothingRoot,
        false,
        true,
      );
    }
    if (card === 3) {
      return shell(
        <div className={`${nothing.r4Box} ${nothing.r4c3Grid} ${sh.posCenter}`}>
          <div className={nothing.r4c3Item}>
            <div className={`${nothing.r4c3Label} ${nothing.r4Mono}`}>
              {g(copy, "notC3L1")}
            </div>
            <div className={`${nothing.r4c3Value} ${nothing.r4Mono}`}>
              {g(copy, "notC3V1")}
            </div>
          </div>
          <div className={nothing.r4c3Item}>
            <div className={`${nothing.r4c3Label} ${nothing.r4Mono}`}>
              {g(copy, "notC3L2")}
            </div>
            <div className={`${nothing.r4c3Value} ${nothing.r4Mono}`}>
              {g(copy, "notC3V2")}
            </div>
          </div>
        </div>,
        nothing.nothingRoot,
        false,
        true,
      );
    }
    if (card === 4) {
      return shell(
        <div className={`${nothing.r4Box} ${nothing.r4c4Price} ${sh.posCenter}`}>
          <div className={`${nothing.r4c4Label} ${nothing.r4Mono}`}>
            {g(copy, "notC4Label")}
          </div>
          <div className={nothing.r4c4Amount}>{g(copy, "notC4Price")}</div>
          <p className={`${nothing.r4c4Foot} ${nothing.r4Mono}`}>
            {g(copy, "notC4Foot")}
          </p>
        </div>,
        nothing.nothingRoot,
        false,
        true,
      );
    }
    return shell(
      <div className={`${sh.posBotBar} ${nothing.r4c5Bar}`}>
        <div>
          <div className={`${nothing.r4c5Action} ${nothing.r4Mono}`}>
            {g(copy, "notC5Action")}
          </div>
          <div className={nothing.r4c5Title}>{g(copy, "notC5Title")}</div>
        </div>
        <div className={nothing.r4Btn}>
          <span className={sh.waIcon} aria-hidden />
          {g(copy, "notC5Phone")}
        </div>
      </div>,
      nothing.nothingRoot,
      false,
      true,
    );
  }

  if (preset === "cyber-hud") {
    if (card === 1) {
      return shell(
        <div
          className={`${cyber.r5Hud} ${cyber.r5c1Block} ${cyber.hudBrackets} ${sh.posCenter}`}
        >
          <div className={cyber.r5c1Copy}>
            <div className={`${cyber.r5c1Brand} ${cyber.r5Text}`}>
              {g(copy, "hudC1Brand").replace(/\s*\n\s*/g, " ").trim()}
            </div>
            <p className={`${cyber.r5c1Sub} ${cyber.r5Text}`}>
              {g(copy, "hudC1Sub")}
            </p>
          </div>
        </div>,
        cyber.cyberRoot,
        false,
        true,
      );
    }
    if (card === 2) {
      return shell(
        <div className={`${cyber.r5Hud} ${cyber.r5c2Bar} ${sh.posBotBar}`}>
          <div className={cyber.r5c2Item}>
            <div className={`${cyber.r5c2Label} ${cyber.r5Text}`}>
              {g(copy, "hudC2L1")}
            </div>
            <div className={`${cyber.r5c2Value} ${cyber.r5Text}`}>
              {g(copy, "hudC2V1")}
            </div>
          </div>
          <div className={cyber.r5c2Item}>
            <div className={`${cyber.r5c2Label} ${cyber.r5Text}`}>
              {g(copy, "hudC2L2")}
            </div>
            <div className={`${cyber.r5c2Value} ${cyber.r5Text}`}>
              {g(copy, "hudC2V2")}
            </div>
          </div>
          <div className={cyber.r5c2Item}>
            <div className={`${cyber.r5c2Label} ${cyber.r5Text}`}>
              {g(copy, "hudC2L3")}
            </div>
            <div className={`${cyber.r5c2Value} ${cyber.r5Text}`}>
              {g(copy, "hudC2V3")}
            </div>
          </div>
        </div>,
        cyber.cyberRoot,
        false,
        true,
      );
    }
    if (card === 3) {
      return shell(
        <div className={`${cyber.r5Hud} ${cyber.r5c3Panel} ${sh.posBr}`}>
          <div>
            <div className={`${cyber.r5c3Label} ${cyber.r5Text}`}>
              {g(copy, "hudC3L1")}
            </div>
            <div className={`${cyber.r5c3Value} ${cyber.r5Text}`}>
              {g(copy, "hudC3V1")}
            </div>
          </div>
          <div>
            <div className={`${cyber.r5c3Label} ${cyber.r5Text}`}>
              {g(copy, "hudC3L2")}
            </div>
            <div className={`${cyber.r5c3Value} ${cyber.r5Text}`}>
              {g(copy, "hudC3V2")}
            </div>
          </div>
        </div>,
        cyber.cyberRoot,
        false,
        true,
      );
    }
    if (card === 4) {
      return shell(
        <div
          className={`${cyber.r5Hud} ${cyber.r5c4Dash} ${cyber.hudBrackets} ${sh.posCenter}`}
        >
          <div>
            <div className={`${cyber.r5c4Label} ${cyber.r5Text}`}>
              {g(copy, "hudC4Label")}
            </div>
            <p className={`${cyber.r5c4Sub} ${cyber.r5Text}`}>
              {g(copy, "hudC4Sub")}
            </p>
          </div>
          <div className={`${cyber.r5c4Price} ${cyber.r5Text}`}>
            {g(copy, "hudC4Price")}
          </div>
        </div>,
        cyber.cyberRoot,
        false,
        true,
      );
    }
    return shell(
      <div className={`${cyber.r5Hud} ${cyber.r5c5Target} ${sh.posCenter}`}>
        <div className={`${cyber.r5c5Title} ${cyber.r5Text}`}>
          {g(copy, "hudC5Title")}
        </div>
        <div className={`${cyber.r5c5Phone} ${cyber.r5Text}`}>
          <span className={sh.waIcon} aria-hidden />
          {g(copy, "hudC5Phone")}
        </div>
      </div>,
      cyber.cyberRoot,
      false,
      true,
    );
  }

  return null;
}

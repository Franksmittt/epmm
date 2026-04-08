/**
 * April 2026 post calendar for Alberton Tyre Clinic (Mon / Wed / Fri).
 * Each slot assigns a template (1–5) and copy patches merged onto studio defaults.
 * Templates: 1 Velocity · 2 Kinetic Grip · 3 Commercial Transit · 4 Tectonic Tread · 5 Kinetic Monolith
 */

export type AtcAprilTemplateNum = 1 | 2 | 3 | 4 | 5;

export type AtcAprilPresetId =
  | "velocity-premium"
  | "kinetic-grip"
  | "commercial-transit"
  | "tectonic-tread"
  | "kinetic-monolith";

export type AtcAprilPostSlot = {
  /** ISO date YYYY-MM-DD */
  date: string;
  weekday: "Mon" | "Wed" | "Fri";
  templateNumber: AtcAprilTemplateNum;
  preset: AtcAprilPresetId;
  /** Short label in the planner table */
  productLine: string;
  /** Ready-to-paste Facebook caption (you can tweak after export) */
  facebookCaption: string;
  /** Merged onto defaults for `preset` in the overlay studio */
  copyPatch: Record<string, string>;
};

const LOC =
  "📍 26 St Columb Rd, New Redruth, Alberton, 1449\n📞 011 907 8495\n📱 WhatsApp 081 884 9807\n🌐 albertontyreclinic.co.za";

export const ATC_APRIL_POST_SLOTS: AtcAprilPostSlot[] = [
  {
    date: "2026-04-01",
    weekday: "Wed",
    templateNumber: 1,
    preset: "velocity-premium",
    productLine: "Continental · PremiumContact 7 · wet safety",
    facebookCaption: `Don't let the rain dictate your drive. 🌧️

Continental PremiumContact 7, engineered for control and confident braking in wet and dry conditions. Perfect for unpredictable SA storms.

👉 Quote & fitment at Alberton Tyre Clinic.

${LOC}

#ContinentalTyres #PremiumContact7 #AlbertonTyreClinic #WetWeather #RoadSafety`,
    copyPatch: {
      brandName: "ALBERTON TYRE CLINIC",
      squareStatusPill: "Brand",
      squareTechHighlight: "Featured Product",
      squareTechLine: "Continental PremiumContact 7",
      headlinePrimary: "Rain",
      headlineMuted: "Controlled.",
      squareButtonText: "011 907 8495",
      verticalStoreLoc: "ALBERTON · CONTINENTAL",
      verticalStatusPill: "Brand",
      verticalProductLine: "Continental PremiumContact 7",
      subtext:
        "Continental PremiumContact 7, next-level wet control for South African roads. We match, balance, and fit so your family car stops when it matters.",
      priceLabel: "Quote",
      priceValue: "Same-day bay",
      verticalButtonText: "011 907 8495",
    },
  },
  {
    date: "2026-04-03",
    weekday: "Fri",
    templateNumber: 2,
    preset: "kinetic-grip",
    productLine: "Dunlop · Grandtrek AT5 · all-terrain",
    facebookCaption: `Weekend escape? You need tyres that can keep up. 🛻

Dunlop Grandtrek AT5, all-terrain grip with the backing of Dunlop Sure. Fitted by pros who know bakkies.

👉 Alberton Tyre Clinic

${LOC}

#Dunlop #Grandtrek #AllTerrain #BakkieLife #AlbertonTyreClinic`,
    copyPatch: {
      gripVerticalPartnerBadge: "Dunlop Zone",
      gripVerticalSpecTag1: "Grandtrek AT5",
      gripVerticalSpecTag2: "All-Terrain",
      gripVerticalHeadlineSolid: "Terrain.",
      gripVerticalHeadlineOutline: "Tamed.",
      gripVerticalSubtext:
        "Dunlop Grandtrek AT5, stone ejector tech and Sure peace of mind. Built for gravel, tar, and everything between.",
      gripVerticalProductBrand: "Dunlop Grandtrek AT5",
      gripVerticalProductSub: "All-Terrain Fitment",
      gripVerticalPhone: "011 907 8495",
      gripSquareBrandPill: "Alberton Tyre Clinic",
      gripSquareHeroSolid: "Gravel.",
      gripSquareHeroOutline: "Grip.",
      gripSquareProductTitle: "Dunlop Grandtrek AT5",
      gripSquareProductSub: "Bakkie & SUV AT",
      gripSquareSpecMini1: "Dunlop Sure",
      gripSquareSpecMini2: "Stone Ejectors",
      gripSquareAuthTag: "Dunlop Zone",
      gripSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-06",
    weekday: "Mon",
    templateNumber: 3,
    preset: "commercial-transit",
    productLine: "Fleet & commercial · priority fitment",
    facebookCaption: `Downtime costs money. ⚙️

Commercial tyres and laser alignment at Alberton Tyre Clinic, keep your fleet rolling with priority bay access and brands you trust.

${LOC}

#FleetTyres #CommercialVehicles #AlbertonTyreClinic #Logistics`,
    copyPatch: {
      commVerticalCorpBadge: "Fleet Services",
      commVerticalSpec1: "Priority bays",
      commVerticalSpec2: "3D alignment",
      commVerticalHeadlineLine1: "Fleet.",
      commVerticalHeadlineLine2: "Moving.",
      commVerticalSubtext:
        "Premium fitment for vans, LDVs, and work trucks. Tyres, balancing, and alignment, one base in Alberton.",
      commVerticalServiceTitle: "Commercial Fleet Desk",
      commVerticalServiceSub: "Alberton Base",
      commVerticalPhone: "011 907 8495",
      commSquareHeroLine1: "Zero",
      commSquareHeroLine2: "downtime.",
      commSquareServiceTitle: "Fleet tyre & alignment",
      commSquareServiceSub:
        "Dunlop, Bridgestone, Continental & more, stocked and fitted fast.",
      commSquareSpec1: "Priority access",
      commSquareSpec2: "Workshop rated",
      commSquareActionLbl: "Fleet quote",
      commSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-08",
    weekday: "Wed",
    templateNumber: 4,
    preset: "tectonic-tread",
    productLine: "Bridgestone · Dueler A/T 002",
    facebookCaption: `Bakkie brawn meets serious engineering. 🔥

Bridgestone Dueler A/T 002, all-terrain confidence with Bridgestone backing. Ask us about mileage and damage guarantee programmes on select lines.

👉 Alberton Tyre Clinic

${LOC}

#Bridgestone #Dueler #AllTerrain #AlbertonTyreClinic`,
    copyPatch: {
      duelSquareHeroL1: "Lamborghini DNA.",
      duelSquareHeroL2Outline: "Bakkie Brawn.",
      duelSquareProductTitle: "Bridgestone Dueler A/T 002",
      duelSquareProductSub: "Premium All-Terrain Fitment",
      duelSquareSpec1: "Mileage focus",
      duelSquareSpec2: "AT confidence",
      duelVerticalBrandBadge: "Bridgestone",
      duelVerticalSpec1: "Dueler A/T 002",
      duelVerticalSpec2: "SUV & bakkie",
      duelVerticalHeadlineL1: "Dueler DNA.",
      duelVerticalHeadlineL2Outline: "AT Dominance.",
      duelVerticalSubtext:
        "Bridgestone Dueler A/T 002, engineered for mixed surfaces and loaded decks. Fitted and balanced at Alberton Tyre Clinic.",
      duelVerticalServiceTitle: "Dueler A/T 002",
      duelVerticalServiceSub: "Ask in store for offers",
      duelVerticalPhone: "011 907 8495",
      duelSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-10",
    weekday: "Fri",
    templateNumber: 5,
    preset: "kinetic-monolith",
    productLine: "Continental · UltraContact · mileage",
    facebookCaption: `Rough roads? High kilometres? 🛣️

Continental UltraContact, durable compound and casing built for long life on SA roads.

👉 Upgrade at Alberton Tyre Clinic.

${LOC}

#Continental #UltraContact #TyreLife #AlbertonTyreClinic`,
    copyPatch: {
      kineticTelemetryText: "MILEAGE // CONTACT PATCH",
      kineticVerticalBrandTag: "Alberton Tyre Clinic",
      kineticHeroSolid: "Further.",
      kineticHeroOutline: "Per km.",
      kineticVerticalWidgetBefore:
        "UltraContact, fewer tyre worries with ",
      kineticVerticalWidgetStrong: "durability-first design",
      kineticVerticalWidgetAfter: ". We measure, fit, and balance for even wear.",
      kineticVerticalMetricVal: "Ultra",
      kineticVerticalMetricLbl: "Contact range",
      kineticVerticalCta: "011 907 8495",
      kineticSquareBrandTag: "Alberton Tyre Clinic · Continental",
      kineticSquareWidgetBefore: "UltraContact: ",
      kineticSquareWidgetStrong: "high-mileage casing",
      kineticSquareWidgetAfter: ", ask us for the right size for your car.",
      kineticSquareMetricLbl: "Focus",
      kineticSquareMetricVal: "Wear life",
      kineticSquareCta: "011 907 8495",
    },
  },
  {
    date: "2026-04-13",
    weekday: "Mon",
    templateNumber: 1,
    preset: "velocity-premium",
    productLine: "Goodyear · EfficientGrip 2 · comfort",
    facebookCaption: `Quieter cabin. Confident grip. ✅

Goodyear EfficientGrip 2, comfort-oriented touring for daily drivers and highway kms.

👉 Fitted at Alberton Tyre Clinic.

${LOC}

#Goodyear #EfficientGrip #AlbertonTyreClinic #DailyDriver`,
    copyPatch: {
      brandName: "ALBERTON TYRE CLINIC",
      squareStatusPill: "Brand",
      squareTechHighlight: "Featured Product",
      squareTechLine: "Goodyear EfficientGrip 2",
      headlinePrimary: "Comfort.",
      headlineMuted: "Locked.",
      squareButtonText: "011 907 8495",
      verticalStoreLoc: "ALBERTON · GOODYEAR",
      verticalStatusPill: "Brand",
      verticalProductLine: "Goodyear EfficientGrip 2",
      subtext:
        "Goodyear EfficientGrip 2, reduced cabin noise with grip you notice when it rains. We'll match OE or upgrade with honest advice.",
      priceLabel: "Fitment",
      priceValue: "While you wait",
      verticalButtonText: "011 907 8495",
    },
  },
  {
    date: "2026-04-15",
    weekday: "Wed",
    templateNumber: 2,
    preset: "kinetic-grip",
    productLine: "Dunlop · SP Sport LM705 · highway comfort",
    facebookCaption: `Daily driver? Dunlop has you covered. 🚗

SP Sport LM705, balanced wet grip and comfort for sedans and hatches.

👉 Alberton Tyre Clinic · Dunlop Zone

${LOC}

#Dunlop #SPSport #AlbertonTyreClinic`,
    copyPatch: {
      gripVerticalPartnerBadge: "Dunlop Zone",
      gripVerticalSpecTag1: "SP Sport LM705",
      gripVerticalSpecTag2: "Wet grip",
      gripVerticalHeadlineSolid: "Daily.",
      gripVerticalHeadlineOutline: "Sorted.",
      gripVerticalSubtext:
        "Dunlop SP Sport LM705, the upgrade your commute deserves. Fitted with Road-Force aware balancing when you need it.",
      gripVerticalProductBrand: "Dunlop SP Sport LM705",
      gripVerticalProductSub: "Passenger range",
      gripVerticalPhone: "011 907 8495",
      gripSquareBrandPill: "Alberton Tyre Clinic",
      gripSquareHeroSolid: "Smooth.",
      gripSquareHeroOutline: "Grip.",
      gripSquareProductTitle: "Dunlop SP Sport LM705",
      gripSquareProductSub: "Comfort touring",
      gripSquareSpecMini1: "Dunlop Zone",
      gripSquareSpecMini2: "Fast fitment",
      gripSquareAuthTag: "Alberton",
      gripSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-17",
    weekday: "Fri",
    templateNumber: 3,
    preset: "commercial-transit",
    productLine: "Bridgestone · Turanza · luxury touring",
    facebookCaption: `Luxury sedan energy, without the luxury wait. ✨

Bridgestone Turanza touring range: quiet, stable, and refined. Perfect for premium daily drivers.

👉 Alberton Tyre Clinic

${LOC}

#Bridgestone #Turanza #AlbertonTyreClinic #LuxuryCars`,
    copyPatch: {
      commVerticalCorpBadge: "Bridgestone",
      commVerticalSpec1: "Quiet ride",
      commVerticalSpec2: "Touring stable",
      commVerticalHeadlineLine1: "Turanza.",
      commVerticalHeadlineLine2: "Refined.",
      commVerticalSubtext:
        "Bridgestone Turanza, engineered for comfort-first touring. We stock popular sizes; call ahead for same-day fitment.",
      commVerticalServiceTitle: "Bridgestone Turanza",
      commVerticalServiceSub: "Touring fitment",
      commVerticalPhone: "011 907 8495",
      commSquareHeroLine1: "Quiet",
      commSquareHeroLine2: "cabin.",
      commSquareServiceTitle: "Turanza touring line",
      commSquareServiceSub:
        "Premium touring tyres, sized, fitted, and aligned in Alberton.",
      commSquareSpec1: "Comfort focus",
      commSquareSpec2: "Stock enquiries",
      commSquareActionLbl: "Call us",
      commSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-20",
    weekday: "Mon",
    templateNumber: 4,
    preset: "tectonic-tread",
    productLine: "Bridgestone · Potenza Sport · performance",
    facebookCaption: `If you drive it like you mean it, equip it like you mean it. ⚡

Bridgestone Potenza Sport, sharp steering and dry grip for performance cars (subject to size availability).

👉 Alberton Tyre Clinic

${LOC}

#Bridgestone #Potenza #PerformanceTyres #AlbertonTyreClinic`,
    copyPatch: {
      duelSquareHeroL1: "Potenza.",
      duelSquareHeroL2Outline: "On rails.",
      duelSquareProductTitle: "Bridgestone Potenza Sport",
      duelSquareProductSub: "Ultra-high performance",
      duelSquareSpec1: "Dry grip",
      duelSquareSpec2: "Sharp response",
      duelVerticalBrandBadge: "Potenza",
      duelVerticalSpec1: "UHP range",
      duelVerticalSpec2: "Performance fitment",
      duelVerticalHeadlineL1: "Response.",
      duelVerticalHeadlineL2Outline: "Instant.",
      duelVerticalSubtext:
        "Bridgestone Potenza Sport, for drivers who want feedback and footprint. Ask us for UHP sizes and track-day friendly options.",
      duelVerticalServiceTitle: "Potenza Sport",
      duelVerticalServiceSub: "Check availability",
      duelVerticalPhone: "011 907 8495",
      duelSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-22",
    weekday: "Wed",
    templateNumber: 5,
    preset: "kinetic-monolith",
    productLine: "Workshop · Road-Force balance spotlight",
    facebookCaption: `Vibration at speed? Don't ignore it. ⚙️

Road-Force balancing and expert fitment at Alberton Tyre Clinic. We chase the shakes other shops miss.

${LOC}

#RoadForce #WheelBalance #AlbertonTyreClinic`,
    copyPatch: {
      kineticTelemetryText: "BALANCE // ROAD-FORCE",
      kineticVerticalBrandTag: "Alberton Tyre Clinic",
      kineticHeroSolid: "Smooth.",
      kineticHeroOutline: "Proof.",
      kineticVerticalWidgetBefore: "We diagnose high-speed vibration with ",
      kineticVerticalWidgetStrong: "Road-Force aware balancing",
      kineticVerticalWidgetAfter: " and precision mounting.",
      kineticVerticalMetricVal: "Expert balancing",
      kineticVerticalMetricLbl: "Road-Force bay",
      kineticVerticalCta: "011 907 8495",
      kineticSquareBrandTag: "Alberton Tyre Clinic",
      kineticSquareWidgetBefore: "Stop guessing, ",
      kineticSquareWidgetStrong: "measure first",
      kineticSquareWidgetAfter: ", then balance. Your steering wheel will tell the difference.",
      kineticSquareMetricLbl: "Service",
      kineticSquareMetricVal: "Road-Force",
      kineticSquareCta: "011 907 8495",
    },
  },
  {
    date: "2026-04-24",
    weekday: "Fri",
    templateNumber: 1,
    preset: "velocity-premium",
    productLine: "Multi-brand · SUV & family safety focus",
    facebookCaption: `School run season, tyres are homework too. 🚸

Right size, right pressure, right tread depth. We carry major brands and honest advice for SUVs and family cars.

👉 Alberton Tyre Clinic

${LOC}

#TyreSafety #FamilyCar #AlbertonTyreClinic`,
    copyPatch: {
      brandName: "ALBERTON TYRE CLINIC",
      squareStatusPill: "Brand",
      squareTechHighlight: "Featured Product",
      squareTechLine: "Major brands · honest SUV advice",
      headlinePrimary: "Family.",
      headlineMuted: "First.",
      squareButtonText: "011 907 8495",
      verticalStoreLoc: "ALBERTON · TYRE SAFETY",
      verticalStatusPill: "Brand",
      verticalProductLine: "Major brands · honest SUV advice",
      subtext:
        "From Dunlop to Bridgestone to Continental, we help you pick the tyre that matches how you drive, not just the poster on the wall.",
      priceLabel: "Visit",
      priceValue: "St Columb Rd",
      verticalButtonText: "011 907 8495",
    },
  },
  {
    date: "2026-04-27",
    weekday: "Mon",
    templateNumber: 2,
    preset: "kinetic-grip",
    productLine: "Maxxis · dual-sport AT (seasonal)",
    facebookCaption: `Adventure calling? Fit rubber that won't flinch. 🏞️

Ask about Maxxis all-terrain options in stock, tough patterns for weekend trails and weekday tar.

👉 Alberton Tyre Clinic

${LOC}

#Maxxis #AllTerrain #AlbertonTyreClinic`,
    copyPatch: {
      gripVerticalPartnerBadge: "AT Specialist",
      gripVerticalSpecTag1: "Maxxis AT",
      gripVerticalSpecTag2: "Weekend ready",
      gripVerticalHeadlineSolid: "Trail.",
      gripVerticalHeadlineOutline: "Ready.",
      gripVerticalSubtext:
        "Maxxis all-terrain lines, popular on bakkies that work Mon–Fri and explore Sat–Sun. Stock varies; message us your size.",
      gripVerticalProductBrand: "Maxxis AT range",
      gripVerticalProductSub: "While stocks last",
      gripVerticalPhone: "011 907 8495",
      gripSquareBrandPill: "Alberton Tyre Clinic",
      gripSquareHeroSolid: "Weekend.",
      gripSquareHeroOutline: "Grip.",
      gripSquareProductTitle: "Maxxis AT options",
      gripSquareProductSub: "Bakkie & SUV",
      gripSquareSpecMini1: "Trail pattern",
      gripSquareSpecMini2: "Tar friendly",
      gripSquareAuthTag: "Ask in store",
      gripSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-29",
    weekday: "Wed",
    templateNumber: 3,
    preset: "commercial-transit",
    productLine: "Run-flat & premium SUV enquiries",
    facebookCaption: `Run-flat or low-profile SUV? We speak your size language. 🔧

Premium fitment, careful mounting, and alignment, protect those expensive rims at Alberton Tyre Clinic.

${LOC}

#RunFlat #SUV #AlbertonTyreClinic`,
    copyPatch: {
      commVerticalCorpBadge: "Premium SUV",
      commVerticalSpec1: "Run-flat savvy",
      commVerticalSpec2: "Low profile OK",
      commVerticalHeadlineLine1: "Premium.",
      commVerticalHeadlineLine2: "Handled.",
      commVerticalSubtext:
        "Low-profile and run-flat tyres need skilled mounting, our workshop is set up for performance and luxury fitments.",
      commVerticalServiceTitle: "Premium fitment desk",
      commVerticalServiceSub: "Book ahead",
      commVerticalPhone: "011 907 8495",
      commSquareHeroLine1: "Rims",
      commSquareHeroLine2: "protected.",
      commSquareServiceTitle: "Run-flat & UHP",
      commSquareServiceSub:
        "Careful mounting, torqued to spec, Alberton's tyre clinic for picky cars.",
      commSquareSpec1: "Run-flat stock",
      commSquareSpec2: "SUV specialists",
      commSquareActionLbl: "WhatsApp size",
      commSquarePhone: "011 907 8495",
    },
  },
];

export const ATC_APRIL_TEMPLATE_LABELS: Record<AtcAprilTemplateNum, string> =
  {
    1: "Template 1 · Velocity / Fitment Lab",
    2: "Template 2 · Kinetic Grip (Dunlop HUD)",
    3: "Template 3 · Commercial Transit",
    4: "Template 4 · Tectonic Tread (Bridgestone ribbon)",
    5: "Template 5 · Kinetic Monolith",
  };

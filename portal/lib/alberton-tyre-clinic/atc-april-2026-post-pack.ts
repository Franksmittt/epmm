/**
 * April–May 2026 post calendar for Alberton Tyre Clinic (Mon / Wed / Fri).
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
  /**
   * Optional 1:1 shipped creative under `portal/public` (path as seen by the browser).
   * Manual ads: ATC_ad1 … ad6 map to post dates 24 Apr, 27 Apr, 29 Apr, 1 May, 4 May, 6 May 2026.
   */
  squareAssetUrl?: string;
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
      gripVerticalPartnerBadge: "BRAND",
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
      duelSquareBrandBadge: "Bridgestone",
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
      gripVerticalPartnerBadge: "BRAND",
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
      duelSquareBrandBadge: "Bridgestone",
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
    templateNumber: 4,
    preset: "tectonic-tread",
    squareAssetUrl: "/uploads/alberton-tyre-clinic/2026-04-24-square.png",
    productLine: "BFGoodrich · All-Terrain T/A KO2 · off-road",
    facebookCaption: `Don't just drive the dirt. Dominate it. 🛻💨

The BFGoodrich All-Terrain T/A KO2 is the undisputed gold standard for South African off-roaders for a reason. Featuring race-proven CoreGard Technology, these tires offer significantly tougher sidewalls and ruthless traction. Whether you're dodging local potholes or tackling severe rock crawling, you need rubber that fights back.

Get your bakkie ready for the dirt with the experts at Alberton Tyre Clinic.

📍 Alberton Tyre Clinic
🏢 26 St Columb Rd, New Redruth, Alberton, 1449
📞 011 907 8495 (Landline)
📱 081 884 9807 (WhatsApp)
💻 https://www.albertontyreclinic.co.za/

#BFGoodrich #TAKO2 #OffRoadSA #BakkieLife #AlbertonTyreClinic #4x4SouthAfrica #NewRedruth`,
    copyPatch: {
      duelSquareBrandBadge: "BFGoodrich",
      duelSquareHeroL1: "CoreGard.",
      duelSquareHeroL2Outline: "KO2.",
      duelSquareProductTitle: "BFGoodrich All-Terrain T/A KO2",
      duelSquareProductSub: "Premium AT fitment",
      duelSquareSpec1: "Sidewall toughness",
      duelSquareSpec2: "Off-road grip",
      duelVerticalBrandBadge: "BFGoodrich",
      duelVerticalSpec1: "All-Terrain T/A KO2",
      duelVerticalSpec2: "Bakkie & 4x4",
      duelVerticalHeadlineL1: "Dominate.",
      duelVerticalHeadlineL2Outline: "The dirt.",
      duelVerticalSubtext:
        "BFGoodrich KO2 with CoreGard Technology — tougher sidewalls and traction for SA conditions. Fitted at Alberton Tyre Clinic.",
      duelVerticalServiceTitle: "BFGoodrich KO2",
      duelVerticalServiceSub: "Quote & fitment",
      duelVerticalPhone: "011 907 8495",
      duelSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-27",
    weekday: "Mon",
    templateNumber: 2,
    preset: "kinetic-grip",
    squareAssetUrl: "/uploads/alberton-tyre-clinic/2026-04-27-square.png",
    productLine: "Dunlop · SP Touring R1 L · daily commuter",
    facebookCaption: `Daily commuting doesn't have to chew through your tread. 🛣️🚗

Engineered specifically for abrasive South African road conditions, the Dunlop SP Touring R1 L delivers premium safety and up to 6% more mileage than its predecessor. Keep your family safe on the tarmac with superior wet grip and a deeper tread life—without breaking the bank.

Don't let worn tires compromise your daily school run. Drop in for a quick, professional fitment today.

📍 Alberton Tyre Clinic
🏢 26 St Columb Rd, New Redruth, Alberton, 1449
📞 011 907 8495 (Landline)
📱 081 884 9807 (WhatsApp)
💻 https://www.albertontyreclinic.co.za/

#DunlopTyres #DailyDrive #RoadSafetySA #TyreFitment #Alberton #JohannesburgSouth #VWPolo`,
    copyPatch: {
      gripVerticalPartnerBadge: "BRAND",
      gripVerticalHeadlineSolid: "Daily.",
      gripVerticalHeadlineOutline: "Further.",
      gripVerticalSubtext:
        "Dunlop SP Touring R1 L — more mileage vs predecessor, wet grip and tread life for abrasive SA roads. Fitted at Alberton Tyre Clinic.",
      gripVerticalProductBrand: "Dunlop SP Touring R1 L",
      gripVerticalProductSub: "Commuter touring",
      gripVerticalPhone: "011 907 8495",
      gripSquareBrandPill: "Alberton Tyre Clinic",
      gripSquareHeroSolid: "School run.",
      gripSquareHeroOutline: "Safe.",
      gripSquareProductTitle: "Dunlop SP Touring R1 L",
      gripSquareProductSub: "Daily drive tyres",
      gripSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-04-29",
    weekday: "Wed",
    templateNumber: 5,
    preset: "kinetic-monolith",
    squareAssetUrl: "/uploads/alberton-tyre-clinic/2026-04-29-square.png",
    productLine: "Black Rhino · Vagabond · Fusion Forged wheels",
    facebookCaption: `Stance. Strength. Absolute presence. 🔥

Transform your rig's stance with the Black Rhino Vagabond. These aren't just cheap show rims—they are Fusion Forged alloys specifically engineered for serious structural integrity to support the heavy load ratings of your overland rigs and SUVs. Matte black, rugged, and built to take a beating while looking flawless.

Bring your Ranger or Hilux to the pros. We’ll get them fitted and balanced with absolute precision.

📍 Alberton Tyre Clinic
🏢 26 St Columb Rd, New Redruth, Alberton, 1449
📞 011 907 8495 (Landline)
📱 081 884 9807 (WhatsApp)
💻 https://www.albertontyreclinic.co.za/

#BlackRhinoWheels #MagWheels #ToyotaHilux #FordRanger #AlbertonTyreClinic #BakkieUpgrades #OverlandSA`,
    copyPatch: {
      kineticTelemetryText: "WHEELS // FORGED",
      kineticVerticalBrandTag: "Alberton Tyre Clinic",
      kineticHeroSolid: "Stance.",
      kineticHeroOutline: "Locked.",
      kineticVerticalWidgetBefore: "Black Rhino Vagabond — ",
      kineticVerticalWidgetStrong: "Fusion Forged",
      kineticVerticalWidgetAfter: " alloys for load-rated overland and SUV builds. Fitted and balanced in-house.",
      kineticVerticalMetricVal: "Vagabond",
      kineticVerticalMetricLbl: "Black Rhino",
      kineticVerticalCta: "011 907 8495",
      kineticSquareBrandTag: "Alberton Tyre Clinic · Wheels",
      kineticSquareWidgetBefore: "Matte black presence: ",
      kineticSquareWidgetStrong: "Black Rhino Vagabond",
      kineticSquareWidgetAfter: ", precision fitment for Ranger, Hilux, and more.",
      kineticSquareMetricLbl: "Range",
      kineticSquareMetricVal: "Forged SUV",
      kineticSquareCta: "011 907 8495",
    },
  },
  {
    date: "2026-05-01",
    weekday: "Fri",
    templateNumber: 1,
    preset: "velocity-premium",
    squareAssetUrl: "/uploads/alberton-tyre-clinic/2026-05-01-square.png",
    productLine: "Yokohama · BluEarth-Es ES32 · efficiency",
    facebookCaption: `Save at the pumps. Stay safe on the road. ⛽🛡️

The Yokohama BluEarth-Es ES32 is the ultimate smart upgrade for your family hatchback. Combining premium Japanese engineering with everyday reliability, this tire offers a remarkably quiet ride, brilliant wet grip, and reduced rolling resistance—meaning your tank takes you further.

Experience the difference of an honest, hard-working local team that puts your safety first.

📍 Alberton Tyre Clinic
🏢 26 St Columb Rd, New Redruth, Alberton, 1449
📞 011 907 8495 (Landline)
📱 081 884 9807 (WhatsApp)
💻 https://www.albertontyreclinic.co.za/

#YokohamaTyres #FuelEfficiency #SuzukiSwift #EcoFriendlyDriving #AlbertonBusiness #TyreSafety`,
    copyPatch: {
      brandName: "ALBERTON TYRE CLINIC",
      squareStatusPill: "Brand",
      squareTechHighlight: "Featured Product",
      squareTechLine: "Yokohama BluEarth-Es ES32",
      headlinePrimary: "Further.",
      headlineMuted: "Per tank.",
      squareButtonText: "011 907 8495",
      verticalStoreLoc: "ALBERTON · YOKOHAMA",
      verticalStatusPill: "Brand",
      verticalProductLine: "Yokohama BluEarth-Es ES32",
      subtext:
        "BluEarth-Es ES32 — quiet ride, wet grip, and lower rolling resistance for hatchbacks and family cars. Fitted at Alberton Tyre Clinic.",
      priceLabel: "Quote",
      priceValue: "Same-day bay",
      verticalButtonText: "011 907 8495",
    },
  },
  {
    date: "2026-05-04",
    weekday: "Mon",
    templateNumber: 4,
    preset: "tectonic-tread",
    squareAssetUrl: "/uploads/alberton-tyre-clinic/2026-05-04-square.png",
    productLine: "Pirelli · Scorpion All Terrain Plus · luxury SUV",
    facebookCaption: `Luxury meets the wild. 🏔️✨

Why compromise your SUV's premium ride when the pavement ends? The Pirelli Scorpion All Terrain Plus brings high-performance engineering directly to your luxury 4x4. Featuring highly aggressive tread patterns optimized for extreme durability, mud traction, and high resistance to sidewall cuts.

Look incredible. Perform anywhere. Trust your premium vehicle to Alberton's leading fitment specialists.

📍 Alberton Tyre Clinic
🏢 26 St Columb Rd, New Redruth, Alberton, 1449
📞 011 907 8495 (Landline)
📱 081 884 9807 (WhatsApp)
💻 https://www.albertontyreclinic.co.za/

#PirelliScorpion #LuxurySUV #4x4SouthAfrica #PremiumTyres #AlbertonTyreClinic #JohannesburgCars`,
    copyPatch: {
      duelSquareBrandBadge: "Pirelli",
      duelSquareHeroL1: "Scorpion.",
      duelSquareHeroL2Outline: "Anywhere.",
      duelSquareProductTitle: "Pirelli Scorpion All Terrain Plus",
      duelSquareProductSub: "Luxury 4x4 AT",
      duelSquareSpec1: "Mud traction",
      duelSquareSpec2: "Sidewall cuts",
      duelVerticalBrandBadge: "Pirelli",
      duelVerticalSpec1: "Scorpion AT Plus",
      duelVerticalSpec2: "Premium SUV",
      duelVerticalHeadlineL1: "Luxury.",
      duelVerticalHeadlineL2Outline: "Off-road.",
      duelVerticalSubtext:
        "Scorpion All Terrain Plus — aggressive pattern, durability, and sidewall resistance for luxury 4x4s. Fitted at Alberton Tyre Clinic.",
      duelVerticalServiceTitle: "Pirelli Scorpion AT+",
      duelVerticalServiceSub: "Premium fitment",
      duelVerticalPhone: "011 907 8495",
      duelSquarePhone: "011 907 8495",
    },
  },
  {
    date: "2026-05-06",
    weekday: "Wed",
    templateNumber: 4,
    preset: "tectonic-tread",
    squareAssetUrl: "/uploads/alberton-tyre-clinic/2026-05-06-square.png",
    productLine: "Bridgestone · Dueler A/T 002 · alignment",
    facebookCaption: `Premium rubber deserves millimeter-perfect precision. 📐🛠️

The Bridgestone Dueler A/T 002 is an absolute beast, boasting a massive 40% improvement in mileage over its predecessor while balancing on-road comfort with intense off-road grip. But to get that kind of longevity, your setup needs to be flawless. Potholes knock your suspension out of spec and chew through your tread.

Let our expert technicians use advanced 3D laser alignment technology to lock in your geometry and maximize the life of your new tires.

📍 Alberton Tyre Clinic
🏢 26 St Columb Rd, New Redruth, Alberton, 1449
📞 011 907 8495 (Landline)
📱 081 884 9807 (WhatsApp)
💻 https://www.albertontyreclinic.co.za/

#BridgestoneDueler #WheelAlignment #TyreMaintenance #AlbertonTyreClinic #CarCareSA #GautengCars`,
    copyPatch: {
      duelSquareBrandBadge: "Bridgestone",
      duelSquareHeroL1: "Dueler.",
      duelSquareHeroL2Outline: "Aligned.",
      duelSquareProductTitle: "Bridgestone Dueler A/T 002",
      duelSquareProductSub: "AT + 3D laser alignment",
      duelSquareSpec1: "Mileage focus",
      duelSquareSpec2: "Geometry lock-in",
      duelVerticalBrandBadge: "Bridgestone",
      duelVerticalSpec1: "Dueler A/T 002",
      duelVerticalSpec2: "3D alignment",
      duelVerticalHeadlineL1: "Precision.",
      duelVerticalHeadlineL2Outline: "Longevity.",
      duelVerticalSubtext:
        "Dueler A/T 002 with big mileage gains — pair new rubber with 3D laser alignment so suspension geometry does not waste tread.",
      duelVerticalServiceTitle: "Dueler A/T 002",
      duelVerticalServiceSub: "Alignment bay",
      duelVerticalPhone: "011 907 8495",
      duelSquarePhone: "011 907 8495",
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

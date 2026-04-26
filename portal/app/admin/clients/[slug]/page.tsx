import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminMonthCalendar } from "@/components/admin/AdminMonthCalendar";
import { AdminMonthNav } from "@/components/admin/AdminMonthNav";
import { deleteClientDayAction } from "@/app/admin/actions";
import { SaveDayForm } from "@/app/admin/clients/[slug]/SaveDayForm";
import {
  getDayPostStatus,
  missingParts,
  parseYearMonth,
  summarizeClientMonth,
} from "@/lib/admin/schedule-helpers";
import { getClientBySlug } from "@/lib/clients/registry";
import { getSession } from "@/lib/auth/session";
import { loadAppData } from "@/lib/data/app-data";
import { EfsAdventureOverlayStudio } from "@/components/admin/absolute-offroad/EfsAdventureOverlayStudio";
import { AbmMasterBatteryOverlayStudio } from "@/components/admin/alberton-battery-mart/AbmMasterBatteryOverlayStudio";
import { AlbertonTyreClinicOverlayStudio } from "@/components/admin/alberton-tyre-clinic/AlbertonTyreClinicOverlayStudio";
import { AsBrokersOverlayStudio } from "@/components/admin/as-brokers/AsBrokersOverlayStudio";
import { EfsExpeditionHudOverlayStudio } from "@/components/admin/efs-suspension/EfsExpeditionHudOverlayStudio";
import { MaverickPaintingOverlayStudio } from "@/components/admin/maverick-painting/MaverickPaintingOverlayStudio";
import { OtmaRelocationRadarOverlayStudio } from "@/components/admin/on-the-move-again/OtmaRelocationRadarOverlayStudio";
import { EndpointMediaOverlayStudio } from "@/components/admin/endpoint-media/EndpointMediaOverlayStudio";
import { MiwesuWoodOverlayStudio } from "@/components/admin/miwesu-wood/MiwesuWoodOverlayStudio";
import { VaalpenskraalWoodOverlayStudio } from "@/components/admin/vaalpenskraal-wood/VaalpenskraalWoodOverlayStudio";
import { EverestWealthOverlayStudio } from "@/components/admin/everest-wealth/EverestWealthOverlayStudio";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ y?: string; m?: string; date?: string }>;
};

export default async function AdminClientSchedulePage({
  params,
  searchParams,
}: Props) {
  const { slug: raw } = await params;
  const sp = await searchParams;
  const slug = decodeURIComponent(raw);
  const client = getClientBySlug(slug);
  if (!client) {
    notFound();
  }

  const { year, month } = parseYearMonth(sp.y, sp.m);
  const selectedDate =
    typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)
      ? sp.date
      : undefined;

  const data = await loadAppData();
  const days = data.schedules[slug] ?? {};
  const sortedDates = Object.keys(days).sort().reverse();
  const summary = summarizeClientMonth(slug, year, month, data.schedules);

  const prefillCaption =
    selectedDate && days[selectedDate]?.caption
      ? days[selectedDate].caption
      : "";

  const monthTitle = new Date(year, month - 1, 1).toLocaleString("en-ZA", {
    month: "long",
    year: "numeric",
  });

  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin"
          className="text-sm text-[#8E8E93] hover:text-white"
        >
          ← All clients
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-[#8E8E93]">
              Code:{" "}
              <code className="text-white/90">{client.accessCode}</code> · /{slug}
            </p>
          </div>
          <Link
            href={`/admin/schedule?y=${year}&m=${month}&client=${encodeURIComponent(slug)}`}
            className="shrink-0 rounded-md border border-white/15 px-3 py-2 text-sm text-[#8E8E93] hover:border-white/25 hover:text-white"
          >
            View on master schedule →
          </Link>
        </div>
      </div>

      {slug === "absolute-offroad" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Five presets: EFS Adventure Pro, Onca Armor, Rock Sliders, Photon
              Lux (lighting beacon — own layout, AO blue + yellow), and DeGraaf
              Performance (cyan accent + glow). Separate square/vertical heroes,
              per-preset copy + JSON (
              <code className="text-white/80">preset</code> +{" "}
              <code className="text-white/80">efs-adventure-overlay</code>),
              export 1080×1080 and 1080×1920.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Absolute Offroad — overlay studio (1:1 + 9:16)
            </p>
            <EfsAdventureOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "alberton-battery-mart" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Six presets: Energy Core, Tactical HUD, Ignition Core (emergency red
              glass strip + terminal), Surge Matrix (industrial hash, static surge
              line, jumper strip / terminal), Rejuvenation Cell (charging vertical +
              glass terminal; slim square ribbon), and Data Matrix (“Did you know”
              SLA vs AGM comparison, grid + VS badge). Separate square/vertical
              heroes, copy + JSON per preset, export 1080×1080 and 1080×1920.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Master Battery — overlay presets
            </p>
            <AbmMasterBatteryOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "alberton-tyre-clinic" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Presets include Velocity Precision / Fitment Laboratory, Kinetic
              Grip (dark kinetic HUD), Commercial Transit (light fleet / glass
              terminal, #FF4500), Tectonic Tread (Bridgestone Dueler ribbon),
              Kinetic Monolith, Apex Interface, and Calibration Matrix.
              Per-preset copy + JSON (
              <code className="text-white/80">preset</code> +{" "}
              <code className="text-white/80">alberton-tyre-clinic-overlay</code>
              ), export 1080×1080 and 1080×1920.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Link
                href={`/admin/clients/${encodeURIComponent(slug)}/april-campaign`}
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                April 2026 post pack → pre-assigned templates + captions
              </Link>
              {isAdmin ? (
                <Link
                  href={`/admin/clients/${encodeURIComponent(slug)}/vault`}
                  className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
                >
                  Vault (admin only) → prompts + HTML archive
                </Link>
              ) : null}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Alberton Tyre Clinic — overlay studio
            </p>
            <AlbertonTyreClinicOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "as-brokers" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Presets: Glass Vault, Executive Ledger, Onyx Typographic, Wealth
              Terminal, Institutional Matrix (photo + scanner HUD), Titanium Vault.
              Photo heroes for Glass, Ledger, and Institutional Matrix; optional
              under Wealth Terminal grid. Per-preset copy and JSON (
              <code className="text-white/80">preset</code>), export 1080×1080 and
              1080×1920.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              AS Brokers — overlay studio (1:1 + 9:16)
            </p>
            <AsBrokersOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "efs-suspension" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Four presets: Expedition HUD, X-Ray / Scanner, Impact Stamp /
              Vertical Spine, Grid-Lock / Longitude. Separate square and vertical
              heroes, per-preset copy + JSON (
              <code className="text-white/80">preset</code>), export 1080×1080
              and 1080×1920 (EFS green / red).
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              EFS — overlay studio (1:1 + 9:16)
            </p>
            <EfsExpeditionHudOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "endpoint-media" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · generic templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Four presets: framed glass, cinematic aura, tactile HUD, and
              floating slate (legacy{" "}
              <code className="text-white/80">endpoint-media-framed-overlay</code>{" "}
              JSON still applies). Separate square and vertical hero
              images, per-preset copy + JSON (
              <code className="text-white/80">endpoint-media-overlay</code> ·{" "}
              <code className="text-white/80">preset</code>), export 1080×1080
              and 1080×1920. Inter typography.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Endpoint Media — generic overlays (1:1 + 9:16)
            </p>
            <EndpointMediaOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "miwesu-wood" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · Thermal dynamics
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Three presets: Thermal dynamics (ember Sekelbos-style), Braai mix
              (full-bleed + glass card / gold split-title square), Balanced burn
              (golden Geelhaak-style + companion square). Separate heroes per
              ratio, JSON (
              <code className="text-white/80">miwesu-wood-overlay</code> ·{" "}
              <code className="text-white/80">preset</code>), export 1080×1080 and
              1080×1920.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="/admin/legacy-studios/miwesu-carousel.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                Open legacy Miwesu carousel pack (vpk_braai_ultimate) →
              </a>
              <a
                href="/admin/legacy-studios/miwesu-firewood-elite-studio.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Miwesu elite pack (estate/performance/stripes) →
              </a>
              <a
                href="/admin/legacy-studios/miwesu-firewood-hilti-studio.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Miwesu Hilti pack →
              </a>
              <a
                href="/admin/legacy-studios/miwesu-firewood-fusion-studio.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Miwesu fusion pack →
              </a>
              <a
                href="/admin/legacy-studios/miwesu-firewood-titan-studio.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Miwesu titan pack →
              </a>
              <a
                href="/admin/legacy-studios/miwesu-firewood-converse-allstar.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Miwesu converse/all-star pack →
              </a>
              <a
                href="/admin/legacy-studios/miwesu-firewood-ua-monolithic.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Miwesu UA monolithic pack →
              </a>
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Miwesu Wood — firewood / braai (1:1 + 9:16)
            </p>
            <MiwesuWoodOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "vaalpenskraal-wood" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Overlay studio · Braai mix (flagship)
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
                Two presets:{" "}
                <strong className="text-white/90">Data Stream</strong>{" "}
                (overclocked ticker + italic hero + cyan HUD) and{" "}
                <strong className="text-white/90">Notification Bubble</strong>{" "}
                (spatial AR tag + speech bubbles + WhatsApp row). Separate square
                and vertical heroes, JSON (
                <code className="text-white/80">
                  vaalpenskraal-wood-braai-overlay
                </code>{" "}
                · <code className="text-white/80">preset</code>), export
                1080×1080 and 1080×1920. Colours: #FF3D00 / #00E5FF on black.
              </p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <a
                  href="/admin/legacy-studios/vaal-studio.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-orange-400 hover:text-orange-300"
                >
                  Open legacy Vaal studio pack (vpk_braai_ultimate) →
                </a>
              </p>
            </div>
            <Link
              href={`/admin/clients/${encodeURIComponent(slug)}/carousel`}
              className="shrink-0 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:border-white/35 hover:bg-white/10"
            >
              Facebook carousel studio (5 cards) →
            </Link>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Vaalpenskraal Wood — braai mix overlays (1:1 + 9:16)
            </p>
            <VaalpenskraalWoodOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "everest-wealth" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · wealth templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Five presets: gold fintech, Swiss vault (emerald + Playfair), cobalt
              terminal, horology crystal plaque, titanium and sapphire. Separate
              square and vertical heroes where applicable, optional vault texture,
              JSON (
              <code className="text-white/80">everest-wealth-overlay</code> ·{" "}
              <code className="text-white/80">preset</code>), export 1080×1080 and
              1080×1920.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Everest Wealth — overlay studio (1:1 + 9:16)
            </p>
            <EverestWealthOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "maverick-painting-contractors" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Four presets: Zenith Industrial Monolith, Structural HUD
              (blueprint), Enterprise Ecosystem (violet + trust blue), and Forensic
              Matrix (green + amber). Separate square/vertical heroes, per-preset
              copy + JSON (
              <code className="text-white/80">preset</code> +{" "}
              <code className="text-white/80">maverick-painting-overlay</code>),
              export 1080×1080 and 1080×1920.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="/admin/legacy-studios/index.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                Open Maverick legacy hub →
              </a>
              <a
                href="/admin/legacy-studios/maverick-social.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8E8E93] underline decoration-white/20 hover:text-white"
              >
                Open Maverick social pack (25 square templates) →
              </a>
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              Maverick Painting — Zenith Industrial Monolith
            </p>
            <MaverickPaintingOverlayStudio />
          </div>
        </section>
      ) : null}

      {slug === "on-the-move-again" ? (
        <section className="space-y-4 rounded-md border border-white/15 bg-[#1D1D1F] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Overlay studio · templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
              Twelve presets now available in the native dropdown, including
              Relocation Radar / REC Hook / Tracking UI / Waypoint compact / GPS
              Map Overlay / Goods-in-Transit / Accountability / Accredited /
              Corporate transit / Eco Estate Moves / Suburb Routing / Long
              Distance. Sky blue{" "}
              <code className="text-white/80">#0284c7</code>. Separate
              square/vertical heroes, per-preset copy + JSON (
              <code className="text-white/80">on-the-move-again-overlay</code>),
              export 1080×1080 and 1080×1920.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="/admin/legacy-studios/otma-studio.html"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                Open legacy OTMA studio pack (10 templates) →
              </a>
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
              On The Move Again — Relocation Radar (1:1 + 9:16)
            </p>
            <OtmaRelocationRadarOverlayStudio />
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-md border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-white">
            {monthTitle} · at a glance
          </h2>
          <AdminMonthNav
            basePath={`/admin/clients/${slug}`}
            year={year}
            month={month}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-md bg-white/5 px-2 py-1 text-[#8E8E93]">
            <span className="text-white">{summary.scheduled}</span> days with
            posts
          </span>
          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-200">
            <span className="font-medium">{summary.complete}</span> ready
          </span>
          <span className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-200">
            <span className="font-medium">{summary.incomplete}</span> need work
          </span>
        </div>
        <AdminMonthCalendar
          slug={slug}
          year={year}
          month={month}
          byDate={days}
        />
      </section>

      <SaveDayForm
        slug={slug}
        defaultDate={selectedDate}
        defaultCaption={prefillCaption}
      />

      {selectedDate && days[selectedDate] ? (
        <p className="text-xs text-[#8E8E93]">
          Editing{" "}
          <span className="text-white/90">{selectedDate}</span>
          {getDayPostStatus(days[selectedDate]) === "incomplete" ? (
            <>
              {" "}
              — still needed:{" "}
              {missingParts(days[selectedDate]).join(", ") || "review assets"}
            </>
          ) : null}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">All scheduled days</h2>
        <p className="text-xs text-[#8E8E93]">
          Newest first. Calendar above is fastest for spotting gaps in a month.
        </p>
        {sortedDates.length === 0 ? (
          <p className="text-sm text-[#8E8E93]">
            Nothing saved yet. Pick a date on the calendar or use the form.
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedDates.map((date) => {
              const row = days[date];
              const st = getDayPostStatus(row);
              const miss = missingParts(row);
              return (
                <li
                  key={date}
                  className="flex flex-col gap-2 rounded-md border border-white/15 bg-[#1D1D1F] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{date}</p>
                      {st === "complete" ? (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200">
                          Ready
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200">
                          Needs: {miss.join(", ")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[#8E8E93]">
                      {row.caption}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/clients/${slug}?y=${year}&m=${month}&date=${date}`}
                      className="rounded-md border border-white/20 px-3 py-2 text-xs text-white hover:bg-white/5"
                    >
                      Open in form
                    </Link>
                    <form action={deleteClientDayAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="date" value={date} />
                      <button
                        type="submit"
                        className="rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

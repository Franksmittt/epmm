import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientBySlug } from "@/lib/clients/registry";
import { VaalpenskraalWoodCarouselStudio } from "@/components/admin/vaalpenskraal-wood/VaalpenskraalWoodCarouselStudio";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminClientCarouselPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (slug !== "vaalpenskraal-wood") {
    notFound();
  }

  const client = getClientBySlug(slug);
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/clients/${encodeURIComponent(slug)}`}
        className="text-sm text-[#8E8E93] hover:text-white"
      >
        ← Back to {client.name} schedule
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Facebook carousel studio · Braai mix
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
          Five square cards (1080×1080) per template—Apple glass, Samsung OLED,
          Vision spatial, Nothing monospace, and Cyber HUD—plus a legacy simple
          mock. JSON + per-field copy match the flagship overlay workflow for
          Meta carousel ads.
        </p>
      </div>
      <section className="rounded-md border border-white/15 bg-[#1D1D1F] p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
          Vaalpenskraal Wood — carousel (5 × 1:1)
        </p>
        <VaalpenskraalWoodCarouselStudio />
      </section>
    </div>
  );
}

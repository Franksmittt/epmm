import Link from "next/link";
import { notFound } from "next/navigation";
import { AtcAprilCampaignPlanner } from "@/components/admin/alberton-tyre-clinic/AtcAprilCampaignPlanner";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminAtcAprilCampaignPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (slug !== "alberton-tyre-clinic") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/clients/${encodeURIComponent(slug)}`}
        className="text-sm text-[#8E8E93] hover:text-white"
      >
        ← Back to Alberton Tyre Clinic schedule
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-white">
          April post pack — graphics + captions
        </h1>
        <p className="mt-1 text-sm text-[#8E8E93]">
          Pre-built calendar for April 2026 (Mon / Wed / Fri). Load a slot,
          upload heroes, export, post.
        </p>
      </div>
      <AtcAprilCampaignPlanner />
    </div>
  );
}

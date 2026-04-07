import { notFound } from "next/navigation";
import { ClientShell } from "@/components/dashboard/ClientShell";
import { WeekBento } from "@/components/dashboard/WeekBento";
import { getClientBySlug } from "@/lib/clients/registry";
import { buildClientSchedule } from "@/lib/schedule/build-client-schedule";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ClientWeekPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  if (!getClientBySlug(slug)) {
    notFound();
  }

  const week = await buildClientSchedule(slug);

  return (
    <ClientShell clientName={week.clientDisplayName}>
      <div className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <header className="mb-10 space-y-2">
          <p className="text-sm text-[#8E8E93]">{week.weekLabel}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {week.clientDisplayName}
          </h1>
        </header>
        <WeekBento week={week} />
      </div>
    </ClientShell>
  );
}

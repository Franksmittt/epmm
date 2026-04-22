import Link from "next/link";
import { redirect } from "next/navigation";
import { RevokeToggleForm } from "@/app/admin/RevokeToggleForm";
import { parseYearMonth, summarizeClientMonth } from "@/lib/admin/schedule-helpers";
import { getSession } from "@/lib/auth/session";
import { CLIENTS } from "@/lib/clients/registry";
import { loadAppData } from "@/lib/data/app-data";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await getSession();
  if (session?.role === "coordinator") {
    redirect("/my-companies");
  }
  const data = await loadAppData();
  const { year, month } = parseYearMonth(null, null);
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("en-ZA", {
    month: "short",
    year: "numeric",
  });

  const clientsAlphabetical = [...CLIENTS].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  let totalScheduled = 0;
  let totalComplete = 0;
  let totalIncomplete = 0;

  for (const c of CLIENTS) {
    const s = summarizeClientMonth(c.slug, year, month, data.schedules);
    totalScheduled += s.scheduled;
    totalComplete += s.complete;
    totalIncomplete += s.incomplete;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-md border border-white/15 bg-[#1D1D1F] p-5">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#8E8E93]">
          Quick read for <span className="text-white/90">{monthLabel}</span>.
          Open <strong className="text-white/90">Master schedule</strong> to see
          every client in one table.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-md bg-black/40 px-3 py-2 text-[#8E8E93]">
            <span className="font-medium text-white">{totalScheduled}</span>{" "}
            post days
          </span>
          <span className="rounded-md bg-emerald-500/10 px-3 py-2 text-emerald-200">
            <span className="font-medium">{totalComplete}</span> ready
          </span>
          <span className="rounded-md bg-amber-500/10 px-3 py-2 text-amber-200">
            <span className="font-medium">{totalIncomplete}</span> need work
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/admin/schedule?y=${year}&m=${month}`}
            className="inline-flex rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black"
          >
            Open master schedule
          </Link>
          <Link
            href="/admin/rapid-studio"
            className="inline-flex rounded-md bg-[#d70a0a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
          >
            Rapid Studio
          </Link>
        </div>
      </section>

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Clients
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
          Codes stay the same unless you change them in code.{" "}
          <strong className="text-white/90">Revoke</strong> blocks login;
          restore anytime.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {clientsAlphabetical.map((c) => {
          const revoked = data.revokedSlugs.includes(c.slug);
          const s = summarizeClientMonth(c.slug, year, month, data.schedules);
          return (
            <li
              key={c.slug}
              className="flex flex-col gap-3 rounded-md border border-white/15 bg-[#1D1D1F] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="mt-1 font-mono text-xs text-[#8E8E93]">
                    {c.accessCode}
                  </p>
                  <p className="mt-2 text-xs text-[#8E8E93]">
                    <span className="text-white/80">{monthLabel}:</span>{" "}
                    {s.scheduled === 0 ? (
                      <span className="text-amber-200/90">no posts yet</span>
                    ) : (
                      <>
                        <span className="text-emerald-200/90">
                          {s.complete} ready
                        </span>
                        {s.incomplete > 0 ? (
                          <>
                            {" "}
                            ·{" "}
                            <span className="text-amber-200/90">
                              {s.incomplete} todo
                            </span>
                          </>
                        ) : null}
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={
                    revoked
                      ? "shrink-0 rounded-md bg-red-500/20 px-2 py-1 text-xs text-red-200"
                      : "shrink-0 rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200"
                  }
                >
                  {revoked ? "Revoked" : "Active"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/clients/${c.slug}`}
                  className="rounded-md border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5"
                >
                  Calendar & uploads
                </Link>
                <RevokeToggleForm slug={c.slug} revoked={revoked} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

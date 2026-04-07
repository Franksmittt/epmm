import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminMonthNav } from "@/components/admin/AdminMonthNav";
import {
  buildMasterSchedule,
  filterMasterRows,
  parseYearMonth,
  summarizeClientMonth,
} from "@/lib/admin/schedule-helpers";
import { getSession } from "@/lib/auth/session";
import { CLIENTS } from "@/lib/clients/registry";
import { loadAppData } from "@/lib/data/app-data";

export const dynamic = "force-dynamic";

type RowFilter = "all" | "complete" | "incomplete";

type Props = {
  searchParams: Promise<{
    y?: string;
    m?: string;
    client?: string;
    filter?: string;
  }>;
};

function scheduleQuery(
  base: string,
  year: number,
  month: number,
  opts: { client?: string; filter?: RowFilter } = {},
): string {
  const p = new URLSearchParams();
  p.set("y", String(year));
  p.set("m", String(month));
  if (opts.client) {
    p.set("client", opts.client);
  }
  if (opts.filter && opts.filter !== "all") {
    p.set("filter", opts.filter);
  }
  return `${base}?${p.toString()}`;
}

export default async function AdminMasterSchedulePage({ searchParams }: Props) {
  const session = await getSession();
  if (session?.role === "coordinator") {
    redirect("/my-companies");
  }
  const sp = await searchParams;
  const { year, month } = parseYearMonth(sp.y, sp.m);
  const clientFilter =
    typeof sp.client === "string" && sp.client.length > 0
      ? sp.client
      : undefined;
  const filterRaw = sp.filter ?? "all";
  const rowFilter: RowFilter =
    filterRaw === "complete" || filterRaw === "incomplete"
      ? filterRaw
      : "all";

  const data = await loadAppData();
  const allRows = buildMasterSchedule(CLIENTS, data.schedules);
  const rows = filterMasterRows(allRows, {
    year,
    month,
    clientSlug: clientFilter,
    status: rowFilter === "all" ? "all" : rowFilter,
  });

  const monthTitle = new Date(year, month - 1, 1).toLocaleString("en-ZA", {
    month: "long",
    year: "numeric",
  });

  let monthComplete = 0;
  let monthIncomplete = 0;
  let monthScheduled = 0;
  const idleClients: string[] = [];

  for (const c of CLIENTS) {
    const s = summarizeClientMonth(c.slug, year, month, data.schedules);
    monthScheduled += s.scheduled;
    monthComplete += s.complete;
    monthIncomplete += s.incomplete;
    if (s.scheduled === 0) {
      idleClients.push(c.name);
    }
  }

  const base = "/admin/schedule";

  const chipClass = (active: boolean) =>
    `rounded-md border px-3 py-1.5 text-xs ${
      active
        ? "border-white/40 bg-white/10 text-white"
        : "border-white/10 text-[#8E8E93] hover:border-white/20 hover:text-white"
    }`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-[#8E8E93] hover:text-white">
          ← All clients
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Master schedule
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
          Every scheduled day for every client in one place. Green = caption +
          square + vertical. Amber = still missing something. The banner lists
          clients with nothing saved for this month.
        </p>
      </div>

      <section className="space-y-3 rounded-md border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-medium text-white">{monthTitle}</h2>
          <AdminMonthNav basePath={base} year={year} month={month} />
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md bg-white/5 px-2 py-1 text-[#8E8E93]">
            <span className="text-white">{monthScheduled}</span> post days
          </span>
          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-200">
            <span className="font-medium">{monthComplete}</span> ready
          </span>
          <span className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-200">
            <span className="font-medium">{monthIncomplete}</span> incomplete
          </span>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8E8E93]">
            Filters
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={scheduleQuery(base, year, month, {
                client: clientFilter,
                filter: "all",
              })}
              className={chipClass(rowFilter === "all")}
            >
              All rows
            </Link>
            <Link
              href={scheduleQuery(base, year, month, {
                client: clientFilter,
                filter: "complete",
              })}
              className={chipClass(rowFilter === "complete")}
            >
              Ready only
            </Link>
            <Link
              href={scheduleQuery(base, year, month, {
                client: clientFilter,
                filter: "incomplete",
              })}
              className={chipClass(rowFilter === "incomplete")}
            >
              Needs work
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8E8E93]">Client:</span>
            <Link
              href={scheduleQuery(base, year, month, {
                filter: rowFilter,
              })}
              className={chipClass(!clientFilter)}
            >
              Everyone
            </Link>
            {CLIENTS.map((c) => (
              <Link
                key={c.slug}
                href={scheduleQuery(base, year, month, {
                  client: c.slug,
                  filter: rowFilter,
                })}
                className={chipClass(clientFilter === c.slug)}
                title={c.name}
              >
                <span className="max-w-[120px] truncate inline-block align-bottom">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {idleClients.length > 0 ? (
        <div className="rounded-md border border-white/10 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
          <span className="font-medium text-amber-200">No posts this month:</span>{" "}
          {idleClients.join(" · ")}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-white/15">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#1D1D1F] text-xs text-[#8E8E93]">
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Client</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Caption</th>
              <th className="px-3 py-3 font-medium">Sq</th>
              <th className="px-3 py-3 font-medium">Vert</th>
              <th className="px-3 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-[#8E8E93]"
                >
                  No rows match this month and filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={`${r.slug}-${r.date}`}
                  className="border-b border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-white">
                    {r.date}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-3 text-[#8E8E93]">
                    {r.clientName}
                  </td>
                  <td className="px-3 py-3">
                    {r.status === "complete" ? (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200">
                        Ready
                      </span>
                    ) : (
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200">
                        Todo
                      </span>
                    )}
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-3 text-[#8E8E93]">
                    {r.captionPreview || "—"}
                  </td>
                  <td className="px-3 py-3 text-center text-lg">
                    {r.hasSquare ? "✓" : "—"}
                  </td>
                  <td className="px-3 py-3 text-center text-lg">
                    {r.hasVertical ? "✓" : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/clients/${r.slug}?y=${year}&m=${month}&date=${r.date}`}
                      className="text-xs text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

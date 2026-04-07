import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientShell } from "@/components/dashboard/ClientShell";
import { getSession } from "@/lib/auth/session";
import { getCoordinatorClients } from "@/lib/clients/registry";

export const dynamic = "force-dynamic";

export default async function MyCompaniesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "admin") {
    redirect("/admin");
  }
  if (session.role === "client") {
    redirect(`/${session.clientSlug}`);
  }
  if (session.role !== "coordinator") {
    redirect("/login");
  }

  const clients = getCoordinatorClients();

  return (
    <ClientShell clientName="Your companies">
      <div className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <header className="mb-10 space-y-2">
          <p className="text-sm text-[#8E8E93]">Switch between brands</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Your scheduled content
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
            Open a company to see what to post, copy captions, and download
            images — the same dashboard your clients see with their login.
          </p>
        </header>

        <ul className="space-y-6">
          {clients.map((c) => (
            <li
              key={c.slug}
              className="rounded-md border border-white/15 bg-[#1D1D1F] p-5"
            >
              <h2 className="text-lg font-semibold text-white">{c.name}</h2>
              <p className="mt-2 text-sm text-[#8E8E93]">
                Posts, captions, and downloads for this brand.
              </p>
              <div className="mt-4">
                <Link
                  href={`/${c.slug}`}
                  className="inline-flex rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Open {c.name}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ClientShell>
  );
}

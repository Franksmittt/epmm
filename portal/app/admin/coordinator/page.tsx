import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCoordinatorClients } from "@/lib/clients/registry";

export const dynamic = "force-dynamic";

export default async function CoordinatorHubPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin");
  }
  if (session?.role !== "coordinator") {
    redirect("/login");
  }

  const clients = getCoordinatorClients();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Your companies</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
          Schedule and copy for Absolute Offroad, Alberton Battery Mart, and
          Alberton Tyre Clinic from one place — open each section below.
        </p>
      </div>

      <div className="space-y-8">
        {clients.map((c) => (
          <section
            key={c.slug}
            className="rounded-md border border-white/15 bg-[#1D1D1F] p-5"
          >
            <h2 className="text-lg font-semibold text-white">{c.name}</h2>
            <p className="mt-1 font-mono text-xs text-[#8E8E93]">
              Client access code: {c.accessCode}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/clients/${c.slug}`}
                className="rounded-md border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
              >
                Calendar & uploads
              </Link>
              <Link
                href={`/${c.slug}`}
                className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
              >
                Open client copy view
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

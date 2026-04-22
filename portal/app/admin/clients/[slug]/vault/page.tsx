import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { readAtcVaultText } from "@/lib/alberton-tyre-clinic/read-atc-vault";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminAtcVaultPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (slug !== "alberton-tyre-clinic") {
    notFound();
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "admin") {
    redirect(session.role === "coordinator" ? "/my-companies" : `/${session.clientSlug}`);
  }

  const body = await readAtcVaultText();
  if (body === null) {
    return (
      <div className="space-y-4">
        <Link
          href={`/admin/clients/${encodeURIComponent(slug)}`}
          className="text-sm text-[#8E8E93] hover:text-white"
        >
          ← Back to {slug}
        </Link>
        <p className="text-sm text-amber-200">
          Vault file not found on disk. Expected{" "}
          <code className="text-white/90">knowledge/clients/alberton-tyre-clinic/vault.txt</code>{" "}
          next to the repo root.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/admin/clients/${encodeURIComponent(slug)}`}
            className="text-sm text-[#8E8E93] hover:text-white"
          >
            ← Alberton Tyre Clinic
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-white">Vault</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#8E8E93]">
            Admin-only backup of image prompts and archived Overlay Studio HTML.
            Copy from the box below; nothing here is linked from the coordinator
            hub.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-orange-500/25 bg-black/50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-orange-200/90">
          vault.txt (full contents)
        </p>
        <pre className="mt-3 max-h-[min(70vh,1200px)] overflow-auto whitespace-pre-wrap break-words rounded border border-white/10 bg-[#0a0a0a] p-4 text-xs leading-relaxed text-[#D1D1D6]">
          {body}
        </pre>
      </div>
    </div>
  );
}

import { toggleClientRevokedAction } from "@/app/admin/actions";

export function RevokeToggleForm({
  slug,
  revoked,
}: {
  slug: string;
  revoked: boolean;
}) {
  if (revoked) {
    return (
      <form action={toggleClientRevokedAction}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="revoked" value="false" />
        <button
          type="submit"
          className="rounded-md border border-emerald-500/40 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/10"
        >
          Restore access
        </button>
      </form>
    );
  }

  return (
    <form action={toggleClientRevokedAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="revoked" value="true" />
      <button
        type="submit"
        className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
      >
        Revoke access
      </button>
    </form>
  );
}

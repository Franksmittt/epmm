import { logoutAction } from "@/app/actions/auth";

export function ClientShell({
  clientName,
  children,
}: {
  clientName: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="truncate text-sm text-[#8E8E93]">{clientName}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-[#8E8E93] hover:text-white"
          >
            Log out
          </button>
        </form>
      </header>
      {children}
    </>
  );
}

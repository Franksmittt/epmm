import Link from "next/link";
import { Archivo_Black } from "next/font/google";
import { logoutAction } from "@/app/actions/auth";
import { getSession } from "@/lib/auth/session";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isCoordinator = session?.role === "coordinator";

  return (
    <div
      className={`min-h-screen bg-black text-white ${archivoBlack.variable}`}
    >
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link
              href={isCoordinator ? "/admin/coordinator" : "/admin"}
              className="font-semibold tracking-tight"
            >
              {isCoordinator ? "EPMM · Social" : "EPMM Admin"}
            </Link>
            <span className="hidden text-white/20 sm:inline">|</span>
            {isCoordinator ? (
              <Link
                href="/admin/coordinator"
                className="text-[#8E8E93] hover:text-white"
              >
                My companies
              </Link>
            ) : (
              <>
                <Link href="/admin" className="text-[#8E8E93] hover:text-white">
                  Clients
                </Link>
                <Link
                  href="/admin/schedule"
                  className="text-[#8E8E93] hover:text-white"
                >
                  Master schedule
                </Link>
              </>
            )}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-[#8E8E93] hover:text-white"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}

import Link from "next/link";
import { Archivo_Black } from "next/font/google";
import { logoutAction } from "@/app/actions/auth";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-h-screen bg-black text-white ${archivoBlack.variable}`}
    >
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link href="/admin" className="font-semibold tracking-tight">
              EPMM Admin
            </Link>
            <span className="hidden text-white/20 sm:inline">|</span>
            <Link
              href="/admin"
              className="text-[#8E8E93] hover:text-white"
            >
              Clients
            </Link>
            <Link
              href="/admin/schedule"
              className="text-[#8E8E93] hover:text-white"
            >
              Master schedule
            </Link>
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

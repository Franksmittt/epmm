import Link from "next/link";
import { Montserrat } from "next/font/google";
import { redirect } from "next/navigation";
import { RapidStudio } from "@/components/admin/rapid-studio/RapidStudio";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  display: "swap",
});

export default async function AdminRapidStudioPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "admin") {
    redirect(
      session.role === "coordinator"
        ? "/my-companies"
        : `/${session.clientSlug}`,
    );
  }

  return (
    <div className={montserrat.className}>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-[#8E8E93] hover:text-white"
        >
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">Rapid Studio</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
          Twelve story layouts: six dark streetwear cards and six light editorial campaign cards.
          Swap images, edit copy inline, use the accent theme, then download a PNG per card.
        </p>
      </div>
      <RapidStudio />
    </div>
  );
}

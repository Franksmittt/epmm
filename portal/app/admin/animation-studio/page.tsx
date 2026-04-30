import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimationStudio } from "@/components/admin/animation-studio/AnimationStudio";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminAnimationStudioPage() {
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
    <div className="max-w-none">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-[#8E8E93] hover:text-white"
        >
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">Animation Studio</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
          Timeline-style vertical layouts: choose a <strong className="text-white/90">video or image</strong>{" "}
          background, edit copy inline, paste JSON to           inject AI-written fields, capture a PNG, or use{" "}
          <strong className="text-white/90">Record 8s video</strong>—timeline is{" "}
          <strong className="text-white/90">1s hold</strong>, then{" "}
          <strong className="text-white/90">5s</strong> of motion, then{" "}
          <strong className="text-white/90">2s hold</strong> on the final frame. Share{" "}
          <strong className="text-white/90">This tab</strong> so Chromium crops to the{" "}
          <strong className="text-white/90">450×800</strong> canvas. VP9 WebM at 15 Mbps downloads as{" "}
          <code className="text-white/80">animation-studio-9x16.webm</code>.
        </p>
      </div>
      <AnimationStudio />
    </div>
  );
}

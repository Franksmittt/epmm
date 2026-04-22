import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getClientBySlug,
  isCoordinatorAllowedSlug,
} from "@/lib/clients/registry";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function AdminClientSlugLayout({
  children,
  params,
}: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  if (!getClientBySlug(slug)) {
    redirect("/admin");
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    return <>{children}</>;
  }

  if (session.role === "coordinator") {
    if (isCoordinatorAllowedSlug(slug)) {
      return <>{children}</>;
    }
    redirect("/my-companies");
  }

  redirect(`/${session.clientSlug}`);
}

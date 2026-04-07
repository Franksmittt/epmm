import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export type Session =
  | { role: "admin" }
  | { role: "client"; clientSlug: string };

export async function getSession(): Promise<Session | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    if (payload.role === "admin") {
      return { role: "admin" };
    }
    if (
      payload.role === "client" &&
      typeof payload.clientSlug === "string"
    ) {
      return { role: "client", clientSlug: payload.clientSlug };
    }
    return null;
  } catch {
    return null;
  }
}

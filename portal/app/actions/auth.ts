"use server";

import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { resolveLogin } from "@/lib/auth/resolve-login";

export type LoginActionState = { error: string } | null;

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const password = formData.get("password");
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return {
      error: "Server is not configured. Set AUTH_SECRET in .env.local.",
    };
  }

  if (typeof password !== "string") {
    return { error: "Enter your access code." };
  }

  const resolved = await resolveLogin(password);
  if (resolved.kind === "error") {
    return { error: resolved.message };
  }

  const key = new TextEncoder().encode(secret);
  const jar = await cookies();

  if (resolved.kind === "admin") {
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(key);
    jar.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/admin");
  }

  if (resolved.kind === "coordinator") {
    const token = await new SignJWT({ role: "coordinator" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(key);
    jar.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/my-companies");
  }

  const token = await new SignJWT({
    role: "client",
    clientSlug: resolved.client.slug,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);

  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/${resolved.client.slug}`);
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

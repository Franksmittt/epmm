import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  isCoordinatorAllowedSlug,
  isRegisteredClientSlug,
} from "@/lib/clients/registry";

type JwtPayload = {
  role?: string;
  clientSlug?: string;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let payload: JwtPayload;
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    payload = verified.payload as JwtPayload;
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const role = payload.role;
  const clientSlug = payload.clientSlug;

  if (pathname === "/") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (role === "coordinator") {
      return NextResponse.redirect(new URL("/admin/coordinator", request.url));
    }
    if (role === "client" && clientSlug) {
      return NextResponse.redirect(new URL(`/${clientSlug}`, request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role === "admin") {
      return NextResponse.next();
    }
    if (role === "coordinator") {
      if (pathname === "/admin" || pathname.startsWith("/admin/schedule")) {
        return NextResponse.redirect(new URL("/admin/coordinator", request.url));
      }
      if (
        pathname === "/admin/coordinator" ||
        pathname.startsWith("/admin/coordinator/")
      ) {
        return NextResponse.next();
      }
      const clientMatch = pathname.match(/^\/admin\/clients\/([^/]+)/);
      if (clientMatch) {
        const slug = decodeURIComponent(clientMatch[1]);
        if (isCoordinatorAllowedSlug(slug)) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/admin/coordinator", request.url));
      }
      return NextResponse.redirect(new URL("/admin/coordinator", request.url));
    }
    if (role === "client" && clientSlug) {
      return NextResponse.redirect(new URL(`/${clientSlug}`, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const oneSeg = pathname.match(/^\/([^/]+)$/);
  if (oneSeg) {
    const seg = decodeURIComponent(oneSeg[1]);
    if (seg !== "login" && seg !== "admin") {
      if (role === "coordinator") {
        if (isCoordinatorAllowedSlug(seg)) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/admin/coordinator", request.url));
      }
      if (role === "client" && clientSlug) {
        if (isRegisteredClientSlug(seg) && seg !== clientSlug) {
          return NextResponse.redirect(new URL(`/${clientSlug}`, request.url));
        }
        if (!isRegisteredClientSlug(seg)) {
          return NextResponse.redirect(new URL(`/${clientSlug}`, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

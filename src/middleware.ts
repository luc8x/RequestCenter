import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  
  const token = await getToken({ req });
  const isAuthenticated = Boolean(token);
  const { pathname } = req.nextUrl;

  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    isAuthenticated &&
    (pathname === "/login" || pathname === "/registrar")
  ) {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica middleware em todas as rotas, exceto:
     * - /api/*
     * - /_next/static/*
     * - /_next/image/*
     * - /favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

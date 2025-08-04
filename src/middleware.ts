import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const permissao = token?.permissao ?? "";
  const isAutenticado = Boolean(token);
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/registrar";

  if (!isAutenticado && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log(permissao)

  if (isAutenticado && isAuthPage) {
    if (permissao === "SOLICITANTE") {
      return NextResponse.redirect(new URL("/inicio", req.url));
    }
    if (permissao === "ATENDENTE") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

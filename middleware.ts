import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.APP_PASSWORD ?? "skyline2024";
const COOKIE = "skyline_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and its POST through
  if (pathname === "/login") return NextResponse.next();

  // Check auth cookie
  if (req.cookies.get(COOKIE)?.value === PASSWORD) return NextResponse.next();

  // Redirect to login, preserving destination
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.svg).*)"],
};

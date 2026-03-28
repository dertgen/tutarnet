import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROUTES = ["/admin/hesabim"];
const PARTNER_ROUTES = ["/m/hesabim"];
const USER_ROUTES = ["/kullanici/hesabim"];
const AUTH_ROUTES = ["/giris-yap", "/kayit-ol", "/magaza-giris", "/magaza-ol"];

function getTokenFromRequest(request: NextRequest): string | null {
  return (
    request.cookies.get("sb-access-token")?.value ??
    request.headers.get("authorization")?.replace("Bearer ", "") ??
    null
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);

  const isAdminRoute   = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isPartnerRoute = PARTNER_ROUTES.some((r) => pathname.startsWith(r));
  const isUserRoute    = USER_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute    = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  const isSetupPage = pathname === "/admin/hesabim/kurulum";

  if ((isAdminRoute || isPartnerRoute || isUserRoute) && !token && !isSetupPage) {
    const loginPath = isPartnerRoute ? "/magaza-giris" : "/giris-yap";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = loginPath;
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/kullanici/hesabim", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/hesabim/:path*",
    "/m/hesabim/:path*",
    "/kullanici/hesabim/:path*",
    "/giris-yap",
    "/kayit-ol",
    "/magaza-giris",
    "/magaza-ol",
  ],
};

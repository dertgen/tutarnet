import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROUTES = ["/admin-paneli"];
const PARTNER_ROUTES = ["/magaza-paneli"];
const USER_ROUTES = ["/hesap"];
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

  const isSetupPage = pathname === "/admin-paneli/kurulum";

  if ((isAdminRoute || isPartnerRoute || isUserRoute) && !token && !isSetupPage) {
    const loginPath = isPartnerRoute ? "/magaza-giris" : "/giris-yap";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = loginPath;
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/hesap", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-paneli/:path*",
    "/magaza-paneli/:path*",
    "/hesap/:path*",
    "/giris-yap",
    "/kayit-ol",
    "/magaza-giris",
    "/magaza-ol",
  ],
};

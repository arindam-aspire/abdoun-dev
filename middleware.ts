import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { AUTH_ROLE_COOKIE_NAME } from "@/lib/auth/sessionCookies";

const intlMiddleware = createMiddleware(routing);

const localePattern = routing.locales.join("|");
const adminRoutePattern = new RegExp(`^/(${localePattern})/dashboard(?:/.*)?$`);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (adminRoutePattern.test(pathname)) {
    const role = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;
    if (role !== "admin") {
      const locale = pathname.split("/")[1] || routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

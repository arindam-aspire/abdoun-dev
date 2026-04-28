import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { AUTH_ROLE_COOKIE_NAME } from "@/lib/auth/sessionCookies";
import { getAdminRedirectPathForLegacyAgentPortal } from "@/lib/routing/adminAgentPortalPaths";

const intlMiddleware = createMiddleware(routing);

const localePattern = routing.locales.join("|");
const agentRoutePattern = new RegExp(
  `^/(${localePattern})/(agent(?:/.*)?|agent-dashboard(?:/.*)?|agent-properties(?:/.*)?|agent-favourite-properties(?:/.*)?|agent-saved-searches(?:/.*)?)$`,
);
const adminRoutePattern = new RegExp(
  `^/(${localePattern})/(admin(?:/.*)?|users(?:/.*)?|agents(?:/.*)?|properties(?:/.*)?|listings(?:/.*)?|leads(?:/.*)?|deals(?:/.*)?|admin-dashboard(?:/.*)?)$`,
);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split("/")[1] || routing.defaultLocale;
  const role = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value?.toLowerCase();
  const isAgentRoute = agentRoutePattern.test(pathname);
  const isAdminRoute = adminRoutePattern.test(pathname);
  const isProtectedRoute = isAgentRoute || isAdminRoute;

  if (!role && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/agent-login`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (role === "user" && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (role === "agent" && isAdminRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/agent-dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (role === "admin" && isAgentRoute) {
    const canonical = getAdminRedirectPathForLegacyAgentPortal(pathname, locale);
    if (canonical != null) {
      const url = request.nextUrl.clone();
      url.pathname = canonical;
      url.search = "";
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin-dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

import { routing } from "@/i18n/routing";
import type { UserRole } from "@/features/auth/authSlice";
import navConfigJson from "@/components/layout/app-header.nav.json";

export type HeaderRole = UserRole | "guest";

export interface HeaderNavItem {
  id: string;
  label: string;
  path: string;
  roles: HeaderRole[];
  publicOnly?: boolean;
}

export interface HeaderActionConfig {
  roles: HeaderRole[];
}

export interface HeaderProfileMenuConfig {
  showFavourites: boolean;
  showSavedSearches: boolean;
  showRecentlyViewed: boolean;
  showNotifications: boolean;
  showAccountSettings: boolean;
  showLogout: boolean;
}

export interface AppHeaderConfig {
  navItems: HeaderNavItem[];
  actions: {
    listProperty: HeaderActionConfig;
  };
  profileMenu: Record<UserRole, HeaderProfileMenuConfig>;
  publicLinks: {
    defaultVisible: boolean;
    showPathPrefixes: string[];
  };
}

export const APP_HEADER_CONFIG: AppHeaderConfig = {
  navItems: navConfigJson.navItems as HeaderNavItem[],
  actions: {
    listProperty: navConfigJson.actions.listProperty as HeaderActionConfig,
  },
  profileMenu: navConfigJson.profileMenu as Record<UserRole, HeaderProfileMenuConfig>,
  publicLinks: {
    defaultVisible: true,
    showPathPrefixes: ["/", "/about", "/team"],
  },
};

function normalizePathname(pathname: string): string {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  const parts = cleanPath.split("/").filter(Boolean);

  if (parts.length === 0) return "/";

  const maybeLocale = parts[0];
  const isLocale = routing.locales.includes(maybeLocale as (typeof routing.locales)[number]);
  const withoutLocale = isLocale ? parts.slice(1) : parts;

  return `/${withoutLocale.join("/")}` || "/";
}

export function resolvePublicLinksVisibility(
  pathname: string | null,
  explicitVisibility?: boolean,
): boolean {
  if (typeof explicitVisibility === "boolean") {
    return explicitVisibility;
  }

  if (!pathname) {
    return APP_HEADER_CONFIG.publicLinks.defaultVisible;
  }

  const normalizedPath = normalizePathname(pathname);
  const isShownRoute = APP_HEADER_CONFIG.publicLinks.showPathPrefixes.some(
    (prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  return isShownRoute ? true : APP_HEADER_CONFIG.publicLinks.defaultVisible;
}

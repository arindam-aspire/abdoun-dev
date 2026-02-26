import { routing } from "@/i18n/routing";

export interface HeaderNavItem {
  id: "listProperty" | "ourTeam" | "aboutUs";
  labelKey: "nav.listProperty" | "nav.ourTeam" | "nav.aboutUs";
  path: string;
  publicOnly?: boolean;
}

export interface AppHeaderConfig {
  navItems: HeaderNavItem[];
  publicLinks: {
    defaultVisible: boolean;
    showPathPrefixes: string[];
  };
}

export const APP_HEADER_CONFIG: AppHeaderConfig = {
  navItems: [
    {
      id: "listProperty",
      labelKey: "nav.listProperty",
      path: "/list",
    },
    {
      id: "aboutUs",
      labelKey: "nav.aboutUs",
      path: "/about",
      publicOnly: true,
    },
    {
      id: "ourTeam",
      labelKey: "nav.ourTeam",
      path: "/team",
      publicOnly: true,
    }
  ],
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

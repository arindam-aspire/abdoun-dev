"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Home, List, MapPin, Users, User } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { useAppSelector } from "@/hooks/storeHooks";

const NAV_HEIGHT = 72;
const SAFE_AREA = "env(safe-area-inset-bottom, 0px)";

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home");
  const auth = useAppSelector((state) => state.auth);
  const isRtl = locale === "ar";

  const basePath = `/${locale}`;

  const items = [
    { key: "home", href: basePath, label: t("bottomNav.home"), icon: Home, match: () => pathname === basePath || pathname === `${basePath}/` },
    { key: "list", href: `${basePath}/list`, label: t("bottomNav.list"), icon: List, match: () => pathname.startsWith(`${basePath}/list`) },
    { key: "lands", href: `${basePath}/lands`, label: t("bottomNav.lands"), icon: MapPin, match: () => pathname.startsWith(`${basePath}/lands`) },
    { key: "team", href: `${basePath}/team`, label: t("bottomNav.team"), icon: Users, match: () => pathname.startsWith(`${basePath}/team`) },
    {
      key: "account",
      href: auth.user ? `${basePath}/dashboard` : basePath,
      label: t("bottomNav.account"),
      icon: User,
      match: () => pathname.startsWith(`${basePath}/dashboard`),
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-[var(--border-subtle)] bg-white shadow-[0_-4px_24px_rgba(26,59,92,0.06)] md:hidden"
      style={{
        paddingBottom: SAFE_AREA,
        minHeight: NAV_HEIGHT,
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {items.map(({ key, href, label, icon: Icon, match }) => {
        const active = match();
        return (
          <Link
            key={key}
            href={href}
            className={`
              flex min-w-0 flex-1 flex-col items-center justify-center gap-1
              py-3 px-2 min-h-[44px] active:bg-[var(--surface)]/50
              transition-colors duration-150
              ${active
                ? "text-[var(--brand-secondary)]"
                : "text-[var(--color-charcoal)]/70"
              }
            `}
            aria-current={active ? "page" : undefined}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
              <Icon
                className="h-6 w-6"
                strokeWidth={active ? 2.5 : 2}
                aria-hidden
              />
            </span>
            <span className="truncate text-[11px] font-medium max-w-[72px] leading-tight">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export const BOTTOM_NAV_HEIGHT = NAV_HEIGHT;



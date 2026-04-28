"use client";

import {
  getSidebarItemHref,
  isSidebarHrefActive,
  sidebarConfig,
  sidebarUiConfig,
  type SidebarRole,
} from "@/components/layout/sidebar.config";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { useSidebar } from "@/hooks/useSidebar";
import { useTranslations } from "@/hooks/useTranslations";
import { performClientLogout } from "@/lib/auth/logoutClient";
import { ADMIN_AGENTS_DASHBOARD_COUNT_PARAMS } from "@/features/admin-agents/admin-dashboard/hooks/useAdminAgentsTotalForDashboard";
import { fetchAdminAgents } from "@/features/admin-agents/adminAgentsSlice";
import { fetchAdminUsersSidebarTotal } from "@/features/admin-users/adminUsersSlice";
import { selectCurrentUser, selectSidebarCounts } from "@/store/selectors";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { isRtlLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar() {
  const { isOpen, isSidebarRole, isMobile, isCollapsed, toggleCollapsed, close } =
    useSidebar();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const counts = useAppSelector(selectSidebarCounts);
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const tCommon = useTranslations("common");
  const isRTL = isRtlLocale(locale);
  useEffect(() => {
    if (user?.role !== "admin" || !user?.id) return;
    void dispatch(fetchAdminAgents(ADMIN_AGENTS_DASHBOARD_COUNT_PARAMS));
    void dispatch(fetchAdminUsersSidebarTotal());
  }, [dispatch, user?.id, user?.role]);

  if (!isSidebarRole) return null;
  const role = user?.role as SidebarRole | undefined;
  const sections = role
    ? sidebarConfig
        .filter((section) => section.roles.includes(role))
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.roles.includes(role)),
        }))
        .filter((section) => section.items.length > 0)
    : [];
  const itemHrefMap = sections.flatMap((section) =>
    section.items.map((item) => ({
      id: item.id,
      href: getSidebarItemHref(locale, item, role),
    })),
  );
  const matchedByPrefix =
    itemHrefMap
      .filter((item) => isSidebarHrefActive(pathname, searchParams, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.id ?? null;

  /** Wizard lives under `/agent-dashboard/add-property`; highlight Listings, not Dashboard. */
  const addPropertyHref = `/${locale}/agent-dashboard/add-property`;
  const activeItemId =
    matchedByPrefix === "agentDashboard" &&
    (pathname === addPropertyHref || pathname.startsWith(`${addPropertyHref}/`))
      ? "manageListings"
      : matchedByPrefix;
  const handleSidebarSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await performClientLogout(dispatch, user?.id);
      setIsLogoutConfirmOpen(false);
      close();
      router.replace(`/${locale}`);
    } finally {
      setIsSigningOut(false);
    }
  };
  const collapseControl = sidebarUiConfig.allowCollapse ? (
    <div
      className={cn(
        "hidden items-center md:flex border-zinc-200 bg-white p-2",
        sidebarUiConfig.collapseControlPosition === "top"
          ? "border-b"
          : "border-t",
        isCollapsed ? "justify-center" : isRTL ? "justify-start" : "justify-end",
      )}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" aria-hidden />
        ) : (
          <PanelLeftClose className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  ) : null;

  return (
    <>
      {isMobile ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={close}
          className={cn(
            "absolute inset-0 z-10 bg-black/40 transition-opacity md:hidden",
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        />
      ) : null}

      <aside
        className={cn(
          "flex min-h-0 flex-shrink-0 flex-col overflow-y-auto bg-white transition-all duration-300 ease-in-out will-change-transform",
          isMobile
            ? cn(
                "absolute inset-y-0 z-20 h-full w-72 max-w-[85vw] shadow-xl",
                isRTL ? "right-0" : "left-0",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : cn(
                      "pointer-events-none",
                      isRTL ? "translate-x-full opacity-90" : "-translate-x-full opacity-90",
                    ),
              )
            : cn(
                "relative h-full",
                !isOpen
                  ? "w-0 min-w-0 overflow-hidden p-0 shadow-none"
                  : isCollapsed
                    ? "w-16"
                    : "w-64",
              ),
        )}
        aria-hidden={!isOpen}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {sidebarUiConfig.collapseControlPosition === "top" ? collapseControl : null}
        <nav className="px-4 py-4" aria-label="Agent admin sidebar navigation">
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.id} className="space-y-2">
                {!isCollapsed ? (
                  <div className={cn("px-2", isRTL ? "text-right" : "text-left")}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#A6A7A8]">
                      {section.title}
                    </h3>
                  </div>
                ) : null}

                <ul
                  className={cn(
                    "space-y-2",
                    isCollapsed ? "" : isRTL ? "pr-4" : "pl-4",
                  )}
                >
                  {section.items.map((item) => {
                    const href = getSidebarItemHref(locale, item, role);
                    const isActive = activeItemId === item.id;
                    const rawCount = item.countKey ? counts[item.countKey] : undefined;
                    /** `-1` means “no badge” (e.g. users total not provided by API yet). */
                    const count =
                      item.countKey && rawCount !== undefined && rawCount >= 0
                        ? rawCount
                        : null;
                    const Icon = item.icon;

                    return (
                      <li key={item.id}>
                        <Link
                          href={href}
                          title={isCollapsed ? item.label : ""}
                          onClick={(event) => {
                            if (item.id === "signOut") {
                              event.preventDefault();
                              setIsLogoutConfirmOpen(true);
                              return;
                            }
                            if (isMobile) {
                              close();
                            }
                          }}
                          className={cn(
                            "flex rounded-lg text-sm font-medium transition",
                            isCollapsed
                              ? "mx-auto h-10 w-10 items-center justify-center px-0 py-0"
                              : "items-center justify-between px-3 py-2",
                            isActive
                              ? "bg-[var(--brand-secondary)] text-white"
                              : "text-zinc-700 hover:bg-zinc-100",
                            isSigningOut &&
                              item.id === "signOut" &&
                              "pointer-events-none opacity-70",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex items-center",
                              isCollapsed ? "" : "gap-2",
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                            {!isCollapsed ? <span>{item.label}</span> : null}
                          </span>
                          {(!isCollapsed || sidebarUiConfig.showCountsWhenCollapsed) &&
                          count !== null ? (
                            <span
                              className={cn(
                                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-zinc-200 text-zinc-700",
                              )}
                            >
                              {count}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
        {sidebarUiConfig.collapseControlPosition === "bottom" ? collapseControl : null}
      </aside>
      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onCancel={() => {
          if (isSigningOut) return;
          setIsLogoutConfirmOpen(false);
        }}
        onConfirm={handleSidebarSignOut}
        title={tCommon("signOut")}
        description={tCommon("confirmSignOut")}
        confirmLabel={tCommon("signOut")}
        loadingConfirmLabel={tCommon("signingOut")}
        cancelLabel={tCommon("cancel")}
        confirmButtonClassName="bg-rose-700 text-white hover:bg-rose-800"
      />
    </>
  );
}

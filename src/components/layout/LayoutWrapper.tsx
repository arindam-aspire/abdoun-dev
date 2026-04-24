"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { isRtlLocale } from "@/i18n/routing";
import { useSidebar } from "@/hooks/useSidebar";
import { useLocale } from "next-intl";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const isRTL = isRtlLocale(locale);
  const { isCollapsed, isOpen, isMobile, isSidebarRole } = useSidebar();
  const sidebarWidth = isCollapsed ? "4rem" : "16rem";
  const showGutterLine = isSidebarRole && !isMobile && isOpen;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 items-stretch">
      {showGutterLine ? (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-[5] w-px bg-gray-200"
          style={
            isRTL
              ? { right: sidebarWidth, left: "auto" }
              : { left: sidebarWidth, right: "auto" }
          }
          aria-hidden
        />
      ) : null}
      <Sidebar />
      <main
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

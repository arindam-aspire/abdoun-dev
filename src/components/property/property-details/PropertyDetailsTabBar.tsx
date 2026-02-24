"use client";

import { Info, Map, Sparkles } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export type PropertyDetailsTabKey = "overview" | "amenities" | "location" | "reviews";

export interface PropertyDetailsTabBarProps {
  activeTab: PropertyDetailsTabKey;
  onTabChange: (tab: PropertyDetailsTabKey) => void;
  isRtl?: boolean;
  /** When true, the Map/Location tab is shown (for exclusive properties). */
  showLocationTab?: boolean;
}

export function PropertyDetailsTabBar({
  activeTab,
  onTabChange,
  isRtl = false,
  showLocationTab = false,
}: PropertyDetailsTabBarProps) {
  const t = useTranslations("home");

  const tabs: { key: PropertyDetailsTabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("propertyTabs.overview"), icon: <Info className="h-3.5 w-3.5" /> },
    { key: "amenities", label: t("propertyTabs.features"), icon: <Sparkles className="h-3.5 w-3.5" /> },
    ...(showLocationTab
      ? [{ key: "location" as const, label: t("propertyTabs.location"), icon: <Map className="h-3.5 w-3.5" /> }]
      : []),
  ];

  return (
    <div className="sticky top-[52px] z-20 -mx-4 border-b border-[var(--border-subtle)] bg-white/95 px-4 py-3 backdrop-blur md:mx-0 md:px-0 md:py-3 md:top-16">
      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className={`inline-flex min-w-max items-center gap-1 text-[11px] font-medium text-[var(--color-charcoal)]/80 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                    : "border-transparent text-[var(--color-charcoal)]/80 hover:text-[var(--color-charcoal)]"
                }`}
              >
                <span
                  className={`${
                    isActive ? "text-[var(--brand-primary)]" : "text-[var(--color-charcoal)]/60"
                  } inline-flex`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

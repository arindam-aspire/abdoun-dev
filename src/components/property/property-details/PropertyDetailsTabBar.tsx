"use client";

import { Info, Map, Sparkles, Star } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export type PropertyDetailsTabKey = "overview" | "amenities" | "location" | "reviews";

export interface PropertyDetailsTabBarProps {
  activeTab: PropertyDetailsTabKey;
  onTabChange: (tab: PropertyDetailsTabKey) => void;
  isRtl?: boolean;
}

export function PropertyDetailsTabBar({
  activeTab,
  onTabChange,
  isRtl = false,
}: PropertyDetailsTabBarProps) {
  const t = useTranslations("home");

  const tabs: { key: PropertyDetailsTabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("propertyTabs.overview"), icon: <Info className="h-3.5 w-3.5" /> },
    { key: "amenities", label: t("propertyTabs.amenities"), icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "location", label: t("propertyTabs.location"), icon: <Map className="h-3.5 w-3.5" /> },
    { key: "reviews", label: t("propertyTabs.reviews"), icon: <Star className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="sticky top-[52px] md:top-[52px] z-20 border-y border-[var(--border-subtle)] bg-[var(--surface)]/95 px-4 py-3 shadow-sm backdrop-blur md:top-14 md:px-8">
      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-start">
        <div
          className={`inline-flex min-w-max items-center gap-1 rounded-2xl border border-[var(--border-subtle)] bg-white/90 p-1.5 text-[11px] font-medium text-[var(--color-charcoal)]/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur ${
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
                className={`flex items-center gap-1 rounded-xl px-3 py-2 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--brand-primary)] text-[var(--brand-on-primary)] shadow-sm ring-1 ring-[var(--brand-primary)]/70"
                    : "text-[var(--color-charcoal)]/80 hover:bg-[var(--surface)] hover:text-[var(--color-charcoal)]"
                }`}
              >
                <span
                  className={`${
                    isActive ? "text-[var(--brand-on-primary)]" : "text-[var(--brand-primary)]"
                  } hidden xs:inline-flex`}
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

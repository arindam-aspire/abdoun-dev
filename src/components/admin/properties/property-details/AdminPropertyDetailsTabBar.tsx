"use client";

import { FileText, Info, Map, Sparkles } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export type AdminPropertyDetailsTabKey =
  | "overview"
  | "amenities"
  | "location"
  | "documents";

export interface AdminPropertyDetailsTabBarProps {
  activeTab: AdminPropertyDetailsTabKey;
  onTabChange: (tab: AdminPropertyDetailsTabKey) => void;
  isRtl?: boolean;
  showLocationTab?: boolean;
}

export function AdminPropertyDetailsTabBar({
  activeTab,
  onTabChange,
  isRtl = false,
  showLocationTab = false,
}: AdminPropertyDetailsTabBarProps) {
  const t = useTranslations("home");

  const tabs: { key: AdminPropertyDetailsTabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("propertyTabs.overview"), icon: <Info className="h-3.5 w-3.5" /> },
    {
      key: "amenities",
      label: `${t("propertyTabs.features")} · Virtual tour`,
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    ...(showLocationTab
      ? [{ key: "location" as const, label: t("propertyTabs.location"), icon: <Map className="h-3.5 w-3.5" /> }]
      : []),
    { key: "documents", label: "Documents", icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="sticky top-[52px] z-20 -mx-4 border-b border-subtle bg-white/95 px-4 py-3 backdrop-blur md:mx-0 md:px-0 md:py-3 md:top-16">
      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className={`inline-flex min-w-max items-center gap-1 text-size-11 fw-medium text-charcoal/80 ${
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
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-charcoal/80 hover:text-charcoal"
                }`}
              >
                <span
                  className={`${
                    isActive ? "text-primary" : "text-charcoal/60"
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

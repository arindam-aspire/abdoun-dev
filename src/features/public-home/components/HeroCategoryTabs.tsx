"use client";

import { BriefcaseBusiness, Building2, Trees } from "lucide-react";

export type HeroCategoryTabKey = "commercial" | "realEstate" | "land";

export interface HeroCategoryTabsProps {
  activeTab: HeroCategoryTabKey;
  onTabChange: (tab: HeroCategoryTabKey) => void;
  labels: { commercial: string; realEstate: string; land: string };
  isRtl: boolean;
}

export function HeroCategoryTabs({
  activeTab,
  onTabChange,
  labels,
  isRtl,
}: HeroCategoryTabsProps) {
  const tabs: {
    key: HeroCategoryTabKey;
    label: string;
    icon: typeof Building2;
  }[] = [
    { key: "realEstate", label: labels.realEstate, icon: Building2 },
    { key: "commercial", label: labels.commercial, icon: BriefcaseBusiness },
    { key: "land", label: labels.land, icon: Trees },
  ];

  return (
    <div
      className={`w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isRtl ? "flex-row-reverse" : ""
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto inline-flex min-w-max rounded-2xl bg-white px-2 py-2 shadow-[0_24px_50px_rgba(18,24,56,0.22)] ring-1 ring-white/70">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={`relative inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === key
                ? "bg-[#355777] text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50 hover:text-[#355777]"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

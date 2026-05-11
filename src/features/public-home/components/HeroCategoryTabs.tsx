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
      className="w-full pb-1 md:overflow-x-auto md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-full flex-row rounded-2xl bg-white p-1 shadow-[0_24px_50px_rgba(18,24,56,0.22)] ring-1 ring-white/70 sm:p-1.5 md:inline-flex md:w-auto md:min-w-max md:max-w-none md:px-2 md:py-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={`relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-2.5 text-center text-xs font-semibold leading-tight transition cursor-pointer sm:min-h-12 sm:flex-row sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm md:min-h-0 md:min-w-[180px] md:flex-none md:px-5 md:py-3.5 ${
              activeTab === key
                ? "bg-[#355777] text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50 hover:text-[#355777] active:bg-slate-100"
            }`}
          >
            <Icon
              className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
              aria-hidden
            />
            <span className="line-clamp-2 max-w-full sm:line-clamp-none">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

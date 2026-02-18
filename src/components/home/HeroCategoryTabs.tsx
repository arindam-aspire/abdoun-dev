"use client";

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
  const tabs: { key: HeroCategoryTabKey; label: string }[] = [
    { key: "realEstate", label: labels.realEstate },
    { key: "commercial", label: labels.commercial },
    { key: "land", label: labels.land },
  ];

  return (
    <div
      className={`w-full max-w-5xl overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isRtl ? "flex-row-reverse" : ""
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto inline-flex min-w-max rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-[var(--border-subtle)] backdrop-blur-sm">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={`relative cursor-pointer rounded-xl px-3 py-2 text-xs font-medium transition sm:px-5 sm:py-2.5 sm:text-sm ${
              activeTab === key
                ? "bg-[var(--brand-secondary)] text-white shadow-sm"
                : "text-[var(--color-charcoal)] hover:bg-white/80 hover:text-[var(--brand-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

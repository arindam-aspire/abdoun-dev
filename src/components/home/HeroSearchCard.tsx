"use client";

import { MapPin } from "lucide-react";
import type { HeroTabKey } from "./types";
import type { HeroTranslations } from "./types";

export interface HeroSearchCardProps {
  translations: HeroTranslations;
  activeTab: HeroTabKey;
  onTabChange: (tab: HeroTabKey) => void;
  isRtl: boolean;
}

export function HeroSearchCard({
  translations: t,
  activeTab,
  onTabChange,
  isRtl,
}: HeroSearchCardProps) {
  return (
    <div className="mt-10 w-full max-w-5xl">
      <div className="rounded-3xl bg-white/95 p-4 shadow-2xl ring-1 ring-slate-100 backdrop-blur-sm md:p-5 lg:p-6">
        <div className="mb-4 flex items-center gap-6 border-slate-200 text-sm font-medium text-slate-500">
          {(["buy", "rent", "sell"] as const).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => onTabChange(tabKey)}
              className={`relative pb-1 capitalize transition ${
                activeTab === tabKey
                  ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-sky-500"
                  : "hover:text-slate-900"
              }`}
            >
              {t.tabs[tabKey]}
            </button>
          ))}
        </div>

        <div
          className={`flex flex-col gap-3 pt-1 text-xs text-slate-700 md:flex-row md:items-center ${
            isRtl ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="min-w-0 flex-[3]">
            <label
              className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${
                isRtl ? "text-right" : "text-left"
              }`}
            >
              {t.locationLabel}
            </label>
            <div className="flex h-14 items-center gap-2 rounded-full border-2 border-sky-300 bg-white px-4 shadow-[0_0_0_1px_rgba(15,23,42,0.02)] transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200">
              <MapPin className="h-5 w-5 shrink-0 text-sky-500" />
              <input
                type="text"
                placeholder={t.locationPlaceholder}
                className={`w-full border-none bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400 ${
                  isRtl ? "text-right" : "text-left"
                }`}
              />
            </div>
          </div>

          <div className="flex-[1.2]">
            <label
              className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${
                isRtl ? "text-right" : "text-left"
              }`}
            >
              {t.typeLabel}
            </label>
            <div className="flex h-14 items-center gap-2 rounded-full border-2 border-sky-300 bg-white px-4 shadow-[0_0_0_1px_rgba(15,23,42,0.02)] transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-medium text-sky-600">
                🏙
              </span>
              <select className="w-full border-none bg-transparent text-sm text-slate-800 outline-none">
                <option>Property Type</option>
                <option>Apartment</option>
                <option>Villa</option>
                <option>Penthouse</option>
                <option>Office</option>
              </select>
            </div>
          </div>

          <div className="flex-[1.2]">
            <label
              className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${
                isRtl ? "text-right" : "text-left"
              }`}
            >
              {t.budgetLabel}
            </label>
            <div className="flex h-14 items-center gap-2 rounded-full border-2 border-sky-300 bg-white px-4 shadow-[0_0_0_1px_rgba(15,23,42,0.02)] transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-medium text-sky-600">
                $
              </span>
              <select className="w-full border-none bg-transparent text-sm text-slate-800 outline-none">
                <option>Max Price</option>
                <option>$2,500</option>
                <option>$5,000</option>
                <option>$10,000</option>
                <option>$25,000</option>
              </select>
            </div>
          </div>

          <div className="flex-none self-end pt-2 md:pt-5 md:self-auto">
            <button
              type="button"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow-md hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 md:w-auto"
            >
              {t.search}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

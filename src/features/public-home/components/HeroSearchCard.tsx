"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import type {
  HeroTabKey,
  HeroTranslations,
} from "@/features/public-home/components/types";
import type { HeroCategoryTabKey } from "@/features/public-home/components/HeroCategoryTabs";
import { BudgetRangeInputs } from "@/features/public-home/components/BudgetRangeInputs";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import {
  PropertyTypeSelect,
  type PropertyType,
} from "@/features/public-home/components/PropertyTypeSelect";
import { HeroCitySelect } from "@/features/public-home/components/HeroCitySelect";
import { HeroAreaSelect } from "@/features/public-home/components/HeroAreaSelect";
import { getAreasByCityName } from "@/lib/mocks/jordanCities";

export interface HeroSearchCardProps {
  translations: HeroTranslations;
  activeTab: HeroTabKey;
  onTabChange: (tab: HeroTabKey) => void;
  activeCategoryTab: HeroCategoryTabKey;
  isRtl: boolean;
}

const CATEGORY_TO_TYPES: Record<HeroCategoryTabKey, string[]> = {
  realEstate: ["Apartments", "Villas", "Buildings", "Farms"],
  commercial: [
    "Offices",
    "Showrooms",
    "Buildings",
    "Warehouse",
    "Businesses",
    "Villas",
  ],
  land: [
    "Residential Lands",
    "Commercial Lands",
    "Industrial Lands",
    "Agricultural Lands",
    "Mixed Use Lands",
  ],
};

const CATEGORY_TO_PARAM: Record<HeroCategoryTabKey, string> = {
  realEstate: "residential",
  commercial: "commercial",
  land: "lands",
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export function HeroSearchCard({
  translations: t,
  activeTab,
  onTabChange,
  activeCategoryTab,
  isRtl,
}: HeroSearchCardProps) {
  type HeroDropdownKey = "type" | "city" | "area" | "budget";
  const router = useRouter();
  const locale = useLocale();
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<
    Record<HeroCategoryTabKey, PropertyType>
  >({
    realEstate: "",
    commercial: "",
    land: "",
  });
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<HeroDropdownKey | null>(null);
  const budgetTriggerRef = useRef<HTMLButtonElement>(null);
  const propertyType = selectedPropertyTypes[activeCategoryTab];

  const areaOptions = selectedCity ? getAreasByCityName(selectedCity) : [];
  const toggleDropdown = (key: HeroDropdownKey) => {
    setOpenDropdown((current) => (current === key ? null : key));
  };
  const closeDropdown = (key: HeroDropdownKey) => {
    setOpenDropdown((current) => (current === key ? null : current));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) {
      params.set("city", selectedCity.toLowerCase());
    }
    if (selectedAreas.length > 0) {
      params.set(
        "locations",
        selectedAreas.map((a) => a.toLowerCase()).join(","),
      );
    }
    params.set("category", CATEGORY_TO_PARAM[activeCategoryTab]);
    if (propertyType) {
      params.set("type", slugify(propertyType));
    }
    params.set("status", activeTab);
    if (minBudget.trim()) params.set("minPrice", minBudget.trim());
    if (maxBudget.trim()) params.set("maxPrice", maxBudget.trim());
    const searchQuery = params.toString();
    const destination = searchQuery
      ? `/${locale}/search-result?${searchQuery}`
      : `/${locale}/search-result`;
    router.push(destination);
  };

  const formatBudgetLabel = () => {
    if (!minBudget && !maxBudget) return "Select budget";

    const formatNumber = (value: string) =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Number(value));

    const minLabel = minBudget ? formatNumber(minBudget) : "Min";
    const maxLabel = maxBudget ? formatNumber(maxBudget) : "Max";

    return `${minLabel} - ${maxLabel}`;
  };

  const handleReset = () => {
    setSelectedPropertyTypes({
      realEstate: "",
      commercial: "",
      land: "",
    });
    setSelectedCity("");
    setSelectedAreas([]);
    setMinBudget("");
    setMaxBudget("");
    setOpenDropdown(null);
    onTabChange("buy");
  };

  return (
    <div className="mt-10 w-full max-w-[64rem]">
      <div className="rounded-[1.4rem] border-2 border-[#f2d400] bg-white p-6 shadow-[0_34px_60px_rgba(10,19,47,0.26)] backdrop-blur-sm md:p-8">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex w-full gap-3 rounded-2xl bg-transparent">
            {(["buy", "rent"] as const).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => onTabChange(tabKey)}
                className={`w-1/2 cursor-pointer rounded-2xl px-5 py-3 text-lg font-medium capitalize transition ${
                  activeTab === tabKey
                    ? "border border-[#f2d400] bg-white text-[#1f2937]"
                    : "bg-[#F3F4F6] text-slate-600 hover:text-[#355777]"
                }`}
              >
                {t.tabs[tabKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-1 text-charcoal md:flex-row md:items-end">
          {/* Type / Property Type */}
          <PropertyTypeSelect
            label={t.typeLabel}
            isRtl={isRtl}
            isOpen={openDropdown === "type"}
            onToggle={() => toggleDropdown("type")}
            onClose={() => closeDropdown("type")}
            value={propertyType}
            options={CATEGORY_TO_TYPES[activeCategoryTab]}
            onChange={(value) => {
              setSelectedPropertyTypes((prev) => ({
                ...prev,
                [activeCategoryTab]: value,
              }));
            }}
          />
          <HeroCitySelect
            label={t.cityLabel}
            placeholder={t.cityPlaceholder}
            value={selectedCity}
            isOpen={openDropdown === "city"}
            onToggle={() => toggleDropdown("city")}
            onClose={() => closeDropdown("city")}
            onChange={(city) => {
              setSelectedCity(city);
              setSelectedAreas([]);
            }}
            isRtl={isRtl}
          />

          <HeroAreaSelect
            label={t.areaLabel}
            placeholder={t.areaPlaceholder}
            selectedAreas={selectedAreas}
            isOpen={openDropdown === "area"}
            onToggle={() => toggleDropdown("area")}
            onClose={() => closeDropdown("area")}
            onSelectionChange={setSelectedAreas}
            areaOptions={areaOptions}
            disabled={!selectedCity}
            isRtl={isRtl}
          />

          {/* Budget */}
          <div className="relative flex-[1.2]">
            <label
              className="sr-only"
            >
              {t.budgetLabel}
            </label>
            <button
              ref={budgetTriggerRef}
              type="button"
              className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-[#b8c8ea] bg-white px-4 text-left text-sm shadow-sm transition-colors hover:border-[#8fa6d8] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.12)]"
              onClick={() => {
                toggleDropdown("budget");
              }}
            >
              <span
                className={`w-full truncate ${
                  minBudget || maxBudget
                    ? "font-medium text-slate-700"
                    : "font-normal text-slate-500"
                }`}
              >
                {formatBudgetLabel()}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            </button>

            <HeroDropdown
              isOpen={openDropdown === "budget"}
              onClose={() => {
                closeDropdown("budget");
              }}
              align={isRtl ? "right" : "left"}
              anchorRef={budgetTriggerRef}
              portaled={false}
            >
              <BudgetRangeInputs
                minBudget={minBudget}
                maxBudget={maxBudget}
                onChangeMin={setMinBudget}
                onChangeMax={setMaxBudget}
                onReset={() => {
                  setMinBudget("");
                  setMaxBudget("");
                }}
                onDone={() => {
                  closeDropdown("budget");
                }}
                minLabel={activeTab === "rent" ? t.budgetYearlyMinLabel : undefined}
                maxLabel={activeTab === "rent" ? t.budgetYearlyMaxLabel : undefined}
              />
            </HeroDropdown>
          </div>

          {/* Search button */}
          <div className="flex-none">
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-11 w-full min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-secondary shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(253,185,19,0.45)] md:w-auto"
            >
              {t.search}
            </button>
          </div>

          <div className="flex-none">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-11 w-full min-w-[112px] cursor-pointer items-center justify-center rounded-xl bg-[#f1f3f7] px-4 text-sm font-semibold text-slate-600 transition hover:bg-[#e8ebf1] hover:text-slate-700 md:w-auto"
            >
              {t.resetSearch}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


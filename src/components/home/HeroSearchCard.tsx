"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { HeroTabKey, HeroTranslations } from "./types";
import type { HeroCategoryTabKey } from "./HeroCategoryTabs";
import { BudgetRangeInputs } from "./BudgetRangeInputs";
import { HeroDropdown } from "./HeroDropdown";
import { PropertyTypeSelect, type PropertyType } from "./PropertyTypeSelect";
import { HeroCitySelect } from "./HeroCitySelect";
import { HeroAreaSelect } from "./HeroAreaSelect";
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
  const [openDropdown, setOpenDropdown] = useState<HeroDropdownKey | null>(
    null,
  );
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

  return (
    <div className="mt-4 w-full max-w-5xl">
      <div className="rounded-3xl bg-white/95 p-4 shadow-2xl ring-1 ring-subtle backdrop-blur-sm md:p-5 lg:p-6">
        <div className={`mb-2 flex ${isRtl ? "" : "justify-start"}`}>
          <div className="inline-flex rounded-2xl bg-surface p-1 ring-1 ring-subtle">
            {(["buy", "rent"] as const).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => onTabChange(tabKey)}
                className={`cursor-pointer rounded-xl px-5 py-2 text-size-sm fw-medium capitalize transition ${
                  activeTab === tabKey
                    ? "bg-secondary text-white shadow-sm"
                    : "text-[rgba(51,51,51,0.7)] hover:text-secondary"
                }`}
              >
                {t.tabs[tabKey]}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`flex flex-col gap-3 pt-1 text-size-xs text-charcoal md:flex-row md:items-center`}
        >
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
              className={`mb-1 block text-size-11 fw-semibold uppercase tracking-[0.18em] text-[rgba(51,51,51,0.7)] ${
                isRtl ? "text-right" : "text-left"
              }`}
            >
              {t.budgetLabel}
            </label>
            <button
              ref={budgetTriggerRef}
              type="button"
              className={`flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors hover:border-[rgba(43,91,166,0.6)] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)]`}
              onClick={() => {
                toggleDropdown("budget");
              }}
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-size-2xs fw-medium text-secondary">
                JD
              </span>
              <span className={`w-full truncate text-size-sm ${minBudget || maxBudget ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.45)] fw-normal"}`}>
                {formatBudgetLabel()}
              </span>
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
                minLabel={
                  activeTab === "rent" ? t.budgetYearlyMinLabel : undefined
                }
                maxLabel={
                  activeTab === "rent" ? t.budgetYearlyMaxLabel : undefined
                }
              />
            </HeroDropdown>
          </div>

          {/* Search button */}
          <div className="flex-none self-end pt-2 md:pt-5 md:self-auto">
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 text-size-sm fw-semibold text-secondary shadow-md hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(253,185,19,0.45)] md:w-auto"
            >
              {t.search}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



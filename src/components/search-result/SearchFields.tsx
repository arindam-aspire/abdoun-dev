"use client";

import { BudgetRangeInputs } from "@/components/home/BudgetRangeInputs";
import { HeroDropdown } from "@/components/home/HeroDropdown";
import { cn } from "@/lib/cn";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CategoryKey, SearchFieldsProps, StatusTabKey } from "./types";
import { routing } from "@/i18n/routing";
import {
  getAreasByCityName,
  JORDAN_CITIES_WITH_AREAS,
} from "@/lib/mocks/jordanCities";
import {
  CATEGORY_OPTIONS,
  CATEGORY_TO_PROPERTY_TYPES,
  STATUS_TABS,
} from "./types";

export type { SearchFieldsProps, SearchFieldsTranslations } from "./types";

const dropdownPanelClass =
  "min-w-48 rounded-xl border border-[var(--border-subtle)] bg-white p-2 shadow-xl ring-1 ring-black/5";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export function SearchFields({
  translations: t,
  isRtl: isRtlProp,
}: SearchFieldsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segment = pathname?.replace(/^\/+/, "").split("/")[0] ?? "";
  const isRtl =
    (routing.locales.includes(segment as (typeof routing.locales)[number])
      ? segment
      : routing.defaultLocale) === "ar" ||
    (segment === "" && isRtlProp);

  const getInitialStatus = (): StatusTabKey => {
    const param = searchParams.get("status");
    if (param === "rent" || param === "buy") {
      return param;
    }
    return "buy";
  };

  const getInitialCategory = (): CategoryKey => {
    const param = searchParams.get("category");
    if (param === "commercial" || param === "residential") {
      return param;
    }
    if (param === "lands") {
      return "land";
    }
    return "residential";
  };

  const getInitialPropertyType = (categoryKey: CategoryKey): string => {
    const typeParam = searchParams.get("type");
    const options = CATEGORY_TO_PROPERTY_TYPES[categoryKey];
    if (typeParam) {
      const normalized = typeParam.toLowerCase();
      const match = options.find((label) => slugify(label) === normalized);
      if (match) return match;
    }
    return options[0] ?? "";
  };

  const getInitialCity = (): string => {
    const param = searchParams.get("city");
    if (!param) return "";
    const found = JORDAN_CITIES_WITH_AREAS.find(
      (c) => c.name.toLowerCase() === param.trim().toLowerCase(),
    );
    return found ? found.name : "";
  };

  const getInitialAreas = (): string[] => {
    const locationsParam = searchParams.get("locations");
    if (!locationsParam) return [];
    const initialCity = getInitialCity();
    if (!initialCity) return [];
    const cityAreas = getAreasByCityName(initialCity);
    const parts = locationsParam.split(",").map((p) => p.trim().toLowerCase());
    return cityAreas.filter((area) => parts.includes(area.toLowerCase()));
  };

  const getInitialBudgetMin = (): string => {
    const param = searchParams.get("budgetMin");
    return param?.trim() ?? "";
  };

  const getInitialBudgetMax = (): string => {
    const param = searchParams.get("budgetMax");
    return param?.trim() ?? "";
  };

  const [status, setStatus] = useState<StatusTabKey>(() => getInitialStatus());
  const [category, setCategory] = useState<CategoryKey>(() =>
    getInitialCategory(),
  );
  const [propertyType, setPropertyType] = useState<string>(() =>
    getInitialPropertyType(getInitialCategory()),
  );
  const [city, setCity] = useState<string>(() => getInitialCity());
  const [selectedAreas, setSelectedAreas] = useState<string[]>(() =>
    getInitialAreas(),
  );
  const [budgetMin, setBudgetMin] = useState(() => getInitialBudgetMin());
  const [budgetMax, setBudgetMax] = useState(() => getInitialBudgetMax());
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const propertyTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const cityTriggerRef = useRef<HTMLButtonElement>(null);
  const areasTriggerRef = useRef<HTMLButtonElement>(null);
  const budgetTriggerRef = useRef<HTMLButtonElement>(null);

  const categoryLabel =
    category === "residential"
      ? t.residential
      : category === "commercial"
        ? t.commercial
        : t.land;
  const propertyTypeOptions = CATEGORY_TO_PROPERTY_TYPES[category];
  const areaOptions = city ? getAreasByCityName(city) : [];

  useEffect(() => {
    const options = CATEGORY_TO_PROPERTY_TYPES[category];
    if (!options.includes(propertyType)) {
      setPropertyType(options[0] ?? "");
    }
  }, [category, propertyType]);

  useEffect(() => {
    if (!city) {
      setSelectedAreas([]);
    } else {
      const options = getAreasByCityName(city);
      setSelectedAreas((prev) => prev.filter((a) => options.includes(a)));
    }
  }, [city]);

  const formatBudgetLabel = () => {
    if (!budgetMin && !budgetMax) return t.budgetPlaceholder;
    const formatNumber = (value: string) =>
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        Number(value),
      );
    const minLabel = budgetMin ? formatNumber(budgetMin) : t.budgetMin;
    const maxLabel = budgetMax ? formatNumber(budgetMax) : t.budgetMax;
    return `${minLabel} - ${maxLabel}`;
  };

  const handleAdvanceSearch = () => {
    const params = new URLSearchParams();
    params.set("status", status);
    params.set("category", category);
    if (propertyType) params.set("type", slugify(propertyType));
    if (city) params.set("city", city);
    if (selectedAreas.length > 0)
      params.set("locations", selectedAreas.join(","));
    if (budgetMin.trim()) params.set("budgetMin", budgetMin.trim());
    if (budgetMax.trim()) params.set("budgetMax", budgetMax.trim());
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <section
      className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-[var(--border-subtle)] sm:p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 md:gap-3 xl:flex-nowrap xl:gap-3 xl:overflow-x-auto xl:overflow-y-hidden xl:pb-1",
        )}
      >
        {/* Rent / Buy tabs (same style as HeroSearchCard) */}
        <div
          className={cn(
            "inline-flex shrink-0 rounded-2xl bg-[var(--surface)] p-1 ring-1 ring-[var(--border-subtle)]",
            isRtl && "flex-row-reverse",
          )}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {STATUS_TABS.map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                setStatus(tabKey);
              }}
              className={cn(
                "cursor-pointer rounded-xl px-5 py-2 text-sm font-medium capitalize transition",
                status === tabKey
                  ? "bg-[var(--brand-secondary)] text-white shadow-sm"
                  : "text-[rgba(51,51,51,0.7)] hover:text-[var(--brand-secondary)]",
              )}
            >
              {t[tabKey]}
            </button>
          ))}
        </div>

        {/* Commercial / Category dropdown */}
        <div className="relative shrink-0" dir={isRtl ? "rtl" : "ltr"}>
          <button
            ref={categoryTriggerRef}
            type="button"
            onClick={() => {
              setCategoryOpen((o) => !o);
              setPropertyTypeOpen(false);
              setCityOpen(false);
              setAreasOpen(false);
              setIsBudgetOpen(false);
            }}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] transition hover:border-[rgba(43,91,166,0.6)]",
              categoryOpen && "border-[var(--brand-secondary)]",
              isRtl && "flex-row-reverse",
            )}
          >
            {categoryLabel}
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={categoryOpen}
            onClose={() => setCategoryOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={categoryTriggerRef}
          >
            <div className={dropdownPanelClass}>
              {CATEGORY_OPTIONS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCategory(key);
                    setCategoryOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)]",
                    category === key
                      ? "bg-[var(--surface)] text-[var(--brand-secondary)] font-medium"
                      : "text-[var(--color-charcoal)]",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  {t[labelKey] as string}
                </button>
              ))}
            </div>
          </HeroDropdown>
        </div>

        {/* Property Type dropdown (depends on category) */}
        <div
          className="relative min-w-[120px] shrink-0"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={propertyTypeTriggerRef}
            type="button"
            onClick={() => {
              setPropertyTypeOpen((o) => !o);
              setCategoryOpen(false);
              setCityOpen(false);
              setAreasOpen(false);
              setIsBudgetOpen(false);
            }}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 py-2 text-sm transition hover:border-[rgba(43,91,166,0.6)]",
              propertyType
                ? "text-[var(--color-charcoal)]"
                : "text-[rgba(51,51,51,0.5)]",
              propertyTypeOpen && "border-[var(--brand-secondary)]",
              isRtl && "flex-row-reverse",
            )}
          >
            {propertyType || "Property type"}
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={propertyTypeOpen}
            onClose={() => setPropertyTypeOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={propertyTypeTriggerRef}
          >
            <div className={dropdownPanelClass}>
              {propertyTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPropertyType(type);
                    setPropertyTypeOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)]",
                    propertyType === type
                      ? "bg-[var(--surface)] text-[var(--brand-secondary)] font-medium"
                      : "text-[var(--color-charcoal)]",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </HeroDropdown>
        </div>

        {/* City dropdown */}
        <div
          className="relative min-w-[100px] shrink-0"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={cityTriggerRef}
            type="button"
            onClick={() => {
              setCityOpen((o) => !o);
              setCategoryOpen(false);
              setPropertyTypeOpen(false);
              setAreasOpen(false);
              setIsBudgetOpen(false);
            }}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 py-2 text-sm transition hover:border-[rgba(43,91,166,0.6)]",
              city
                ? "text-[var(--color-charcoal)]"
                : "text-[rgba(51,51,51,0.5)]",
              cityOpen && "border-[var(--brand-secondary)]",
              isRtl && "flex-row-reverse",
            )}
          >
            {city || t.cityPlaceholder}
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={cityOpen}
            onClose={() => setCityOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={cityTriggerRef}
          >
            <div className="min-w-48 max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-white p-2 shadow-xl ring-1 ring-black/5">
              {JORDAN_CITIES_WITH_AREAS.map((cityOption) => (
                <button
                  key={cityOption.id}
                  type="button"
                  onClick={() => {
                    setCity(cityOption.name);
                    setCityOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)]",
                    city === cityOption.name
                      ? "bg-[var(--surface)] text-[var(--brand-secondary)] font-medium"
                      : "text-[var(--color-charcoal)]",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  {cityOption.name}
                </button>
              ))}
            </div>
          </HeroDropdown>
        </div>

        {/* Areas (locations) multi-select - like HeroAreaSelect, disabled when no city */}
        <div className="relative w-52 shrink-0" dir={isRtl ? "rtl" : "ltr"}>
          <button
            ref={areasTriggerRef}
            type="button"
            disabled={!city}
            onClick={() => {
              if (!city) return;
              setAreasOpen((o) => !o);
              setCategoryOpen(false);
              setPropertyTypeOpen(false);
              setCityOpen(false);
              setIsBudgetOpen(false);
            }}
            className={cn(
              "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 bg-white px-4 py-2 text-sm transition",
              !city
                ? "cursor-not-allowed border-[rgba(43,91,166,0.2)] bg-[var(--surface)]/50 text-[rgba(51,51,51,0.5)]"
                : "border-[rgba(43,91,166,0.35)] hover:border-[rgba(43,91,166,0.6)]",
              selectedAreas.length > 0
                ? "text-[var(--color-charcoal)]"
                : !city
                  ? "text-[rgba(51,51,51,0.5)]"
                  : "text-[rgba(51,51,51,0.5)]",
              areasOpen && city && "border-[var(--brand-secondary)]",
              isRtl && "flex-row-reverse",
            )}
          >
            {selectedAreas.length === 0 ? (
              <span className="truncate">{t.areasPlaceholder}</span>
            ) : selectedAreas.length <= 2 ? (
              <span className="truncate">{selectedAreas.join(", ")}</span>
            ) : (
              <span
                className={cn(
                  "flex min-w-0 items-center gap-1",
                  isRtl && "flex-row-reverse",
                )}
              >
                <span className="min-w-0 truncate">
                  {selectedAreas.slice(0, 2).join(", ")}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[var(--brand-secondary)]">
                  <MoreHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                  {t.areasMoreLabel(selectedAreas.length - 2)}
                </span>
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={areasOpen && !!city}
            onClose={() => setAreasOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={areasTriggerRef}
          >
            <div className="min-w-48 max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-white p-2 shadow-xl ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => {
                  const allSelected =
                    areaOptions.length > 0 &&
                    areaOptions.every((a) => selectedAreas.includes(a));
                  if (allSelected) {
                    setSelectedAreas([]);
                  } else {
                    setSelectedAreas([...areaOptions]);
                  }
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-[var(--surface)]",
                  "text-[var(--brand-secondary)]",
                  isRtl && "text-right",
                )}
              >
                {areaOptions.length > 0 &&
                areaOptions.every((a) => selectedAreas.includes(a))
                  ? t.areasDeselectAll
                  : t.areasSelectAll}
              </button>
              <div className="my-1 border-t border-[var(--border-subtle)]" />
              {areaOptions.map((areaName) => {
                const isSelected = selectedAreas.includes(areaName);
                return (
                  <label
                    key={areaName}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)]",
                      isSelected
                        ? "bg-[var(--surface)] text-[var(--brand-secondary)] font-medium"
                        : "text-[var(--color-charcoal)]",
                      isRtl && "flex-row-reverse text-right",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedAreas((prev) =>
                            prev.includes(areaName)
                              ? prev.filter((a) => a !== areaName)
                              : [...prev, areaName],
                          );
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-[var(--border-subtle)] text-[var(--brand-secondary)] focus:ring-[var(--brand-primary)]"
                      />
                      <span>{areaName}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </HeroDropdown>
        </div>

        {/* Budget (JD) - dropdown like HeroSearchCard */}
        <div className="relative shrink-0" dir={isRtl ? "rtl" : "ltr"}>
          <button
            ref={budgetTriggerRef}
            type="button"
            onClick={() => {
              setIsBudgetOpen((o) => !o);
              setCategoryOpen(false);
              setPropertyTypeOpen(false);
              setCityOpen(false);
              setAreasOpen(false);
            }}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] transition hover:border-[rgba(43,91,166,0.6)]",
              isBudgetOpen && "border-[var(--brand-secondary)]",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-medium text-[var(--brand-secondary)]">
              JD
            </span>
            <span className="min-w-0 truncate text-sm">
              {formatBudgetLabel()}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={isBudgetOpen}
            onClose={() => setIsBudgetOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={budgetTriggerRef}
          >
            <BudgetRangeInputs
              minBudget={budgetMin}
              maxBudget={budgetMax}
              onChangeMin={setBudgetMin}
              onChangeMax={setBudgetMax}
              onReset={() => {
                setBudgetMin("");
                setBudgetMax("");
              }}
              onDone={() => setIsBudgetOpen(false)}
              minLabel={status === "rent" ? t.budgetYearlyMinLabel : undefined}
              maxLabel={status === "rent" ? t.budgetYearlyMaxLabel : undefined}
            />
          </HeroDropdown>
        </div>

        {/* Advance Search button */}
        <button
          type="button"
          onClick={handleAdvanceSearch}
          className={cn(
            "flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-[var(--brand-secondary)] bg-[var(--brand-secondary)] px-5 py-2 text-sm font-medium text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2",
            isRtl && "flex-row-reverse",
          )}
        >
          {t.advanceSearch}
        </button>
      </div>
    </section>
  );
}

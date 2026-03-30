"use client";

import { SearchFields } from "@/features/property-search/components/SearchFields";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

export interface AgentSearchProps {
  language: AppLocale;
}

function getPageTitle(
  t: (key: string, values?: Record<string, string>) => string,
  searchParams: URLSearchParams,
): string {
  return t("properties");
}

export function AgentSearch({ language }: AgentSearchProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const tSaved = useTranslations("savedSearches");
  const isRtl = language === "ar";
  const pageTitle = getPageTitle(t, searchParams);
  return (
    <section dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-4">
        <div className="z-20 bg-white pt-2 -mt-2 md:sticky md:top-[52px]">
          <SearchFields
            isRtl={isRtl}
            translations={{
              rent: t("rent"),
              buy: t("buy"),
              enterLocation: t("enterLocation"),
              cityPlaceholder: t("cityPlaceholder"),
              areasPlaceholder: t("areasPlaceholder"),
              areasSelectAll: t("areasSelectAll"),
              areasDeselectAll: t("areasDeselectAll"),
              areasMoreLabel: (count) => t("areasMoreLabel", { count }),
              residential: t("residential"),
              commercial: t("commercial"),
              land: t("land"),
              priceLabel: t("priceLabel"),
              areaLabel: t("areaLabel"),
              budgetLabel: t("budgetLabel"),
              budgetPlaceholder: t("budgetPlaceholder"),
              budgetMin: t("budgetMin"),
              budgetMax: t("budgetMax"),
              budgetYearlyMin: t("budgetYearlyMin"),
              budgetYearlyMax: t("budgetYearlyMax"),
              budgetYearlyMinLabel: t("budgetYearlyMinLabel"),
              budgetYearlyMaxLabel: t("budgetYearlyMaxLabel"),
              advanceSearch: t("advanceSearch"),
              advancedSearch: t("advancedSearch"),
              clear: t("clear"),
              furnitureStatus: t("furnitureStatus"),
              furnitureFurnished: t("furnitureFurnished"),
              furnitureSemiFurnished: t("furnitureSemiFurnished"),
              furnitureUnfurnished: t("furnitureUnfurnished"),
              bathrooms: t("bathrooms"),
              floorLevel: t("floorLevel"),
              parking: t("parking"),
              propertyAge: t("propertyAge"),
              minArea: t("minArea"),
              maxArea: t("maxArea"),
              bedrooms: t("bedrooms"),
              rooms: t("rooms"),
              minPlotArea: t("minPlotArea"),
              maxPlotArea: t("maxPlotArea"),
              allRooms: t("allRooms"),
              allBaths: t("allBaths"),
              allParking: t("allParking"),
              selectFurnitureStatus: t("selectFurnitureStatus"),
              selectFloorLevel: t("selectFloorLevel"),
              selectPropertyAge: t("selectPropertyAge"),
              garage: t("garage"),
              maidsRoom: t("maidsRoom"),
              heatingUnderfloor: t("heatingUnderfloor"),
              fireplace: t("fireplace"),
              swimmingPool: t("swimmingPool"),
              garden: t("garden"),
              airConditioning: t("airConditioning"),
              saveSearch: tSaved("saveSearch"),
            }}
          />
        </div>
      </div>
      {/* Preserve behavior: keep computed title (even if unused for now) */}
      <span className="sr-only">{pageTitle}</span>
    </section>
  );
}


"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { SearchFields } from "./SearchFields";
import { SearchResults } from "./SearchResults";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/mocks/jordanCities";
import { getAreasByCityName } from "@/lib/mocks/jordanCities";

export interface SearchResultMainProps {
  language: AppLocale;
}

function getPageTitle(
  t: (key: string, values?: Record<string, string>) => string,
  searchParams: URLSearchParams,
): string {
  const cityParam = searchParams.get("city")?.trim();
  const locationsParam = searchParams.get("locations");
  if (!cityParam && !locationsParam) {
    return t("propertiesInAmman");
  }
  const city = JORDAN_CITIES_WITH_AREAS.find(
    (c) => c.name.toLowerCase() === (cityParam ?? "").toLowerCase(),
  )?.name;
  const areas: string[] = locationsParam
    ? locationsParam.split(",").map((p) => p.trim()).filter(Boolean)
    : [];
  const cityAreas = city ? getAreasByCityName(city) : [];
  const selectedAreas = areas.filter((a) =>
    cityAreas.some((opt) => opt.toLowerCase() === a.toLowerCase()),
  );
  if (selectedAreas.length > 0 && city) {
    const location =
      selectedAreas.length <= 2
        ? `${city} - ${selectedAreas.join(", ")}`
        : `${city} - ${selectedAreas[0]}, ${t("areasMoreLabel", { count: String(selectedAreas.length - 1) })}`;
    return t("propertiesInLocation", { location });
  }
  if (city) {
    return t("propertiesInLocation", { location: city });
  }
  return t("propertiesInAmman");
}

export function SearchResultMain({ language }: SearchResultMainProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const isRtl = language === "ar";
  const pageTitle = getPageTitle(t, searchParams);

  return (
    <section
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="space-y-4">
        {/* Sticky search bar below header (header is sticky top-0 z-30, ~64px height) */}
        <div className="sticky top-16 z-20 bg-white pt-2 -mt-2 md:top-[52px]">
          <SearchFields
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
            }}
            isRtl={isRtl}
          />
        </div>
        <SearchResults resultsTitle={pageTitle} />
      </div>
    </section>
  );
}

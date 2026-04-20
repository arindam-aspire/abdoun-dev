"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/mocks/jordanCities";
import { getAreasByCityName } from "@/lib/mocks/jordanCities";
import { useLocale } from "next-intl";
import { StickySearchWrapper } from "@/components/ui/StickySearchWrapper";
import { SearchFields } from "@/features/property-search/components/SearchFields";
import { SearchResults } from "@/features/property-search/components/SearchResults";

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
    ? locationsParam
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
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

export default function SearchResultPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const tSaved = useTranslations("savedSearches");
  const language = useLocale() as AppLocale;
  const isRtl = language === "ar";
  const pageTitle = getPageTitle(t, searchParams);
  const source = searchParams.get("source");
  const activeSavedSearchId =
    source === "saved-search" ? searchParams.get("savedSearchId") : null;
  const saveSearchLabel =
    activeSavedSearchId && activeSavedSearchId.trim()
      ? "Update Search"
      : tSaved("saveSearch");

  return (
    <section className="mx-auto container w-full" dir={isRtl ? "rtl" : "ltr"}>
      <StickySearchWrapper className="px-4 md:px-8">
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
            resetSearch: t("resetSearch"),
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
            saveSearch: saveSearchLabel,
          }}
          isRtl={isRtl}
        />
      </StickySearchWrapper>
      <div className="px-4 py-8 md:px-8">
        <SearchResults resultsTitle={pageTitle} />
      </div>
    </section>
  );
}

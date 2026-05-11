"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  fetchLocationTaxonomyIfNeeded,
  selectJordanCitiesWithAreas,
} from "@/features/location-taxonomy/locationTaxonomySlice";
import { buildSearchResultPageTitle } from "@/features/location-taxonomy/locationTaxonomyMappers";
import { StickySearchWrapper } from "@/components/ui/StickySearchWrapper";
import { SearchFields } from "@/features/property-search/components/SearchFields";
import { SearchResults } from "@/features/property-search/components/SearchResults";

export default function SearchResultPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const tSaved = useTranslations("savedSearches");
  const language = useLocale() as AppLocale;
  const isRtl = language === "ar";
  const dispatch = useAppDispatch();
  const citiesJordan = useAppSelector(selectJordanCitiesWithAreas);

  useEffect(() => {
    void dispatch(fetchLocationTaxonomyIfNeeded());
  }, [dispatch]);

  const pageTitle = useMemo(
    () => buildSearchResultPageTitle(t, searchParams, citiesJordan),
    [t, searchParams, citiesJordan],
  );
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

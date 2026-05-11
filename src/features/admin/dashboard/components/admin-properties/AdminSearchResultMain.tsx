"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  fetchLocationTaxonomyIfNeeded,
  selectJordanCitiesWithAreas,
} from "@/features/location-taxonomy/locationTaxonomySlice";
import { buildSearchResultPageTitle } from "@/features/location-taxonomy/locationTaxonomyMappers";
import { SearchFields } from "@/features/property-search/components/SearchFields";
import { AdminSearchResults } from "./AdminSearchResults";

export interface AdminSearchResultMainProps {
  language: AppLocale;
}

export function AdminSearchResultMain({ language }: AdminSearchResultMainProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const tSaved = useTranslations("savedSearches");
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

  return (
    <section dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-4">
        <div className="z-20 bg-white pt-2 -mt-2 md:sticky md:top-[52px]">
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
              saveSearch: tSaved("saveSearch"),
            }}
            isRtl={isRtl}
          />
        </div>
        <AdminSearchResults resultsTitle={pageTitle} />
      </div>
    </section>
  );
}


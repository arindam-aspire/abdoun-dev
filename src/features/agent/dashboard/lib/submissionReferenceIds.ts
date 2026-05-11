/**
 * Maps UI selections to backend integer IDs. Align these with your Abdoun API seed data
 * (property categories, types, cities, areas, features). Env vars override defaults.
 */
import type { LocationTaxonomyCity } from "@/features/location-taxonomy/api/locationTaxonomy.api";
import { getCityAndAreaIdsFromTaxonomy, resolveCityNameFromTaxonomy } from "@/features/location-taxonomy/locationTaxonomyMappers";
import type { Category } from "../components/add-property/addPropertyWizard.types";

function numEnv(key: string, fallback: number): number {
  const raw = typeof process !== "undefined" ? process.env[key] : undefined;
  const n = raw != null && raw !== "" ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

const DEFAULT_CATEGORY: Record<Category, number> = {
  residential: numEnv("NEXT_PUBLIC_SUBMISSION_CATEGORY_RESIDENTIAL", 1),
  commercial: numEnv("NEXT_PUBLIC_SUBMISSION_CATEGORY_COMMERCIAL", 2),
  land: numEnv("NEXT_PUBLIC_SUBMISSION_CATEGORY_LAND", 3),
};

/** propertyType slugs from BasicInformationStep — set type IDs to match API. */
const TYPE_ID_BY_KEY: Record<string, number> = {
  "residential:apartment": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_RES_APARTMENT", 1),
  "residential:villa": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_RES_VILLA", 2),
  "residential:building": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_RES_BUILDING", 3),
  "commercial:office": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_COM_OFFICE", 4),
  "commercial:shop": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_COM_SHOP", 5),
  "commercial:warehouse": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_COM_WAREHOUSE", 6),
  "land:residential-land": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_LAND_RES", 7),
  "land:commercial-land": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_LAND_COM", 8),
  "land:farm-land": numEnv("NEXT_PUBLIC_SUBMISSION_TYPE_LAND_FARM", 9),
};

const DEFAULT_CITY_ID = numEnv("NEXT_PUBLIC_SUBMISSION_DEFAULT_CITY_ID", 1);
const DEFAULT_AREA_ID = numEnv("NEXT_PUBLIC_SUBMISSION_DEFAULT_AREA_ID", 1);

/** Optional: "Amman|Abdoun" -> area id (first area name wins for multi-select). */
const AREA_OVERRIDES: Record<string, number> = {};

export function getCategoryId(category: Category): number {
  return DEFAULT_CATEGORY[category] ?? 1;
}

export function getTypeId(category: Category, propertyTypeSlug: string): number {
  const key = `${category}:${propertyTypeSlug.trim()}`;
  return TYPE_ID_BY_KEY[key] ?? numEnv("NEXT_PUBLIC_SUBMISSION_DEFAULT_TYPE_ID", 1);
}

/** Resolve UI category from API `category_id` (inverse of `getCategoryId`). */
export function getCategoryFromCategoryId(categoryId: number | undefined | null): Category {
  if (categoryId == null || !Number.isFinite(categoryId)) return "residential";
  const match = (Object.keys(DEFAULT_CATEGORY) as Category[]).find(
    (c) => DEFAULT_CATEGORY[c] === categoryId,
  );
  return match ?? "residential";
}

/**
 * Turn internal slug (e.g. `building`, `residential-land`) into dropdown labels that match
 * {@link BasicInformationStep} fallbacks and typical English taxonomy names.
 */
function propertyTypeSlugToDisplayLabel(slug: string): string {
  return slug
    .split("-")
    .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase() : ""))
    .join(" ");
}

/** Resolve property type **display value** from API `type_id` for a given category (inverse of `getTypeId`). */
export function getPropertyTypeSlugFromTypeId(
  category: Category,
  typeId: number | undefined | null,
): string {
  if (typeId == null || !Number.isFinite(typeId)) return "";
  const prefix = `${category}:`;
  for (const [key, id] of Object.entries(TYPE_ID_BY_KEY)) {
    if (id === typeId && key.startsWith(prefix)) {
      return propertyTypeSlugToDisplayLabel(key.slice(prefix.length));
    }
  }
  return "";
}

/** Best-effort city name from stored `city_id` using loaded location taxonomy. */
export function getCityNameForSubmissionCityId(
  cityId: number | undefined | null,
  taxonomyCities: LocationTaxonomyCity[] = [],
): string {
  return resolveCityNameFromTaxonomy(cityId, taxonomyCities);
}

export function getAreaNamesForSubmissionAreaId(
  cityName: string,
  areaId: number | undefined | null,
  taxonomyCities: LocationTaxonomyCity[] = [],
): string[] {
  const city = taxonomyCities.find((c) => c.name.trim().toLowerCase() === cityName.trim().toLowerCase());
  if (!city || areaId == null || !Number.isFinite(areaId)) return [];
  const match = (city.areas ?? []).find((a) => a.id === areaId);
  return match?.name ? [match.name] : [];
}

export function getCityAndAreaIds(
  cityName: string,
  areaNames: string[],
  taxonomyCities: LocationTaxonomyCity[] = [],
): { city_id: number; area_id: number } {
  const city = taxonomyCities.find((c) => c.name.trim().toLowerCase() === cityName.trim().toLowerCase());
  const areaName = areaNames[0]?.trim() ?? "";
  if (city) {
    const key = `${city.name}|${areaName}`;
    const areaId = AREA_OVERRIDES[key];
    if (typeof areaId === "number") {
      return { city_id: city.id, area_id: areaId };
    }
  }
  return getCityAndAreaIdsFromTaxonomy(taxonomyCities, cityName, areaNames, DEFAULT_CITY_ID, DEFAULT_AREA_ID);
}

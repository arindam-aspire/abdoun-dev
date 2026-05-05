/**
 * Maps UI selections to backend integer IDs. Align these with your Abdoun API seed data
 * (property categories, types, cities, areas, features). Env vars override defaults.
 */
import { getCityByName, JORDAN_CITIES_WITH_AREAS } from "@/lib/constants/jordanCities";
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

/** Best-effort city name from stored `city_id` (mirrors env-based IDs in `getCityAndAreaIds`). */
export function getCityNameForSubmissionCityId(cityId: number | undefined | null): string {
  if (cityId == null || !Number.isFinite(cityId)) return "";
  for (const city of JORDAN_CITIES_WITH_AREAS) {
    const id = numEnv(`NEXT_PUBLIC_SUBMISSION_CITY_ID_${city.id.toUpperCase()}`, DEFAULT_CITY_ID);
    if (id === cityId) return city.name;
  }
  return "";
}

/**
 * Area names from `area_id` are resolved in {@link LocationStep} once location taxonomy loads.
 * This stub remains so synchronous GET hydration does not depend on async taxonomy.
 */
export function getAreaNamesForSubmissionAreaId(
  _cityName: string,
  _areaId: number | undefined | null,
): string[] {
  return [];
}

export function getCityAndAreaIds(
  cityName: string,
  areaNames: string[],
): { city_id: number; area_id: number } {
  const city = getCityByName(cityName);
  const areaName = areaNames[0]?.trim() ?? "";
  if (city) {
    const key = `${city.name}|${areaName}`;
    const areaId = AREA_OVERRIDES[key];
    if (typeof areaId === "number") {
      return {
        city_id: numEnv(`NEXT_PUBLIC_SUBMISSION_CITY_ID_${city.id.toUpperCase()}`, DEFAULT_CITY_ID),
        area_id: areaId,
      };
    }
  }
  return { city_id: DEFAULT_CITY_ID, area_id: DEFAULT_AREA_ID };
}

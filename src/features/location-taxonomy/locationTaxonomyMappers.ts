import type { LocationTaxonomyCity } from "@/features/location-taxonomy/api/locationTaxonomy.api";
import type { JordanCityWithAreas } from "@/features/location-taxonomy/types";

export function mapTaxonomyCitiesToJordanShape(cities: LocationTaxonomyCity[]): JordanCityWithAreas[] {
  return cities.map((c) => ({
    id: String(c.id),
    name: c.name,
    areas: (c.areas ?? []).map((a) => a.name).filter(Boolean),
  }));
}

export function getAreasByCityNameFromTaxonomy(
  cities: LocationTaxonomyCity[],
  cityName: string,
): string[] {
  const n = cityName.trim().toLowerCase();
  const city = cities.find((c) => c.name.trim().toLowerCase() === n);
  return city ? (city.areas ?? []).map((a) => a.name).filter(Boolean) : [];
}

export function getCityByNameFromTaxonomy(
  cities: LocationTaxonomyCity[],
  cityName: string,
): JordanCityWithAreas | undefined {
  return mapTaxonomyCitiesToJordanShape(cities).find(
    (c) => c.name.toLowerCase() === cityName.trim().toLowerCase(),
  );
}

export function getAreasByCityNameFromJordanShape(
  citiesJordan: JordanCityWithAreas[],
  cityName: string,
): string[] {
  const city = citiesJordan.find((c) => c.name.toLowerCase() === cityName.trim().toLowerCase());
  return city ? city.areas : [];
}

/**
 * Search / admin search-result page title from URL params + loaded city list.
 */
export function buildSearchResultPageTitle(
  t: (key: string, values?: Record<string, string>) => string,
  searchParams: URLSearchParams,
  citiesJordan: JordanCityWithAreas[],
): string {
  const exclusiveParam = searchParams.get("exclusive");
  if (exclusiveParam === "1" || exclusiveParam === "true") {
    return t("exclusivePropertiesTitle");
  }
  const cityParam = searchParams.get("city")?.trim();
  const locationsParam = searchParams.get("locations");
  if (!cityParam && !locationsParam) {
    return t("propertiesInAmman");
  }
  const city = citiesJordan.find((c) => c.name.toLowerCase() === (cityParam ?? "").toLowerCase())?.name;
  const areas: string[] = locationsParam
    ? locationsParam
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  const cityAreas = city ? getAreasByCityNameFromJordanShape(citiesJordan, city) : [];
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

export function resolveCityNameFromTaxonomy(
  cityId: number | undefined | null,
  cities: LocationTaxonomyCity[],
): string {
  if (cityId == null || !Number.isFinite(cityId)) return "";
  return cities.find((c) => c.id === cityId)?.name ?? "";
}

export function resolveAreaNamesFromTaxonomy(
  cityId: number | undefined | null,
  areaId: number | undefined | null,
  cities: LocationTaxonomyCity[],
): string[] {
  if (cityId == null || !Number.isFinite(cityId) || areaId == null || !Number.isFinite(areaId)) {
    return [];
  }
  const city = cities.find((c) => c.id === cityId);
  const area = city?.areas?.find((a) => a.id === areaId);
  return area?.name ? [area.name] : [];
}

export function getCityAndAreaIdsFromTaxonomy(
  cities: LocationTaxonomyCity[],
  cityName: string,
  areaNames: string[],
  fallbackCityId: number,
  fallbackAreaId: number,
): { city_id: number; area_id: number } {
  const trimmedCity = cityName.trim();
  const areaName = areaNames[0]?.trim() ?? "";
  const city = cities.find((c) => c.name.trim().toLowerCase() === trimmedCity.toLowerCase());
  if (!city) {
    return { city_id: fallbackCityId, area_id: fallbackAreaId };
  }
  const area = (city.areas ?? []).find((a) => a.name.trim().toLowerCase() === areaName.toLowerCase());
  if (!area) {
    return { city_id: city.id, area_id: fallbackAreaId };
  }
  return { city_id: city.id, area_id: area.id };
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v.trim() || null : null;
}

/**
 * Human-readable "Area, City" from submission `location` ids.
 * Prefers API taxonomy (numeric ids). Falls back to legacy string slug ids + Jordan-shaped list.
 */
export function cityAreaLabelFromLocationPayload(
  cityId: unknown,
  areaId: unknown,
  options: {
    taxonomyCities: LocationTaxonomyCity[];
    legacyCities?: JordanCityWithAreas[] | null;
  },
): string | null {
  const cNum = num(cityId);
  const aNum = num(areaId);
  const { taxonomyCities, legacyCities } = options;

  if (taxonomyCities.length > 0 && cNum != null) {
    const city = taxonomyCities.find((c) => c.id === cNum);
    const cityName = city?.name ?? null;
    let areaName: string | null = null;
    if (city && aNum != null) {
      areaName = city.areas?.find((a) => a.id === aNum)?.name ?? null;
    }
    if (cityName && areaName) return `${areaName}, ${cityName}`;
    return areaName ?? cityName ?? null;
  }

  const cSlug = str(cityId);
  const aSlug = str(areaId);
  if (!cSlug && !aSlug) return null;
  const legacy = legacyCities ?? [];
  const city = legacy.find((c) => c.id === cSlug);
  const normalizedArea = aSlug?.toLowerCase() ?? null;
  const areaName =
    city && normalizedArea
      ? city.areas.find((a) => a.toLowerCase() === normalizedArea) ?? null
      : null;
  const cityName = city?.name ?? null;
  if (cityName && areaName) return `${areaName}, ${cityName}`;
  return areaName ?? cityName ?? null;
}

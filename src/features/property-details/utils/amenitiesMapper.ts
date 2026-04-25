import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

type BackendLocalizedField =
  | string
  | Record<string, string | null | undefined>
  | null
  | undefined;

export type BackendTranslateFn = (
  field: BackendLocalizedField,
  fallback?: string,
) => string;

function toAmenityText(value: unknown, tBackend: BackendTranslateFn): string | null {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? text : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    const localized = tBackend(asRecord as Record<string, string | null | undefined>);
    if (localized.trim()) {
      return localized.trim();
    }
    for (const key of ["name", "label", "title", "value"]) {
      const candidate = asRecord[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return null;
}

function humanizeAmenitySlug(slug: string): string {
  return slug
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function toAmenityEntries(value: unknown, tBackend: BackendTranslateFn): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const rec = value as Record<string, unknown>;
    if (Array.isArray(rec.amenities)) {
      return rec.amenities;
    }
    return Object.entries(rec).flatMap(([key, raw]) => {
      if (key === "amenities") return [];
      const val = toAmenityText(raw, tBackend);
      if (!val) return [key];
      return [`${key}: ${val}`];
    });
  }
  return [];
}

export function mapAmenities(
  item: PropertyDetailsApiResponse,
  tBackend: BackendTranslateFn,
): string[] {
  const rawFeature = toAmenityEntries(item.features, tBackend);
  const rawMore = toAmenityEntries(item.more_features, tBackend);
  const amenitySlugs =
    item.features && typeof item.features === "object" && !Array.isArray(item.features)
      ? (item.features as { amenities?: string[] }).amenities
      : undefined;

  const all = [...rawFeature, ...rawMore]
    .map((entry) => {
      if (
        typeof entry === "string" &&
        Array.isArray(amenitySlugs) &&
        amenitySlugs.includes(entry)
      ) {
        return humanizeAmenitySlug(entry);
      }
      return toAmenityText(entry, tBackend);
    })
    .filter((text): text is string => Boolean(text));

  return Array.from(new Set(all));
}


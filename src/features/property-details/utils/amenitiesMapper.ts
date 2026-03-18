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

function toAmenityEntries(value: unknown, tBackend: BackendTranslateFn): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, raw]) => {
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
  const all = [
    ...toAmenityEntries(item.features, tBackend),
    ...toAmenityEntries(item.more_features, tBackend),
  ]
    .map((entry) => toAmenityText(entry, tBackend))
    .filter((text): text is string => Boolean(text));

  return Array.from(new Set(all));
}


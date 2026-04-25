import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

export function mapNeighborhoodLatLng(
  item: PropertyDetailsApiResponse,
): { lat?: number; lng?: number } {
  const d = item.location_detail;
  const loc =
    item.location && typeof item.location === "object"
      ? (item.location as { latitude?: number | null; longitude?: number | null })
      : null;
  const lat =
    item.latitude ?? d?.latitude ?? (loc?.latitude != null ? Number(loc.latitude) : undefined);
  const lng =
    item.longitude ?? d?.longitude ?? (loc?.longitude != null ? Number(loc.longitude) : undefined);
  return {
    lat: typeof lat === "number" && Number.isFinite(lat) ? lat : undefined,
    lng: typeof lng === "number" && Number.isFinite(lng) ? lng : undefined,
  };
}


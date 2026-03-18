import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

export function mapNeighborhoodLatLng(
  item: PropertyDetailsApiResponse,
): { lat?: number; lng?: number } {
  const lat = item.latitude ?? undefined;
  const lng = item.longitude ?? undefined;
  return { lat, lng };
}


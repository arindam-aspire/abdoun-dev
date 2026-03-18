import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";
import type { PropertyStat } from "@/features/property-details/types";

export function mapPropertyStats(item: PropertyDetailsApiResponse): PropertyStat[] {
  const stats: PropertyStat[] = [];

  if (item.category) {
    stats.push({
      label: "Category",
      value: item.category,
    });
  }
  if (item.status) {
    stats.push({
      label: "Listing status",
      value: item.status,
    });
  }
  if (item.latitude != null && item.longitude != null) {
    stats.push({
      label: "Coordinates",
      value: `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`,
    });
  }

  return stats;
}


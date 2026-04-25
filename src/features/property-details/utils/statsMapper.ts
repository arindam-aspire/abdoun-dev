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

/** Three cards under “Key highlights” — from API; avoids hardcoded marketing copy. */
export function mapPropertyOverviewStats(
  item: PropertyDetailsApiResponse,
): PropertyStat[] {
  const p = item.pricing;
  if (p) {
    return [
      {
        label: "Payment",
        value: p.price_on_request
          ? "Price on request"
          : p.payment_method?.trim() || "On request",
        description: p.installment_available
          ? "Installment options may be available — ask the agent."
          : "Contact the agent for payment options.",
      },
      {
        label: "Price terms",
        value: p.is_negotiable ? "Negotiable" : "As listed",
        description: p.contract_duration
          ? `Contract: ${p.contract_duration}`
          : p.currency
            ? `Currency: ${p.currency}`
            : undefined,
      },
      {
        label: "Listing",
        value: (p.listing_type || item.listing_type || "sale")
          .toString()
          .toLowerCase() === "rent"
          ? "For rent"
          : "For sale",
        description: item.status ? `Status: ${item.status}` : undefined,
      },
    ];
  }

  return [
    {
      label: "Payment",
      value: "On request",
      description: "The listing agent can share payment and fee details.",
    },
    {
      label: "Service charge",
      value: "On request",
      description: "Building management fees on request where applicable.",
    },
    {
      label: "Listing",
      value: item.status?.trim() || "—",
      description: item.category ? `Category: ${item.category}` : undefined,
    },
  ];
}


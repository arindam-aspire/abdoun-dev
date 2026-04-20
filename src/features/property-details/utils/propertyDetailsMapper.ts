import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";
import { mapAmenities, type BackendTranslateFn } from "@/features/property-details/utils/amenitiesMapper";
import { mapGallery } from "@/features/property-details/utils/galleryMapper";
import { mapNeighborhoodLatLng } from "@/features/property-details/utils/neighborhoodMapper";
import type { DetailedProperty } from "@/features/property-details/types";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatPrice(item: PropertyDetailsApiResponse): string {
  if (item.selling_price_amount != null) {
    const currency = item.selling_price_currency ?? "JD";
    return `${formatNumber(item.selling_price_amount)} ${currency}`;
  }
  if (item.rent_price_amount != null) {
    const currency = item.rent_price_currency ?? "JD";
    return `${formatNumber(item.rent_price_amount)} ${currency}`;
  }
  return "Price on request";
}

export function toDetailedProperty(
  item: PropertyDetailsApiResponse,
  tBackend: BackendTranslateFn,
): DetailedProperty {
  const gallery = mapGallery(item);
  const isRent = item.rent_price_amount != null && item.selling_price_amount == null;
  const { lat, lng } = mapNeighborhoodLatLng(item);
  const locationObj =
    item.location && typeof item.location === "object"
      ? item.location
      : item.location_detail && typeof item.location_detail === "object"
        ? item.location_detail
        : null;
  const locationFromNested = locationObj?.address ? tBackend(locationObj.address) : "";
  const title = tBackend(item.title) || "Untitled Property";
  const description = tBackend(item.description)?.trim() || "No description available.";
  const location = locationFromNested || item.location_name || "Location unavailable";

  return {
    id: item.id,
    title,
    subtitle: item.category ? `${item.category} in ${location}` : "Property details",
    badge: isRent ? "For Rent" : "For Sale",
    image: gallery[0],
    location,
    lat,
    lng,
    price: formatPrice(item),
    beds: item.bedrooms ?? 0,
    baths: item.bathrooms ?? 0,
    area: item.built_up_area != null ? formatNumber(item.built_up_area) : "N/A",
    status: item.status ?? undefined,
    description,
    amenities: mapAmenities(item, tBackend),
    gallery,
    propertyType: item.category ?? "Property",
    media: item.media,
    virtualTourUrl: item.media?.virtual_tour_url ?? undefined,
  };
}


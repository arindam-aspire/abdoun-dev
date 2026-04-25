import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";
import { mapAmenities, type BackendTranslateFn } from "@/features/property-details/utils/amenitiesMapper";
import { mapGallery } from "@/features/property-details/utils/galleryMapper";
import { mapNeighborhoodLatLng } from "@/features/property-details/utils/neighborhoodMapper";
import type { DetailedProperty } from "@/features/property-details/types";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function getSellingAmount(item: PropertyDetailsApiResponse): number | null {
  if (item.selling_price_amount != null) return item.selling_price_amount;
  if (item.pricing?.selling_price != null) return item.pricing.selling_price;
  return null;
}

function getRentAmount(item: PropertyDetailsApiResponse): number | null {
  if (item.rent_price_amount != null) return item.rent_price_amount;
  return null;
}

function getListingCurrency(item: PropertyDetailsApiResponse, sale: boolean): string {
  if (sale) {
    return item.selling_price_currency ?? item.pricing?.currency ?? "JOD";
  }
  return item.rent_price_currency ?? item.pricing?.currency ?? "JOD";
}

function formatPrice(item: PropertyDetailsApiResponse): string {
  if (item.pricing?.price_on_request) {
    return "Price on request";
  }
  const sell = getSellingAmount(item);
  if (sell != null) {
    const currency = getListingCurrency(item, true);
    return `${formatNumber(sell)} ${currency}`;
  }
  const rent = getRentAmount(item);
  if (rent != null) {
    const currency = getListingCurrency(item, false);
    return `${formatNumber(rent)} ${currency}`;
  }
  return "Price on request";
}

/** Area used for “avg per m²” — prefer details, else top-level built_up_area. */
function getBuiltUpAreaM2(item: PropertyDetailsApiResponse): number | null {
  const d = item.details?.built_up_area;
  if (typeof d === "number" && Number.isFinite(d) && d > 0) return d;
  const t = item.built_up_area;
  if (typeof t === "number" && Number.isFinite(t) && t > 0) return t;
  return null;
}

export function computePricePerM2Jod(item: PropertyDetailsApiResponse): string | null {
  const areaM2 = getBuiltUpAreaM2(item);
  const total = getSellingAmount(item) ?? getRentAmount(item);
  if (areaM2 == null || total == null || areaM2 <= 0) return null;
  const per = Math.round(total / areaM2);
  return `${formatNumber(per)} JOD`;
}

function buildLocationLabel(
  item: PropertyDetailsApiResponse,
  tBackend: BackendTranslateFn,
): string {
  if (item.location_name && item.location_name.trim()) {
    return item.location_name.trim();
  }
  const locationObj =
    item.location && typeof item.location === "object"
      ? item.location
      : item.location_detail && typeof item.location_detail === "object"
        ? item.location_detail
        : null;
  if (locationObj) {
    const r = (locationObj as { region?: string | null }).region?.trim() ?? "";
    const c = (locationObj as { city?: string | null }).city?.trim() ?? "";
    const country = (locationObj as { country?: string | null }).country?.trim() ?? "";
    const parts = [r, c, country].filter((p) => p.length > 0);
    if (parts.length > 0) {
      return parts.join(", ");
    }
    const fromAddr = locationObj.address ? tBackend(locationObj.address) : "";
    if (fromAddr.trim()) return fromAddr.trim();
  }
  if (typeof item.location === "string" && item.location.trim()) {
    return item.location.trim();
  }
  return "Location unavailable";
}

function listingIsRent(item: PropertyDetailsApiResponse): boolean {
  const lt = (item.listing_type || item.pricing?.listing_type || "").toLowerCase();
  if (lt === "rent" || lt === "lease") return true;
  if (lt === "sale" || lt === "buy") return false;
  return getRentAmount(item) != null && getSellingAmount(item) == null;
}

export function toDetailedProperty(
  item: PropertyDetailsApiResponse,
  tBackend: BackendTranslateFn,
): DetailedProperty {
  const gallery = mapGallery(item);
  const isRent = listingIsRent(item);
  const { lat, lng } = mapNeighborhoodLatLng(item);
  const title = tBackend(item.title) || "Untitled Property";
  const rawDescription = tBackend(item.description ?? "")?.trim();
  const description = rawDescription || "No description available.";
  const location = buildLocationLabel(item, tBackend);
  const typeLine = item.property_type || item.propertyType || item.category || "Property";
  const agent = item.agent;

  return {
    id: item.id,
    title,
    subtitle: item.category
      ? `${item.category} in ${location}`
      : `Property in ${location}`,
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
    propertyType: typeLine,
    media: item.media,
    virtualTourUrl: item.media?.virtual_tour_url ?? undefined,
    brokerName: agent?.name?.trim() || "Abdoun Real Estate",
    agent: agent
      ? {
          name: agent.name?.trim() || "Abdoun Real Estate",
          phone: agent.phone,
          email: agent.email,
          whatsapp: agent.whatsapp,
          photo: agent.photo,
          licenseNumber: agent.license_number,
        }
      : undefined,
    pricePerSqm: computePricePerM2Jod(item) ?? undefined,
    documentVerificationStatus: (item.status ?? "").toLowerCase() === "verified" ? "Ready" : "Pending",
  };
}


import { JORDAN_CITIES_WITH_AREAS, type JordanCityWithAreas } from "@/lib/mocks/jordanCities";
import type { DetailedProperty } from "@/features/property-details/types";

function toRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v.trim() || null : null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function stableNumericId(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.max(1, Math.abs(h));
}

function fmtPrice(price: unknown, currency: unknown): string {
  const p = num(price);
  const c = str(currency) ?? "JOD";
  if (p == null) return "—";
  const formatted = new Intl.NumberFormat("en-JO", { style: "decimal" }).format(p);
  return `${formatted} ${c}`;
}

function cityAreaLabel(cityId: unknown, areaId: unknown): string | null {
  const cId = str(cityId);
  const aId = str(areaId);
  if (!cId && !aId) return null;

  const city: JordanCityWithAreas | undefined = cId
    ? JORDAN_CITIES_WITH_AREAS.find((c) => c.id === cId)
    : undefined;

  const normalizedArea = aId?.toLowerCase() ?? null;
  const areaName =
    city && normalizedArea
      ? city.areas.find((a) => a.toLowerCase() === normalizedArea) ?? null
      : null;

  const cityName = city?.name ?? null;
  if (cityName && areaName) return `${areaName}, ${cityName}`;
  return areaName ?? cityName ?? null;
}

function getAmenityLabels(payload: Record<string, unknown>): string[] {
  const amenities = toRecord(payload.amenities);
  const list = amenities?.amenities;
  if (Array.isArray(list)) {
    return list
      .map((x) => (typeof x === "string" ? x.trim() : null))
      .filter((x): x is string => Boolean(x));
  }
  return [];
}

function getGalleryUrls(payload: Record<string, unknown>): string[] {
  const md = toRecord(payload.media_documents);
  const images = md?.images;
  if (Array.isArray(images)) {
    return images
      .map((x) => {
        if (typeof x === "string") return x.trim();
        const o = toRecord(x);
        return str(o?.url) ?? str(o?.file_url) ?? str(o?.image_url) ?? null;
      })
      .filter((x): x is string => Boolean(x));
  }
  const gallery = md?.gallery;
  if (Array.isArray(gallery)) {
    return gallery
      .map((x) => (typeof x === "string" ? x.trim() : null))
      .filter((x): x is string => Boolean(x));
  }
  return [];
}

export type SubmissionPayloadToDetailedPropertyInput = {
  submissionId: string;
  status?: string | null;
  payload: Record<string, unknown>;
  propertyReferenceNumber?: string | null;
  submittedByName?: string | null;
};

export function submissionPayloadToDetailedProperty(
  input: SubmissionPayloadToDetailedPropertyInput,
): DetailedProperty {
  const payload = input.payload ?? {};
  const bi = toRecord(payload.basic_information) ?? {};
  const loc = toRecord(payload.location) ?? {};
  const pricing = toRecord(payload.pricing) ?? {};
  const pd = toRecord(payload.property_details) ?? {};

  const title = str(bi.title) ?? "Untitled property";
  const subtitle =
    str(bi.subtitle) ??
    str(bi.short_description) ??
    str(bi.listing_purpose) ??
    "Property submission";

  const locationLabel =
    cityAreaLabel(loc.city_id, loc.area_id) ??
    str(loc.address) ??
    str(loc.location_label) ??
    "Jordan";

  const gallery = getGalleryUrls(payload);
  const heroImage =
    gallery[0] ??
    str(bi.cover_image_url) ??
    "https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?q=80&w=1800&auto=format&fit=crop";

  const beds = num(pd.bedrooms) ?? num(pd.beds) ?? 0;
  const baths = num(pd.bathrooms) ?? num(pd.baths) ?? 0;
  const area = num(pd.area) ?? num(pd.size) ?? num(pd.built_up_area) ?? null;

  const badge = str(input.status)?.replace(/_/g, " ") ?? "Submission";

  return {
    id: stableNumericId(input.submissionId),
    title,
    subtitle,
    badge,
    image: heroImage,
    location: locationLabel,
    price: fmtPrice(pricing.price, pricing.currency),
    beds,
    baths,
    area: area != null ? String(area) : "—",
    description: str(bi.description) ?? str(bi.full_description) ?? "—",
    amenities: getAmenityLabels(payload),
    gallery: gallery.length > 0 ? gallery : undefined,
    propertyType: str(bi.type_name) ?? str(bi.property_type) ?? str(bi.type_id) ?? undefined,
    brokerName: input.submittedByName ?? undefined,
    status: input.propertyReferenceNumber ? `Ref: ${input.propertyReferenceNumber}` : undefined,
  };
}


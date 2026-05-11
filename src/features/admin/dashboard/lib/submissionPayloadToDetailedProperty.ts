import type { LocationTaxonomyCity } from "@/features/location-taxonomy/api/locationTaxonomy.api";
import { cityAreaLabelFromLocationPayload } from "@/features/location-taxonomy/locationTaxonomyMappers";
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
  locationTaxonomyCities: LocationTaxonomyCity[] = [],
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
    cityAreaLabelFromLocationPayload(loc.city_id, loc.area_id, {
      taxonomyCities: locationTaxonomyCities,
    }) ??
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


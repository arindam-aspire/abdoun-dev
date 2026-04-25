import type { AddPropertyWizardState } from "../components/add-property/addPropertyWizardSlice";
import {
  createOwner,
  type ListingPurpose,
  type MediaFileRef,
  type OwnerDocumentRef,
} from "../components/add-property/addPropertyWizard.types";
import {
  getAreaNamesForSubmissionAreaId,
  getCategoryFromCategoryId,
  getCityNameForSubmissionCityId,
  getPropertyTypeSlugFromTypeId,
} from "./submissionReferenceIds";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function readStr(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

function readNumStr(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "string") return v;
  return "";
}

function splitPhone(phone: string): { countryCode: string; phone: string } {
  const t = phone.trim();
  if (!t) return { countryCode: "+962", phone: "" };
  const m = t.match(/^(\+\d{1,4})\s*(.*)$/);
  if (m) {
    return { countryCode: m[1] ?? "+962", phone: (m[2] ?? "").trim() };
  }
  return { countryCode: "+962", phone: t };
}

function parseMediaRows(rows: unknown): MediaFileRef[] {
  if (!Array.isArray(rows)) return [];
  const out: MediaFileRef[] = [];
  for (const row of rows) {
    const o = asRecord(row);
    if (!o) continue;
    const file_name = readStr(o, "file_name");
    const url = readStr(o, "url");
    if (!file_name || !url) continue;
    const caption = readStr(o, "caption");
    const display_order =
      typeof o.display_order === "number" && Number.isFinite(o.display_order)
        ? o.display_order
        : undefined;
    out.push({
      file_name,
      url,
      ...(caption ? { caption } : {}),
      ...(display_order !== undefined ? { display_order } : {}),
    });
  }
  return out;
}

/**
 * Mutates wizard state from API `payload` keys that are present (GET or PATCH merged shape).
 * Does not touch `activeStep`, `submissionId`, or other navigation / meta fields.
 */
export function applySubmissionPayloadToWizardState(
  state: AddPropertyWizardState,
  payload: Record<string, unknown>,
): void {
  if (payload.basic_information != null) {
    const bi = asRecord(payload.basic_information) ?? {};
    if ("listing_purpose" in bi) {
      const purpose = readStr(bi, "listing_purpose");
      if (purpose === "sale" || purpose === "rent") {
        state.listingPurpose = purpose as ListingPurpose;
      }
    }
    if ("category_id" in bi) {
      const categoryId =
        typeof bi.category_id === "number" && Number.isFinite(bi.category_id)
          ? bi.category_id
          : undefined;
      state.category = getCategoryFromCategoryId(categoryId);
    }
    if ("type_id" in bi) {
      const typeId =
        typeof bi.type_id === "number" && Number.isFinite(bi.type_id) ? bi.type_id : undefined;
      state.propertyType = getPropertyTypeSlugFromTypeId(state.category, typeId);
    }
    if ("title" in bi) {
      state.propertyTitle = readStr(bi, "title");
    }
    if ("description" in bi) {
      state.description = readStr(bi, "description");
    }
  }

  if (payload.location != null) {
    const loc = asRecord(payload.location) ?? {};
    const cityId =
      typeof loc.city_id === "number" && Number.isFinite(loc.city_id) ? loc.city_id : undefined;
    const areaId =
      typeof loc.area_id === "number" && Number.isFinite(loc.area_id) ? loc.area_id : undefined;
    const cityName = getCityNameForSubmissionCityId(cityId);
    if (cityName) {
      state.city = cityName;
    }
    if ("address" in loc) {
      state.address = readStr(loc, "address");
    }
    if (cityName) {
      const resolved = getAreaNamesForSubmissionAreaId(cityName, areaId);
      if (resolved.length > 0) {
        state.selectedAreas = resolved;
      }
    }
  }

  if (payload.owner_information != null) {
    const oi = asRecord(payload.owner_information) ?? {};
    const ownersRaw = oi.owners;
    const ownerDocs: Record<number, OwnerDocumentRef[]> = {};
    if (Array.isArray(ownersRaw) && ownersRaw.length > 0) {
      state.owners = ownersRaw.map((row, index) => {
        const o = asRecord(row) ?? {};
        const id = index + 1;
        const prev = state.owners[index];
        const phoneRaw = readStr(o, "phone");
        const { countryCode, phone } =
          "phone" in o
            ? splitPhone(phoneRaw)
            : {
                countryCode: prev?.countryCode ?? "+962",
                phone: prev?.phone ?? "",
              };
        if ("documents" in o) {
          const docsRaw = o.documents;
          if (Array.isArray(docsRaw) && docsRaw.length > 0) {
            const docs: OwnerDocumentRef[] = [];
            for (const d of docsRaw) {
              const dr = asRecord(d);
              if (!dr) continue;
              const fn = readStr(dr, "file_name");
              const u = readStr(dr, "url");
              if (fn && u) docs.push({ file_name: fn, url: u });
            }
            ownerDocs[id] = docs;
          } else if (Array.isArray(docsRaw) && docsRaw.length === 0) {
            ownerDocs[id] = [];
          }
        } else if (state.ownerDocuments[id]?.length) {
          ownerDocs[id] = state.ownerDocuments[id] ?? [];
        }
        return {
          id,
          fullName: "full_name" in o ? readStr(o, "full_name") : (prev?.fullName ?? ""),
          countryCode,
          phone,
          email: "email" in o ? readStr(o, "email") : (prev?.email ?? ""),
          socialSecurityId: "social_security_id" in o ? readStr(o, "social_security_id") : (prev?.socialSecurityId ?? ""),
          nationality: "nationality" in o ? readStr(o, "nationality") : (prev?.nationality ?? ""),
          address: "address" in o ? readStr(o, "address") : (prev?.address ?? ""),
        };
      });
      state.ownerDocuments = { ...state.ownerDocuments, ...ownerDocs };
    }
  }

  if (payload.property_details != null) {
    const pd = asRecord(payload.property_details) ?? {};
    const cur = state.propertyDetails;
    state.propertyDetails = {
      ...cur,
      ...( "bedrooms" in pd ? { bedrooms: readNumStr(pd, "bedrooms") } : {}),
      ...( "bathrooms" in pd ? { bathrooms: readNumStr(pd, "bathrooms") } : {}),
      ...( "built_up_area" in pd ? { builtUpArea: readNumStr(pd, "built_up_area") } : {}),
      ...( "parking_spaces" in pd ? { parkingSpaces: readNumStr(pd, "parking_spaces") } : {}),
      ...( "property_age" in pd
        ? {
            propertyAge:
              readStr(pd, "property_age") || readNumStr(pd, "property_age"),
          }
        : {}),
      ...( "completion_status" in pd ? { completionStatus: readStr(pd, "completion_status") } : {}),
      ...( "total_floors" in pd ? { totalFloors: readNumStr(pd, "total_floors") } : {}),
      ...( "occupancy" in pd ? { occupancy: readStr(pd, "occupancy") } : {}),
      ...( "ownership_type" in pd ? { ownershipType: readStr(pd, "ownership_type") } : {}),
      ...( "reference_number" in pd ? { referenceNumber: readStr(pd, "reference_number") } : {}),
      ...( "permit_number" in pd ? { permitNumber: readStr(pd, "permit_number") } : {}),
      ...( "orientation" in pd ? { orientation: readStr(pd, "orientation") } : {}),
    };
  }

  if (payload.pricing != null) {
    const pr = asRecord(payload.pricing) ?? {};
    if ("price" in pr) {
      state.price = readNumStr(pr, "price");
    }
    if ("service_charge" in pr) {
      state.serviceFee = readNumStr(pr, "service_charge");
    }
    if ("maintenance_fee" in pr) {
      state.maintenanceFee = readNumStr(pr, "maintenance_fee");
    }
  }

  if (payload.amenities != null) {
    const am = asRecord(payload.amenities) ?? {};
    const featureIds = am.feature_ids;
    if (Array.isArray(featureIds)) {
      state.amenityFeatureIds = featureIds.filter(
        (x): x is number => typeof x === "number" && Number.isFinite(x),
      );
    }
  }

  if (payload.media_documents != null) {
    const md = asRecord(payload.media_documents) ?? {};
    if ("images" in md) {
      let images = parseMediaRows(md.images);
      images = [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      state.mediaImages = images;
    }
    if ("videos" in md) {
      let videos = parseMediaRows(md.videos);
      videos = [...videos].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      state.mediaVideos = videos;
    }
    if ("documents" in md) {
      let documents = parseMediaRows(md.documents);
      documents = [...documents].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      state.propertyListingDocuments = documents;
    }
    if ("youtube_url" in md) {
      state.youtubeUrl = readStr(md, "youtube_url");
    }
    if ("virtual_tour_url" in md) {
      state.virtualTourUrl = readStr(md, "virtual_tour_url");
    }
  }

  if (payload.review_submit != null) {
    const rs = asRecord(payload.review_submit) ?? {};
    const keys = [
      "terms_accepted",
      "privacy_accepted",
      "public_display_authorized",
      "fees_acknowledged",
    ] as const;
    const present = keys.filter((k) => k in rs);
    if (present.length > 0) {
      state.termsAccepted = present.every((k) => Boolean(rs[k]));
    }
  }
}

/**
 * Sync merged server `payload` after a full GET (rehydration).
 * Applies every key that is present; empty objects still overwrite.
 */
export function mergeSubmissionPayloadIntoWizardState(
  state: AddPropertyWizardState,
  payload: Record<string, unknown> | undefined | null,
): void {
  if (!payload || typeof payload !== "object") return;
  applySubmissionPayloadToWizardState(state, payload);
  if (state.owners.length === 0) {
    state.owners = [createOwner(1)];
  }
}

/**
 * After PATCH: only apply fields the response actually includes, so a partial
 * `payload` (e.g. only `basic_information`) does not clear `media_documents` in Redux
 * or wipe uploads when the server omits sibling keys.
 */
export function applyPatchResponsePayloadToWizard(
  state: AddPropertyWizardState,
  payload: Record<string, unknown> | undefined | null,
): void {
  if (!payload || typeof payload !== "object") return;

  if ("basic_information" in payload) {
    if (payload.basic_information != null) {
      const slice = { basic_information: payload.basic_information };
      applySubmissionPayloadToWizardState(state, slice);
    }
  }
  if ("location" in payload && payload.location != null) {
    applySubmissionPayloadToWizardState(state, { location: payload.location });
  }
  if ("owner_information" in payload && payload.owner_information != null) {
    applySubmissionPayloadToWizardState(state, { owner_information: payload.owner_information });
  }
  if ("property_details" in payload && payload.property_details != null) {
    applySubmissionPayloadToWizardState(state, { property_details: payload.property_details });
  }
  if ("pricing" in payload && payload.pricing != null) {
    applySubmissionPayloadToWizardState(state, { pricing: payload.pricing });
  }
  if ("amenities" in payload && payload.amenities != null) {
    applySubmissionPayloadToWizardState(state, { amenities: payload.amenities });
  }
  if ("media_documents" in payload && payload.media_documents != null) {
    applySubmissionPayloadToWizardState(state, { media_documents: payload.media_documents });
  }
  if ("review_submit" in payload && payload.review_submit != null) {
    applySubmissionPayloadToWizardState(state, { review_submit: payload.review_submit });
  }

  if (state.owners.length === 0) {
    state.owners = [createOwner(1)];
  }
}

import type { AgentListing, ListingStatus, PropertyType } from "@/types/agent";
import type { AgentPropertyListItem } from "../api/agentProperties.api";

const VALID_PROPERTY_TYPES: ReadonlySet<string> = new Set([
  "villa",
  "apartment",
  "office",
  "land",
  "house",
  "duplex",
  "warehouse",
  "studio",
  "penthouse",
  "commercial",
]);

function toPropertyType(slug: string): PropertyType {
  const s = slug.trim().toLowerCase().replace(/-/g, "_");
  if (VALID_PROPERTY_TYPES.has(s)) {
    return s as PropertyType;
  }
  return "commercial";
}

/**
 * Map backend `property_status` slug to UI `ListingStatus` (mock-aligned keys).
 */
export function mapStatusSlugToListingStatus(
  statusSlug: string,
): ListingStatus {
  const s = statusSlug.trim().toLowerCase().replace(/-/g, "_");
  if (s === "active") return "active";
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "deactivated" || s === "inactive") return "deactivated";
  if (s === "draft") return "draft";
  if (
    s === "pending" ||
    s === "pending_approval" ||
    s === "submitted" ||
    s === "under_review" ||
    s === "pending_admin_approval"
  ) {
    return "pending_approval";
  }
  return "pending_approval";
}

/**
 * Map `property_listing_submissions.status` to a `ListingStatus` for filters / styling.
 */
export function mapSubmissionStatusToListingStatus(
  submissionStatus: string,
): ListingStatus {
  const s = submissionStatus.trim().toLowerCase().replace(/-/g, "_");
  if (s === "draft" || s === "in_progress") return "draft";
  if (s === "submitted" || s === "changes_requested") return "pending_approval";
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  return "pending_approval";
}

export function mapAgentPropertyItemToAgentListing(
  item: AgentPropertyListItem,
): AgentListing {
  const priceNum = Number.parseFloat(String(item.price));
  const price = Number.isFinite(priceNum) ? priceNum : 0;
  const type = toPropertyType(item.type_slug);
  const subType = item.category_name?.trim() ? item.category_name : undefined;
  const last = item.updated_at || item.created_at;

  const sub = item.submission_status?.trim();
  const hasSubmission = Boolean(sub);
  const status: ListingStatus = hasSubmission
    ? mapSubmissionStatusToListingStatus(sub!)
    : mapStatusSlugToListingStatus(item.status_slug);

  return {
    id: String(item.property_hash),
    title: item.title,
    type,
    subType: subType || undefined,
    status,
    statusDisplayName: hasSubmission ? undefined : item.status_name?.trim() || undefined,
    lastUpdated: last,
    price,
    isFromApi: true,
    submissionStatus: hasSubmission ? sub! : null,
    catalogStatusName: hasSubmission && item.status_name?.trim() ? item.status_name.trim() : null,
  };
}

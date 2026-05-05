import type { AgentListing } from "@/types/agent";

const EDITABLE_STATUSES = new Set([
  "draft",
  "in_progress",
  "changes_requested",
  "rejected",
]);

const DELETABLE_STATUSES = new Set([
  "draft",
  "in_progress",
  "changes_requested",
  "rejected",
]);

/**
 * Product rule: use backend flag when present; else infer from submission workflow status.
 */
export function canEditSubmission(row: AgentListing): boolean {
  if (typeof row.canEditSubmission === "boolean") {
    return row.canEditSubmission;
  }
  const s = row.submissionStatus?.trim().toLowerCase() ?? "";
  if (!s) return false;
  return EDITABLE_STATUSES.has(s);
}

export function canDeleteSubmission(row: AgentListing): boolean {
  if (typeof row.canDeleteSubmission === "boolean") {
    return row.canDeleteSubmission;
  }
  const s = row.submissionStatus?.trim().toLowerCase() ?? "";
  if (!s) return false;
  return DELETABLE_STATUSES.has(s);
}

type Translate = (key: string) => string;

/**
 * Submission workflow uses "verified" on some APIs; agent **listings** badge should read
 * "Approved". Catalog / search still use "Verified" elsewhere (e.g. `catalogStatusName`, badges).
 */
function submissionWorkflowBadgeIsApproved(label: string): boolean {
  const n = label.trim().toLowerCase();
  return n === "verified" || n === "approved" || n === "live";
}

function humanizeStatusLabel(input: string): string {
  const s = input.trim().replace(/_/g, " ");
  if (!s) return s;
  return s.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/**
 * Badge text on **Manage Listings** (submission-centric): prefer API workflow label with
 * approved/verified wording mapped to Approved; then `submission_status`; catalog subtitle
 * stays "Verified" via {@link AgentListing.catalogStatusName}.
 */
export function getDisplayStatusLabel(row: AgentListing, t: Translate): string {
  const w = row.submissionWorkflowLabel?.trim();
  if (w) {
    const wl = w.toLowerCase();
    if (wl === "submitted" || wl === "pending_admin_approval") {
      return t("statusPendingApproval");
    }
    if (submissionWorkflowBadgeIsApproved(w)) {
      return t("statusApproved");
    }
    if (wl === "rejected") return t("statusRejected");
    if (wl === "changes_requested") return t("statusChangesRequested");
    if (wl === "in_progress") return t("statusInProgress");
    if (wl === "draft") return t("statusDraft");
    return humanizeStatusLabel(w);
  }

  const sub = row.submissionStatus?.trim().toLowerCase() ?? "";
  if (sub === "submitted" || sub === "pending_admin_approval") {
    return t("statusPendingApproval");
  }
  if (sub === "approved" || sub === "verified") {
    return t("statusApproved");
  }
  if (sub === "rejected") return t("statusRejected");
  if (sub === "changes_requested") return t("statusChangesRequested");
  if (sub === "in_progress") return t("statusInProgress");
  if (sub === "draft") return t("statusDraft");

  const displayName = row.statusDisplayName?.trim();
  if (displayName) {
    if (row.isFromApi && displayName.toLowerCase() === "verified") {
      return t("statusApproved");
    }
    return displayName;
  }
  if (row.status === "pending_approval") return t("statusPendingApproval");
  if (row.status === "approved") return t("statusApproved");
  if (row.status === "rejected") return t("statusRejected");
  if (row.status === "active") return t("statusActive");
  if (row.status === "deactivated") return t("statusDeactivated");
  if (row.status === "draft") return t("statusDraft");
  return humanizeStatusLabel(row.status);
}

/**
 * Back-compat re-export: admin flows were moved to the admin-dashboard API module.
 * Keep this file so existing imports do not break.
 */
export {
  fetchAdminPropertySubmissions,
  getAdminPropertySubmission,
  listAdminPropertySubmissions,
  reviewAdminPropertySubmission,
} from "@/features/admin-agents/admin-dashboard/api/adminPropertySubmissions.api";

export type {
  AdminGetSubmissionResult,
  AdminReviewAction,
  AdminReviewBody,
  AdminSubmissionListItem,
  AdminSubmissionListResult,
} from "@/features/admin-agents/admin-dashboard/api/adminPropertySubmissions.api";

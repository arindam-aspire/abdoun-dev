/** Agent dashboard module types. Mock data only. */

export type ListingStatus = "draft" | "pending_approval" | "approved" | "active" | "rejected" | "deactivated";

export type PropertyType =
  | "villa"
  | "apartment"
  | "office"
  | "land"
  | "house"
  | "duplex"
  | "warehouse"
  | "studio"
  | "penthouse"
  | "commercial";

export interface AgentListing {
  id: string;
  title: string;
  type: PropertyType;
  /** Optional sub type; shown in table as "Type, Sub Type" in content only. */
  subType?: string;
  status: ListingStatus;
  lastUpdated: string;
  price: number;
  /**
   * When `true`, row comes from `GET /agent-properties` (no mock delete/publish).
   * View uses `id` as the property details identifier (e.g. `property_hash` string).
   */
  isFromApi?: boolean;
  /** Raw status label from API (optional; preferred for badge when set). */
  statusDisplayName?: string;
  /** `property_listing_submissions.status` when the API enriches the row. */
  submissionStatus?: string | null;
  /** Catalog / `property_status` label (e.g. Verified) when `submissionStatus` is also shown. */
  catalogStatusName?: string | null;
}

export type InquiryStatus = "new" | "contacted" | "closed";

export interface AgentInquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  dateReceived: string;
  status: InquiryStatus;
  message: string;
  response?: string;
  respondedAt?: string;
}

export interface AgentDashboardData {
  totalProperties: number;
  activeProperties: number;
  draftProperties: number;
  inquiryVolumeAllTime: number;
  inquiryVolumeLast7Days: number;
  /** Inquiries received in the last 30 days (leads this month). */
  leadsThisMonth: number;
  /** Total property views (mock). */
  totalPropertyViews: number;
  /** Number of closed deals/inquiries. */
  dealCloseCount: number;
  /** Conversion rate = (dealCloseCount / leadsThisMonth) * 100. */
  conversionRate: number;
  /** Percent change vs prior period from API (optional). Shown on metric cards. */
  listingsChangePercent: number | null;
  leadsChangePercent: number | null;
  dealsClosedChangePercent: number | null;
  propertyViewsChangePercent: number | null;
  inquiryTrendLast30Days: number[];
  recentActivity: { text: string; time: string; tone: "neutral" | "success" | "warning" | "info" }[];
  /**
   * Property performance rows for the dashboard chart.
   * Provided by `GET /agents/dashboard/summary` as `propertyPerformance` (backend key).
   */
  propertyPerformance?: PerformanceComparisonItem[];
}

export interface InquiryTrendDay {
  date: string;
  count: number;
}

export interface PerformanceComparisonItem {
  label: string;
  value: number;
}

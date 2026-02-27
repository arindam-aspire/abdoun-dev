/** Agent dashboard module types. Mock data only. */

export type ListingStatus = "active" | "draft";

export interface AgentListing {
  id: string;
  title: string;
  status: ListingStatus;
  lastUpdated: string;
  price: number;
}

export type InquiryStatus = "new" | "responded" | "closed";

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
  /** View rate as percentage (e.g. 8.2 for 8.2%). */
  viewRate: number;
  /** Number of closed deals/inquiries. */
  dealCloseCount: number;
  inquiryTrendLast30Days: number[];
  recentActivity: { text: string; time: string; tone: "neutral" | "success" | "warning" }[];
}

export interface InquiryTrendDay {
  date: string;
  count: number;
}

export interface PerformanceComparisonItem {
  label: string;
  value: number;
}

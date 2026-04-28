export type DashboardActivityTone = "neutral" | "success" | "warning";

export type DashboardActivityItem = {
  text: string;
  time: string;
  tone: DashboardActivityTone;
};

export interface PerformanceComparisonItem {
  label: string;
  value: number;
}

export interface AdminDashboardData {
  /** Reporting month (YYYY-MM), from API. */
  month: string;
  /** KPI cards — current month values */
  usersThisMonth: number;
  usersMoMDelta: number;
  agentsThisMonth: number;
  agentsMoMDelta: number;
  pendingApprovals: number;
  pendingApprovalsToday: number;
  listingsThisMonth: number;
  listingsMoMDelta: number;
  leadsThisMonth: number;
  leadsMoMDelta: number;
  closedDealsThisMonth: number;

  /** 12-month series for charts */
  userGrowthSeries: number[];
  listingGrowthSeries: number[];
  leadGrowthSeries: number[];

  /** Lead source distribution (for doughnut chart) */
  leadSourceLabels: string[];
  leadSourceValues: number[];

  /** Month labels (abbreviated) */
  monthLabels: string[];
  /** New backend key (preferred) for property performance. */
  propertyPerformance: PerformanceComparisonItem[];

  /** Recent activity feed (from API when available). */
  recentActivity?: DashboardActivityItem[];
}


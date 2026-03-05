/**
 * Admin Dashboard mock service. In-memory data only.
 * Provides month-scoped KPI and chart data for admin overview.
 */

export interface AdminDashboardData {
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

    /** 12-month series for charts */
    userGrowthSeries: number[];
    listingGrowthSeries: number[];
    leadGrowthSeries: number[];

    /** Lead source distribution (for doughnut chart) */
    leadSourceLabels: string[];
    leadSourceValues: number[];

    /** Month labels (abbreviated) */
    monthLabels: string[];
}

export interface AdminPerformanceItem {
    label: string;
    value: number;
}

function getMonthLabels(): string[] {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const now = new Date();
    const current = now.getMonth();
    const labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
        const idx = (current - i + 12) % 12;
        labels.push(months[idx]);
    }
    return labels;
}

export function getAdminDashboardData(): Promise<AdminDashboardData> {
    const userGrowthSeries = [820, 940, 1050, 1120, 1180, 1310, 1420, 1540, 1650, 1780, 1890, 2040];
    const listingGrowthSeries = [64, 78, 91, 85, 106, 118, 132, 148, 142, 167, 189, 208];
    const leadGrowthSeries = [310, 340, 378, 420, 395, 460, 510, 558, 490, 620, 685, 742];

    const usersThisMonth = userGrowthSeries[userGrowthSeries.length - 1];
    const usersPrevMonth = userGrowthSeries[userGrowthSeries.length - 2];
    const usersMoMDelta = +((((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 100).toFixed(1));

    const listingsThisMonth = listingGrowthSeries[listingGrowthSeries.length - 1];
    const listingsPrevMonth = listingGrowthSeries[listingGrowthSeries.length - 2];
    const listingsMoMDelta = +((((listingsThisMonth - listingsPrevMonth) / listingsPrevMonth) * 100).toFixed(1));

    const leadsThisMonth = leadGrowthSeries[leadGrowthSeries.length - 1];
    const leadsPrevMonth = leadGrowthSeries[leadGrowthSeries.length - 2];
    const leadsMoMDelta = +((((leadsThisMonth - leadsPrevMonth) / leadsPrevMonth) * 100).toFixed(1));

    return Promise.resolve({
        usersThisMonth,
        usersMoMDelta,
        agentsThisMonth: 48,
        agentsMoMDelta: 5.3,
        pendingApprovals: 56,
        pendingApprovalsToday: 8,
        listingsThisMonth,
        listingsMoMDelta,
        leadsThisMonth,
        leadsMoMDelta,

        userGrowthSeries,
        listingGrowthSeries,
        leadGrowthSeries,
        leadSourceLabels: ["Organic Search", "WhatsApp", "Meta Ads", "Direct Referral"],
        leadSourceValues: [1264, 894, 621, 299],
        monthLabels: getMonthLabels(),
    });
}

export function getAdminPerformanceComparison(): Promise<AdminPerformanceItem[]> {
    return Promise.resolve([
        { label: "Abdoun", value: 186 },
        { label: "Sweifieh", value: 142 },
        { label: "Dabouq", value: 118 },
        { label: "Khalda", value: 97 },
        { label: "Shmeisani", value: 84 },
    ]);
}

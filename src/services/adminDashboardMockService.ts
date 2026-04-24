import { getClosedLeadsCountForDashboard, getLeadsThisMonthCountForDashboard } from "@/services/leadInquiriesMockService";
import { getListingsThisMonthCountForDashboard, getPendingApprovalsCountForDashboard } from "@/services/agentDashboardMockService";
import type { PropertyType } from "@/types/agent";

/**
 * Admin Dashboard mock service. In-memory data only.
 * Provides month-scoped KPI and chart data for admin overview.
 */
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
    propertyPerformanceSeries: PerformanceComparisonItem[];
}

export interface AdminPerformanceItem {
    label: string;
    value: number;
}

type ViewerRole = "admin" | "agent";

export interface PropertyPerformanceRecord {
    id: string;
    agentId: string;
    agentName: string;
    propertyTitle: string;
    propertyType: PropertyType;
    views: number;
}

export interface PropertyPerformanceQuery {
    role: ViewerRole;
    /**
     * Current signed-in agent id (required for role="agent").
     * Agent role always returns only this agent's properties.
     */
    viewerAgentId?: string;
    /** Optional admin filter to show one specific agent. */
    agentId?: string;
    /** Optional limit for top results by views. */
    limit?: number;
}

const propertyPerformanceStore: PropertyPerformanceRecord[] = [
    { id: "PP-001", agentId: "AG-001", agentName: "Leen Khoury", propertyTitle: "Villa Abdoun, 4BR", propertyType: "villa", views: 148 },
    { id: "PP-002", agentId: "AG-001", agentName: "Leen Khoury", propertyTitle: "Apartment Sweifieh", propertyType: "apartment", views: 113 },
    { id: "PP-003", agentId: "AG-001", agentName: "Leen Khoury", propertyTitle: "Garden Apartment, Um Uthaina", propertyType: "apartment", views: 87 },
    { id: "PP-004", agentId: "AG-002", agentName: "Omar Shdeifat", propertyTitle: "Duplex, Dabouq", propertyType: "duplex", views: 132 },
    { id: "PP-005", agentId: "AG-002", agentName: "Omar Shdeifat", propertyTitle: "Family House, Khalda", propertyType: "house", views: 104 },
    { id: "PP-006", agentId: "AG-002", agentName: "Omar Shdeifat", propertyTitle: "Office Space, Shmeisani", propertyType: "office", views: 98 },
    { id: "PP-007", agentId: "AG-003", agentName: "Dana Abu-Taleb", propertyTitle: "Penthouse, Fifth Circle", propertyType: "penthouse", views: 156 },
    { id: "PP-008", agentId: "AG-003", agentName: "Dana Abu-Taleb", propertyTitle: "Land Parcel, Airport Road", propertyType: "land", views: 74 },
    { id: "PP-009", agentId: "AG-003", agentName: "Dana Abu-Taleb", propertyTitle: "Warehouse, Marka", propertyType: "warehouse", views: 68 },
];

function getCategoryForType(type: PropertyType): string {
    if (["villa", "apartment", "house", "duplex", "studio", "penthouse"].includes(type)) return "Residential";
    if (["office", "warehouse", "commercial"].includes(type)) return "Commercial";
    if (type === "land") return "Land";
    return "Residential";
}

function formatPropertyLabel(type: PropertyType, title: string): string {
    const category = getCategoryForType(type);
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    return `${category}, ${formattedType}, ${title}`;
}

function formatAgentPropertyLabel(record: PropertyPerformanceRecord): string {
    return `${record.agentName} - ${formatPropertyLabel(record.propertyType, record.propertyTitle)}`;
}

function getScopedPropertyPerformanceRecords(query: PropertyPerformanceQuery): PropertyPerformanceRecord[] {
    const { role, viewerAgentId, agentId } = query;

    if (role === "agent") {
        if (!viewerAgentId) return [];
        return propertyPerformanceStore.filter((item) => item.agentId === viewerAgentId);
    }

    if (agentId) {
        return propertyPerformanceStore.filter((item) => item.agentId === agentId);
    }

    return [...propertyPerformanceStore];
}

export function getPropertyPerformanceSeriesForRole(query: PropertyPerformanceQuery): Promise<PerformanceComparisonItem[]> {
    const limit = query.limit ?? 5;
    const scoped = getScopedPropertyPerformanceRecords(query);
    const items = scoped
        .map((item) => ({ label: formatAgentPropertyLabel(item), value: item.views }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
    return Promise.resolve(items);
}

export function getAdminAgentFilterOptions(): Promise<Array<{ id: string; name: string }>> {
    const options = Array.from(
        new Map(propertyPerformanceStore.map((item) => [item.agentId, item.agentName])).entries()
    ).map(([id, name]) => ({ id, name }));
    return Promise.resolve(options);
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

    const usersThisMonth = 18;
    const usersPrevMonth = 14;
    const usersMoMDelta = +((((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 100).toFixed(1));

    const listingsThisMonth = getListingsThisMonthCountForDashboard();
    const listingsPrevMonth = Math.max(1, listingsThisMonth - 6);
    const listingsMoMDelta = +((((listingsThisMonth - listingsPrevMonth) / listingsPrevMonth) * 100).toFixed(1));

    const leadsThisMonth = getLeadsThisMonthCountForDashboard();
    const leadsPrevMonth = Math.max(1, leadsThisMonth - 12);
    const leadsMoMDelta = +((((leadsThisMonth - leadsPrevMonth) / leadsPrevMonth) * 100).toFixed(1));

    const pendingApprovals = getPendingApprovalsCountForDashboard();

    return getPropertyPerformanceSeriesForRole({ role: "admin", limit: 5 }).then((propertyPerformanceSeries) => ({
        month: new Date().toISOString().slice(0, 7),
        usersThisMonth,
        usersMoMDelta,
        agentsThisMonth: 48,
        agentsMoMDelta: 5.3,
        pendingApprovals,
        pendingApprovalsToday: pendingApprovals > 0 ? 2 : 0,
        listingsThisMonth,
        listingsMoMDelta,
        leadsThisMonth,
        leadsMoMDelta,
        closedDealsThisMonth: getClosedLeadsCountForDashboard(),

        userGrowthSeries,
        listingGrowthSeries,
        leadGrowthSeries,
        leadSourceLabels: ["Organic Search", "WhatsApp", "Meta Ads", "Direct Referral"],
        leadSourceValues: [1264, 894, 621, 299],
        monthLabels: getMonthLabels(),
        propertyPerformanceSeries,
    }));
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

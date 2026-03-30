/**
 * Agent Dashboard mock service. In-memory database only.
 * All CRUD and reads go through this layer. No backend.
 */

import type {
  AgentDashboardData,
  AgentInquiry,
  AgentListing,
  InquiryStatus,
  ListingStatus,
  PerformanceComparisonItem,
  PropertyType,
} from "@/types/agent";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

// ----- In-memory store -----
const listingsStore: AgentListing[] = [
  { id: "L1", title: "Villa Abdoun, 4BR", type: "villa", subType: "Detached", status: "active", lastUpdated: isoDaysAgo(2), price: 485000 },
  { id: "L2", title: "Apartment Sweifieh", type: "apartment", subType: "Garden", status: "active", lastUpdated: isoDaysAgo(5), price: 185000 },
  { id: "L3", title: "Office Space, Shmeisani", type: "office", subType: "Grade A", status: "active", lastUpdated: isoDaysAgo(1), price: 320000 },
  { id: "L4", title: "Land Parcel, Airport Road", type: "land", subType: "Residential", status: "pending_approval", lastUpdated: isoDaysAgo(7), price: 120000 },
  { id: "L5", title: "Penthouse, Fifth Circle", type: "penthouse", status: "active", lastUpdated: isoDaysAgo(0), price: 620000 },
  { id: "L6", title: "Studio, Jabal Amman", type: "studio", subType: "Furnished", status: "pending_approval", lastUpdated: isoDaysAgo(10), price: 85000 },
  { id: "L7", title: "Family House, Khalda", type: "house", subType: "Standalone", status: "active", lastUpdated: isoDaysAgo(3), price: 390000 },
  { id: "L8", title: "Duplex, Dabouq", type: "duplex", status: "rejected", lastUpdated: isoDaysAgo(4), price: 275000 },
  { id: "L9", title: "Warehouse, Marka", type: "warehouse", subType: "Industrial", status: "approved", lastUpdated: isoDaysAgo(14), price: 210000 },
  { id: "L10", title: "Garden Apartment, Um Uthaina", type: "apartment", subType: "Garden", status: "active", lastUpdated: isoDaysAgo(1), price: 165000 },
  { id: "L11", title: "Commercial Unit, Mecca St", type: "commercial", subType: "Retail", status: "deactivated", lastUpdated: isoDaysAgo(6), price: 440000 },
];

const inquiriesStore: AgentInquiry[] = [
  { id: "IQ1", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", dateReceived: isoDaysAgo(0), status: "new", message: "Is the villa still available? Interested in viewing." },
  { id: "IQ2", propertyId: "L2", propertyName: "Apartment Sweifieh", dateReceived: isoDaysAgo(1), status: "contacted", message: "What are the monthly fees?", response: "Fees are JOD 45/month.", respondedAt: isoDaysAgo(0) },
  { id: "IQ3", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", dateReceived: isoDaysAgo(2), status: "contacted", message: "Can we negotiate the price?" },
  { id: "IQ4", propertyId: "L5", propertyName: "Penthouse, Fifth Circle", dateReceived: isoDaysAgo(0), status: "new", message: "Schedule a visit please." },
  { id: "IQ5", propertyId: "L3", propertyName: "Office Space, Shmeisani", dateReceived: isoDaysAgo(3), status: "contacted", message: "Is parking included?", response: "Yes, 2 spaces.", respondedAt: isoDaysAgo(2) },
  { id: "IQ6", propertyId: "L7", propertyName: "Family House, Khalda", dateReceived: isoDaysAgo(4), status: "new", message: "Availability from next month?" },
  { id: "IQ7", propertyId: "L2", propertyName: "Apartment Sweifieh", dateReceived: isoDaysAgo(5), status: "contacted", message: "Thanks, we found another." },
  { id: "IQ8", propertyId: "L8", propertyName: "Duplex, Dabouq", dateReceived: isoDaysAgo(1), status: "new", message: "Send floor plan." },
  { id: "IQ9", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", dateReceived: isoDaysAgo(6), status: "contacted", message: "Best price?", response: "Price is firm.", respondedAt: isoDaysAgo(5) },
  { id: "IQ10", propertyId: "L10", propertyName: "Garden Apartment, Um Uthaina", dateReceived: isoDaysAgo(0), status: "new", message: "Pet friendly?" },
  { id: "IQ11", propertyId: "L5", propertyName: "Penthouse, Fifth Circle", dateReceived: isoDaysAgo(7), status: "closed", message: "Deal closed." },
  { id: "IQ12", propertyId: "L3", propertyName: "Office Space, Shmeisani", dateReceived: isoDaysAgo(2), status: "new", message: "Lease terms?" },
  { id: "IQ13", propertyId: "L7", propertyName: "Family House, Khalda", dateReceived: isoDaysAgo(8), status: "contacted", message: "Viewing this week?", response: "Thursday 3pm works.", respondedAt: isoDaysAgo(7) },
  { id: "IQ14", propertyId: "L8", propertyName: "Duplex, Dabouq", dateReceived: isoDaysAgo(9), status: "new", message: "Photos of kitchen?" },
  { id: "IQ15", propertyId: "L2", propertyName: "Apartment Sweifieh", dateReceived: isoDaysAgo(1), status: "new", message: "Is it furnished?" },
  { id: "IQ16", propertyId: "L10", propertyName: "Garden Apartment, Um Uthaina", dateReceived: isoDaysAgo(10), status: "closed", message: "No longer interested." },
  { id: "IQ17", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", dateReceived: isoDaysAgo(3), status: "new", message: "Bank financing possible?" },
  { id: "IQ18", propertyId: "L5", propertyName: "Penthouse, Fifth Circle", dateReceived: isoDaysAgo(11), status: "closed", message: "Amenities list?", response: "Pool, gym, concierge.", respondedAt: isoDaysAgo(10) },
  { id: "IQ19", propertyId: "L3", propertyName: "Office Space, Shmeisani", dateReceived: isoDaysAgo(4), status: "new", message: "Square footage?" },
  { id: "IQ20", propertyId: "L7", propertyName: "Family House, Khalda", dateReceived: isoDaysAgo(0), status: "new", message: "School district?" },
];

// ----- Helpers -----
function getInquiryCountFromDaysAgo(days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();
  return inquiriesStore.filter((iq) => iq.dateReceived.slice(0, 10) >= cutoffStr.slice(0, 10)).length;
}

function buildTrendLast30Days(): number[] {
  const out: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = isoDaysAgo(i);
    out.push(inquiriesStore.filter((iq) => iq.dateReceived.startsWith(date)).length);
  }
  return out;
}

function getCategoryForType(type: PropertyType): string {
  if (["villa", "apartment", "house", "duplex", "studio", "penthouse"].includes(type)) return "Residential";
  if (["office", "warehouse", "commercial"].includes(type)) return "Commercial";
  if (type === "land") return "Land";
  return "Residential"; // Fallback
}

export function formatPropertyLabel(type: PropertyType | undefined, title: string): string {
  if (!type) return title;
  const category = getCategoryForType(type);
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  return `${category}, ${formattedType}, ${title}`;
}

// ----- Public API -----

export function getDashboardData(): Promise<AgentDashboardData> {
  const active = listingsStore.filter((l) => l.status === "active").length;
  const draft = 0; // Draft status removed from Manage Listings
  const trend = buildTrendLast30Days();
  const leadsThisMonth = getInquiryCountFromDaysAgo(30);
  const dealCloseCount = inquiriesStore.filter((iq) => iq.status === "closed").length;
  const totalPropertyViews = 542; // mock total views
  const conversionRate = leadsThisMonth > 0 ? Math.round((dealCloseCount / leadsThisMonth) * 100 * 10) / 10 : 0;
  return Promise.resolve({
    totalProperties: listingsStore.length,
    activeProperties: active,
    draftProperties: draft,
    inquiryVolumeAllTime: inquiriesStore.length,
    inquiryVolumeLast7Days: getInquiryCountFromDaysAgo(7),
    leadsThisMonth,
    totalPropertyViews,
    dealCloseCount,
    conversionRate,
    inquiryTrendLast30Days: trend,
    recentActivity: [
      { text: "New inquiry on Villa Abdoun, 4BR.", time: "12 min ago", tone: "success" },
      { text: "Listing Penthouse, Fifth Circle updated.", time: "1 hour ago", tone: "success" },
      { text: "3 new inquiries require response.", time: "2 hours ago", tone: "warning" },
      { text: "Weekly inquiry summary ready.", time: "Yesterday", tone: "neutral" },
      { text: "Studio, Jabal Amman submitted for approval.", time: "Yesterday", tone: "success" },
    ],
  });
}

export function getListings(): Promise<AgentListing[]> {
  return Promise.resolve([...listingsStore]);
}

export function getListingById(id: string): Promise<AgentListing | null> {
  return Promise.resolve(listingsStore.find((l) => l.id === id) ?? null);
}

export function updateListing(
  id: string,
  patch: Partial<Pick<AgentListing, "title" | "status" | "lastUpdated" | "price" | "type" | "subType">>
): Promise<AgentListing | null> {
  const idx = listingsStore.findIndex((l) => l.id === id);
  if (idx === -1) return Promise.resolve(null);
  const next = { ...listingsStore[idx], ...patch, lastUpdated: isoNow().slice(0, 10) };
  listingsStore[idx] = next;
  return Promise.resolve(next);
}

export function publishDraft(id: string): Promise<AgentListing | null> {
  return updateListing(id, { status: "active" as ListingStatus });
}

export function deleteListing(id: string): Promise<boolean> {
  const idx = listingsStore.findIndex((l) => l.id === id);
  if (idx === -1) return Promise.resolve(false);
  listingsStore.splice(idx, 1);
  return Promise.resolve(true);
}

let nextListingId = listingsStore.length + 1;

export function addListing(listing: Pick<AgentListing, "title" | "type" | "price">): Promise<AgentListing> {
  const newListing: AgentListing = {
    id: `L${nextListingId++}`,
    title: listing.title,
    type: listing.type,
    status: "pending_approval",
    lastUpdated: isoNow().slice(0, 10),
    price: listing.price,
  };
  listingsStore.push(newListing);
  return Promise.resolve(newListing);
}

export function getListingsThisMonthCountForDashboard(): number {
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-03"
  return listingsStore.filter((listing) =>
    typeof listing.lastUpdated === "string" &&
    listing.lastUpdated.startsWith(currentMonthPrefix)
  ).length;
}

export function getPendingApprovalsCountForDashboard(): number {
  return listingsStore.filter((listing) => listing.status === "pending_approval").length;
}

export function getInquiries(): Promise<AgentInquiry[]> {
  return Promise.resolve([...inquiriesStore].sort((a, b) => b.dateReceived.localeCompare(a.dateReceived)));
}

export function getInquiryById(id: string): Promise<AgentInquiry | null> {
  return Promise.resolve(inquiriesStore.find((iq) => iq.id === id) ?? null);
}

export function updateInquiryStatus(id: string, status: InquiryStatus): Promise<AgentInquiry | null> {
  const idx = inquiriesStore.findIndex((iq) => iq.id === id);
  if (idx === -1) return Promise.resolve(null);
  inquiriesStore[idx] = { ...inquiriesStore[idx], status };
  return Promise.resolve(inquiriesStore[idx]);
}

export function addInquiryResponse(
  id: string,
  response: string
): Promise<AgentInquiry | null> {
  const idx = inquiriesStore.findIndex((iq) => iq.id === id);
  if (idx === -1) return Promise.resolve(null);
  const now = isoNow();
  inquiriesStore[idx] = {
    ...inquiriesStore[idx],
    response,
    respondedAt: now.slice(0, 10),
    status: "contacted" as InquiryStatus,
  };
  return Promise.resolve(inquiriesStore[idx]);
}

/** Daily inquiry counts for the last 30 days (for detailed trends). */
export function getInquiryTrendDaily(): Promise<{ date: string; count: number }[]> {
  const out: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = isoDaysAgo(i);
    out.push({
      date,
      count: inquiriesStore.filter((iq) => iq.dateReceived.startsWith(date)).length,
    });
  }
  return Promise.resolve(out);
}

/** Weekly aggregation (last 4 weeks). */
export function getInquiryTrendWeekly(): Promise<{ weekLabel: string; count: number }[]> {
  const weeks: { weekLabel: string; count: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date();
    start.setDate(start.getDate() - (w + 1) * 7);
    const end = new Date();
    end.setDate(end.getDate() - w * 7);
    const count = inquiriesStore.filter((iq) => {
      const d = iq.dateReceived.slice(0, 10);
      return d >= start.toISOString().slice(0, 10) && d < end.toISOString().slice(0, 10);
    }).length;
    weeks.push({ weekLabel: `Week ${4 - w}`, count });
  }
  return Promise.resolve(weeks);
}

export function getPerformanceComparison(): Promise<PerformanceComparisonItem[]> {
  const byProperty = new Map<string, { count: number; label: string }>();
  for (const iq of inquiriesStore) {
    const listing = listingsStore.find((l) => l.id === iq.propertyId);
    const label = formatPropertyLabel(listing?.type, iq.propertyName);
    
    const existing = byProperty.get(iq.propertyName);
    if (existing) {
      existing.count += 1;
    } else {
      byProperty.set(iq.propertyName, { count: 1, label });
    }
  }
  const items: PerformanceComparisonItem[] = Array.from(byProperty.values())
    .map(({ label, count }) => ({ 
      label: label.length > 45 ? label.slice(0, 42) + "…" : label, 
      value: count 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  return Promise.resolve(items);
}

export function getPropertyViewCounts(): Promise<PerformanceComparisonItem[]> {
  const active = listingsStore.filter((l) => l.status === "active");
  const items: PerformanceComparisonItem[] = active.map((listing) => {
    const hash = listing.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const views = (hash % 45) + 5;
    const label = formatPropertyLabel(listing.type, listing.title);
    return { label, value: views };
  });
  items.sort((a, b) => b.value - a.value);
  return Promise.resolve(items);
}

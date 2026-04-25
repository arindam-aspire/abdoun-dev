import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Building,
  LayoutDashboard,
  List,
  Lock,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  User,
  Users,
  MessageCircle,
  BarChart,
  Search,
  HeartIcon,
} from "lucide-react";

export type SidebarRole = "admin" | "agent";

export type SidebarItem = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles: SidebarRole[];
  countKey?: string;
};

/** Admin: these sidebar links open under-development (not wired for admin yet). */
export const SIDEBAR_ITEM_IDS_ADMIN_UNDER_DEVELOPMENT: ReadonlySet<string> = new Set([
  "manageListings",
  "favouriteProperties",
  "savedSearches",
  "leadsAndInquiries",
  "reportsAndAnalytics",
  "managePreferences",
  "users",
]);

export function getSidebarItemHref(
  locale: string,
  item: Pick<SidebarItem, "id" | "path">,
  role: SidebarRole | undefined,
): string {
  const base = `/${locale}${item.path}`;
  if (role === "admin" && SIDEBAR_ITEM_IDS_ADMIN_UNDER_DEVELOPMENT.has(item.id)) {
    return `/${locale}/under-development?nav=${encodeURIComponent(item.id)}`;
  }
  return base;
}

type SearchParamsLike = { get(name: string): string | null };

export function isSidebarHrefActive(
  pathname: string,
  searchParams: SearchParamsLike,
  itemHref: string,
): boolean {
  const qIndex = itemHref.indexOf("?");
  if (qIndex === -1) {
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
  }
  const pathOnly = itemHref.slice(0, qIndex);
  if (pathname !== pathOnly) return false;
  const expected = new URLSearchParams(itemHref.slice(qIndex + 1));
  for (const [key, value] of expected) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export type SidebarSection = {
  id: string;
  title: string;
  roles: SidebarRole[];
  items: SidebarItem[];
};

function parseBooleanEnv(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  return raw.toLowerCase() === "true";
}

function parseCollapseControlPosition(
  raw: string | undefined,
): "top" | "bottom" {
  if (!raw) return "top";
  const normalized = raw.toLowerCase();
  return normalized === "bottom" ? "bottom" : "top";
}

export const sidebarUiConfig = {
  allowCollapse: parseBooleanEnv(process.env.NEXT_PUBLIC_SIDEBAR_ALLOW_COLLAPSE, false),
  defaultCollapsed: false,
  showCountsWhenCollapsed: false,
  collapseControlPosition: parseCollapseControlPosition(
    process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSE_CONTROL_POSITION,
  ),
};

export const sidebarConfig: SidebarSection[] = [
  {
    id: "overview",
    title: "Dashboard",
    roles: ["admin", "agent"],
    items: [
      {
        id: "adminDashboard",
        label: "Dashboard",
        path: "/admin-dashboard",
        icon: LayoutDashboard,
        roles: ["admin"],
      },
      {
        id: "agentDashboard",
        label: "Dashboard",
        path: "/agent-dashboard",
        icon: LayoutDashboard,
        roles: ["agent"],
      },
      {
       id: "manageListings",
       label: "Manage Listings",
       path: "/agent-dashboard/listings",
       icon: List,
       roles: ["admin", "agent"],
       countKey: "totalListings",
      },
      {
        id: "favouriteProperties",
        label: "Favourite Properties",
        path: "/agent-favourite-properties",
        icon: HeartIcon,
        roles: ["admin", "agent"],
        countKey: "totalFavouriteProperties",
      },
      {
        id: "savedSearches",
        label: "Saved Searches",
        path: "/agent-saved-searches",
        icon: Bookmark,
        roles: ["admin", "agent"],
        countKey: "totalSavedSearches",
      },
      {
        id: "leadsAndInquiries",
        label: "Leads and Inquiries",
        path: "/agent-dashboard/leads-and-inquiries",
        icon: MessageCircle,
        roles: ["admin", "agent"],
        countKey: "leadsThisMonth",
      },
      {
        id: "reportsAndAnalytics",
        label: "Reports and Analytics",
        path: "/agent-dashboard/reports-and-analytics",
        icon: BarChart,
        roles: ["admin", "agent"],
      },
    ],
  },
  {
    id: "management",
    title: "Management",
    roles: ["admin"],
    items: [
      {
        id: "users",
        label: "Users",
        path: "/admin-users",
        icon: Users,
        roles: ["admin"],
        countKey: "pendingUsers",
      },
      {
        id: "agents",
        label: "Agents",
        path: "/agents",
        icon: ShieldCheck,
        roles: ["admin"],
        countKey: "totalAgents",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    roles: ["admin", "agent"],
    items: [
      {
        id: "managePreferences",
        label: "Manage Preferences",
        path: "/agent-dashboard/manage-preferences",
        icon: Settings,
        roles: ["admin", "agent"],
      },
      {
        id: "profileSettings",
        label: "Profile Settings",
        path: "/settings/profile",
        icon: User,
        roles: ["admin", "agent"],
      },
      {
        id: "changePassword",
        label: "Change Password",
        path: "/settings/change-password",
        icon: Lock,
        roles: ["admin", "agent"],
      },
      {
        id: "changeEmail",
        label: "Change Email",
        path: "/settings/change-email",
        icon: Mail,
        roles: ["admin", "agent"],
      },
      {
        id: "signOut",
        label: "Sign Out",
        path: "/sign-out",
        icon: LogOut,
        roles: ["admin", "agent"],
      },
    ],
  },
];

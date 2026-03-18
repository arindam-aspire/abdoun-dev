import type { AdminDashboardData } from "@/services/adminDashboardMockService";
import { getAdminDashboardData } from "@/services/adminDashboardMockService";

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  return await getAdminDashboardData();
}


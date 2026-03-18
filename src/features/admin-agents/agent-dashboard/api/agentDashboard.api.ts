import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import {
  getDashboardData,
  getPerformanceComparison,
} from "@/services/agentDashboardMockService";

export async function fetchAgentDashboardData(): Promise<AgentDashboardData> {
  return await getDashboardData();
}

export async function fetchAgentPerformanceComparison(): Promise<
  PerformanceComparisonItem[]
> {
  return await getPerformanceComparison();
}


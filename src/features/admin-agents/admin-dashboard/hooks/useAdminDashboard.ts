import { useEffect, useState } from "react";
import type { AdminDashboardData } from "@/services/adminDashboardMockService";
import { fetchAdminDashboardData } from "@/features/admin-agents/admin-dashboard/api/adminDashboard.api";

type UseAdminDashboardState = {
  data: AdminDashboardData | null;
  loading: boolean;
  error: unknown;
};

export function useAdminDashboard(): UseAdminDashboardState {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const dashboard = await fetchAdminDashboardData();
        if (cancelled) return;
        setData(dashboard);
      } catch (e) {
        if (cancelled) return;
        setError(e);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}


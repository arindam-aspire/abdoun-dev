import { useEffect } from "react";
import type { AdminDashboardData } from "@/types/adminDashboard";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  loadAdminDashboardSummary,
  selectAdminDashboardSummary,
} from "@/features/admin-agents/admin-dashboard/adminDashboardSummarySlice";

type UseAdminDashboardState = {
  data: AdminDashboardData | null;
  loading: boolean;
  error: Error | null;
};

/** Ensures summary is loaded (shared Redux cache; avoids duplicate in-flight / refetch when already succeeded). */
export function useAdminDashboard(): UseAdminDashboardState {
  const dispatch = useAppDispatch();
  const { data, status, error: errorMessage } = useAppSelector(selectAdminDashboardSummary);

  useEffect(() => {
    void dispatch(loadAdminDashboardSummary());
  }, [dispatch]);

  const loading = status === "idle" || status === "loading";
  const error = errorMessage ? new Error(errorMessage) : null;

  return { data, loading, error };
}

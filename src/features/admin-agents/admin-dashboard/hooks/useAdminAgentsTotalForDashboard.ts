"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchAdminAgents } from "@/features/admin-agents/adminAgentsSlice";

/** Matches admin agents directory API: `GET .../agents?page=1&limit=10&sort_by=invited_at&order=desc` (no `status` = all agents). */
export const ADMIN_AGENTS_DASHBOARD_COUNT_PARAMS = {
  page: 1,
  limit: 10,
  sort_by: "invited_at",
  order: "desc" as const,
};

/**
 * Ensures agent list metadata is in Redux (`adminAgents.total` from `GET /agents`).
 * Dispatches on mount; the thunk skips the network call when the same query is
 * already cached and the list is not marked stale (see `fetchAdminAgents` condition).
 */
export function useAdminAgentsTotalForDashboard() {
  const dispatch = useAppDispatch();
  const total = useAppSelector((s) => s.adminAgents.total);
  const loading = useAppSelector((s) => s.adminAgents.loading);
  const status = useAppSelector((s) => s.adminAgents.status);

  useEffect(() => {
    void dispatch(fetchAdminAgents(ADMIN_AGENTS_DASHBOARD_COUNT_PARAMS));
  }, [dispatch]);

  const valueLabel =
    loading && status !== "succeeded" && status !== "failed"
      ? "—"
      : total.toLocaleString();

  return { total, loading, status, valueLabel };
}

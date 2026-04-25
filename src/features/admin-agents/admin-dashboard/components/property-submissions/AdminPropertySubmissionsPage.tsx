"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui";
import {
  listAdminPropertySubmissions,
  type AdminSubmissionListItem,
} from "@/features/admin-agents/agent-dashboard/api/adminPropertySubmissions.api";
import { getApiErrorMessage } from "@/lib/http/apiError";

type StatusFilter = "" | "submitted" | "changes_requested" | "approved" | "rejected";

export function AdminPropertySubmissionsPage() {
  const locale = useLocale() as AppLocale;
  const [filter, setFilter] = useState<StatusFilter>("submitted");
  const [page, setPage] = useState(1);
  const limit = 15;
  const [items, setItems] = useState<AdminSubmissionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminPropertySubmissions({
        page,
        limit,
        ...(filter ? { status: filter } : {}),
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">Property listing submissions</h1>
        <p className="mt-1 text-sm text-charcoal/70">
          Review agent-submitted property drafts (approve, request changes, or reject).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-charcoal/80" htmlFor="submission-status-filter">
          Status
        </label>
        <select
          id="submission-status-filter"
          className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal"
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value as StatusFilter);
          }}
        >
          <option value="">All</option>
          <option value="submitted">Submitted</option>
          <option value="changes_requested">Changes requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <Button type="button" variant="outline" className="text-sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-charcoal/60">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-charcoal/60">No submissions match this filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-charcoal/10 bg-surface text-xs uppercase tracking-wide text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Submission</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Step</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.submission_id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/90">{row.submission_id}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-charcoal/5 px-2 py-0.5 text-xs font-medium capitalize">
                      {row.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/70">
                    {row.property_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-charcoal/80">{row.current_step}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${locale}/property-submissions/${row.submission_id}`}
                      className="text-sm font-medium text-secondary hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-charcoal/60">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Button, Textarea } from "@/components/ui";
import {
  getAdminPropertySubmission,
  reviewAdminPropertySubmission,
  type AdminGetSubmissionResult,
} from "@/features/admin-agents/agent-dashboard/api/adminPropertySubmissions.api";
import { getApiErrorMessage } from "@/lib/http/apiError";

type Props = { submissionId: string };

function payloadTitle(payload: Record<string, unknown>): string {
  const bi = payload.basic_information;
  if (bi && typeof bi === "object" && !Array.isArray(bi)) {
    const t = (bi as Record<string, unknown>).title;
    if (typeof t === "string" && t.trim()) return t;
  }
  return "—";
}

export function AdminPropertySubmissionDetailPage({ submissionId }: Props) {
  const locale = useLocale() as AppLocale;
  const [data, setData] = useState<AdminGetSubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminPropertySubmission(submissionId);
      setData(res);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runReview = async (action: "approve" | "changes_requested" | "reject") => {
    if ((action === "changes_requested" || action === "reject") && !reason.trim()) {
      setToast("Please enter a reason for this outcome.");
      return;
    }
    setActing(true);
    setToast(null);
    try {
      await reviewAdminPropertySubmission(submissionId, {
        action,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      setToast(
        action === "approve"
          ? "Submission approved."
          : action === "changes_requested"
            ? "Changes requested; the owner can edit and resubmit."
            : "Submission rejected.",
      );
      setReason("");
      await load();
    } catch (e) {
      setToast(getApiErrorMessage(e));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-charcoal/60">Loading submission…</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href={`/${locale}/property-submissions`} className="text-sm text-secondary hover:underline">
          ← Back to submissions
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error ?? "Submission not found."}
        </div>
      </div>
    );
  }

  const locked =
    data.status === "draft" ||
    data.status === "in_progress" ||
    data.status === "approved" ||
    data.status === "rejected";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/${locale}/property-submissions`} className="text-sm text-secondary hover:underline">
            ← Back to submissions
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal">{payloadTitle(data.payload)}</h1>
          <p className="mt-1 font-mono text-xs text-charcoal/60">{data.submission_id}</p>
        </div>
        <div className="text-right text-sm">
          <div className="rounded-full bg-charcoal/5 px-3 py-1 text-xs font-medium capitalize text-charcoal">
            {data.status.replace(/_/g, " ")}
          </div>
          {data.property_id ? (
            <p className="mt-2 text-xs text-charcoal/60">
              Property ID: <span className="font-mono">{data.property_id}</span>
            </p>
          ) : null}
          {data.review_reason ? (
            <p className="mt-2 max-w-md text-xs text-amber-900/90">
              Last review note: {data.review_reason}
            </p>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-charcoal">Payload (read-only)</h2>
        <pre className="mt-3 max-h-[480px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-800">
          {JSON.stringify(data.payload, null, 2)}
        </pre>
      </section>

      <section className="rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-charcoal">Moderation</h2>
        <p className="mt-1 text-xs text-charcoal/60">
          Approve publishes the listing workflow outcome on the server. Request changes unlocks the owner
          stepper; reject is terminal.
        </p>
        <label className="mt-4 block text-xs font-medium text-charcoal/80" htmlFor="review-reason">
          Reason (required for request changes / reject; optional for approve)
        </label>
        <Textarea
          id="review-reason"
          className="mt-1 min-h-[88px] rounded-lg border border-charcoal/15"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={acting || locked}
          placeholder="Explain the decision for the submitter when applicable."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="accent"
            className="bg-emerald-700 text-white hover:bg-emerald-800"
            disabled={acting || locked}
            onClick={() => void runReview("approve")}
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={acting || locked}
            onClick={() => void runReview("changes_requested")}
          >
            Request changes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-800 hover:bg-red-50"
            disabled={acting || locked}
            onClick={() => void runReview("reject")}
          >
            Reject
          </Button>
        </div>
        {locked && data.status !== "submitted" && data.status !== "changes_requested" ? (
          <p className="mt-3 text-xs text-charcoal/55">
            {data.status === "draft" || data.status === "in_progress"
              ? "This submission is still a draft and cannot be moderated yet."
              : "This submission is already in a terminal moderation state."}
          </p>
        ) : null}
        {toast ? <p className="mt-3 text-sm text-charcoal/80">{toast}</p> : null}
      </section>
    </div>
  );
}

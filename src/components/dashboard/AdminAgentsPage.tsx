"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Check, Copy, Mail, RefreshCw, UserCheck, UserPlus2, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  clearInviteFeedback,
  fetchAdminAgents,
  inviteAdminAgentByEmail,
} from "@/features/admin-agents/adminAgentsSlice";
import type { AppLocale } from "@/i18n/routing";
import {
  DialogDescription,
  DialogFooter,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";

const INVITES_SERIES = [3, 5, 4, 7, 6, 9, 11, 8, 10, 12, 14, 13];

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusClass(status: string): string {
  if (status === "active") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "suspended") {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border border-amber-200 bg-amber-50 text-amber-700";
}

function DummyBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="mt-3 flex h-28 items-end gap-1.5">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex-1">
          <div
            className="w-full rounded-t-sm bg-primary opacity-80"
            style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
            title={String(value)}
          />
        </div>
      ))}
    </div>
  );
}

export function AdminAgentsPage() {
  const locale = useLocale() as AppLocale;
  const dispatch = useAppDispatch();
  const { items, loading, error, status, inviting, inviteError, inviteSuccessMessage } =
    useAppSelector((state) => state.adminAgents);
  const [email, setEmail] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== "idle") return;
    void dispatch(fetchAdminAgents());
  }, [dispatch, status]);

  useEffect(() => {
    return () => {
      dispatch(clearInviteFeedback());
    };
  }, [dispatch]);

  const invitedCount = useMemo(
    () => items.filter((agent) => agent.status === "invited").length,
    [items],
  );

  const activeCount = useMemo(
    () => items.filter((agent) => agent.status === "active").length,
    [items],
  );

  const onInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    const normalizedEmail = email.trim();
    const result = await dispatch(inviteAdminAgentByEmail(normalizedEmail));
    if (inviteAdminAgentByEmail.fulfilled.match(result)) {
      const invitePath = `/${locale}/invite-agent?email="${normalizedEmail}"`;
      const fullInviteLink = `${window.location.origin}${encodeURI(invitePath)}`;
      setGeneratedInviteLink(fullInviteLink);
      setCopied(false);
      setIsInviteModalOpen(true);
      setEmail("");
    }
  };

  const onCopyLink = async () => {
    if (!generatedInviteLink) return;
    try {
      await navigator.clipboard.writeText(generatedInviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Agents
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            Manage your team and invite new agents by email.
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-subtle bg-surface px-3 py-2 text-size-sm text-charcoal hover:bg-primary/5"
        >
          <RefreshCw className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm">
          <p className="text-size-xs text-charcoal/70">Total agents</p>
          <p className="mt-2 text-size-2xl fw-semibold text-charcoal">{items.length}</p>
        </article>
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            <p className="text-size-xs text-charcoal/70">Active agents</p>
          </div>
          <p className="mt-2 text-size-2xl fw-semibold text-emerald-700">{activeCount}</p>
        </article>
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm">
          <p className="text-size-xs text-charcoal/70">Pending invites</p>
          <p className="mt-2 text-size-2xl fw-semibold text-amber-700">{invitedCount}</p>
        </article>
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm">
          <p className="text-size-xs text-charcoal/70">Invite channel</p>
          <p className="mt-2 inline-flex items-center gap-2 text-size-sm fw-semibold text-secondary">
            <Mail className="h-4 w-4" />
            Email invitation
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-center gap-2">
          <UserPlus2 className="h-4 w-4 text-secondary" />
          <h2 className="text-size-sm fw-semibold text-charcoal">Invite agent via email</h2>
        </div>
        <form onSubmit={onInvite} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (inviteError || inviteSuccessMessage) dispatch(clearInviteFeedback());
            }}
            placeholder="agent@example.com"
            className="h-11 w-full rounded-xl border border-subtle bg-white px-3 text-size-sm text-charcoal outline-none ring-0 placeholder:text-charcoal/50 focus:border-primary"
            required
          />
          <button
            type="submit"
            disabled={inviting}
            className="cursor-pointer inline-flex h-12 w-60 items-center justify-center rounded-xl bg-secondary px-6 text-size-base fw-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {inviting ? "Generating..." : "Generate link"}
          </button>
        </form>
        {inviteError ? (
          <p className="mt-3 text-size-sm text-rose-700">{inviteError}</p>
        ) : null}
        {inviteSuccessMessage ? (
          <p className="mt-3 text-size-sm text-emerald-700">{inviteSuccessMessage}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-secondary" />
          <h2 className="text-size-sm fw-semibold text-charcoal">Agent list</h2>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-size-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-size-sm text-charcoal/70">Loading agents...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-subtle text-size-xs text-charcoal/70">
                  <th className="px-2 py-2 fw-medium">Name</th>
                  <th className="px-2 py-2 fw-medium">Email</th>
                  <th className="px-2 py-2 fw-medium">Phone</th>
                  <th className="px-2 py-2 fw-medium">City</th>
                  <th className="px-2 py-2 fw-medium">Invited by</th>
                  <th className="px-2 py-2 fw-medium">Invited at</th>
                  <th className="px-2 py-2 fw-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((agent) => (
                  <tr key={agent.id} className="border-b border-subtle/70 text-size-sm last:border-0">
                    <td className="px-2 py-3 fw-semibold text-charcoal">{agent.fullName}</td>
                    <td className="px-2 py-3 text-charcoal/80">{agent.email}</td>
                    <td className="px-2 py-3 text-charcoal/80">{agent.phone}</td>
                    <td className="px-2 py-3 text-charcoal/80">{agent.city}</td>
                    <td className="px-2 py-3 text-charcoal/80">{agent.invitedBy}</td>
                    <td className="px-2 py-3 text-charcoal/70">{formatDateTime(agent.invitedAt)}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-size-11 fw-medium capitalize ${statusClass(agent.status)}`}
                      >
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DialogRoot open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)}>
        <DialogTitle>Invitation Link Ready</DialogTitle>
        <DialogDescription>
          This is demo behavior. Copy this link or send it via email.
        </DialogDescription>
        <div className="mt-4 rounded-lg border border-subtle bg-surface px-3 py-2">
          <p className="break-all text-size-sm text-charcoal">{generatedInviteLink}</p>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-subtle bg-white px-4 text-size-sm fw-semibold text-charcoal hover:bg-surface"
          >
            Close
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent("Agent Invitation Link")}&body=${encodeURIComponent(`Please use this invite link:\n${generatedInviteLink}`)}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-size-sm fw-semibold text-white hover:brightness-95"
          >
            <Mail className="h-4 w-4" />
            Send via email
          </a>
          <button
            type="button"
            onClick={() => void onCopyLink()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-subtle bg-white px-4 text-size-sm fw-semibold text-charcoal hover:bg-surface"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}

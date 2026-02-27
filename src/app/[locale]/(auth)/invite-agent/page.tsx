"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AgentInviteForm } from "@/components/agent/AgentInviteForm";
import { useTranslations } from "@/hooks/useTranslations";
import {
  getInviteByToken,
  acceptInvitation,
  tokenForEmail,
} from "@/services/agentInviteMockService";
import type { AgentInviteFormPayload } from "@/components/agent/AgentInviteForm";

/** Decode email from query: handle %22 (quotes) and trim. */
function parseEmailFromParams(value: string | null): string | null {
  if (value == null || value === "") return null;
  const decoded = decodeURIComponent(value).trim();
  const withoutQuotes = decoded.replace(/^"+|"+$/g, "").trim();
  return withoutQuotes.includes("@") ? withoutQuotes : null;
}

export default function InviteAgentPage() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = params.locale ?? "en";
  const t = useTranslations("agentAuth");

  const emailFromUrl = searchParams.get("email");
  const email = parseEmailFromParams(emailFromUrl);

  const [invite, setInvite] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(!!email);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setInvite(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const token = tokenForEmail(email);
    getInviteByToken(token).then((data) => {
      if (!cancelled) {
        if (data) setInvite({ email: data.email });
        else setInvite(null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const handleSubmit = useCallback(
    async (payload: AgentInviteFormPayload) => {
      if (!email) return;
      setError(null);
      try {
        await acceptInvitation(tokenForEmail(email), payload);
        setSuccess(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("inviteNotFound"));
      }
    },
    [email, t]
  );

  if (!emailFromUrl) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-red-600">
          Missing email. Use: /{locale}/invite-agent?email=your@email.com
        </p>
        <Link
          href={`/${locale}?openAuth=agent`}
          className="mt-4 flex justify-center text-sm font-medium text-primary"
        >
          {t("loginTitle")}
        </Link>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-red-600">Invalid email in URL.</p>
        <Link
          href={`/${locale}?openAuth=agent`}
          className="mt-4 flex justify-center text-sm font-medium text-primary"
        >
          {t("loginTitle")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <p className="mt-6 text-center text-sm text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-red-600">{t("inviteNotFound")}</p>
        <Link
          href={`/${locale}?openAuth=agent`}
          className="mt-4 flex justify-center text-sm font-medium text-primary"
        >
          {t("loginTitle")}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-emerald-700">{t("inviteSuccess")}</p>
        <div className="mt-6">
          <Link
            href={`/${locale}?openAuth=agent`}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-on-accent fw-medium text-size-base transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("loginTitle")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex justify-center">
        <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
      </div>
      <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
        {t("inviteTitle")}
      </h1>
      <p className="mt-1.5 text-center text-sm text-zinc-600">{t("inviteSubtitle")}</p>
      <AgentInviteForm
        email={invite.email}
        onSubmit={handleSubmit}
        error={error}
        success={success}
      />
    </div>
  );
}

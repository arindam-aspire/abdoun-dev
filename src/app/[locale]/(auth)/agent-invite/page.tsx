"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AgentInviteForm } from "@/features/admin-agents/agent-dashboard/components/agent-invite/AgentInviteForm";
import { useTranslations } from "@/hooks/useTranslations";
import {
  getInviteByToken,
  tokenForEmail,
} from "@/services/agentInviteMockService";
import { validateInviteToken } from "@/services/adminAgentApiService";
import { completeAgentOnboarding } from "@/services/agentOnboardingApiService";
import type { AgentInviteFormPayload } from "@/features/admin-agents/agent-dashboard/components/agent-invite/AgentInviteForm";
import { LoadingScreen } from "@/components/ui";

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
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";

  const [invite, setInvite] = useState<{
    email: string;
    token?: string;
  } | null>(null);
  const [loading, setLoading] = useState(!!email || !!tokenFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validate token from URL (e.g. /en/agent-invite?token=xxx)
  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    validateInviteToken(tokenFromUrl)
      .then((data) => {
        if (cancelled) return;
        if (data.alreadySubmitted) {
          setInvite(null);
          setError(data.message ?? t("inviteNotFound"));
        } else {
          setInvite({ email: data.email, token: tokenFromUrl });
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setInvite(null);
          console.log("error validating invite token", err);
          setError(err instanceof Error ? err.message : t("inviteNotFound"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl, t]);

  // Email-based invite (legacy): resolve invite by email
  useEffect(() => {
    if (tokenFromUrl || !email) {
      if (!tokenFromUrl) {
        setInvite(null);
        setLoading(false);
      }
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
  }, [email, tokenFromUrl]);

  const handleSubmit = useCallback(
    async (payload: AgentInviteFormPayload) => {
      const submitToken = invite?.token ?? (email ? tokenForEmail(email) : "");
      if (!submitToken) return;
      setError(null);
      try {
        const result = await completeAgentOnboarding(submitToken, {
          fullName: payload.name,
          phone: payload.phone,
          serviceArea: payload.serviceArea,
        });
        setSuccessMessage(result.message ?? t("inviteSuccess"));
        setSuccess(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("inviteNotFound"));
      }
    },
    [invite?.token, email, t],
  );

  const hasTokenOrEmail = !!tokenFromUrl || !!emailFromUrl;
  if (!hasTokenOrEmail) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-red-600">
          Missing invite link. Use the link from your invitation email, or: /
          {locale}/agent-invite?email=your@email.com
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

  if (!tokenFromUrl && !email) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-red-600">
          Invalid email in URL.
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

  if (loading) {
    return (
      <LoadingScreen  title="Verifying" description="Please wait while we validate your invite." />
    );
  }

  if (!invite) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <BrandLogo locale={locale} variant="black" imageClassName="h-12 w-auto" />
        </div>
        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("inviteTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-red-600">
          {error ?? t("inviteNotFound")}
        </p>
        <div className="mt-4">
          <Link
            href={`/${locale}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-on-accent fw-medium text-size-base transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Return to Home page
          </Link>
        </div>
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
        <p className="mt-4 text-center text-sm text-emerald-700">
          {successMessage ?? t("inviteSuccess")}
        </p>
        <div className="mt-6">
          <Link
            href={`/${locale}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-on-accent fw-medium text-size-base transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Return to homepage
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
      <p className="mt-1.5 text-center text-sm text-zinc-600">
        {t("inviteSubtitle")}
      </p>
      <AgentInviteForm
        email={invite.email}
        onSubmit={handleSubmit}
        error={error}
        success={success}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AgentInviteForm } from "@/components/agent/AgentInviteForm";
import { useTranslations } from "@/hooks/useTranslations";
import { getInviteByToken, acceptInvitation } from "@/services/agentInviteMockService";
import type { AgentInviteFormPayload } from "@/components/agent/AgentInviteForm";

export default function InviteAgentByTokenPage() {
  const params = useParams<{ locale: string; token: string }>();
  const locale = params.locale ?? "en";
  const token = params.token ?? "";
  const t = useTranslations("agentAuth");
  const [invite, setInvite] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
  }, [token]);

  const handleSubmit = async (payload: AgentInviteFormPayload) => {
    setError(null);
    try {
      await acceptInvitation(token, payload);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("inviteNotFound"));
    }
  };

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

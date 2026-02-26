"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function LocalizedForgotPasswordPage() {
  const t = useTranslations("auth");
  const params = useParams<{ locale: string }>();
  const locale = params.locale || "en";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          Forgot Password
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-600">
          Password reset is not implemented yet. Please contact support or try
          signing in again.
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[var(--brand-primary)] px-5 text-base font-medium text-white hover:bg-[var(--brand-secondary)] mt-6"
        >
          {t("signInLink")}
        </Link>
      </div>
  );
}


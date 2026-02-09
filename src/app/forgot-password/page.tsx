"use client";

import Link from "next/link";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { useTranslations } from "@/hooks/useTranslations";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  return (
    <AuthCardLayout>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          Forgot Password
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-600">
          Password reset is not implemented yet. Please contact support or try
          signing in again.
        </p>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-sky-600 px-5 text-base font-medium text-white hover:bg-sky-700 mt-6"
        >
          {t("signInLink")}
        </Link>
      </div>
    </AuthCardLayout>
  );
}

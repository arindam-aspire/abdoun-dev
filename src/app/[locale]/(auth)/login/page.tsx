"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth";
import { Input, Label, LoadingButton } from "@/components/ui";
import { useLoginFlow } from "@/hooks/useAuthForms";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";

export default function LoginPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const locale = params.locale ?? "en";
  const t = useTranslations("auth");
  const user = useAppSelector(selectCurrentUser);
  const flow = useLoginFlow(locale);

  useEffect(() => {
    if (user) {
      router.replace(`/${locale}`);
    }
  }, [user, locale, router]);

  if (user) {
    return null;
  }

  return (
    <AuthCard locale={locale} title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void flow.actions.submitManualLogin();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-identifier" className="text-sm font-medium text-zinc-800">
            {t("emailOrPhoneIncludingCountryCode")}
          </Label>
          <Input
            id="login-identifier"
            type="text"
            autoComplete="username"
            placeholder={t("emailOrPhoneIncludingCountryCode")}
            value={flow.fields.identifier}
            onChange={(e) => flow.actions.setIdentifier(e.target.value)}
            disabled={flow.loading}
            className="h-11"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password" className="text-sm font-medium text-zinc-800">
            {t("password")}
          </Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            value={flow.fields.password}
            onChange={(e) => flow.actions.setPassword(e.target.value)}
            disabled={flow.loading}
            className="h-11"
          />
        </div>

        <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <label className="flex min-w-0 cursor-pointer items-center gap-2.5 text-sm text-zinc-700 select-none">
            <input
              type="checkbox"
              checked={flow.rememberMe}
              onChange={(e) => flow.actions.setRememberMe(e.target.checked)}
              disabled={flow.loading}
              className="h-4 w-4 shrink-0 rounded border-zinc-300 text-sky-600 focus:ring-sky-500/25"
            />
            <span className="truncate">{t("rememberMe")}</span>
          </label>
          <Link
            href={`/${locale}?openAuth=forgot`}
            className="shrink-0 text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <p className="text-center text-xs leading-6 text-zinc-600">
          {t("signInTermsPrefix")}{" "}
          <Link
            href={`/${locale}/terms`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-700 underline underline-offset-2 hover:text-sky-800"
          >
            {t("termsAndConditions")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            href={`/${locale}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-700 underline underline-offset-2 hover:text-sky-800"
          >
            {t("privacyPolicy")}
          </Link>
        </p>

        {flow.error ? (
          <p className="text-sm text-red-600" role="alert">
            {flow.error}
          </p>
        ) : null}

        {flow.loginLockCountdownLabel ? (
          <p className="text-center text-sm font-medium text-amber-800" role="status">
            {flow.loginLockCountdownLabel}
          </p>
        ) : null}

        <LoadingButton
          type="submit"
          className="h-11 w-full"
          size="lg"
          loading={flow.loading}
          disabled={flow.loginLockedOut}
        >
          {t("submitLogin")}
        </LoadingButton>

        <p className="text-center text-sm text-zinc-600">
          {t("noAccountSignUp")}{" "}
          <Link
            href={`/${locale}?openAuth=signup`}
            className="font-medium text-sky-700 underline-offset-2 hover:underline"
          >
            {t("signUpLink")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

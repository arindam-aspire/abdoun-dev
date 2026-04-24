"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { LoadingScreen } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { persistAuthSession } from "@/lib/auth/sessionCookies";
import { selectCurrentUser } from "@/store/selectors";
import {
  getCurrentUser,
  setPasswordAfterLogin,
  toSessionUserForProfile,
} from "@/services/authService";

export default function ForceChangePasswordPage() {
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? "en";
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        // If no tokens at all, redirect to login. Otherwise allow page even if
        // profile user is not yet hydrated.
        if (typeof window !== "undefined") {
          const accessToken = window.localStorage.getItem("accessToken");
          const refreshToken = window.localStorage.getItem("refreshToken");
          if (!accessToken || !refreshToken) {
            router.push(`/${locale}`);
            return;
          }
        }
      } finally {
        if (active) setReady(true);
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, [locale, router, currentUser]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingScreen
          title="Preparing security check"
          description="Please wait while we load the password change page."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex justify-center">
        <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
      </div>
      <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
        Change your password
      </h1>
      <p className="mt-1.5 text-center text-sm text-zinc-600">
        Please set a new password to secure your account before continuing.
      </p>
      <ChangePasswordForm
        initialLoading={submitting}
        onSubmit={async (newPassword) => {
          setSubmitError(null);
          setSubmitting(true);
          try {
            await setPasswordAfterLogin({
              password: newPassword,
            });

            const me = await getCurrentUser();
            const sessionUser = toSessionUserForProfile(me);
            persistAuthSession(sessionUser);
            dispatch(login(sessionUser));

            if (sessionUser.role === "agent") {
              router.push(`/${locale}/agent-dashboard`);
            } else if (sessionUser.role === "admin") {
              router.push(`/${locale}/admin-dashboard`);
            } else {
              router.push(`/${locale}`);
            }
          } catch (error) {
            const message =
              error instanceof Error && error.message
                ? error.message
                : "Failed to set password. Please try again.";
            setSubmitError(message);
          } finally {
            setSubmitting(false);
          }
        }}
      />
      {submitError ? (
        <p className="mt-3 text-center text-size-sm text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { GuardRedirectScreen } from "@/components/ui";
import { login } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { readAuthSessionFromBrowser } from "@/lib/auth/sessionCookies";
import { enrichWithPhoneParts } from "@/services/authService";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (user?.role === "admin") {
      return;
    }

    const sessionUser = readAuthSessionFromBrowser();
    if (sessionUser?.role === "admin") {
      dispatch(login(enrichWithPhoneParts(sessionUser)));
      return;
    }

    if (!user) {
      router.replace(`/${locale}`);
    }
  }, [dispatch, locale, router, user]);

  if (user?.role !== "admin") {
    return (
      <GuardRedirectScreen
        logo={
          <BrandLogo
            locale={locale}
            priority
            imageClassName="h-12 sm:h-14"
            ariaLabel="Back to home"
          />
        }
        description="We’re checking your session and redirecting you to your admin dashboard."
      />
    );
  }
  return <>{children}</>;
}

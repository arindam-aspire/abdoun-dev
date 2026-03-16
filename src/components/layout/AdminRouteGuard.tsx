"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center text-sm text-zinc-600">
        Redirecting...
      </div>
    );
  }
  return <>{children}</>;
}

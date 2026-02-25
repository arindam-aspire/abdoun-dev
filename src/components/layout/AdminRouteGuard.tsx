"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { readAuthSessionFromBrowser } from "@/lib/auth/sessionCookies";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (user?.role === "admin") {
      return;
    }

    const sessionUser = readAuthSessionFromBrowser();
    if (sessionUser?.role === "admin") {
      dispatch(login(sessionUser));
      return;
    }

    if (!user) {
      router.replace(`/${locale}`);
    }
  }, [dispatch, locale, router, user]);

  if (user?.role !== "admin") return null;
  return <>{children}</>;
}

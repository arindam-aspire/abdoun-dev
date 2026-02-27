"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { readAuthSessionFromBrowser } from "@/lib/auth/sessionCookies";

export function AgentRouteGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (user?.role === "agent") {
      return;
    }

    const sessionUser = readAuthSessionFromBrowser();
    if (sessionUser?.role === "agent") {
      dispatch(login(sessionUser));
      return;
    }

    if (!user) {
      router.replace(`/${locale}`);
    }
  }, [dispatch, locale, router, user]);

  if (user?.role !== "agent") return null;
  return <>{children}</>;
}

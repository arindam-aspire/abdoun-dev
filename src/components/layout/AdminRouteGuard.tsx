"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import { GuardRedirectScreen } from "@/components/ui";
import { useSession } from "@/features/auth/hooks/useSession";
import { useEffect, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

function useHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = window.requestAnimationFrame(onStoreChange);
      return () => window.cancelAnimationFrame(id);
    },
    () => true,
    () => false,
  );
}

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { role } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const isHydrated = useHydrated();

  useEffect(() => {
    if (!isHydrated) return;
    if (role === "admin") return;

    const destination = `/${locale}`;
    if (pathname === destination) return;
    router.replace(destination);
  }, [isHydrated, locale, pathname, role, router]);

  // Render a deterministic shell until client hydration completes to avoid
  // server/client markup mismatches in the admin layout.
  if (!isHydrated) {
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
        description="We’re checking your session and redirecting you."
      />
    );
  }

  if (role !== "admin") return null;
  return <>{children}</>;
}

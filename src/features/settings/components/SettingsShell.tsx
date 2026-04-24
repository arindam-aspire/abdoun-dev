"use client";

import { useEffect, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useSession } from "@/features/auth/hooks/useSession";
import { useHydrated } from "@/hooks/useHydrated";
import { GuardRedirectScreen } from "@/components/ui";
import AppFooter from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SidebarLayoutFrame } from "@/components/layout/SidebarLayoutFrame";
import { SidebarProvider } from "@/context/SidebarContext";

type SettingsShellProps = {
  children: ReactNode;
};

export function SettingsShell({ children }: SettingsShellProps) {
  const t = useTranslations("settings");
  const { user, role } = useSession();
  const isHydrated = useHydrated();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace(`/${locale}`);
    }
  }, [isHydrated, user, locale, router]);

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
        description={t("loading")}
      />
    );
  }

  if (!user) {
    return null;
  }

  const withSidebar = role === "agent" || role === "admin";

  const content = (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="min-w-0">{children}</div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--foreground)]">
      {withSidebar ? (
        <SidebarProvider>
          <SidebarLayoutFrame>
            <section className="bg-gradient-to-b from-[var(--surface)] to-white">
              {content}
            </section>
          </SidebarLayoutFrame>
        </SidebarProvider>
      ) : (
        <div className="flex flex-1 flex-col pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0">
          <AppHeader />
          <div className="flex-1">{content}</div>
          <AppFooter />
        </div>
      )}
      {!withSidebar ? <BottomNav /> : null}
    </div>
  );
}

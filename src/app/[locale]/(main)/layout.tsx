"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import AppFooter from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-white text-[var(--foreground)]">
      <AppHeader />
      <div className="flex-1 flex flex-col pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0">
        <div className="flex-1">{children}</div>
        <AppFooter />
      </div>
      <BottomNav />
    </main>
  );
}

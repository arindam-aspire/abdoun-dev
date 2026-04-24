"use client";

import AppFooter from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AgentDashboardSummaryHydrator } from "@/features/admin-agents/agent-dashboard/components/AgentDashboardSummaryHydrator";

type SidebarLayoutFrameProps = {
  children: React.ReactNode;
};

/**
 * App shell: header, sidebar + main (via LayoutWrapper), footer.
 * The sidebar/main gutter line is drawn inside LayoutWrapper only (not over the footer).
 */
export function SidebarLayoutFrame({ children }: SidebarLayoutFrameProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--foreground)]">
      <AgentDashboardSummaryHydrator />
      <AppHeader />
      <LayoutWrapper>{children}</LayoutWrapper>
      <AppFooter />
    </div>
  );
}

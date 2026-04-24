import { AgentRouteGuard } from "@/components/layout/AgentRouteGuard";
import { SidebarLayoutFrame } from "@/components/layout/SidebarLayoutFrame";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentRouteGuard>
      <SidebarProvider>
        <SidebarLayoutFrame>
          <section className="bg-gradient-to-b from-[var(--surface)] to-white">
            <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">{children}</div>
          </section>
        </SidebarLayoutFrame>
      </SidebarProvider>
    </AgentRouteGuard>
  );
}

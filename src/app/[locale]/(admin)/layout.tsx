import { AdminRouteGuard } from "@/components/layout/AdminRouteGuard";
import { SidebarLayoutFrame } from "@/components/layout/SidebarLayoutFrame";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <SidebarProvider>
        <SidebarLayoutFrame>
          <section className="bg-gradient-to-b from-[var(--surface)] to-white">
            <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">{children}</div>
          </section>
        </SidebarLayoutFrame>
      </SidebarProvider>
    </AdminRouteGuard>
  );
}

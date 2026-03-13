import { AdminRouteGuard } from "@/components/layout/AdminRouteGuard";
import AppFooter from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <main className="min-h-screen flex flex-col bg-white text-[var(--foreground)]">
        <AppHeader />
        <div className="flex-1 flex flex-col">
          <section className="flex-1 bg-gradient-to-b from-[var(--surface)] to-white">
            <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </section>
          <AppFooter />
        </div>
      </main>
    </AdminRouteGuard>
  );
}

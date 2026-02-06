"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileBarChart2, ListChecks, Shield, UserCircle2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAppSelector } from "@/hooks/storeHooks";
import type { UserRole } from "@/features/auth/authSlice";
import { useTranslations } from "@/hooks/useTranslations";

function RoleBadge({ role }: { role: UserRole }) {
  const tCommon = useTranslations("common");
  const colors: Record<UserRole, string> = {
    user: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    agent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    admin: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role]}`}
    >
      <Shield className="h-3 w-3" />
      {tCommon(role)}
    </span>
  );
}

export default function DashboardPage() {
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();
  const tDash = useTranslations("dashboard");

  useEffect(() => {
    if (!auth.user) {
      router.replace("/login");
    }
  }, [auth.user, router]);

  if (!auth.user) {
    return null;
  }

  const role = auth.user.role;

  const roleTitle =
    role === "user"
      ? tDash("welcomeUser")
      : role === "agent"
      ? tDash("welcomeAgent")
      : tDash("welcomeAdmin");

  return (
    <MainLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
              <Building2 className="h-5 w-5" />
              {roleTitle}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {tDash("mockNotice")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              <UserCircle2 className="h-4 w-4" />
              <span className="font-medium">{auth.user.name}</span>
            </div>
            <RoleBadge role={role} />
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {role === "user" && (
            <>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="h-4 w-4" />
                  Saved searches (mock)
                </h2>
                <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <li>• 2–3 BR apartments in Abdoun &amp; Dabouq under $2,500</li>
                  <li>• Villas in North Abdoun with private garden</li>
                  <li>• Offices near business district with parking</li>
                </ul>
              </section>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FileBarChart2 className="h-4 w-4" />
                  Activity (mock)
                </h2>
                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                  In a real implementation, this card would summarize your last viewed
                  listings, scheduled tours, and recommendations.
                </p>
              </section>
            </>
          )}

          {role === "agent" && (
            <>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FileBarChart2 className="h-4 w-4" />
                  Pipeline (mock)
                </h2>
                <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <li>• 6 active buyers looking in Abdoun &amp; Um Uthaina</li>
                  <li>• 3 listings awaiting photography</li>
                  <li>• 2 offers under negotiation</li>
                </ul>
              </section>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="h-4 w-4" />
                  Portfolio (mock)
                </h2>
                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                  This section could show your current listings, performance metrics, and
                  lead conversion similar to agent tools on Zillow or Bayut.
                </p>
              </section>
            </>
          )}

          {role === "admin" && (
            <>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FileBarChart2 className="h-4 w-4" />
                  Platform metrics (mock)
                </h2>
                <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <li>• 1,248 active listings</li>
                  <li>• 96 active agents</li>
                  <li>• 18,420 monthly sessions</li>
                </ul>
              </section>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="h-4 w-4" />
                  Moderation queue (mock)
                </h2>
                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                  Admins could review new listings, verify agents, and manage reported
                  content here.
                </p>
              </section>
            </>
          )}

          <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
            <p className="font-medium">Extending this dashboard</p>
            <p className="mt-2">
              Replace the mocked cards with real data from your API, plug role-based
              permissions into your backend, and expand each section into dedicated
              routes for analytics, listings, and CRM-style tools.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}


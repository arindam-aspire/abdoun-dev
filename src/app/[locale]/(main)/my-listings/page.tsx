import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { AgentListingsPage } from "@/features/agent/dashboard/components/AgentListingsPage";
import { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function UserListingsRoute() {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  return (
    <AuthenticatedRouteGuard>
      <div className="mx-auto container w-full px-4 py-8 md:px-8" dir={isRtl ? "rtl" : "ltr"}>
        <AgentListingsPage mode="user" />
      </div>
    </AuthenticatedRouteGuard>
  );
}

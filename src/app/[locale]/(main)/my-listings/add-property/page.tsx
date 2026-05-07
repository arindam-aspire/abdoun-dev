import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { AddPropertyPage } from "@/features/agent/dashboard/components/add-property/AddPropertyPage";
import { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function UserAddPropertyRoute() {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  return (
    <AuthenticatedRouteGuard>
      <div
        className="mx-auto container w-full px-4 py-8 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <AddPropertyPage mode="user" />
      </div>
    </AuthenticatedRouteGuard>
  );
}

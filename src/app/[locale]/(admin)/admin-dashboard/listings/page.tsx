import { ManageListingComponent } from "@/features/listings/components/ManageListingComponent";
import { AppLocale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

export default function AdminListingsRoute() {
  const t = useTranslations("adminDashboard");
  const locale = useLocale() as AppLocale;
  const addPropertyHref = `/${locale}/admin-dashboard/add-property`;
  return (
    <ManageListingComponent
      userType="admin"
      subtitle="Review agent-submitted property drafts, request changes, or approve them."
      addPropertyHref={addPropertyHref}
    />
  );
}

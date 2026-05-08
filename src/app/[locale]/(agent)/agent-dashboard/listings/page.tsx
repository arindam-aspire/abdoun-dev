import { ManageListingComponent } from "@/features/listings/components/ManageListingComponent";
import { AppLocale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

export default function AgentListingsRoute() {
  const t = useTranslations("agentDashboard");
  const locale = useLocale() as AppLocale;
  const addPropertyHref = `/${locale}/agent-dashboard/add-property`;
  return (
    <ManageListingComponent
      userType="agent"
      subtitle={t("manageListingsSubtitle")}
      note={t("listingsActionsViewOnlyNote")}
      addPropertyHref={addPropertyHref}
    />
  );
}

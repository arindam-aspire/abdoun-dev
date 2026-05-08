import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { ManageListingComponent } from "@/features/listings/components/ManageListingComponent";
import { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function UserListingsRoute() {
  const locale = useLocale() as AppLocale;
  const addPropertyHref = `/${locale}/my-listings/add-property`;
  return (
    <AuthenticatedRouteGuard>
      <div className="mx-auto container w-full px-4 py-8 md:px-8" dir="ltr">
      <ManageListingComponent
        userType="user"
        subtitle="Manage your listings"
        addPropertyHref={addPropertyHref}
      />
      </div>
    </AuthenticatedRouteGuard>
  );
}

import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { LeadManagementPage } from "@/features/leads/components/LeadManagementPage";

export default function MyInquiriesPage() {
  return (
    <AuthenticatedRouteGuard>
      <div className="mx-auto container w-full px-4 py-8 md:px-8" dir="ltr">
        <LeadManagementPage mode="user" />
      </div>
    </AuthenticatedRouteGuard>
  );
}

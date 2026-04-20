import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { SavedSearchesPage } from "@/features/saved-searches/components/SavedSearchesPage";

export default function SavedSearchesRoutePage() {
  return (
    <AuthenticatedRouteGuard>
      <SavedSearchesPage />
    </AuthenticatedRouteGuard>
  );
}

import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { SavedSearchesView } from "@/features/saved-searches/components/SavedSearchesView";

export default function SavedSearchesRoutePage() {
  return (
    <AuthenticatedRouteGuard>
      <SavedSearchesView variant="main" />
    </AuthenticatedRouteGuard>
  );
}

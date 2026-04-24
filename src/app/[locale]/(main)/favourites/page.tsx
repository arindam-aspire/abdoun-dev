import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { SavedPropertiesView } from "@/features/favourites/components/SavedPropertiesView";

export default function FavouritesPage() {
  return (
    <AuthenticatedRouteGuard>
      <SavedPropertiesView variant="main" />
    </AuthenticatedRouteGuard>
  );
}

import { AgentRouteGuard } from "@/components/layout/AgentRouteGuard";
import { SavedPropertiesView } from "@/features/favourites/components/SavedPropertiesView";

export default function AgentFavouritePropertiesPage() {
  return (
    <AgentRouteGuard>
      <SavedPropertiesView variant="agent" />
    </AgentRouteGuard>
  );
}

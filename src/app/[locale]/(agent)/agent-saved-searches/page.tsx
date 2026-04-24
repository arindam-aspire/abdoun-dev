import { AgentRouteGuard } from "@/components/layout/AgentRouteGuard";
import { SavedSearchesView } from "@/features/saved-searches/components/SavedSearchesView";

export default function AgentSavedSearchesPage() {
  return (
    <AgentRouteGuard>
      <SavedSearchesView variant="agent" />
    </AgentRouteGuard>
  );
}

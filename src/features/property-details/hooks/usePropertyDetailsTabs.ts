import { useMemo, useState } from "react";
import type { PropertyDetailsTabKey } from "@/features/property-details/components/PropertyDetailsTabBar";

export type UsePropertyDetailsTabsArgs = {
  canShowLocationTab: boolean;
  canShowDocumentsTab: boolean;
};

export type UsePropertyDetailsTabsResult = {
  displayTab: PropertyDetailsTabKey;
  handleTabChange: (tab: PropertyDetailsTabKey) => void;
};

export function usePropertyDetailsTabs({
  canShowLocationTab,
  canShowDocumentsTab,
}: UsePropertyDetailsTabsArgs): UsePropertyDetailsTabsResult {
  const [activeTab, setActiveTab] = useState<PropertyDetailsTabKey>("overview");

  const handleTabChange = (tab: PropertyDetailsTabKey) => {
    setActiveTab(tab);
  };

  const displayTab: PropertyDetailsTabKey = useMemo(
    () => {
      if (!canShowLocationTab && activeTab === "location") return "overview";
      if (!canShowDocumentsTab && activeTab === "documents") return "overview";
      return activeTab;
    },
    [activeTab, canShowDocumentsTab, canShowLocationTab],
  );

  return {
    displayTab,
    handleTabChange,
  };
}


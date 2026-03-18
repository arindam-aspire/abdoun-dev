import { useEffect, useMemo, useRef, useState } from "react";
import type { PropertyDetailsTabKey } from "@/features/property-details/components/PropertyDetailsTabBar";

export type UsePropertyDetailsTabsArgs = {
  isExclusive: boolean;
  hasVirtualTour: boolean;
};

export type UsePropertyDetailsTabsResult = {
  activeTab: PropertyDetailsTabKey;
  displayTab: PropertyDetailsTabKey;
  overviewRef: React.MutableRefObject<HTMLElement | null>;
  amenitiesRef: React.MutableRefObject<HTMLElement | null>;
  virtualTourRef: React.MutableRefObject<HTMLElement | null>;
  locationRef: React.MutableRefObject<HTMLElement | null>;
  sidebarRef: React.MutableRefObject<HTMLDivElement | null>;
  handleTabChange: (tab: PropertyDetailsTabKey) => void;
};

export function usePropertyDetailsTabs({
  isExclusive,
  hasVirtualTour,
}: UsePropertyDetailsTabsArgs): UsePropertyDetailsTabsResult {
  const [activeTab, setActiveTab] = useState<PropertyDetailsTabKey>("overview");

  const overviewRef = useRef<HTMLElement | null>(null);
  const amenitiesRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const virtualTourRef = useRef<HTMLElement | null>(null);

  const manualTabLockUntilRef = useRef(0);
  const manualTabTargetRef = useRef<PropertyDetailsTabKey | null>(null);
  const observerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = (tab: PropertyDetailsTabKey) => {
    manualTabTargetRef.current = tab;
    manualTabLockUntilRef.current = Date.now() + 700;
    setActiveTab(tab);

    const map: Record<PropertyDetailsTabKey, HTMLElement | null | undefined> = {
      overview: overviewRef.current,
      amenities: amenitiesRef.current,
      location: locationRef.current,
      reviews: sidebarRef.current,
      virtualTour: virtualTourRef.current,
    };

    const target = map[tab];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const sections: Array<{ key: PropertyDetailsTabKey; element: HTMLElement | null }> = [
      { key: "overview", element: overviewRef.current },
      { key: "amenities", element: amenitiesRef.current },
      { key: "virtualTour", element: virtualTourRef.current },
      ...(isExclusive ? [{ key: "location" as const, element: locationRef.current }] : []),
    ];

    const observedSections = sections.filter(
      (section): section is { key: PropertyDetailsTabKey; element: HTMLElement } => Boolean(section.element),
    );

    if (observedSections.length === 0) return;

    const stickyHeaderOffset = window.innerWidth >= 768 ? 170 : 140;
    const visibilityMap = new Map<PropertyDetailsTabKey, number>();

    const setMostVisibleSection = () => {
      if (Date.now() < manualTabLockUntilRef.current && manualTabTargetRef.current) {
        const lockedTab = manualTabTargetRef.current;
        setActiveTab((current) => (current === lockedTab ? current : lockedTab));
        return;
      }

      let bestKey = observedSections[0].key;
      let bestRatio = -1;

      for (const section of observedSections) {
        const ratio = visibilityMap.get(section.key) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestKey = section.key;
        }
      }

      if (bestRatio > 0) {
        setActiveTab((current) => (current === bestKey ? current : bestKey));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const matched = observedSections.find((section) => section.element === entry.target);
          if (!matched) continue;
          visibilityMap.set(matched.key, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        if (observerDebounceRef.current) {
          clearTimeout(observerDebounceRef.current);
        }
        observerDebounceRef.current = setTimeout(() => {
          setMostVisibleSection();
        }, 80);
      },
      {
        root: null,
        rootMargin: `-${stickyHeaderOffset}px 0px -40% 0px`,
        threshold: [0.15, 0.3, 0.5, 0.7],
      },
    );

    for (const section of observedSections) {
      visibilityMap.set(section.key, 0);
      observer.observe(section.element);
    }

    return () => {
      if (observerDebounceRef.current) {
        clearTimeout(observerDebounceRef.current);
      }
      observer.disconnect();
    };
  }, [isExclusive]);

  const displayTab: PropertyDetailsTabKey = useMemo(
    () =>
      (!isExclusive && activeTab === "location") || (!hasVirtualTour && activeTab === "virtualTour")
        ? "overview"
        : activeTab,
    [activeTab, hasVirtualTour, isExclusive],
  );

  return {
    activeTab,
    displayTab,
    overviewRef,
    amenitiesRef,
    virtualTourRef,
    locationRef,
    sidebarRef,
    handleTabChange,
  };
}


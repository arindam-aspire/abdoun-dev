"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { AMENITY_FEATURE_OPTIONS } from "@/features/admin-agents/agent-dashboard/lib/amenityFeatureOptions";

import { CardSection } from "../AddPropertyStepLayout";
import { selectAddPropertyWizard, toggleAmenityFeatureId } from "../addPropertyWizardSlice";

export function FeaturesMediaStep() {
  const dispatch = useAppDispatch();
  const { amenityFeatureIds } = useAppSelector(selectAddPropertyWizard);

  const toggleFeature = (id: number) => {
    dispatch(toggleAmenityFeatureId(id));
  };

  return (
    <CardSection
      title="Features & Amenities"
      description="Enter the primary features details for this property record. This information will be used for official ledger entries and contract generation."
      required
    >
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {AMENITY_FEATURE_OPTIONS.map((feature) => (
          <label
            key={feature.id}
            className="inline-flex cursor-pointer items-center gap-2 text-size-sm fw-semibold text-[#1f2937]"
          >
            <input
              type="checkbox"
              checked={amenityFeatureIds.includes(feature.id)}
              onChange={() => toggleFeature(feature.id)}
              className="h-3.5 w-3.5 rounded border-[#b8c8ea] text-secondary focus:ring-primary"
            />
            <span>{feature.label}</span>
          </label>
        ))}
      </div>
      <div className="mt-10" />
    </CardSection>
  );
}

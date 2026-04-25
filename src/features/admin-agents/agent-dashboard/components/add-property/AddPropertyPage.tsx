"use client";

import {
  Building2,
  Check,
  DollarSign,
  FileCheck2,
  MapPin,
  Sparkles,
  Tag,
  UploadCloud,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { useTranslations } from "@/hooks/useTranslations";

import { AddPropertyWizard } from "./AddPropertyWizard";
import {
  selectAddPropertyActiveStep,
  selectAddPropertyCurrentStepIndex,
  setActiveStep,
} from "./addPropertyWizardSlice";

const STEP_ITEMS = [
  {
    id: "basic-information",
    icon: Tag,
    labelKey: "sectionBasicInfo",
    fallback: "Basic Information",
    shortLabel: "Setup",
  },
  {
    id: "location",
    icon: MapPin,
    labelKey: "sectionLocation",
    fallback: "Location",
    shortLabel: "Location",
  },
  {
    id: "property-details",
    icon: Building2,
    labelKey: "sectionDetails",
    fallback: "Property Details",
    shortLabel: "Details",
  },
  {
    id: "owner-information",
    icon: User,
    labelKey: "sectionOwnerInfo",
    fallback: "Owner Information",
    shortLabel: "Owners",
  },
  {
    id: "pricing",
    icon: DollarSign,
    labelKey: "sectionPricing",
    fallback: "Pricing",
    shortLabel: "Pricing",
  },
  {
    id: "features-amenities",
    icon: Sparkles,
    labelKey: null,
    fallback: "Features & Amenities",
    shortLabel: "Amenities",
  },
  {
    id: "media-documents",
    icon: UploadCloud,
    labelKey: null,
    fallback: "Media & Documents",
    shortLabel: "Media",
  },
  {
    id: "review-submit",
    icon: FileCheck2,
    labelKey: null,
    fallback: "Review & Submit",
    shortLabel: "Finalize",
  },
] as const;

export function AddPropertyPage() {
  const t = useTranslations("agentDashboard");
  const dispatch = useAppDispatch();
  const activeStep = useAppSelector(selectAddPropertyActiveStep);
  const activeStepIndex = useAppSelector(selectAddPropertyCurrentStepIndex);
  const trackInsetPercent = 50 / STEP_ITEMS.length;
  const progressPercent =
    STEP_ITEMS.length > 1
      ? (activeStepIndex / (STEP_ITEMS.length - 1)) * (100 - trackInsetPercent * 2)
      : 0;

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <aside className="bg-white lg:sticky lg:top-0 lg:h-screen lg:w-[290px] lg:shrink-0">
          <div className="space-y-6 p-4">
            <div className="space-y-1">
              <p className="text-size-xl fw-semibold text-[#23415f]">
                {t("addPropertyPageTitle")}
              </p>
              <p className="text-size-sm text-charcoal/60">
                Step {activeStepIndex + 1} of {STEP_ITEMS.length}
              </p>
            </div>

            <nav className="space-y-1.5">
              {STEP_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeStep;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => dispatch(setActiveStep(item.id))}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-size-sm transition-colors",
                      isActive
                        ? "bg-[#ffe24a] text-[#1f3f5c] shadow-[inset_0_0_0_1px_rgba(255,226,74,0.85)]"
                        : "text-charcoal/65 hover:bg-[#f6f8fb] hover:text-charcoal",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="fw-medium">
                      {item.labelKey ? t(item.labelKey) : item.fallback}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-subtle bg-white/90 backdrop-blur-sm p-4">
            <div className="mx-auto w-full">
              <div className="relative">
                <div
                  className="absolute top-3.5 h-1 rounded-full bg-[#dde5ef]"
                  style={{
                    left: `${trackInsetPercent}%`,
                    right: `${trackInsetPercent}%`,
                  }}
                />
                <div
                  className="absolute top-3.5 h-1 rounded-full bg-[#2f4e68] transition-all duration-300"
                  style={{
                    left: `${trackInsetPercent}%`,
                    width: `${progressPercent}%`,
                  }}
                />

                <div
                  className="grid items-start gap-2 sm:gap-4"
                  style={{ gridTemplateColumns: `repeat(${STEP_ITEMS.length}, minmax(0, 1fr))` }}
                >
                  {STEP_ITEMS.map((item, index) => {
                    const isActive = item.id === activeStep;
                    const isComplete = index < activeStepIndex;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => dispatch(setActiveStep(item.id))}
                        className="group relative flex min-w-0 flex-col items-center gap-3 text-center"
                      >
                        <div
                          className={[
                            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-size-xs fw-semibold transition-colors",
                            isActive
                              ? "border-[#ffe24a] bg-[#ffe24a] text-[#24415c]"
                              : isComplete
                                ? "border-[#2f4e68] bg-[#2f4e68] text-white"
                                : "border-[#dbe4ef] bg-[#e8eef6] text-[#a4b0bf]",
                          ].join(" ")}
                        >
                          {isComplete ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="min-h-[16px]">
                        <span
                          className={[
                            "hidden text-[11px] fw-semibold uppercase tracking-[0.08em] sm:block transition-colors",
                            isActive ? "text-[#24415c]" : "text-[#94a3b8]",
                          ].join(" ")}
                        >
                          {item.shortLabel}
                        </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <main className="mx-auto w-full p-4">
              <AddPropertyWizard />
          </main>
        </div>
      </div>
    </div>
  );
}

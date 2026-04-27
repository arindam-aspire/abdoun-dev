"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
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
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { store } from "@/store";

import {
  AddPropertyWizard,
  type AddPropertyWizardNavigateHandle,
} from "./AddPropertyWizard";
import { canNavigateToStepIndex } from "@/features/admin-agents/agent-dashboard/lib/addPropertyStepValidation";
import { UI_STEP_ID_TO_COMPLETION_KEY } from "@/features/admin-agents/agent-dashboard/lib/localStepCompletion";
import { Toast } from "@/components/ui/toast";
import {
  selectAddPropertyActiveStep,
  selectAddPropertyCurrentStepIndex,
  selectAddPropertyLastCompletedStepDisplay,
  selectAddPropertyStepCompletionMap,
  selectAddPropertyWizard,
  selectShouldPromptLeaveAddProperty,
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
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("agentDashboard");
  const dispatch = useAppDispatch();
  const wizardNavRef = useRef<AddPropertyWizardNavigateHandle>(null);
  const activeStep = useAppSelector(selectAddPropertyActiveStep);
  const activeStepIndex = useAppSelector(selectAddPropertyCurrentStepIndex);
  const stepCompletionMap = useAppSelector(selectAddPropertyStepCompletionMap);
  const lastCompletedDisplay = useAppSelector(selectAddPropertyLastCompletedStepDisplay);
  const wizard = useAppSelector(selectAddPropertyWizard);
  const [navToast, setNavToast] = useState<{ message: string } | null>(null);

  const trySetActiveStep = useCallback(
    (stepId: (typeof STEP_ITEMS)[number]["id"], targetIndex: number) => {
      if (!canNavigateToStepIndex(targetIndex, activeStepIndex, wizard)) {
        setNavToast({
          message: "Please complete the previous steps before jumping ahead.",
        });
        return;
      }
      dispatch(setActiveStep(stepId));
    },
    [activeStepIndex, dispatch, wizard],
  );

  const listingsHref = `/${locale}/agent-dashboard/listings`;

  useEffect(() => {
    const onDocClickCapture = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("a[href]");
      if (!el || !(el instanceof HTMLAnchorElement)) return;
      if (el.dataset.skipLeaveGuard === "true") return;
      if (el.target === "_blank" || el.hasAttribute("download")) return;
      let next: URL;
      try {
        next = new URL(el.href);
      } catch {
        return;
      }
      if (next.origin !== window.location.origin) return;
      const nextPath = `${next.pathname}${next.search}`;
      const currentPath = `${window.location.pathname}${window.location.search}`;
      if (nextPath === currentPath) return;
      if (!pathname.includes("/agent-dashboard/add-property")) return;
      if (!selectShouldPromptLeaveAddProperty(store.getState())) return;
      e.preventDefault();
      e.stopPropagation();
      wizardNavRef.current?.requestNavigate(nextPath);
    };
    document.addEventListener("click", onDocClickCapture, true);
    return () => document.removeEventListener("click", onDocClickCapture, true);
  }, [pathname]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!selectShouldPromptLeaveAddProperty(store.getState())) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
  const trackInsetPercent = 50 / STEP_ITEMS.length;
  const progressFromCompletion =
    STEP_ITEMS.length > 0
      ? (lastCompletedDisplay / STEP_ITEMS.length) * (100 - trackInsetPercent * 2)
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
              {STEP_ITEMS.map((item, navIndex) => {
                const isActive = item.id === activeStep;
                const navKey = UI_STEP_ID_TO_COMPLETION_KEY[item.id];
                const stepDone = Boolean(stepCompletionMap[navKey] ?? false);

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      trySetActiveStep(item.id, navIndex);
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-size-sm transition-colors",
                      isActive
                        ? "bg-[#ffe24a] text-[#1f3f5c] shadow-[inset_0_0_0_1px_rgba(255,226,74,0.85)]"
                        : "text-charcoal/65 hover:bg-[#f6f8fb] hover:text-charcoal",
                    ].join(" ")}
                  >
                    {stepDone ? (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2f4e68] text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    ) : (
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#dbe4ef] bg-[#e8eef6] text-size-[10px] fw-semibold text-[#64748b]"
                        aria-hidden
                      >
                        {navIndex + 1}
                      </span>
                    )}
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
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => wizardNavRef.current?.requestNavigate(listingsHref)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 transition hover:text-charcoal"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                  {t("manageListingsTitle")}
                </button>
              </div>
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
                    width: `${progressFromCompletion}%`,
                  }}
                />

                <div
                  className="grid items-start gap-2 sm:gap-4"
                  style={{ gridTemplateColumns: `repeat(${STEP_ITEMS.length}, minmax(0, 1fr))` }}
                >
                  {STEP_ITEMS.map((item, index) => {
                    const isActive = item.id === activeStep;
                    const apiKey = UI_STEP_ID_TO_COMPLETION_KEY[item.id];
                    const isComplete = Boolean(
                      stepCompletionMap[apiKey] ?? false,
                    );

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          trySetActiveStep(item.id, index);
                        }}
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
            <AddPropertyWizard ref={wizardNavRef} />
          </main>
        </div>
      </div>
      {navToast ? (
        <Toast
          kind="error"
          message={navToast.message}
          duration={5000}
          onClose={() => setNavToast(null)}
        />
      ) : null}
    </div>
  );
}

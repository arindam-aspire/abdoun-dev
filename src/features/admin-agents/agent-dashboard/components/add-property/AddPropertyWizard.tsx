"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui";
import { Toast } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { store } from "@/store";
import {
  createPropertySubmission,
  getPropertySubmission,
  patchPropertySubmission,
  submitPropertySubmission,
} from "../../api/propertySubmissions.api";
import { buildStepData, uiStepToApiStep } from "../../lib/buildSubmissionStepData";
import { wizardStateFromApiSubmission } from "../../lib/hydrateWizardFromSubmission";

import { BasicInformationStep } from "./steps/BasicInformationStep";
import { FeaturesMediaStep } from "./steps/FeaturesMediaStep";
import { LocationStep } from "./steps/LocationStep";
import { MediaDocumentsStep } from "./steps/MediaDocumentsStep";
import { OwnerInformationStep } from "./steps/OwnerInformationStep";
import { PricingStep } from "./steps/PricingStep";
import { PropertyDetailsStep } from "./steps/PropertyDetailsStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";
import {
  goToNextStep,
  goToPreviousStep,
  selectAddPropertyActiveStep,
  selectAddPropertyCurrentStepIndex,
  selectAddPropertyWizard,
  mergeServerPayloadAfterPatch,
  rehydrateAddPropertyWizard,
  resetAddPropertyWizard,
  setSubmissionMeta,
} from "./addPropertyWizardSlice";
import { ADD_PROPERTY_STEP_ORDER } from "./addPropertyWizard.types";

const STORAGE_KEY = "abdoun:add-property:submission-id";

function isUserEditableStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return status === "draft" || status === "in_progress" || status === "changes_requested";
}

function isTerminalSubmissionStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return status === "submitted" || status === "approved" || status === "rejected";
}

export function AddPropertyWizard() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const activeStep = useAppSelector(selectAddPropertyActiveStep);
  const currentStepIndex = useAppSelector(selectAddPropertyCurrentStepIndex);
  const wizardState = useAppSelector(selectAddPropertyWizard);

  const isReviewStep = currentStepIndex === ADD_PROPERTY_STEP_ORDER.length - 1;
  const allTermsAccepted = Boolean(wizardState.termsAccepted);
  const submissionId = wizardState.submissionId;
  const submissionStatus = wizardState.submissionStatus;
  const editable = isUserEditableStatus(submissionStatus);

  const [initLoading, setInitLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const showToast = useCallback((kind: "success" | "error", message: string) => {
    setToast({ kind, message });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startFreshDraft() {
      sessionStorage.removeItem(STORAGE_KEY);
      const created = await createPropertySubmission();
      if (cancelled) return;
      dispatch(resetAddPropertyWizard());
      dispatch(
        setSubmissionMeta({
          submissionId: created.submission_id,
          submissionStatus: created.status,
          propertyIdAfterSubmit: null,
          adminReviewReason: null,
        }),
      );
      sessionStorage.setItem(STORAGE_KEY, created.submission_id);
    }

    async function bootstrap() {
      setInitLoading(true);
      if (typeof window === "undefined") {
        setInitLoading(false);
        return;
      }

      const wantNew = searchParams.get("new") === "1";
      const explicitId = searchParams.get("submission")?.trim() || null;
      const fromSession = sessionStorage.getItem(STORAGE_KEY);

      try {
        if (wantNew) {
          await startFreshDraft();
          if (!cancelled) {
            showToast("success", "New draft started.");
            router.replace(pathname, { scroll: false });
          }
          return;
        }

        if (explicitId) {
          const sub = await getPropertySubmission(explicitId);
          if (cancelled) return;
          dispatch(rehydrateAddPropertyWizard(wizardStateFromApiSubmission(sub)));
          sessionStorage.setItem(STORAGE_KEY, sub.submission_id);
          return;
        }

        if (fromSession) {
          try {
            const sub = await getPropertySubmission(fromSession);
            if (cancelled) return;
            if (isTerminalSubmissionStatus(sub.status) && !explicitId) {
              await startFreshDraft();
              if (!cancelled) {
                showToast("success", "Previous listing was already submitted. Started a new draft.");
              }
              return;
            }
            dispatch(rehydrateAddPropertyWizard(wizardStateFromApiSubmission(sub)));
            sessionStorage.setItem(STORAGE_KEY, sub.submission_id);
            return;
          } catch {
            if (cancelled) return;
            sessionStorage.removeItem(STORAGE_KEY);
            await startFreshDraft();
            if (!cancelled) {
              showToast("success", "Started a new draft listing.");
            }
            return;
          }
        }

        await startFreshDraft();
      } catch (e) {
        if (!cancelled) {
          showToast("error", getApiErrorMessage(e));
        }
      } finally {
        if (!cancelled) {
          setInitLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [dispatch, pathname, router, searchParams, showToast]);

  const handleBack = () => {
    router.push(`/${locale}/agent-dashboard/listings`);
  };

  const patchForStep = useCallback(
    async (step: (typeof ADD_PROPERTY_STEP_ORDER)[number], action: "save" | "next" | "previous" | "save_draft") => {
      const id = store.getState().addPropertyWizard.submissionId;
      if (!id) {
        showToast("error", "No submission. Please wait for initialization.");
        return false;
      }
      const currentWizard = store.getState().addPropertyWizard;
      const data = buildStepData(step, currentWizard);
      const apiStep = uiStepToApiStep(step);
      try {
        const result = await patchPropertySubmission(id, {
          step: apiStep,
          action,
          data,
        });
        dispatch(
          setSubmissionMeta({
            submissionStatus: result.status,
            propertyIdAfterSubmit: result.property_id ?? null,
            adminReviewReason: result.review_reason ?? null,
          }),
        );
        if (result.payload != null && typeof result.payload === "object") {
          dispatch(mergeServerPayloadAfterPatch(result.payload as Record<string, unknown>));
        }
        return true;
      } catch (e) {
        showToast("error", getApiErrorMessage(e));
        return false;
      }
    },
    [dispatch, showToast],
  );

  const handleDraft = async () => {
    if (!editable) {
      showToast("error", "This submission can no longer be edited.");
      return;
    }
    if (!submissionId) return;
    setSaving(true);
    const ok = await patchForStep(activeStep, "save_draft");
    setSaving(false);
    if (ok) {
      showToast("success", "Draft saved on the server.");
    }
  };

  const handleNext = async () => {
    if (!editable) {
      showToast("error", "This submission is locked. You cannot make changes right now.");
      return;
    }
    if (!submissionId) {
      showToast("error", "Still connecting to the server. Try again in a moment.");
      return;
    }
    if (currentStepIndex < ADD_PROPERTY_STEP_ORDER.length - 1) {
      setSaving(true);
      const ok = await patchForStep(activeStep, "next");
      if (ok) {
        dispatch(goToNextStep());
      }
      setSaving(false);
      return;
    }

    if (!allTermsAccepted) {
      return;
    }
    setSaving(true);
    const reviewOk = await patchForStep("review-submit", "save");
    if (!reviewOk) {
      setSaving(false);
      return;
    }
    try {
      const submitId = store.getState().addPropertyWizard.submissionId;
      if (!submitId) {
        setSaving(false);
        return;
      }
      const result = await submitPropertySubmission(submitId);
      dispatch(
        setSubmissionMeta({
          submissionStatus: "submitted",
          propertyIdAfterSubmit: result.property_id,
        }),
      );
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setSaving(false);
      router.push(`/${locale}/agent-dashboard/listings?submitted=1`);
    } catch (e) {
      setSaving(false);
      showToast("error", getApiErrorMessage(e));
    }
  };

  const handleStepBack = async () => {
    if (currentStepIndex === 0) {
      handleBack();
      return;
    }
    if (!editable || !submissionId) {
      dispatch(goToPreviousStep());
      return;
    }
    setSaving(true);
    const ok = await patchForStep(activeStep, "previous");
    if (ok) {
      dispatch(goToPreviousStep());
    }
    setSaving(false);
  };

  if (initLoading) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-10 text-center text-slate-600">
        Preparing your listing…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeStep === "basic-information" ? <BasicInformationStep /> : null}

      {activeStep === "location" ? <LocationStep /> : null}

      {activeStep === "property-details" ? <PropertyDetailsStep /> : null}

      {activeStep === "owner-information" ? <OwnerInformationStep /> : null}

      {activeStep === "pricing" ? <PricingStep /> : null}

      {activeStep === "features-amenities" ? <FeaturesMediaStep /> : null}

      {activeStep === "media-documents" ? <MediaDocumentsStep /> : null}

      {activeStep === "review-submit" ? <ReviewSubmitStep /> : null}

      <div className="mt-2">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void handleStepBack();
            }}
            className="min-w-28 rounded-xl"
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStepIndex === 0 ? "Back" : "Previous"}
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void handleDraft();
              }}
              className="rounded-xl"
              disabled={saving || !editable}
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => {
                void handleNext();
              }}
              disabled={(isReviewStep && !allTermsAccepted) || saving || !editable}
              className="min-w-32 rounded-xl bg-[#294a66] text-white hover:bg-[#203d56]"
            >
              {saving ? "…" : isReviewStep ? "Submit" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}

"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { isAxiosError } from "axios";
import type { AppLocale } from "@/i18n/routing";
import { Button, LoadingButton } from "@/components/ui";
import {
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { queueRouteToast } from "@/lib/ui/routeToast";
import { store } from "@/store";
import {
  fetchAdminManageListingsSidebarTotal,
  fetchAgentListingsSidebarCounts,
} from "@/features/agent/dashboard/agentDashboardSummarySlice";
import { fetchLocationTaxonomyIfNeeded } from "@/features/location-taxonomy/locationTaxonomySlice";
import {
  createAndSubmitPropertySubmission,
  createPropertySubmissionDraft,
  getPropertySubmission,
  patchPropertySubmissionFullDraft,
  submitExistingPropertySubmission,
} from "../../api/propertySubmissions.api";
import {
  createAndSubmitAdminPropertySubmission,
  submitExistingAdminPropertySubmission,
} from "@/features/admin/dashboard/api/adminPropertySubmissions.api";
import { getValidationErrorBeforeLeavingStep } from "../../lib/addPropertyStepValidation";
import { buildFullReduxPayload, getCurrentStepIndex1Based } from "../../lib/buildSubmissionStepData";
import { hasAnyLocalStepComplete } from "../../lib/localStepCompletion";
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
  selectAddPropertyCurrentStepComplete,
  selectAddPropertyCurrentStepIndex,
  selectAddPropertyIsEditable,
  selectAddPropertyWizardMode,
  selectAddPropertyWizard,
  mergeServerPayloadAfterPatch,
  rehydrateAddPropertyWizard,
  resetAddPropertyWizard,
  selectShouldPromptLeaveAddProperty,
  setStepProgressFromServer,
  setSubmissionMeta,
  initializeNewPropertyWizard,
} from "./addPropertyWizardSlice";
import { ADD_PROPERTY_STEP_ORDER } from "./addPropertyWizard.types";

export type AddPropertyWizardNavigateHandle = {
  requestNavigate: (href: string) => void;
};

const DRAFT_SAVED_MESSAGE = "Draft saved successfully.";
const GENERIC_FAILURE_MESSAGE = "Something went wrong. Please try again.";

function messageForSubmitError(e: unknown): string {
  if (isAxiosError(e) && e.response?.status === 404) {
    return "The requested record was not found.";
  }
  return getApiErrorMessage(e, GENERIC_FAILURE_MESSAGE);
}

export const AddPropertyWizard = forwardRef<AddPropertyWizardNavigateHandle>(
  function AddPropertyWizard(_props, ref) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslations("agentDashboard");

  const activeStep = useAppSelector(selectAddPropertyActiveStep);
  const currentStepIndex = useAppSelector(selectAddPropertyCurrentStepIndex);
  const wizardState = useAppSelector(selectAddPropertyWizard);
  const wizardMode = useAppSelector(selectAddPropertyWizardMode);
  const canEdit = useAppSelector(selectAddPropertyIsEditable);
  const currentStepComplete = useAppSelector(selectAddPropertyCurrentStepComplete);

  const isReviewStep = currentStepIndex === ADD_PROPERTY_STEP_ORDER.length - 1;
  const allTermsAccepted = Boolean(wizardState.termsAccepted);
  const isRejectedResubmit =
    isReviewStep && canEdit && wizardState.submissionStatus === "rejected";
  const isAdmin = wizardMode === "admin";
  const isUser = wizardMode === "user";
  // Listings landing for back/cancel/post-submit, parameterized by mode (agent / admin / user).
  const listingsHref = isAdmin
    ? `/${locale}/admin-dashboard/listings`
    : isUser
      ? `/${locale}/my-listings`
      : `/${locale}/agent-dashboard/listings`;
  // When an agent or user is editing a previously rejected submission, hide "Save as Draft"
  // to avoid implying a new draft flow; the primary action is "Resubmit".
  const shouldHideSaveAsDraft = !isAdmin && isRejectedResubmit;

  const [initLoading, setInitLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [leaveModal, setLeaveModal] = useState<{ open: boolean; href: string | null }>({
    open: false,
    href: null,
  });
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [emptyDraftDialog, setEmptyDraftDialog] = useState<{
    open: boolean;
    context: { kind: "inline" } | { kind: "leave"; href: string } | null;
  }>({ open: false, context: null });

  const showToast = useCallback((kind: "success" | "error", message: string) => {
    setToast({ kind, message });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const wantNew = searchParams.get("new") === "1";
      const explicitId = searchParams.get("submission")?.trim() || null;

      if (wantNew) {
        dispatch(initializeNewPropertyWizard());
        void dispatch(fetchLocationTaxonomyIfNeeded());
        if (!cancelled) {
          router.replace(pathname, { scroll: false });
        }
        setInitLoading(false);
        return;
      }

      if (explicitId) {
        setInitLoading(true);
        try {
          await dispatch(fetchLocationTaxonomyIfNeeded());
        } catch {
          // Continue rehydration even if taxonomy fails; location step can retry.
        }
        const taxonomy = store.getState().locationTaxonomy.cities;
        try {
          if (isAdmin) {
            // Admin drafts are stored per-user in the standard submissions table.
            const sub = await getPropertySubmission(explicitId);
            if (cancelled) return;
            dispatch(rehydrateAddPropertyWizard(wizardStateFromApiSubmission(sub, taxonomy)));
          } else {
            const sub = await getPropertySubmission(explicitId);
            if (cancelled) return;
            dispatch(rehydrateAddPropertyWizard(wizardStateFromApiSubmission(sub, taxonomy)));
          }
          // `rehydrateAddPropertyWizard` preserves `wizardMode`, so no re-assert is needed here.
        } catch (e) {
          if (!cancelled) {
            showToast("error", messageForSubmitError(e));
            dispatch(initializeNewPropertyWizard());
          }
        } finally {
          if (!cancelled) setInitLoading(false);
        }
        return;
      }

      if (!cancelled) setInitLoading(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isAdmin, pathname, router, searchParams, showToast]);

  const saveDraftToServer = useCallback(async (): Promise<boolean> => {
    const root = store.getState();
    const s = root.addPropertyWizard;
    const taxonomy = root.locationTaxonomy.cities;
    const id = s.submissionId;
    const payload = buildFullReduxPayload(s, taxonomy);
    const currentStep = getCurrentStepIndex1Based(s);
    try {
      if (isAdmin) {
        // Admin drafts are created/updated via the standard user endpoints.
        // Submit is admin-specific (auto-verified), but draft storage is shared.
        if (!id) {
          const result = await createPropertySubmissionDraft(payload, currentStep);
          dispatch(
            setSubmissionMeta({
              submissionId: result.submission_id,
              submissionStatus: result.status,
              isPersisted: true,
            }),
          );
          if (result.payload != null && typeof result.payload === "object") {
            dispatch(mergeServerPayloadAfterPatch({
              patch: result.payload as Record<string, unknown>,
              locationTaxonomyCities: store.getState().locationTaxonomy.cities,
            }));
          }
          if (result.step_completion !== undefined || result.last_completed_step !== undefined) {
            dispatch(
              setStepProgressFromServer({
                ...(result.step_completion !== undefined
                  ? { step_completion: result.step_completion }
                  : {}),
                ...(result.last_completed_step !== undefined
                  ? { last_completed_step: result.last_completed_step }
                  : {}),
              }),
            );
          }
          if (!isAdmin) {
            void dispatch(fetchAgentListingsSidebarCounts({ force: true }));
          }
          return true;
        }

        const result = await patchPropertySubmissionFullDraft(id, {
          payload,
          current_step: currentStep,
        });
        dispatch(
          setSubmissionMeta({
            submissionStatus: result.status,
            propertyIdAfterSubmit: result.property_id ?? null,
            adminReviewReason: result.review_reason ?? null,
          }),
        );
        if (result.payload != null && typeof result.payload === "object") {
          dispatch(mergeServerPayloadAfterPatch({
              patch: result.payload as Record<string, unknown>,
              locationTaxonomyCities: store.getState().locationTaxonomy.cities,
            }));
        }
        if (result.step_completion !== undefined || result.last_completed_step !== undefined) {
          dispatch(
            setStepProgressFromServer({
              ...(result.step_completion !== undefined
                ? { step_completion: result.step_completion }
                : {}),
              ...(result.last_completed_step !== undefined
                ? { last_completed_step: result.last_completed_step }
                : {}),
            }),
          );
        }
        if (!isAdmin) {
          void dispatch(fetchAgentListingsSidebarCounts({ force: true }));
        }
        return true;
      }
      if (!id) {
        const result = await createPropertySubmissionDraft(payload, currentStep);
        dispatch(
          setSubmissionMeta({
            submissionId: result.submission_id,
            submissionStatus: result.status,
            isPersisted: true,
          }),
        );
        if (result.payload != null && typeof result.payload === "object") {
          dispatch(mergeServerPayloadAfterPatch({
              patch: result.payload as Record<string, unknown>,
              locationTaxonomyCities: store.getState().locationTaxonomy.cities,
            }));
        }
        if (result.step_completion !== undefined || result.last_completed_step !== undefined) {
          dispatch(
            setStepProgressFromServer({
              ...(result.step_completion !== undefined
                ? { step_completion: result.step_completion }
                : {}),
              ...(result.last_completed_step !== undefined
                ? { last_completed_step: result.last_completed_step }
                : {}),
            }),
          );
        }
        if (!isAdmin) {
          void dispatch(fetchAgentListingsSidebarCounts({ force: true }));
        }
        return true;
      }
      const result = await patchPropertySubmissionFullDraft(id, {
        payload,
        current_step: currentStep,
      });
      dispatch(
        setSubmissionMeta({
          submissionStatus: result.status,
          propertyIdAfterSubmit: result.property_id ?? null,
          adminReviewReason: result.review_reason ?? null,
        }),
      );
      if (result.payload != null && typeof result.payload === "object") {
        dispatch(mergeServerPayloadAfterPatch({
              patch: result.payload as Record<string, unknown>,
              locationTaxonomyCities: store.getState().locationTaxonomy.cities,
            }));
      }
      if (result.step_completion !== undefined || result.last_completed_step !== undefined) {
        dispatch(
          setStepProgressFromServer({
            ...(result.step_completion !== undefined
              ? { step_completion: result.step_completion }
              : {}),
            ...(result.last_completed_step !== undefined
              ? { last_completed_step: result.last_completed_step }
              : {}),
          }),
        );
      }
      if (!isAdmin) {
        void dispatch(fetchAgentListingsSidebarCounts({ force: true }));
      }
      return true;
    } catch (e) {
      showToast("error", messageForSubmitError(e));
      return false;
    }
  }, [dispatch, isAdmin, showToast]);

  const proceedNavigate = useCallback(
    (href: string) => {
      setLeaveModal({ open: false, href: null });
      router.push(href);
    },
    [router],
  );

  const requestNavigate = useCallback(
    (href: string) => {
      if (!selectShouldPromptLeaveAddProperty(store.getState())) {
        router.push(href);
        return;
      }
      setLeaveModal({ open: true, href });
    },
    [router],
  );

  useImperativeHandle(ref, () => ({ requestNavigate }), [requestNavigate]);

  const closeLeaveModal = useCallback(() => {
    if (leaveSaving) return;
    setLeaveModal({ open: false, href: null });
  }, [leaveSaving]);

  const leaveWithoutSaving = useCallback(() => {
    const href = leaveModal.href;
    if (!href) return;
    dispatch(resetAddPropertyWizard());
    proceedNavigate(href);
  }, [dispatch, leaveModal.href, proceedNavigate]);

  const saveDraftAndLeave = useCallback(async () => {
    const href = leaveModal.href;
    if (!href) return;
    if (!canEdit) {
      proceedNavigate(href);
      return;
    }
    const s = store.getState().addPropertyWizard;
    if (!hasAnyLocalStepComplete(s, store.getState().locationTaxonomy.cities)) {
      setLeaveModal({ open: false, href: null });
      setEmptyDraftDialog({ open: true, context: { kind: "leave", href } });
      return;
    }
    setLeaveSaving(true);
    const ok = await saveDraftToServer();
    setLeaveSaving(false);
    if (ok) {
      queueRouteToast({ kind: "success", message: DRAFT_SAVED_MESSAGE });
      proceedNavigate(href);
    }
  }, [canEdit, leaveModal.href, saveDraftToServer, proceedNavigate]);

  const handleBack = () => {
    requestNavigate(listingsHref);
  };

  const confirmEmptyDraftSave = useCallback(async () => {
    const ctx = emptyDraftDialog.context;
    setEmptyDraftDialog({ open: false, context: null });
    if (!ctx) return;
    if (ctx.kind === "inline") {
      setSaving(true);
      const ok = await saveDraftToServer();
      setSaving(false);
      if (ok) {
        showToast("success", DRAFT_SAVED_MESSAGE);
      }
      return;
    }
    setLeaveSaving(true);
    const ok = await saveDraftToServer();
    setLeaveSaving(false);
    if (ok) {
      queueRouteToast({ kind: "success", message: DRAFT_SAVED_MESSAGE });
      proceedNavigate(ctx.href);
    }
  }, [emptyDraftDialog.context, proceedNavigate, saveDraftToServer]);

  const closeEmptyDraftDialog = useCallback(() => {
    if (saving || leaveSaving) return;
    const ctx = emptyDraftDialog.context;
    setEmptyDraftDialog({ open: false, context: null });
    if (ctx?.kind === "leave") {
      setLeaveModal({ open: true, href: ctx.href });
    }
  }, [emptyDraftDialog.context, leaveSaving, saving]);

  const handleDraft = async () => {
    if (!canEdit) {
      showToast("error", "This submission can no longer be edited.");
      return;
    }
    const s = store.getState().addPropertyWizard;
    if (!hasAnyLocalStepComplete(s, store.getState().locationTaxonomy.cities)) {
      setEmptyDraftDialog({ open: true, context: { kind: "inline" } });
      return;
    }
    setSaving(true);
    const ok = await saveDraftToServer();
    setSaving(false);
    if (ok) {
      showToast("success", DRAFT_SAVED_MESSAGE);
    }
  };

  const handleNext = async () => {
    if (currentStepIndex < ADD_PROPERTY_STEP_ORDER.length - 1) {
      if (!initLoading) {
        const s = store.getState().addPropertyWizard;
        const err = getValidationErrorBeforeLeavingStep(
          s.activeStep,
          s,
          store.getState().locationTaxonomy.cities,
        );
        if (err) {
          showToast("error", err);
          return;
        }
        dispatch(goToNextStep());
      }
      return;
    }

    if (!canEdit) {
      return;
    }
    if (!allTermsAccepted) {
      return;
    }
    setSaving(true);
    try {
      const s = store.getState().addPropertyWizard;
      const fullPayload = buildFullReduxPayload(s, store.getState().locationTaxonomy.cities);
      const subId = s.submissionId;

      if (isAdmin) {
        if (!subId) {
          await createAndSubmitAdminPropertySubmission(fullPayload);
          dispatch(resetAddPropertyWizard());
          void dispatch(fetchAdminManageListingsSidebarTotal({ force: true }));
          router.push(`/${locale}/admin-dashboard/listings?created=1`);
          return;
        }

        if (s.dirty) {
          const step = getCurrentStepIndex1Based(s);
          const patchResult = await patchPropertySubmissionFullDraft(subId, {
            payload: fullPayload,
            current_step: step,
          });
          dispatch(
            setSubmissionMeta({
              submissionStatus: patchResult.status,
              propertyIdAfterSubmit: patchResult.property_id ?? null,
              adminReviewReason: patchResult.review_reason ?? null,
            }),
          );
          if (patchResult.payload != null && typeof patchResult.payload === "object") {
            dispatch(mergeServerPayloadAfterPatch({
            patch: patchResult.payload as Record<string, unknown>,
            locationTaxonomyCities: store.getState().locationTaxonomy.cities,
          }));
          }
        }

        try {
          await submitExistingAdminPropertySubmission(subId);
        } catch (e) {
          // Back-compat: older BE deployments only had POST `/admin/property-submissions/submit`.
          if (isAxiosError(e) && e.response?.status === 404) {
            await createAndSubmitAdminPropertySubmission(fullPayload);
          } else {
            throw e;
          }
        }
        dispatch(resetAddPropertyWizard());
        void dispatch(fetchAdminManageListingsSidebarTotal({ force: true }));
        router.push(`/${locale}/admin-dashboard/listings?created=1`);
        return;
      }

      if (!subId) {
        const result = await createAndSubmitPropertySubmission(fullPayload);
        dispatch(
          setSubmissionMeta({
            submissionId: result.submission_id ?? null,
            submissionStatus: result.status ?? "submitted",
            propertyIdAfterSubmit: result.property_id,
            isPersisted: true,
          }),
        );
        dispatch(resetAddPropertyWizard());
        void dispatch(fetchAgentListingsSidebarCounts({ force: true }));
        router.push(`${listingsHref}?submitted=1`);
        return;
      }

      const wasResubmitFromRejected = s.submissionStatus === "rejected";

      if (s.dirty) {
        const step = getCurrentStepIndex1Based(s);
        const patchResult = await patchPropertySubmissionFullDraft(subId, {
          payload: fullPayload,
          current_step: step,
        });
        dispatch(
          setSubmissionMeta({
            submissionStatus: patchResult.status,
            propertyIdAfterSubmit: patchResult.property_id ?? null,
            adminReviewReason: patchResult.review_reason ?? null,
          }),
        );
        if (patchResult.payload != null && typeof patchResult.payload === "object") {
          dispatch(mergeServerPayloadAfterPatch({
            patch: patchResult.payload as Record<string, unknown>,
            locationTaxonomyCities: store.getState().locationTaxonomy.cities,
          }));
        }
        if (
          patchResult.step_completion !== undefined ||
          patchResult.last_completed_step !== undefined
        ) {
          dispatch(
            setStepProgressFromServer({
              ...(patchResult.step_completion !== undefined
                ? { step_completion: patchResult.step_completion }
                : {}),
              ...(patchResult.last_completed_step !== undefined
                ? { last_completed_step: patchResult.last_completed_step }
                : {}),
            }),
          );
        }
      }

      const result = await submitExistingPropertySubmission(subId);
      dispatch(
        setSubmissionMeta({
          submissionStatus: "submitted",
          propertyIdAfterSubmit: result.property_id,
        }),
      );
      dispatch(resetAddPropertyWizard());
      void dispatch(fetchAgentListingsSidebarCounts({ force: true }));
      if (wasResubmitFromRejected) {
        router.push(`${listingsHref}?resubmitted=1`);
      } else {
        router.push(`${listingsHref}?submitted=1`);
      }
    } catch (e) {
      showToast("error", messageForSubmitError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex === 0) {
      handleBack();
      return;
    }
    dispatch(goToPreviousStep());
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
            {!shouldHideSaveAsDraft ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleDraft();
                }}
                className="rounded-xl"
                disabled={saving || !canEdit}
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
            ) : null}
            <Button
              type="button"
              variant="accent"
              onClick={() => {
                void handleNext();
              }}
              disabled={
                saving ||
                (isReviewStep && (!canEdit || !allTermsAccepted)) ||
                (!isReviewStep && !currentStepComplete)
              }
              className="min-w-32 rounded-xl bg-[#294a66] text-white hover:bg-[#203d56]"
            >
              {saving
                ? "…"
                : isReviewStep
                  ? canEdit
                    ? isAdmin
                      ? "Create & Verify Property"
                      : isRejectedResubmit
                        ? t("buttonResubmit")
                        : t("buttonSubmit")
                    : "Submitted"
                  : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <DialogRoot
        open={emptyDraftDialog.open}
        onClose={closeEmptyDraftDialog}
        className="relative max-w-lg"
      >
        <DialogTitle>{t("emptyDraftSaveTitle")}</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          {t("emptyDraftSaveDescription")}
        </DialogDescription>
        <DialogFooter className="mt-6 flex flex-row flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeEmptyDraftDialog}
            disabled={saving || leaveSaving}
            className="min-w-0 flex-1"
          >
            {t("emptyDraftSaveCancel")}
          </Button>
          <LoadingButton
            type="button"
            variant="accent"
            className="min-w-0 flex-1 bg-[#294a66] text-white hover:bg-[#203d56]"
            onClick={() => void confirmEmptyDraftSave()}
            disabled={saving || leaveSaving}
            loading={saving || leaveSaving}
          >
            {t("emptyDraftSaveConfirm")}
          </LoadingButton>
        </DialogFooter>
      </DialogRoot>

      <DialogRoot
        open={leaveModal.open}
        onClose={closeLeaveModal}
        className="relative max-w-lg"
      >
        <DialogTitle>{t("leaveAddPropertyTitle")}</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          {t("leaveAddPropertyDescription")}
        </DialogDescription>
        <DialogFooter className="mt-6 flex-row flex-nowrap gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeLeaveModal}
            disabled={leaveSaving}
            className="h-auto min-h-10 min-w-0 flex-1 justify-center px-2 py-2.5 text-center text-xs leading-snug sm:px-3 sm:text-sm"
          >
            {t("leaveAddPropertyCancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 min-w-0 flex-1 justify-center border-rose-200 px-2 py-2.5 text-center text-xs leading-snug text-rose-800 hover:bg-rose-50 sm:px-3 sm:text-sm"
            onClick={() => leaveWithoutSaving()}
            disabled={leaveSaving}
          >
            {t("leaveAddPropertyDiscard")}
          </Button>
          <LoadingButton
            type="button"
            variant="accent"
            className="h-auto min-h-10 min-w-0 flex-1 justify-center bg-[#294a66] px-2 py-2.5 text-center text-xs leading-snug text-white hover:bg-[#203d56] sm:px-3 sm:text-sm"
            loading={leaveSaving}
            onClick={() => void saveDraftAndLeave()}
            disabled={leaveSaving || !canEdit}
          >
            {t("leaveAddPropertySaveDraft")}
          </LoadingButton>
        </DialogFooter>
      </DialogRoot>

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
});

AddPropertyWizard.displayName = "AddPropertyWizard";

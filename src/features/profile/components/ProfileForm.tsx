"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil } from "lucide-react";
import { useLocale } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations } from "@/hooks/useTranslations";
import { useProfile, type UseProfileResult } from "@/hooks/useProfile";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { getCurrentSession, getStoredTokens } from "@/lib/auth/sessionManager";
import { isRtlLocale } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneNumberInputField } from "@/components/ui/PhoneNumberInputField";
import { cn } from "@/lib/cn";
import { formatPhoneValidationIssue } from "@/lib/formatPhoneValidationIssue";
import { getProfilePhoneReadonlyDisplay, splitPhoneNumber } from "@/lib/phone";
import { getPhoneValidationIssueCodeForSelectedCountry } from "@/lib/phoneValidation";
import {
  getIdentityErrorMessage,
  getProfileRequestRetryAfterSeconds,
  isProfileRequestRateLimited,
  requestEmailChange,
  requestPhoneOtp,
  type ProfileRequestExtras,
} from "@/lib/profileApi";
import type { ProfileData } from "@/types/auth";
import { EmailVerifyModal } from "@/features/profile/components/modals/EmailVerifyModal";
import { PhoneOtpModal } from "@/features/profile/components/modals/PhoneOtpModal";
import { PendingBadge } from "@/features/profile/components/PendingBadge";
import { ProfileFormSkeleton } from "@/features/profile/components/ProfileFormSkeleton";
import { CountryFlagImg } from "@/components/ui/phone-country-code-select";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/gif,image/webp";
const MAX_IMAGE_MB = 4;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Avatar initials: two words → first letter each; one word → first two graphemes (e.g. John → JO). */
function getInitials(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    return `${a ?? ""}${b ?? ""}`.toLocaleUpperCase();
  }
  const word = parts[0] ?? trimmed;
  return Array.from(word)
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase();
}

type ProfileFormValues = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  avatarPreview?: string;
};

function profileToFormDefaults(profile: ProfileData): ProfileFormValues {
  return {
    fullName: profile.fullName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    avatarPreview: undefined,
  };
}

type IdentityFieldStatus = "none" | "pending" | "verified";

export interface ProfileFormProps {
  /** Called when user cancels or after successful save. Omit when embedding in a page. */
  onClose?: () => void;
  /** RTL layout; defaults from active locale (`ar` → RTL). */
  isRtl?: boolean;
  /** Optional class for the root wrapper (e.g. for flex layout in modal). */
  className?: string;
  /** When true, show a compact layout suitable for modal. Default true. */
  compact?: boolean;
  /** When true, show skeleton (e.g. parent refetching profile from API). */
  isLoading?: boolean;
  /** Fired after a successful save (e.g. toast on settings page). */
  onSaveSuccess?: () => void;
  /** Fired when save fails. */
  onSaveError?: (error: unknown) => void;
}

interface ProfileFormBodyProps extends ProfileFormProps {
  profileData: UseProfileResult;
}

/**
 * Profile fields + photo, wired with react-hook-form (dirty state, submit, phone rules).
 */
function ProfileFormBody({
  profileData,
  onClose,
  isRtl = false,
  className,
  compact = true,
  onSaveSuccess,
  onSaveError,
}: ProfileFormBodyProps) {
  const t = useTranslations("profile");
  const tPhone = useTranslations("phoneInput");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"email" | "phone" | null>(null);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [requestingPhone, setRequestingPhone] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [emailVerifyAddress, setEmailVerifyAddress] = useState("");
  const [phoneVerifyAddress, setPhoneVerifyAddress] = useState("");
  const [assumeEmailSentForModal, setAssumeEmailSentForModal] = useState(false);
  const [assumeOtpSentForModal, setAssumeOtpSentForModal] = useState(false);
  const [emailIdentityStatus, setEmailIdentityStatus] =
    useState<IdentityFieldStatus>("none");
  const [phoneIdentityStatus, setPhoneIdentityStatus] =
    useState<IdentityFieldStatus>("none");
  const [emailRequestExtras, setEmailRequestExtras] = useState<
    ProfileRequestExtras | undefined
  >();
  const [phoneRequestExtras, setPhoneRequestExtras] = useState<
    ProfileRequestExtras | undefined
  >();
  const [phoneDevOtpHint, setPhoneDevOtpHint] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState,
    setValue,
    getValues,
  } = useForm<ProfileFormValues>({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      avatarUrl: "",
    },
  });

  const { isDirty, isSubmitting, errors } = formState;

  const getIdentityRequestExtras = useCallback((): ProfileRequestExtras | undefined => {
    const fn = (getValues("fullName") ?? "").trim();
    const server = (profileData.profile.fullName ?? "").trim();
    if (fn.length > 0 && fn !== server) return { full_name: fn };
    return undefined;
  }, [getValues, profileData.profile.fullName]);

  const syncFromProfile = useCallback(() => {
    reset(profileToFormDefaults(profileData.profile));
    setPhotoError(null);
  }, [profileData.profile, reset]);

  /** Hydrate / re-sync from server when profile updates, unless the user has unsaved edits or identity inline edit. */
  useEffect(() => {
    if (isDirty || editingField !== null) return;
    syncFromProfile();
  }, [syncFromProfile, isDirty, editingField]);

  const avatarPreview = useWatch({ control, name: "avatarPreview" });
  const avatarUrl = useWatch({ control, name: "avatarUrl" });
  const displayAvatar = avatarPreview ?? avatarUrl;

  const fullNameWatch = useWatch({
    control,
    name: "fullName",
    defaultValue: "",
  });
  const emailWatch = useWatch({ control, name: "email", defaultValue: "" });
  const phoneWatch = useWatch({ control, name: "phone", defaultValue: "" });
  /** Prefer RHF value; fall back to profile so first paint shows identity before any reset. */
  const emailForDisplay =
    (emailWatch ?? "").trim() || (profileData.profile.email ?? "").trim();
  const phoneForDisplay =
    (phoneWatch ?? "").trim() || (profileData.profile.phone ?? "").trim();
  const nameSourceForInitials =
    (fullNameWatch ?? "").trim() ||
    (profileData.profile.fullName ?? "").trim() ||
    (profileData.profile.displayName ?? "").trim();
  const initials = getInitials(nameSourceForInitials);

  useEffect(() => {
    const serverEmail = profileData.profile.email.trim();
    const wEmail = (emailWatch ?? "").trim();
    if (emailIdentityStatus === "verified" && wEmail !== serverEmail) {
      setEmailIdentityStatus("none");
    }
  }, [emailWatch, emailIdentityStatus, profileData.profile.email]);

  useEffect(() => {
    const serverPhone = profileData.profile.phone.trim();
    const wPhone = (phoneWatch ?? "").trim();
    if (phoneIdentityStatus === "verified" && wPhone !== serverPhone) {
      setPhoneIdentityStatus("none");
    }
  }, [phoneWatch, phoneIdentityStatus, profileData.profile.phone]);

  useEffect(() => {
    if (!apiError) return;
    setToast({ kind: "error", message: apiError });
  }, [apiError]);

  const fullNameField = register("fullName", {
    validate: (value) =>
      String(value ?? "").trim().length > 0 || t("fullNameRequired"),
  });
  const emailHiddenField = register("email");
  const phoneHiddenField = register("phone");

  const startEditEmail = useCallback(() => {
    setApiError(null);
    setEditingField("email");
    setTempEmail((getValues("email") || profileData.profile.email || "").trim());
  }, [getValues, profileData.profile.email]);

  const startEditPhone = useCallback(() => {
    setApiError(null);
    setEditingField("phone");
    setTempPhone((getValues("phone") || profileData.profile.phone || "").trim());
  }, [getValues, profileData.profile.phone]);

  const cancelEditIdentity = useCallback(() => {
    setEditingField(null);
    setTempEmail("");
    setTempPhone("");
    setApiError(null);
  }, []);

  const submitEmailChange = useCallback(async () => {
    const next = tempEmail.trim();
    const current = (getValues("email") || profileData.profile.email || "").trim();
    if (!next) {
      setApiError(t("emailRequired"));
      return;
    }
    if (!EMAIL_REGEX.test(next)) {
      setApiError(t("emailInvalid"));
      return;
    }
    if (next === current) {
      setApiError(t("identitySameEmail"));
      return;
    }
    setApiError(null);
    setRequestingEmail(true);
    const extras = getIdentityRequestExtras();
    try {
      await requestEmailChange(next, extras);
      setEmailRequestExtras(extras);
      setEmailIdentityStatus("pending");
      setEmailVerifyAddress(next);
      setAssumeEmailSentForModal(true);
      setEmailModalOpen(true);
      setEditingField(null);
      setTempEmail("");
    } catch (e) {
      if (isProfileRequestRateLimited(e)) {
        const sec = getProfileRequestRetryAfterSeconds(e);
        setApiError(
          sec != null
            ? t("profileRequestRateLimitedRetryIn", { seconds: sec })
            : t("profileRequestRateLimited"),
        );
      } else {
        setApiError(getIdentityErrorMessage(e, t("identityGenericError")));
      }
    } finally {
      setRequestingEmail(false);
    }
  }, [getIdentityRequestExtras, getValues, profileData.profile.email, t, tempEmail]);

  const submitPhoneChange = useCallback(async () => {
    const next = tempPhone.trim();
    const current = (getValues("phone") || profileData.profile.phone || "").trim();
    if (!next) {
      setApiError(t("phoneRequired"));
      return;
    }
    const { iso2 } = splitPhoneNumber(next);
    const issueCode = getPhoneValidationIssueCodeForSelectedCountry(next, iso2, false);
    if (issueCode) {
      setApiError(formatPhoneValidationIssue(tPhone, issueCode));
      return;
    }
    if (next === current) {
      setApiError(t("identitySamePhone"));
      return;
    }
    setApiError(null);
    setRequestingPhone(true);
    const extras = getIdentityRequestExtras();
    try {
      const res = await requestPhoneOtp(next, extras);
      setPhoneRequestExtras(extras);
      setPhoneDevOtpHint(res.dev_phone_otp ?? null);
      setPhoneIdentityStatus("pending");
      setPhoneVerifyAddress(next);
      setAssumeOtpSentForModal(true);
      setPhoneModalOpen(true);
      setEditingField(null);
      setTempPhone("");
    } catch (e) {
      if (isProfileRequestRateLimited(e)) {
        const sec = getProfileRequestRetryAfterSeconds(e);
        setApiError(
          sec != null
            ? t("profileRequestRateLimitedRetryIn", { seconds: sec })
            : t("profileRequestRateLimited"),
        );
      } else {
        setApiError(getIdentityErrorMessage(e, t("identityGenericError")));
      }
    } finally {
      setRequestingPhone(false);
    }
  }, [getIdentityRequestExtras, getValues, profileData.profile.phone, t, tPhone, tempPhone]);

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      setPhotoError(null);
      if (!file) return;
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setPhotoError(t("photoTooLarge"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setValue("avatarPreview", dataUrl, { shouldDirty: true });
        setValue("avatarUrl", dataUrl, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    },
    [setValue, t],
  );

  const handleRemovePhoto = useCallback(() => {
    setValue("avatarPreview", undefined, { shouldDirty: true });
    setValue("avatarUrl", "", { shouldDirty: true });
    setPhotoError(null);
  }, [setValue]);

  const handleCancel = useCallback(() => {
    setApiError(null);
    cancelEditIdentity();
    setEmailIdentityStatus("none");
    setPhoneIdentityStatus("none");
    setAssumeEmailSentForModal(false);
    setAssumeOtpSentForModal(false);
    setEmailRequestExtras(undefined);
    setPhoneRequestExtras(undefined);
    setPhoneDevOtpHint(null);
    syncFromProfile();
    onClose?.();
  }, [cancelEditIdentity, syncFromProfile, onClose]);

  const handleEmailModalClose = useCallback(() => {
    setEmailModalOpen(false);
    setAssumeEmailSentForModal(false);
    setEmailRequestExtras(undefined);
  }, []);

  const handlePhoneModalClose = useCallback(() => {
    setPhoneModalOpen(false);
    setAssumeOtpSentForModal(false);
    setPhoneRequestExtras(undefined);
    setPhoneDevOtpHint(null);
  }, []);

  const handleEmailVerified = useCallback(async () => {
    const nextEmail = emailVerifyAddress.trim();
    await profileData.refreshProfile();
    setEmailIdentityStatus("verified");
    const snap = getValues();
    reset({
      ...snap,
      email: nextEmail,
      avatarPreview: undefined,
    });
  }, [emailVerifyAddress, getValues, profileData, reset]);

  const handlePhoneVerified = useCallback(async () => {
    const nextPhone = phoneVerifyAddress.trim();
    await profileData.refreshProfile();
    setPhoneIdentityStatus("verified");
    const snap = getValues();
    reset({
      ...snap,
      phone: nextPhone,
      avatarPreview: undefined,
    });
  }, [getValues, phoneVerifyAddress, profileData, reset]);

  const onValidSubmit = useCallback(
    async (data: ProfileFormValues) => {
      setApiError(null);
      setSavingProfile(true);
      try {
        await profileData.saveProfile({
          fullName: data.fullName.trim(),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        });

        reset({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          avatarPreview: undefined,
        });

        onSaveSuccess?.();
        onClose?.();
      } catch (err) {
        setApiError(t("identityGenericError"));
        onSaveError?.(err);
      } finally {
        setSavingProfile(false);
      }
    },
    [onClose, onSaveError, onSaveSuccess, profileData, reset, t],
  );

  return (
    <>
      <form
        onSubmit={handleSubmit(onValidSubmit)}
        className={cn(
          "flex flex-col",
          compact ? "min-h-0 flex-1" : "",
          className,
        )}
        dir={isRtl ? "rtl" : "ltr"}
        noValidate
      >
      <div
        className={cn(
          compact && "min-h-0 flex-1 overflow-y-auto",
          "px-4 py-5 md:px-6",
        )}
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="relative shrink-0">
            <div
              className={cn(
                "flex h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700",
                "ring-2 ring-white dark:ring-zinc-800",
              )}
              aria-hidden
            >
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt=""
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-600 dark:text-zinc-300">
                  {initials || "?"}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_IMAGE}
              className="hidden"
              onChange={handlePhotoSelect}
              aria-label={t("changePhoto")}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || savingProfile}
              className={cn(
                "absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-500 text-white shadow-md",
                "hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:border-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-500",
              )}
              aria-label={t("changePhoto")}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t("recommendedSize")}
          </p>
          {displayAvatar ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isSubmitting || savingProfile}
              className="mt-2 rounded text-xs font-medium text-zinc-500 underline hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
            >
              {t("remove")}
            </button>
          ) : null}
          {photoError && (
            <p
              className="mt-2 text-center text-xs text-red-600 dark:text-red-400"
              role="alert"
            >
              {photoError}
            </p>
          )}
        </div>

        <hr className="mb-6 border-zinc-200 dark:border-zinc-700" />

        <div className="space-y-4">
          <div>
            <Label htmlFor="profile-fullName" className="mb-1.5 block" required>
              {t("fullName")}
            </Label>
            <Input
              id="profile-fullName"
              type="text"
              {...fullNameField}
              onChange={(e) => {
                fullNameField.onChange(e);
                setPhotoError(null);
              }}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              disabled={isSubmitting || savingProfile}
              error={errors.fullName?.message}
            />
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Label htmlFor="profile-email-readonly" className="block" required>
                {t("emailAddress")}
              </Label>
              <span className="inline-flex min-h-[1.375rem] items-center transition-opacity duration-300 ease-out">
                {emailIdentityStatus === "pending" ? (
                  <PendingBadge
                    variant="pending"
                    label={t("pendingVerification")}
                  />
                ) : null}
                {emailIdentityStatus === "verified" ? (
                  <PendingBadge variant="verified" label={t("verified")} />
                ) : null}
              </span>
            </div>
            {editingField === "email" ? (
              <div className="space-y-2">
                <Input
                  id="profile-email-edit"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => {
                    setTempEmail(e.target.value);
                    setApiError(null);
                  }}
                  placeholder={t("emailFieldPlaceholder")}
                  autoComplete="email"
                  disabled={requestingEmail}
                />
                <div className="flex w-full flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-800 focus-visible:ring-red-800"
                    size="sm"
                    onClick={cancelEditIdentity}
                    disabled={requestingEmail}
                  >
                    {t("cancelEdit")}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-primary text-white hover:brightness-95 focus-visible:ring-primary"
                    size="sm"
                    onClick={() => void submitEmailChange()}
                    disabled={requestingEmail}
                  >
                    {requestingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {t("sending")}
                      </>
                    ) : (
                      t("continueToVerify")
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-10 items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-size-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100">
                <span id="profile-email-readonly" className="min-w-0 flex-1 truncate">
                  {(() => {
                    const em = emailForDisplay;
                    if (!em) return "—";
                    if (EMAIL_REGEX.test(em)) {
                      return (
                        <a
                          href={`mailto:${em}`}
                          className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                        >
                          {em}
                        </a>
                      );
                    }
                    return em;
                  })()}
                </span>
                <button
                  type="button"
                  className={cn(
                    "shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
                  )}
                  aria-label={t("editEmail")}
                  disabled={
                    isSubmitting ||
                    savingProfile ||
                    requestingEmail ||
                    requestingPhone ||
                    editingField === "phone" ||
                    emailIdentityStatus === "pending"
                  }
                  onClick={startEditEmail}
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Label htmlFor="profile-phone-readonly" className="block" required>
                {t("phoneNumber")}
              </Label>
              <span className="inline-flex min-h-[1.375rem] items-center transition-opacity duration-300 ease-out">
                {phoneIdentityStatus === "pending" ? (
                  <PendingBadge
                    variant="pending"
                    label={t("pendingVerification")}
                  />
                ) : null}
                {phoneIdentityStatus === "verified" ? (
                  <PendingBadge variant="verified" label={t("verified")} />
                ) : null}
              </span>
            </div>
            {editingField === "phone" ? (
              <div className="space-y-2">
                <PhoneNumberInputField
                  value={tempPhone || undefined}
                  onChange={(v) => {
                    setTempPhone(v ?? "");
                    setApiError(null);
                  }}
                  placeholder={t("phonePlaceholder")}
                  disabled={requestingPhone}
                />
                <div className="flex w-full flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-red-500 text-white hover:bg-red-800 focus-visible:ring-red-800"
                    size="sm"
                    onClick={cancelEditIdentity}
                    disabled={requestingPhone}
                  >
                    {t("cancelEdit")}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-primary text-white hover:brightness-95 focus-visible:ring-primary"
                    size="sm"
                    onClick={() => void submitPhoneChange()}
                    disabled={requestingPhone}
                  >
                    {requestingPhone ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {t("sending")}
                      </>
                    ) : (
                      t("continueToVerify")
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-10 items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-size-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100">
                <span
                  id="profile-phone-readonly"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate"
                >
                  {(() => {
                    const parts = getProfilePhoneReadonlyDisplay(phoneForDisplay);
                    if (!parts) return "—";
                    return (
                      <>
                        <CountryFlagImg
                          iso2={parts.iso2}
                          loading="eager"
                          className="h-6 w-8 shrink-0"
                        />
                        <span className="min-w-0 truncate tabular-nums">
                          {parts.nationalLine}
                        </span>
                      </>
                    );
                  })()}
                </span>
                <button
                  type="button"
                  className={cn(
                    "shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
                  )}
                  aria-label={t("editPhone")}
                  disabled={
                    isSubmitting ||
                    savingProfile ||
                    requestingEmail ||
                    requestingPhone ||
                    editingField === "email" ||
                    phoneIdentityStatus === "pending"
                  }
                  onClick={startEditPhone}
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
          <input type="hidden" {...emailHiddenField} />
          <input type="hidden" {...phoneHiddenField} />
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900 md:px-6",
          isRtl && "flex-row-reverse",
        )}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting || savingProfile}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || isSubmitting || savingProfile || editingField !== null}
        >
          {isSubmitting || savingProfile ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              {t("saveChanges")}
            </>
          ) : (
            t("saveChanges")
          )}
        </Button>
      </div>
      </form>

      <EmailVerifyModal
        open={emailModalOpen}
        onClose={handleEmailModalClose}
        email={emailVerifyAddress}
        requestExtras={emailRequestExtras}
        assumeVerificationEmailAlreadySent={assumeEmailSentForModal}
        onVerificationSent={() => setEmailIdentityStatus("pending")}
        onVerified={handleEmailVerified}
      />
      <PhoneOtpModal
        open={phoneModalOpen}
        onClose={handlePhoneModalClose}
        phone={phoneVerifyAddress}
        initialDevPhoneOtp={phoneDevOtpHint}
        requestExtras={phoneRequestExtras}
        assumeOtpAlreadySent={assumeOtpSentForModal}
        onOtpSent={() => setPhoneIdentityStatus("pending")}
        onVerified={handlePhoneVerified}
      />
      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          duration={toast.kind === "error" ? 6000 : 4000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </>
  );
}

/**
 * Self-contained profile edit form: photo upload/remove, fields, Save/Cancel.
 * Uses useProfile() internally. Reusable in modal or full page.
 */
export function ProfileForm(props: ProfileFormProps) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isRtl = props.isRtl ?? isRtlLocale(locale);
  const authUser = useAppSelector(selectCurrentUser);
  const profileData = useProfile();

  const isHydratingFromSession = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (authUser?.id) return false;
    const session = getCurrentSession();
    if (session?.user) return true;
    const tokens = session?.tokens ?? getStoredTokens();
    return !!tokens;
  }, [authUser?.id]);

  const showSkeleton = Boolean(props.isLoading) || (!profileData && isHydratingFromSession);

  if (showSkeleton) {
    return (
      <ProfileFormSkeleton
        compact={props.compact}
        isRtl={isRtl}
        className={props.className}
        message={t("loadingProfile")}
      />
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("signInToView")}
        </p>
      </div>
    );
  }

  return <ProfileFormBody {...props} isRtl={isRtl} profileData={profileData} />;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MapPin, Pencil } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneNumberInputField } from "@/components/ui/PhoneNumberInputField";
import { cn } from "@/lib/cn";
import type { ProfileData } from "@/types/auth";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/gif,image/webp";
const MAX_IMAGE_MB = 4;

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isSameProfile(a: Partial<ProfileData>, b: Partial<ProfileData>): boolean {
  return (
    (a.fullName ?? "") === (b.fullName ?? "") &&
    (a.email ?? "") === (b.email ?? "") &&
    (a.phone ?? "") === (b.phone ?? "") &&
    (a.location ?? "") === (b.location ?? "") &&
    (a.avatarUrl ?? "") === (b.avatarUrl ?? "")
  );
}

export interface ProfileFormProps {
  /** Called when user cancels or after successful save. Omit when embedding in a page. */
  onClose?: () => void;
  isRtl?: boolean;
  /** Optional class for the root wrapper (e.g. for flex layout in modal). */
  className?: string;
  /** When true, show a compact layout suitable for modal. Default true. */
  compact?: boolean;
}

/**
 * Self-contained profile edit form: photo upload/remove, fields, Save/Cancel.
 * Uses useProfile() internally. Reusable in modal or full page.
 */
export function ProfileForm({
  onClose,
  isRtl = false,
  className,
  compact = true,
}: ProfileFormProps) {
  const t = useTranslations("profile");
  const profileData = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSyncedRef = useRef(false);

  const [form, setForm] = useState<
    Partial<ProfileData> & { avatarPreview?: string }
  >({});
  const [initial, setInitial] = useState<Partial<ProfileData>>({});
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const syncFromProfile = useCallback(() => {
    if (!profileData?.profile) return;
    const p = profileData.profile;
    const next = {
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      location: p.location,
      avatarUrl: p.avatarUrl,
    };
    setInitial(next);
    setForm({ ...next });
    setPhotoError(null);
  }, [profileData?.profile]);

  useEffect(() => {
    if (profileData && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncFromProfile();
    }
  }, [profileData, syncFromProfile]);

  const isDirty = !isSameProfile(form, initial);
  const displayAvatar = form.avatarPreview ?? form.avatarUrl;
  const initials = getInitials(form.fullName ?? "");

  const handleChange = useCallback(
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setPhotoError(null);
    },
    [],
  );

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
        setForm((prev) => ({
          ...prev,
          avatarPreview: dataUrl,
          avatarUrl: dataUrl,
        }));
      };
      reader.readAsDataURL(file);
    },
    [t],
  );

  const handleRemovePhoto = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      avatarPreview: undefined,
      avatarUrl: "",
    }));
    setPhotoError(null);
  }, []);

  const handleCancel = useCallback(() => {
    syncFromProfile();
    onClose?.();
  }, [syncFromProfile, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profileData || !isDirty) return;

      setSaving(true);
      try {
        await profileData.saveProfile({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          ...(form.avatarUrl !== undefined && { avatarUrl: form.avatarUrl }),
        });
        onClose?.();
      } finally {
        setSaving(false);
      }
    },
    [profileData, isDirty, form, onClose],
  );

  if (!profileData) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("signInToView")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col",
        compact ? "min-h-0 flex-1" : "",
        className,
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          compact && "min-h-0 flex-1 overflow-y-auto",
          "px-4 py-5 md:px-6",
        )}
      >
        {/* Profile photo – centered, with edit overlay and remove */}
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
              className={cn(
                "absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-500 text-white shadow-md",
                "hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
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
              className="mt-2 text-xs font-medium text-zinc-500 underline hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 rounded dark:text-zinc-400 dark:hover:text-red-400"
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
            <Label htmlFor="profile-fullName" className="mb-1.5 block">
              {t("fullName")}
            </Label>
            <Input
              id="profile-fullName"
              type="text"
              value={form.fullName ?? ""}
              onChange={handleChange("fullName")}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="profile-email" className="mb-1.5 block">
              {t("emailAddress")}
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email ?? ""}
              onChange={handleChange("email")}
              placeholder="john.doe@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="profile-phone" className="mb-1.5 block">
              {t("phoneNumber")}
            </Label>
            <PhoneNumberInputField
              value={form.phone || undefined}
              onChange={(v) =>
                setForm((prev) => ({ ...prev, phone: v ?? "" }))
              }
              placeholder={t("phonePlaceholder")}
              showFlag={true}
              showCountryCode={true}
              showDialCode={true}
            />
          </div>
          <div>
            <Label htmlFor="profile-location" className="mb-1.5 block">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {t("location")}
              </span>
            </Label>
            <Input
              id="profile-location"
              type="text"
              value={form.location ?? ""}
              onChange={handleChange("location")}
              placeholder="Dubai, UAE"
            />
          </div>
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
          disabled={saving}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={!isDirty || saving}>
          {saving ? "..." : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}


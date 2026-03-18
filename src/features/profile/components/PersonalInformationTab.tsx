"use client";

import { useCallback } from "react";
import { InlineEditableField } from "@/features/profile/components/InlineEditableField";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/cn";
import type { ProfileData } from "@/types/auth";
import { PROFILE_ROLE_OPTIONS } from "@/features/profile/schemas/profileFormSchema";

export interface PersonalInformationTabProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => Promise<void>;
  isRtl?: boolean;
  className?: string;
}

export function PersonalInformationTab({
  profile,
  onUpdate,
  isRtl = false,
  className,
}: PersonalInformationTabProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  const roleOptions = PROFILE_ROLE_OPTIONS.map((r) => ({
    value: r.value,
    label: tCommon(r.value),
  }));

  const handleSaveName = useCallback(
    async (value: string) => {
      await onUpdate({ fullName: value || profile.fullName });
    },
    [onUpdate, profile.fullName],
  );

  const handleSaveRole = useCallback(
    async (value: string) => {
      if (value === "user" || value === "agent" || value === "admin") {
        await onUpdate({ role: value });
      }
    },
    [onUpdate],
  );

  const handleSaveDisplayName = useCallback(
    async (value: string) => {
      await onUpdate({ displayName: value || undefined });
    },
    [onUpdate],
  );

  return (
    <div className={cn("space-y-6", className)} dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-4">
        <InlineEditableField
          label={t("fullName")}
          value={profile.fullName ?? ""}
          placeholder={t("namePlaceholder")}
          onSave={handleSaveName}
          isRtl={isRtl}
        />
        <InlineEditableField
          label={tCommon("role")}
          value={
            profile.role
              ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
              : profile.role ?? ""
          }
          placeholder={tCommon("user")}
          onSave={handleSaveRole}
          options={roleOptions}
          isRtl={isRtl}
          readOnly={true}
        />
        <InlineEditableField
          label={t("displayName")}
          value={profile.displayName ?? ""}
          placeholder={t("displayNamePlaceholder")}
          onSave={handleSaveDisplayName}
          isRtl={isRtl}
        />
      </div>
    </div>
  );
}


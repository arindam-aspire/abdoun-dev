"use client";

import { useState, useCallback } from "react";
import { X, User, Lock, Shield } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { DialogRoot } from "@/components/ui/dialog";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";
import { PersonalInformationTab } from "@/components/profile/PersonalInformationTab";
import { SignInSecurityTab } from "@/components/profile/SignInSecurityTab";
import { PrivacyCookiesTab } from "@/components/profile/PrivacyCookiesTab";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/cn";

export type ProfileTabId = "personal" | "security" | "privacy";

export interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  isRtl?: boolean;
}

const TABS: { id: ProfileTabId; labelKey: string; icon: typeof User }[] = [
  { id: "personal", labelKey: "personalInformation", icon: User },
  { id: "security", labelKey: "signInSecurity", icon: Lock },
  // { id: "privacy", labelKey: "privacyCookies", icon: Shield },
];

export function ProfileModal({
  open,
  onClose,
  isRtl = false,
}: ProfileModalProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const profileData = useProfile();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("personal");

  const handlePhotoChange = useCallback(
    (dataUrl: string) => {
      if (profileData) {
        void profileData.saveProfile({ avatarUrl: dataUrl });
      }
    },
    [profileData],
  );

  const handlePhotoRemove = useCallback(() => {
    if (profileData) {
      void profileData.saveProfile({ avatarUrl: "" });
    }
  }, [profileData]);

  const handleProfileUpdate = useCallback(
    async (updates: Parameters<NonNullable<typeof profileData>["saveProfile"]>[0]) => {
      if (profileData) {
        await profileData.saveProfile(updates);
      }
    },
    [profileData],
  );

  if (!open) return null;

  const profile = profileData?.profile;

  return (
    <DialogRoot
      open={open}
      onClose={onClose}
      className={cn(
        "flex h-[90vh] max-h-[800px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl dark:border-zinc-800 dark:bg-zinc-900",
        isRtl && "text-right",
      )}
      containerClassName="p-4"
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700 md:px-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {tCommon("myProfile")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!profile ? (
          <div className="flex flex-1 items-center justify-center px-4 py-8">
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("signInToView")}
            </p>
          </div>
        ) : (
          <>
            {/* Photo at top */}
            <div className="shrink-0 border-b border-zinc-200 bg-zinc-50/50 px-4 py-6 dark:border-zinc-700 dark:bg-zinc-800/30 md:px-4">
              <ProfilePhoto
                avatarUrl={profile.avatarUrl}
                fullName={profile.fullName}
                onPhotoChange={handlePhotoChange}
                onPhotoRemove={handlePhotoRemove}
                size="lg"
                editable
                isRtl={isRtl}
              />
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-700">
              <nav
                className="flex gap-1 px-4 md:px-6"
                aria-label="Profile sections"
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                          : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                      )}
                      aria-selected={activeTab === tab.id}
                      role="tab"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {t(tab.labelKey)}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab panels */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
              {activeTab === "personal" && (
                <PersonalInformationTab
                  profile={profile}
                  onUpdate={handleProfileUpdate}
                  isRtl={isRtl}
                />
              )}
              {activeTab === "security" && (
                <SignInSecurityTab
                  email={profile.email}
                  phone={profile.phone}
                  onPhoneUpdate={async (phone) => {
                    await handleProfileUpdate({ phone });
                  }}
                  lastSignInText="Today at 2:30 PM"
                  isRtl={isRtl}
                />
              )}
              {/* {activeTab === "privacy" && (
                <PrivacyCookiesTab isRtl={isRtl} />
              )} */}
            </div>
          </>
        )}
      </div>
    </DialogRoot>
  );
}

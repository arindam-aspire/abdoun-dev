"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/hooks/useProfile";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { SettingsProfileSkeleton } from "@/features/settings/components/SettingsProfileSkeleton";
import { Toast } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/http";
import type { ToastKind } from "@/components/ui/toast";

export function SettingsProfilePage() {
  const t = useTranslations("settings");
  const { user } = useSession();
  const profile = useProfile();
  const [toast, setToast] = useState<{
    kind: ToastKind;
    message: string;
  } | null>(null);

  const onSaveSuccess = useCallback(() => {
    setToast({ kind: "success", message: t("toastProfileSaved") });
  }, [t]);

  const onSaveError = useCallback(
    (err: unknown) => {
      setToast({
        kind: "error",
        message: getApiErrorMessage(err) || t("toastError"),
      });
    },
    [t],
  );

  if (!user) {
    return null;
  }

  if (!profile) {
    return <SettingsProfileSkeleton />;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-zinc-100">
          {t("profilePageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 md:mt-3 dark:text-zinc-400">
          {t("profilePageDescription")}
        </p>
      </header>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {t("sectionPersonal")}
          </h3>
        </div>
        <ProfileForm
          compact={false}
          onSaveSuccess={onSaveSuccess}
          onSaveError={onSaveError}
        />
      </div>
      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

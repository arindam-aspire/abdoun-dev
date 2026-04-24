"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSession } from "@/features/auth/hooks/useSession";
import { changePassword } from "@/features/auth/api/auth.api";
import { getApiErrorMessage } from "@/lib/http";
import { SettingsPasswordForm } from "@/features/settings/components/SettingsPasswordForm";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";

export function SettingsPasswordPage() {
  const t = useTranslations("settings");
  const { user } = useSession();
  const [toast, setToast] = useState<{
    kind: ToastKind;
    message: string;
  } | null>(null);

  const handleSubmit = useCallback(
    async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      try {
        await changePassword({
          password: newPassword,
          previous_password: currentPassword,
        });
        setToast({ kind: "success", message: t("passwordUpdatedToast") });
      } catch (e) {
        const message = getApiErrorMessage(e) || t("toastError");
        setToast({ kind: "error", message });
        throw e;
      }
    },
    [t],
  );

  if (!user) {
    return null;
  }

  // When backend exposes social-only / no-password accounts, set disabled to true and show passwordOAuthOnly.
  const socialOnlyNoPassword = false;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-zinc-100">
          {t("passwordPageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 md:mt-3 dark:text-zinc-400">
          {t("passwordPageDescription")}
        </p>
      </header>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
        <SettingsPasswordForm
          onSubmit={handleSubmit}
          disabled={socialOnlyNoPassword}
          disabledMessage={t("passwordOAuthOnly")}
        />
      </div>
      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          duration={toast.kind === "error" ? 5000 : 4000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

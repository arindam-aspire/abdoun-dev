"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSession } from "@/features/auth/hooks/useSession";
import { ChangeEmailForm } from "@/features/email/components/ChangeEmailForm";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";

function maskEmail(email: string | undefined): string {
  if (!email || email.length <= 3) {
    return "•••@•••";
  }
  const at = email.indexOf("@");
  if (at <= 0) {
    return "•••@•••";
  }
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}

export function SettingsEmailPage() {
  const t = useTranslations("settings");
  const { user } = useSession();
  const [toast, setToast] = useState<{
    kind: ToastKind;
    message: string;
  } | null>(null);

  const masked = useMemo(() => maskEmail(user?.email), [user?.email]);

  const onSuccess = useCallback(() => {
    setToast({ kind: "success", message: t("emailUpdatedToast") });
  }, [t]);

  const onError = useCallback(
    (message: string) => {
      setToast({ kind: "error", message: message || t("toastError") });
    },
    [t],
  );

  if (!user) {
    return null;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-zinc-100">
          {t("emailPageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 md:mt-3 dark:text-zinc-400">
          {t("emailPageDescription")}
        </p>
      </header>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
        <ChangeEmailForm
          currentEmailMasked={masked}
          currentEmailPlain={user.email ?? ""}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          duration={toast.kind === "error" ? 6000 : 5000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

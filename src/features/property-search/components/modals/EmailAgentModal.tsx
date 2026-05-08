"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneNumberInputField } from "@/components/ui/PhoneNumberInputField";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { Toast } from "@/components/ui";
import { createContactLead } from "@/features/leads/api/leadApiService";
import { getApiErrorMessage } from "@/lib/http/apiError";
import type { AxiosError } from "axios";

export interface EmailAgentModalTranslations {
  title: string;
  enterName: string;
  enterEmail: string;
  phone: string;
  messageLabel: string;
  keepMeInformed: string;
  sendEmail: string;
}

export interface EmailAgentModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: number;
    title: string;
  };
  recipient?: {
    name?: string;
    email?: string | null;
  };
  initialValues?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  translations: EmailAgentModalTranslations;
  isRtl?: boolean;
  propertyId?: string;
  onRequireAuth?: () => void;
}

export function EmailAgentModal({
  open,
  onClose,
  listing,
  recipient,
  initialValues,
  translations: t,
  isRtl = false,
  propertyId,
  onRequireAuth,
}: EmailAgentModalProps) {
  const signedInUser = useAppSelector(selectCurrentUser);
  const tSearch = useTranslations("searchResult");
  const propertyRef = `${listing.title} - #${listing.id}`;
  const defaultMessage = tSearch("messageDefault", { propertyRef });
  const recipientEmail = recipient?.email?.trim() ? recipient.email.trim() : "contact@abdoun.com";
  const recipientName = recipient?.name?.trim() ? recipient.name.trim() : "Abdoun Real Estate";

  const [name, setName] = useState(() => initialValues?.name ?? "");
  const [email, setEmail] = useState(() => initialValues?.email ?? "");
  const [phone, setPhone] = useState(() => initialValues?.phone ?? "");
  const [message, setMessage] = useState(() => defaultMessage);
  const [keepInformed, setKeepInformed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "phoneNumber" | "message", string>>>({});
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const applyBackendFieldErrors = (error: unknown): boolean => {
    const typedError = error as AxiosError<{ detail?: Array<{ loc?: unknown[]; msg?: string }> }>;
    const details = typedError.response?.data?.detail;
    if (!Array.isArray(details)) return false;
    const next: Partial<Record<"name" | "email" | "phoneNumber" | "message", string>> = {};
    for (const item of details) {
      const field = item?.loc?.[item.loc.length - 1];
      if (field === "name" || field === "email" || field === "phoneNumber" || field === "message") {
        next[field] = item.msg ?? "Invalid value.";
      }
    }
    if (Object.keys(next).length === 0) return false;
    setFieldErrors(next);
    return true;
  };

  const isForbiddenError = (error: unknown): boolean => {
    const typedError = error as AxiosError;
    return typedError.response?.status === 403;
  };

  const validate = () => {
    const next: Partial<Record<"name" | "email" | "phoneNumber" | "message", string>> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) next.name = "Name must be between 2 and 20 characters.";
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 255) next.email = "Enter a valid email address.";
    if (trimmedPhone.length < 8 || trimmedPhone.length > 20) next.phoneNumber = "Phone number must be between 8 and 20 characters.";
    if (trimmedMessage.length < 10 || trimmedMessage.length > 1000) next.message = "Message must be between 10 and 1000 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedInUser) {
      setToast({ kind: "error", message: "Please sign in to continue." });
      onRequireAuth?.();
      return;
    }
    if (!validate()) return;
    const payloadPropertyId = propertyId ?? String(listing.id);
    setSubmitting(true);
    try {
      await createContactLead({
        propertyId: payloadPropertyId,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        message: message.trim(),
      });
      setToast({ kind: "success", message: "Your inquiry has been sent successfully" });
      onClose();
    } catch (error) {
      if (isForbiddenError(error)) {
        setToast({
          kind: "error",
          message: "You are not allowed to submit contact inquiries with this account.",
        });
        return;
      }
      if (applyBackendFieldErrors(error)) {
        setToast({ kind: "error", message: "Please correct the highlighted fields." });
        return;
      }
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to send inquiry. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <DialogRoot
      open={open}
      onClose={onClose}
      className="max-w-md rounded-xl bg-white p-0 shadow-xl"
      containerClassName="p-4"
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle px-5 pb-4 pt-5">
          <h2 className="text-size-lg fw-bold text-charcoal">{t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 hover:bg-black/5 hover:text-charcoal"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="rounded-lg border border-subtle bg-surface px-3 py-2 text-size-xs text-charcoal/75">
            <p className="fw-semibold text-charcoal">To: {recipientName}</p>
            <p className="mt-0.5">
              Sent to:{" "}
              <span className="font-mono text-charcoal/80">{recipientEmail}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-4 pt-4">
          <label className="mb-1.5 block text-size-sm fw-medium text-charcoal">
            {t.enterName} *
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.enterName}
            className="mb-4 border-subtle"
            required
          />
          {fieldErrors.name ? <p className="mb-3 -mt-2 text-xs text-red-600">{fieldErrors.name}</p> : null}

          <label className="mb-1.5 block text-size-sm fw-medium text-charcoal">
            {t.enterEmail} *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.enterEmail}
            className="mb-4 border-subtle"
            required
          />
          {fieldErrors.email ? <p className="mb-3 -mt-2 text-xs text-red-600">{fieldErrors.email}</p> : null}

          <div className="mb-4">
            <label className="mb-1.5 block text-size-sm fw-medium text-charcoal">
              {t.phone}
            </label>
            <PhoneNumberInputField
              value={phone || undefined}
              onChange={(v) => setPhone(v ?? "")}
              placeholder=""
            />
            {fieldErrors.phoneNumber ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p> : null}
          </div>

          <label className="mb-1.5 block text-size-sm fw-medium text-charcoal">
            {t.messageLabel}
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessage}
            className="mb-4 min-h-[100px] border-subtle"
            rows={4}
          />
          {fieldErrors.message ? <p className="mb-3 -mt-2 text-xs text-red-600">{fieldErrors.message}</p> : null}

          <label
            className={cn(
              "mb-4 flex cursor-pointer items-start gap-2",
              isRtl && "flex-row-reverse",
            )}
          >
            <Checkbox
              checked={keepInformed}
              onChange={(e) => setKeepInformed(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-size-sm text-charcoal/80">
              {t.keepMeInformed}
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 text-size-sm fw-semibold text-white hover:brightness-95"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden />
            {submitting ? "Sending..." : t.sendEmail}
          </button>
        </form>
      </div>
    </DialogRoot>
    {toast ? <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} /> : null}
    </>
  );
}


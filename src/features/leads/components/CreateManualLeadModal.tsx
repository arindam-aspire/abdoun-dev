"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { createManualOwnerLead } from "@/features/leads/api/leadApiService";
import { getApiErrorMessage } from "@/lib/http/apiError";
import type { ManualOwnerLeadCreatePayload } from "@/types/lead";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<keyof ManualOwnerLeadCreatePayload | "contact", string>>;

export type CreateManualLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  onError: (message: string) => void;
  onSuccessToast: (message: string) => void;
};

export function CreateManualLeadModal({
  open,
  onClose,
  onSuccess,
  onError,
  onSuccessToast,
}: CreateManualLeadModalProps) {
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [relatedPropertyName, setRelatedPropertyName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setOwnerName("");
    setPhoneNumber("");
    setEmail("");
    setRelatedPropertyName("");
    setMessage("");
    setErrors({});
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    reset();
    onClose();
  }, [onClose, reset, submitting]);

  const validate = useCallback((): boolean => {
    const next: FieldErrors = {};
    const name = ownerName.trim();
    const prop = relatedPropertyName.trim();
    const msg = message.trim();
    const phone = phoneNumber.trim();
    const mail = email.trim();

    if (!name) next.ownerName = "Owner name is required.";
    if (!prop) next.relatedPropertyName = "Related property name is required.";
    if (!msg) next.message = "Message is required.";
    if (!phone && !mail) {
      next.contact = "Enter at least a phone number or an email.";
    }
    if (mail && (!EMAIL_RE.test(mail) || mail.length > 255)) {
      next.email = "Enter a valid email address.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [ownerName, relatedPropertyName, message, phoneNumber, email]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: ManualOwnerLeadCreatePayload = {
      ownerName: ownerName.trim(),
      relatedPropertyName: relatedPropertyName.trim(),
      message: message.trim(),
    };
    const phone = phoneNumber.trim();
    const mail = email.trim();
    if (phone) payload.phoneNumber = phone;
    if (mail) payload.email = mail;

    setSubmitting(true);
    try {
      await createManualOwnerLead(payload);
      onSuccessToast("Lead created successfully.");
      reset();
      onClose();
      await onSuccess();
    } catch (err) {
      onError(getApiErrorMessage(err, "Failed to create lead."));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/45 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <DialogRoot open={open} onClose={handleClose} className="max-w-2xl" preventCloseOnOutsideClick={submitting}>
      <form noValidate onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div>
          <h2 className="text-size-lg fw-semibold text-charcoal">Add new lead</h2>
          <p className="mt-1 text-size-sm text-charcoal/65">
            Create a manual owner lead. Communication with the owner happens outside the app; use notes and status to
            track progress.
          </p>
        </div>

        {errors.contact ? <p className="text-sm text-red-600">{errors.contact}</p> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="manual-owner-name" className="text-size-xs fw-medium text-charcoal/80">
              Owner name <span className="text-red-600">*</span>
            </label>
            <input
              id="manual-owner-name"
              name="ownerName"
              value={ownerName}
              onChange={(ev) => setOwnerName(ev.target.value)}
              className={cn(inputClass, errors.ownerName && "border-red-300")}
              placeholder="Full name"
              autoComplete="name"
              disabled={submitting}
            />
            {errors.ownerName ? <p className="text-sm text-red-600">{errors.ownerName}</p> : null}
          </div>
          <div className="space-y-1">
            <label htmlFor="manual-phone" className="text-size-xs fw-medium text-charcoal/80">
              Phone number
            </label>
            <input
              id="manual-phone"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(ev) => setPhoneNumber(ev.target.value)}
              className={inputClass}
              placeholder="Optional if email provided"
              autoComplete="tel"
              disabled={submitting}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="manual-email" className="text-size-xs fw-medium text-charcoal/80">
              Email
            </label>
            <input
              id="manual-email"
              name="email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={cn(inputClass, errors.email && "border-red-300")}
              placeholder="Optional if phone provided"
              autoComplete="email"
              disabled={submitting}
            />
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="manual-property" className="text-size-xs fw-medium text-charcoal/80">
              Related property name <span className="text-red-600">*</span>
            </label>
            <input
              id="manual-property"
              name="relatedPropertyName"
              value={relatedPropertyName}
              onChange={(ev) => setRelatedPropertyName(ev.target.value)}
              className={cn(inputClass, errors.relatedPropertyName && "border-red-300")}
              placeholder="Property title or description"
              disabled={submitting}
            />
            {errors.relatedPropertyName ? <p className="text-sm text-red-600">{errors.relatedPropertyName}</p> : null}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="manual-message" className="text-size-xs fw-medium text-charcoal/80">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              id="manual-message"
              name="message"
              value={message}
              onChange={(ev) => setMessage(ev.target.value)}
              className={cn(inputClass, "min-h-[120px] resize-y", errors.message && "border-red-300")}
              placeholder="Initial notes or context for this lead"
              disabled={submitting}
            />
            {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting} className="min-w-[8rem]">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Creating…
              </>
            ) : (
              "Create lead"
            )}
          </Button>
        </div>
      </form>
    </DialogRoot>
  );
}

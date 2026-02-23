"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/hooks/useTranslations";

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
  initialValues?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  translations: EmailAgentModalTranslations;
  isRtl?: boolean;
}

export function EmailAgentModal({
  open,
  onClose,
  listing,
  initialValues,
  translations: t,
  isRtl = false,
}: EmailAgentModalProps) {
  const tSearch = useTranslations("searchResult");
  const propertyRef = `${listing.title} - #${listing.id}`;
  const defaultMessage = tSearch("messageDefault", { propertyRef });

  const [name, setName] = useState(() => initialValues?.name ?? "");
  const [email, setEmail] = useState(() => initialValues?.email ?? "");
  const [phone, setPhone] = useState(() => initialValues?.phone ?? "");
  const [message, setMessage] = useState(() => defaultMessage);
  const [keepInformed, setKeepInformed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry: ${listing.title}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
    );
    window.location.href = `mailto:contact@abdoun.com?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <DialogRoot
      open={open}
      onClose={onClose}
      className="max-w-md rounded-xl bg-white p-0 shadow-xl"
      containerClassName="p-4"
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 pt-5 pb-4">
          <h2 className="text-lg font-bold text-[var(--color-charcoal)]">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-charcoal)]/60 hover:bg-black/5 hover:text-[var(--color-charcoal)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4">
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            {t.enterName} *
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.enterName}
            className="mb-4 border-[var(--border-subtle)]"
            required
          />

          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            {t.enterEmail} *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.enterEmail}
            className="mb-4 border-[var(--border-subtle)]"
            required
          />

          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            {t.phone}
          </label>
          <div
            className={cn(
              "mb-4 flex overflow-hidden rounded-md border border-[var(--border-subtle)]",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="flex items-center border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm text-[var(--color-charcoal)]/80 [border-inline-end-width:1px]">
              +962
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder=""
              className="flex flex-1 border-0 bg-white px-3 py-2 text-sm text-[var(--color-charcoal)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-inset"
            />
          </div>

          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            {t.messageLabel}
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessage}
            className="mb-4 min-h-[100px] border-[var(--border-subtle)]"
            rows={4}
          />

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
            <span className="text-sm text-[var(--color-charcoal)]/80">
              {t.keepMeInformed}
            </span>
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-secondary)] py-3 text-sm font-semibold text-white hover:brightness-95"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden />
            {t.sendEmail}
          </button>
        </form>
      </div>
    </DialogRoot>
  );
}

"use client";

import { Phone, X } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const DEFAULT_PHONE = "+962-6-0000000";

export interface ContactPropertyModalTranslations {
  contactUs: string;
  quoteReference: string;
  whenCallingUs: string;
  agentLabel: string;
  agentName: string;
  call: string;
  whatsapp: string;
}

export interface ContactPropertyModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: number;
    title: string;
    brokerName: string;
  };
  translations: ContactPropertyModalTranslations;
  isRtl?: boolean;
}

export function ContactPropertyModal({
  open,
  onClose,
  listing,
  translations: t,
  isRtl = false,
}: ContactPropertyModalProps) {
  const propertyRef = `${listing.title} - #${listing.id}`;
  const phoneHref = "tel:+962600000000";

  return (
    <DialogRoot
      open={open}
      onClose={onClose}
      className="max-w-md rounded-xl bg-white p-0 shadow-xl"
      containerClassName="p-4"
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle px-5 pt-5 pb-4">
          <h2 className="text-size-lg fw-bold text-charcoal">
            {t.contactUs}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 hover:bg-black/5 hover:text-charcoal"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-size-sm fw-medium text-charcoal">
            {listing.brokerName}
          </p>

          {/* Phone with icon */}
          <div
            className={cn(
              "mt-3 flex items-center gap-3 rounded-xl bg-secondary/10 p-3",
              isRtl && "flex-row-reverse",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20">
              <Phone className="h-5 w-5 text-secondary" aria-hidden />
            </div>
            <a
              href={phoneHref}
              className="text-size-base fw-bold text-secondary hover:underline"
            >
              {DEFAULT_PHONE}
            </a>
          </div>

          <p className="mt-2 text-size-sm text-charcoal/80">
            {t.agentLabel}: {t.agentName}
          </p>

          <p className="mt-3 text-size-sm text-charcoal/80">
            {t.quoteReference}{" "}
            <span
              className="fw-semibold text-primary underline"
              title={propertyRef}
            >
              {propertyRef}
            </span>{" "}
            {t.whenCallingUs}
          </p>
        </div>
      </div>
    </DialogRoot>
  );
}



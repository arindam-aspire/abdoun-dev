"use client";

import { X } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const WHATSAPP_NUMBER = "962600000000";
/** Display format matching Call modal */
const DEFAULT_PHONE_DISPLAY = "+962-6-0000000";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface WhatsAppContactModalTranslations {
  title: string;
  quoteReference: string;
  whenMessagingUsWhatsApp: string;
  agentLabel: string;
  agentName: string;
}

export interface WhatsAppContactModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: number;
    title: string;
    brokerName: string;
  };
  translations: WhatsAppContactModalTranslations;
  isRtl?: boolean;
}

export function WhatsAppContactModal({
  open,
  onClose,
  listing,
  translations: t,
  isRtl = false,
}: WhatsAppContactModalProps) {
  const propertyRef = `${listing.title} - #${listing.id}`;
  const defaultText = `Hi, I'm interested in: ${propertyRef}. Please get in touch when you can.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultText)}`;

  return (
    <DialogRoot
      open={open}
      onClose={onClose}
      className="max-w-md rounded-xl bg-white p-0 shadow-xl"
      containerClassName="p-4"
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="text-left">
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

        <div className="px-5 py-4">
          <p className="text-size-sm fw-medium text-charcoal">{listing.brokerName}</p>

          {/* WhatsApp with icon (same layout and color as Call modal) */}
          <div
            className={cn(
              "mt-3 flex items-center gap-3 rounded-xl bg-secondary/10 p-3",
              isRtl && "flex-row-reverse",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20">
              <WhatsAppIcon className="h-5 w-5 text-secondary" aria-hidden />
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="text-size-base fw-bold text-secondary hover:underline"
            >
              {DEFAULT_PHONE_DISPLAY}
            </a>
          </div>

          <p className="mt-2 text-size-sm text-charcoal/80">
            {t.agentLabel}: {t.agentName}
          </p>

          <p className="mt-3 text-size-sm text-charcoal/80">
            {t.quoteReference}{" "}
            <span className="fw-semibold text-primary underline" title={propertyRef}>
              {propertyRef}
            </span>{" "}
            {t.whenMessagingUsWhatsApp}
          </p>
        </div>
      </div>
    </DialogRoot>
  );
}


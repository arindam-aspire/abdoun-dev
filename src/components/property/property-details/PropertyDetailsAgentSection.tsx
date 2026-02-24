"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Mail, Phone, UserCircle2 } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { ContactPropertyModal } from "@/components/search-result/ContactPropertyModal";
import { EmailAgentModal } from "@/components/search-result/EmailAgentModal";
import { WhatsAppContactModal } from "@/components/search-result/WhatsAppContactModal";
import { cn } from "@/lib/cn";

const DEFAULT_AGENT_NAME = "Jalal Yance";
const DEFAULT_AGENT_SPECIALTY = "Luxury specialist — Abdoun & Dabouq";

export interface PropertyDetailsAgentSectionProps {
  listing: {
    id: number;
    title: string;
    brokerName: string;
  };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function PropertyDetailsAgentSection({ listing }: PropertyDetailsAgentSectionProps) {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  const tSearch = useTranslations("searchResult");
  const signedInUser = useAppSelector((state) => state.auth.user);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  const tEmail = tSearch("email");
  const tCall = tSearch("call");

  return (
    <section className="border-t border-[var(--border-subtle)] bg-[var(--surface)]/50 py-5 md:py-6">
      <div className={cn("flex items-center gap-3 px-4 md:px-5", isRtl && "flex-row-reverse")}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
            Listing agent
          </p>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">{DEFAULT_AGENT_NAME}</p>
          <p className="text-[11px] text-[var(--color-charcoal)]/70">
            {DEFAULT_AGENT_SPECIALTY}
          </p>
        </div>
      </div>

      {/* Call, Email, WhatsApp – same as Search Results page */}
      <div
        className={cn(
          "mt-4 grid grid-cols-3 gap-2 px-4 text-xs md:px-5",
          isRtl && "grid-flow-dense",
        )}
      >
        <button
          type="button"
          onClick={() => setEmailModalOpen(true)}
          className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-[var(--brand-secondary)]/12 px-2 text-[11px] font-semibold text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]/50"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{tEmail}</span>
        </button>
        <button
          type="button"
          onClick={() => setContactModalOpen(true)}
          className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-[var(--brand-secondary)]/12 px-2 text-[11px] font-semibold text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]/50"
        >
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{tCall}</span>
        </button>
        <button
          type="button"
          onClick={() => setWhatsappModalOpen(true)}
          className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-secondary)]/12 text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]/50"
          aria-label="WhatsApp"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
        </button>
      </div>

      <p className="mt-3 px-4 text-[11px] leading-relaxed text-[var(--color-charcoal)]/75 md:px-5">
        Our concierge team confirms viewing slots within
        <span className="font-semibold text-[var(--color-charcoal)]"> 2 hours</span> and
        shares all details via WhatsApp and email.
      </p>

      <EmailAgentModal
        key={`${listing.id}-${signedInUser?.id ?? "guest"}-${emailModalOpen ? "open" : "closed"}`}
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        listing={{ id: listing.id, title: listing.title }}
        initialValues={
          signedInUser
            ? {
                name: signedInUser.name,
                email: signedInUser.email,
                phone: signedInUser.phone,
              }
            : undefined
        }
        translations={{
          title: tSearch("emailAgentTitle"),
          enterName: tSearch("enterName"),
          enterEmail: tSearch("enterEmail"),
          phone: tSearch("phone"),
          messageLabel: tSearch("messageLabel"),
          keepMeInformed: tSearch("keepMeInformed"),
          sendEmail: tSearch("sendEmail"),
        }}
        isRtl={isRtl}
      />

      <ContactPropertyModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        listing={listing}
        translations={{
          contactUs: tSearch("contactUs"),
          quoteReference: tSearch("quoteReference"),
          whenCallingUs: tSearch("whenCallingUs"),
          agentLabel: tSearch("agentLabel"),
          agentName: tSearch("agentName"),
          call: tSearch("call"),
          whatsapp: tSearch("whatsapp"),
        }}
        isRtl={isRtl}
      />

      <WhatsAppContactModal
        open={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        listing={listing}
        translations={{
          title: tSearch("whatsappModalTitle"),
          quoteReference: tSearch("quoteReference"),
          whenMessagingUsWhatsApp: tSearch("whenMessagingUsWhatsApp"),
          agentLabel: tSearch("agentLabel"),
          agentName: tSearch("agentName"),
        }}
        isRtl={isRtl}
      />
    </section>
  );
}

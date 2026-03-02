"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import type { SearchResultListing } from "@/components/search-result/types";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/hooks/useTranslations";
import { ContactPropertyModal } from "@/components/search-result/ContactPropertyModal";
import { EmailAgentModal } from "@/components/search-result/EmailAgentModal";
import { WhatsAppContactModal } from "@/components/search-result/WhatsAppContactModal";
import { useAppSelector } from "@/hooks/storeHooks";

export interface AdminSearchResultPropertyCardProps {
  listing: SearchResultListing;
  translations?: {
    email?: string;
    call?: string;
  };
  detailsBasePath?: string;
}

export function AdminSearchResultPropertyCard({
  listing,
  translations = {},
  detailsBasePath = "properties",
}: AdminSearchResultPropertyCardProps) {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  const tSearch = useTranslations("searchResult");
  const signedInUser = useAppSelector((state) => state.auth.user);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const images =
    listing.images?.length > 0
      ? listing.images
      : ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"];
  const totalImages = images.length;
  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImageIndex((i) => (i === 0 ? totalImages - 1 : i - 1));
    },
    [totalImages],
  );
  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImageIndex((i) => (i === totalImages - 1 ? 0 : i + 1));
    },
    [totalImages],
  );
  const t = {
    email: translations.email ?? "Email",
    call: translations.call ?? "Call",
  };

  const detailsHref =
    `/${locale}/${detailsBasePath}/${listing.id}` +
    (listing.exclusive || listing.badges?.includes("Exclusive") ? "?exclusive=1" : "");
  const linkProps = {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };

  const isExclusiveListing =
    listing.exclusive === true || (Array.isArray(listing.badges) && listing.badges.includes("Exclusive"));
  const showVerified =
    Array.isArray(listing.badges) && listing.badges.includes("Verified");
  const showExclusive = isExclusiveListing;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-white shadow-sm transition hover:shadow-md",
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top: Image */}
      <Link
        href={detailsHref}
        {...linkProps}
        className="relative flex h-0 w-full flex-shrink-0 overflow-hidden rounded-t-xl"
        style={{ paddingBottom: "65%" }}
        aria-label={`View ${listing.title}`}
      >
        <div className="absolute inset-0">
          {images[0] && (
            <Image
              src={images[currentImageIndex] ?? images[0]}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-300"
            />
          )}
        </div>

        {/* Badges */}
        <div
          className={cn(
            "absolute top-2 z-10 flex flex-wrap items-center gap-1.5",
            isRtl ? "right-2" : "left-2",
          )}
        >
          {showExclusive && (
            <span className="inline-flex rounded-md bg-accent px-2 py-1 text-size-11 fw-semibold text-secondary shadow-sm">
              Exclusive
            </span>
          )}
          {showVerified && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-size-11 fw-medium text-white">
              <CheckCircle2 className="h-3 w-3 text-white" />
              Verified
            </span>
          )}
        </div>

        {/* Three-dot menu (replaces FavouriteButton) */}
        <div
          ref={menuRef}
          className={cn(
            "absolute top-2 z-10",
            isRtl ? "left-2" : "right-2",
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm ring-1 ring-subtle hover:bg-white cursor-pointer"
            aria-label="Property actions"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div
              className={cn(
                "absolute top-11 z-50 min-w-[140px] rounded-lg border border-subtle bg-white py-1 shadow-xl",
                isRtl ? "left-0" : "right-0",
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  // TODO: Implement edit
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-size-sm text-charcoal hover:bg-surface cursor-pointer transition"
              >
                <Pencil className="h-3.5 w-3.5 text-charcoal/60" />
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  // TODO: Implement delete
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-size-sm text-red-600 hover:bg-red-50 cursor-pointer transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Carousel arrows */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className={cn(
                "absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow-sm ring-1 ring-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white",
                isRtl && "left-auto right-2",
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className={cn(
                "absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow-sm ring-1 ring-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white",
                isRtl && "right-auto left-2",
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {totalImages > 1 && (
          <div
            className={cn(
              "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5",
              isRtl && "flex-row-reverse",
            )}
          >
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition",
                  i === currentImageIndex
                    ? "bg-white ring-2 ring-white/50"
                    : "bg-white/60",
                )}
                aria-hidden
              />
            ))}
          </div>
        )}

        {/* Broker name */}
        <div
          className={cn(
            "absolute bottom-8 left-1/2 z-0 -translate-x-1/2 text-size-2xs fw-medium text-white/70",
            isRtl && "translate-x-1/2",
          )}
        >
          {listing.brokerName}
        </div>
      </Link>

      {/* Bottom: Details */}
      <div
        className={cn(
          "relative z-10 flex min-h-[120px] flex-1 flex-col justify-between p-3",
          isRtl ? "text-right" : "text-left",
        )}
      >
        <Link
          href={detailsHref}
          {...linkProps}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg -m-1 p-1"
          aria-label={`View details for ${listing.title}`}
        >
          <p className="text-size-base fw-bold leading-tight text-charcoal">
            {listing.price}
          </p>
          <p className="mt-0.5 text-size-xs text-charcoal/80 line-clamp-1">
            {listing.acres
              ? `${listing.acres} acres - ${listing.propertyType}`
              : `${listing.area} sqft - ${listing.propertyType}`}
          </p>
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-size-11 text-charcoal/75",
              isRtl && "flex-row-reverse justify-end",
            )}
          >
            <MapPin className="h-3 w-3 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{listing.location}</span>
          </div>
          <p className="mt-1 text-size-2xs fw-semibold uppercase tracking-wider text-charcoal/60">
            {listing.brokerName}
          </p>
        </Link>

        {/* Call, Email, WhatsApp */}
        <div
          className={cn(
            "mt-2 grid grid-cols-3 gap-1.5 border-t border-subtle pt-2",
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEmailModalOpen(true);
            }}
            className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-md bg-secondary/12 px-1.5 text-size-11 fw-semibold text-secondary hover:bg-secondary/18"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{t.email}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContactModalOpen(true);
            }}
            className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-md bg-secondary/12 px-1.5 text-size-11 fw-semibold text-secondary hover:bg-secondary/18"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{t.call}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWhatsappModalOpen(true);
            }}
            className="inline-flex h-9 min-w-0 cursor-pointer items-center justify-center rounded-md bg-secondary/12 text-secondary hover:bg-secondary/18"
            aria-label="WhatsApp"
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
        </div>
      </div>

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
        listing={{ id: listing.id, title: listing.title, brokerName: listing.brokerName }}
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
        listing={{ id: listing.id, title: listing.title, brokerName: listing.brokerName }}
        translations={{
          title: tSearch("whatsappModalTitle"),
          quoteReference: tSearch("quoteReference"),
          whenMessagingUsWhatsApp: tSearch("whenMessagingUsWhatsApp"),
          agentLabel: tSearch("agentLabel"),
          agentName: tSearch("agentName"),
        }}
        isRtl={isRtl}
      />
    </article>
  );
}

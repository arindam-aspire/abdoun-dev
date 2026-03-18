"use client";

import { useState, useCallback } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppLocale } from "@/i18n/routing";
import type { SearchResultListing } from "@/features/property-search/types";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/hooks/useTranslations";
import { ContactPropertyModal } from "./modals/ContactPropertyModal";
import { EmailAgentModal } from "./modals/EmailAgentModal";
import { WhatsAppContactModal } from "./modals/WhatsAppContactModal";
import { FavouriteButton } from "@/features/favourites/components/FavouriteButton";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";

export interface SearchResultPropertyCardProps {
  listing: SearchResultListing;
  translations?: {
    email?: string;
    call?: string;
  };
  /** Base path segment for property details link. Defaults to "property-details". */
  detailsBasePath?: string;
}

export function SearchResultPropertyCard({
  listing,
  translations = {},
  detailsBasePath = "property-details",
}: SearchResultPropertyCardProps) {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  const tSearch = useTranslations("searchResult");
  const signedInUser = useAppSelector(selectCurrentUser);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  const images =
    listing.images?.length > 0
      ? listing.images
      : [
          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
        ];
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
    (listing.exclusive || listing.badges?.includes("Exclusive")
      ? "?exclusive=1"
      : "");
  const linkProps = {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };

  const isExclusiveListing =
    listing.exclusive === true ||
    (Array.isArray(listing.badges) && listing.badges.includes("Exclusive"));
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
      {/* Top: Image (fixed aspect – slightly smaller card) */}
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

        {/* Badges: Verified and/or Exclusive */}
        <div
          className={cn(
            "absolute top-2 z-10 flex flex-wrap items-center gap-1.5",
            isRtl ? "right-2" : "left-2",
          )}
        >
          {showExclusive && <Badge variant="exclusive">Exclusive</Badge>}
          {showVerified && (
            <Badge variant="verified">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>

        {/* Favorite top-right on image */}
        <FavouriteButton
          propertyId={listing.id}
          className={cn(
            "absolute top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm ring-1 ring-subtle hover:bg-white hover:text-red-500",
            isRtl ? "left-2" : "right-2",
          )}
          iconClassName="h-5 w-5"
        />

        {/* Carousel arrows – visible on card hover */}
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

        {/* Broker name on image (subtle) */}
        <div
          className={cn(
            "absolute bottom-8 left-1/2 z-0 -translate-x-1/2 text-size-2xs fw-medium text-white/70",
            isRtl && "translate-x-1/2",
          )}
        >
          {listing.brokerName}
        </div>
      </Link>

      {/* Bottom: Minimal details (same structure for all cards = even height) */}
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

        {/* Actions */}
        <div className={cn("mt-3 grid grid-cols-3 gap-2", isRtl && "text-right")}>
          <button
            type="button"
            onClick={() => {
              if (!signedInUser) return;
              setWhatsappModalOpen(true);
            }}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-subtle bg-white px-3 py-2 text-size-xs fw-semibold text-secondary shadow-sm hover:bg-surface",
              isRtl && "flex-row-reverse",
            )}
            aria-label={tSearch("whatsapp")}
            disabled={!signedInUser}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            {tSearch("whatsapp")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!signedInUser) return;
              setEmailModalOpen(true);
            }}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-subtle bg-white px-3 py-2 text-size-xs fw-semibold text-secondary shadow-sm hover:bg-surface",
              isRtl && "flex-row-reverse",
            )}
            aria-label={t.email}
            disabled={!signedInUser}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            {t.email}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!signedInUser) return;
              setContactModalOpen(true);
            }}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-subtle bg-white px-3 py-2 text-size-xs fw-semibold text-secondary shadow-sm hover:bg-surface",
              isRtl && "flex-row-reverse",
            )}
            aria-label={t.call}
            disabled={!signedInUser}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            {t.call}
          </button>
        </div>

        {!signedInUser && (
          <div className="mt-3 rounded-lg bg-surface px-3 py-2 text-size-xs text-charcoal/70">
            {tSearch("loginToContact")}
          </div>
        )}
      </div>

      <EmailAgentModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        listing={{ id: listing.id, title: listing.title }}
        initialValues={{
          name: signedInUser?.name ?? "",
          email: signedInUser?.email ?? "",
          phone: signedInUser?.phone ?? "",
        }}
        translations={{
          title: tSearch("email"),
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
          title: tSearch("whatsapp"),
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


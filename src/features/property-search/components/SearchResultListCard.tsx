"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  BedDouble,
  Bath,
  Expand,
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
import { WhatsAppContactModal } from "./modals/WhatsAppContactModal";
import { ContactPropertyModal } from "./modals/ContactPropertyModal";
import { EmailAgentModal } from "./modals/EmailAgentModal";
import { FavouriteButton } from "@/features/favourites/components/FavouriteButton";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface SearchResultListCardProps {
  listing: SearchResultListing;
  translations: {
    launchPrice: string;
    paymentPlan: string;
    handover: string;
    whatsapp: string;
    email: string;
    call: string;
    byDeveloper: (name: string) => string;
    paymentPlanInfo?: string;
  };
  /** Base path segment for property details link. Defaults to "property-details". */
  detailsBasePath?: string;
}

export function SearchResultListCard({
  listing,
  translations: t,
  detailsBasePath = "property-details",
}: SearchResultListCardProps) {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  const tSearch = useTranslations("searchResult");
  const signedInUser = useAppSelector(selectCurrentUser);
  const currentUserRole = signedInUser?.role?.toLowerCase();
  const canViewOwnerDetails =
    currentUserRole === "agent" || currentUserRole === "admin";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images =
    listing.images?.length > 0
      ? listing.images
      : [
          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
        ];
  const totalImages = images.length;
  const visibleDotCount = Math.min(totalImages, 3);
  const activeDotIndex =
    totalImages <= 3 ? currentImageIndex : currentImageIndex % visibleDotCount;

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

  // Auto-advance carousel on hover (same as grid view)
  useEffect(() => {
    if (!isHovered || totalImages <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((i) => (i === totalImages - 1 ? 0 : i + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, totalImages]);

  const detailsHref =
    `/${locale}/${detailsBasePath}/${listing.id}` +
    (listing.exclusive || listing.is_exclusive || listing.badges?.includes("Exclusive")
      ? "?exclusive=1"
      : "");
  const linkProps = {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };

  const ownerEntries =
    listing.owners
      ?.map((owner) => ({
        name: owner.full_name?.trim() ?? "",
        phone: owner.phone?.trim() ?? "",
      }))
      .filter((owner) => owner.name || owner.phone) ?? [];
  const hasOwnerDetails = canViewOwnerDetails && ownerEntries.length > 0;
  const isExclusiveListing =
    listing.exclusive === true ||
    listing.is_exclusive === true ||
    (Array.isArray(listing.badges) && listing.badges.includes("Exclusive"));
  const showExclusive = isExclusiveListing;

  return (
    <article
      className={cn(
        "group flex overflow-hidden rounded-xl border border-[#e7ebf1] bg-white transition duration-300 hover:-translate-y-1",
        "min-h-0 flex-col md:flex-row",
      )}
      dir={isRtl ? "rtl" : "ltr"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left: Image carousel (~50% on desktop) */}
      <Link
        href={detailsHref}
        {...linkProps}
        className={cn(
          "relative flex-shrink-0 overflow-hidden",
          "w-full md:w-[320px]",
          "aspect-[4/3] md:aspect-auto",
          "rounded-t-xl md:rounded-t-none",
          isRtl ? "md:rounded-r-xl" : "md:rounded-l-xl",
        )}
        aria-label={`View ${listing.title}`}
      >
        <div className="absolute inset-0">
          {images[0] && (
            <Image
              src={images[currentImageIndex] ?? images[0]}
              alt={listing.title}
              fill
              sizes="(max-width: 767px) 100vw, 320px"
              className="object-cover transition-[transform,opacity,filter] duration-500 group-hover:scale-[1.03]"
            />
          )}
        </div>

        {/* Badges: Exclusive */}
        <div
          className={cn(
            "absolute top-2 z-10 flex flex-wrap items-center gap-1.5",
            isRtl ? "right-2" : "left-2",
          )}
        >
          {showExclusive && <Badge variant="exclusive">Exclusive</Badge>}
        </div>

        {/* Favourite button (same as grid view) */}
        <FavouriteButton
          propertyId={listing.id}
          className={cn(
            "absolute top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-secondary ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white",
            isRtl ? "left-2" : "right-2",
          )}
          iconClassName="h-5 w-5"
        />

        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className={cn(
                "absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow-sm ring-1 ring-black/10 transition-opacity duration-200 hover:bg-white",
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
                "absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow-sm ring-1 ring-black/10 transition-opacity duration-200 hover:bg-white",
                isRtl && "right-auto left-2",
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}

        <div
          className={cn(
            "absolute bottom-3 z-10 flex w-full items-center justify-between px-3",
            isRtl && "flex-row-reverse",
          )}
        >
          {/* Broker name on image */}
          <div className="min-w-0 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm text-size-xs fw-medium text-white">
            <span className="block truncate">{listing.brokerName}</span>
          </div>

          {/* Pagination dots (visible on card hover) */}
          {totalImages > 1 && (
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full bg-black/20 px-2 py-1.5 backdrop-blur-sm transition-opacity duration-200",
                isRtl && "flex-row-reverse",
              )}
            >
              {Array.from({ length: visibleDotCount }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    i === activeDotIndex
                      ? "h-3 w-3 bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
                      : "bg-white/60 hover:bg-white/85",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Right: Details */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col justify-between p-4 md:p-6",
          isRtl ? "text-right" : "text-left",
        )}
      >
        <div>
          <Link
            href={detailsHref}
            {...linkProps}
            className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={`View details for ${listing.title}`}
          >
            <h3 className="text-size-lg fw-medium leading-tight">
              {listing.title}
            </h3>
          </Link>

          <div
            className={cn(
              "my-2 flex items-center gap-1 text-size-sm text-[#717182]",
              isRtl && "flex-row-reverse justify-end",
            )}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#6A7282]" aria-hidden />
            <span className="truncate">{listing.location}</span>
          </div>

          <div
            className={cn(
              "flex items-center justify-between",
              isRtl && "flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 flex-wrap items-center gap-6 text-[#717182]",
                isRtl && "flex-row-reverse",
              )}
            >
              <span className="inline-flex items-center gap-2">
                <BedDouble className="h-4 w-4 shrink-0 text-[#717182]" aria-hidden />
                {listing.beds} Beds
              </span>
              <span className="inline-flex items-center gap-2">
                <Bath className="h-4 w-4 shrink-0 text-[#717182]" aria-hidden />
                {listing.baths} Bathrooms
              </span>
              <span className="inline-flex items-center gap-2">
                <Expand className="h-4 w-4 shrink-0 text-[#717182]" aria-hidden />
                {listing.acres
                  ? `${listing.acres} acres`
                  : `${listing.area} sqft`}
              </span>
            </div>

            <div
              className={cn(
                "shrink-0 text-size-2xl fw-bold tracking-tight text-[#364153]",
                isRtl ? "text-left" : "text-right",
              )}
            >
              {listing.price}
            </div>
          </div>

          <div className="my-3 h-px w-full bg-[#E5E7EB]" />

          <div
            className={cn(
              "grid items-center gap-3",
              hasOwnerDetails ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
            )}
          >
            {hasOwnerDetails ? (
              <div className={cn("min-w-0", isRtl && "text-right")}>
                <div
                  className={cn(
                    "flex items-center gap-2 text-size-xs tracking-wide text-[#717182]",
                    isRtl && "flex-row-reverse justify-end",
                  )}
                >
                  <span>Owner Details</span>
                </div>
                <div
                  className={cn(
                    "mt-1 space-y-1",
                    isRtl && "text-right",
                  )}
                >
                  {ownerEntries.map((owner, index) => (
                    <div
                      key={`${listing.id}-owner-${index}`}
                      className={cn(
                        "flex min-w-0 items-center gap-2 text-size-base",
                        isRtl && "flex-row-reverse justify-end",
                      )}
                    >
                      <span className="truncate">{owner.name || "-"}</span>
                      {owner.name && owner.phone ? (
                        <span className="inline-flex w-3 justify-center text-charcoal/40">
                          |
                        </span>
                      ) : null}
                      <span className="truncate">{owner.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className={cn(
                "flex items-center gap-2",
                isRtl && "flex-row-reverse",
                isRtl ? "md:justify-start" : "md:justify-end",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  if (!signedInUser) return;
                  setEmailModalOpen(true);
                }}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#D1D5DC] bg-white px-4 text-size-sm fw-medium text-[#364153] transition hover:bg-slate-50"
                aria-label={t.email}
                disabled={!signedInUser}
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <span>{t.email}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!signedInUser) return;
                  setContactModalOpen(true);
                }}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#D1D5DC] bg-white px-4 text-size-sm fw-medium text-[#364153] transition hover:bg-slate-50"
                aria-label={t.call}
                disabled={!signedInUser}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <span>{t.call}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!signedInUser) return;
                  setWhatsappModalOpen(true);
                }}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#D1D5DC] bg-white text-[#364153] transition hover:bg-slate-50"
                aria-label={t.whatsapp}
                disabled={!signedInUser}
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

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


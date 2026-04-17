"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { AuthPopup } from "@/features/auth/components/modals/AuthPopup";
import { FavouriteButton } from "@/features/favourites/components/FavouriteButton";
import { ContactPropertyModal } from "@/features/property-search/components/modals/ContactPropertyModal";
import { EmailAgentModal } from "@/features/property-search/components/modals/EmailAgentModal";
import { WhatsAppContactModal } from "@/features/property-search/components/modals/WhatsAppContactModal";
import type { ListingOwnerDetails } from "@/features/property-search/types";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { cn } from "@/lib/cn";
import { selectCurrentUser } from "@/store/selectors";
import { AuthProviderLogo } from "../auth/popup-steps/AuthProviderLogo";

export interface PropertyCardNewMetric {
  icon: LucideIcon;
  label: string;
}

export interface PropertyCardNewBadge {
  label: ReactNode;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "exclusive";
  className?: string;
}

export interface PropertyCardNewProps {
  loading?: boolean;
  title: string;
  price: string;
  summaryLine?: string;
  location: string;
  agentLabel: string;
  ownerName?: string;
  contactNumber?: string;
  owners?: ListingOwnerDetails[];
  href: string;
  propertyId: number;
  images: string[];
  imageAlt?: string;
  badges?: PropertyCardNewBadge[];
  metrics?: PropertyCardNewMetric[];
  imageOverlayContent?: ReactNode;
  cardClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  imageSizes?: string;
  target?: "_blank" | "_self";
  rel?: string;
  isRtl?: boolean;
  showImageNavigation?: boolean;
}

function PropertyCardNewSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-[22px] border border-[#e7ebf1] bg-white"
      aria-hidden="true"
    >
      <Skeleton className="h-0 w-full rounded-none pb-[67%]" />

      <div className="px-5 py-4 md:px-5 md:py-4">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="mt-2 h-5 w-3/4" />
        <Skeleton className="mt-2 h-6 w-1/2" />

        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>

        <div className="mt-4 border-t border-[#edf1f5] pt-3.5">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#f8fafc] px-3 py-2.5">
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-full rounded-full" />
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <Skeleton className="h-[38px] flex-1 rounded-[10px]" />
            <Skeleton className="h-[38px] flex-1 rounded-[10px]" />
            <Skeleton className="h-[38px] w-[38px] rounded-[10px]" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardNew({
  loading = false,
  title,
  price,
  summaryLine,
  location,
  agentLabel,
  owners,
  href,
  propertyId,
  images,
  imageAlt,
  badges = [],
  metrics = [],
  imageOverlayContent,
  cardClassName,
  contentClassName,
  titleClassName,
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  target = "_blank",
  rel = "noopener noreferrer",
  isRtl = false,
  showImageNavigation,
}: PropertyCardNewProps) {
  const locale = useLocale() as AppLocale;
  const tSearch = useTranslations("searchResult");
  const signedInUser = useAppSelector(selectCurrentUser);
  const currentUserRole = signedInUser?.role?.toLowerCase();
  const canViewOwnerDetails =
    currentUserRole === "agent" || currentUserRole === "admin";
  const safeImages =
    images.length > 0
      ? images
      : [
          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200",
        ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [authPopupOpen, setAuthPopupOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const imageTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalImages = safeImages.length;
  const canNavigateImages = showImageNavigation ?? totalImages > 1;
  const ownerEntries =
    owners
      ?.map((owner) => ({
        name: owner.full_name?.trim() ?? "",
        phone: owner.phone?.trim() ?? "",
      }))
      .filter((owner) => owner.name || owner.phone) ?? [];
  const hasOwnerDetails = canViewOwnerDetails && ownerEntries.length > 0;
  const visibleDotIndices =
    totalImages <= 3
      ? Array.from({ length: totalImages }, (_, index) => index)
      : currentImageIndex <= 1
        ? [0, 1, 2]
        : currentImageIndex >= totalImages - 2
          ? [totalImages - 3, totalImages - 2, totalImages - 1]
          : [currentImageIndex - 1, currentImageIndex, currentImageIndex + 1];

  const runImageTransition = useCallback(() => {
    setIsImageTransitioning(true);
    if (imageTransitionTimeoutRef.current) {
      clearTimeout(imageTransitionTimeoutRef.current);
    }
    imageTransitionTimeoutRef.current = setTimeout(() => {
      setIsImageTransitioning(false);
    }, 260);
  }, []);

  const goPrev = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    runImageTransition();
    setCurrentImageIndex((index) => (index === 0 ? totalImages - 1 : index - 1));
  }, [runImageTransition, totalImages]);

  const goNext = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    runImageTransition();
    setCurrentImageIndex((index) => (index === totalImages - 1 ? 0 : index + 1));
  }, [runImageTransition, totalImages]);

  const goToImage = useCallback(
    (event: MouseEvent<HTMLButtonElement>, index: number) => {
      event.preventDefault();
      event.stopPropagation();
      if (index === currentImageIndex) return;
      runImageTransition();
      setCurrentImageIndex(index);
    },
    [currentImageIndex, runImageTransition],
  );

  useEffect(() => {
    return () => {
      if (imageTransitionTimeoutRef.current) {
        clearTimeout(imageTransitionTimeoutRef.current);
      }
    };
  }, []);

  const requireLoginForContact = useCallback(() => {
    if (signedInUser) return false;
    setToastMessage(tSearch("loginToContact"));
    setAuthPopupOpen(true);
    return true;
  }, [signedInUser, tSearch]);

  if (loading) {
    return <PropertyCardNewSkeleton />;
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#e7ebf1] bg-white transition duration-300 hover:-translate-y-1",
        isRtl ? "text-right" : "text-left",
        cardClassName,
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="relative h-0 w-full pb-[67%]">
          <Image
            src={safeImages[currentImageIndex] ?? safeImages[0]}
            alt={imageAlt ?? title}
            fill
            sizes={imageSizes}
            className={cn(
              "object-cover transition-[transform,opacity,filter] duration-500 group-hover:scale-[1.03]",
              isImageTransitioning ? "opacity-85 blur-[1px]" : "opacity-100 blur-0",
            )}
          />
        </div>

        <div
          className={cn(
            "absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-2.5",
            isRtl && "flex-row-reverse",
          )}
        >
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              isRtl && "justify-end",
            )}
          >
            {badges.map((badge, index) => (
              <Badge
                key={`${propertyId}-${index}`}
                variant={badge.variant ?? "default"}
                className={cn(
                  "rounded-full px-3 py-0.5 text-size-11 fw-semibold",
                  badge.className,
                )}
              >
                {badge.label}
              </Badge>
            ))}
          </div>

          <FavouriteButton
            propertyId={propertyId}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-secondary shadow-[0_10px_24px_rgba(15,23,42,0.14)] ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white"
            iconClassName="h-4 w-4"
          />
        </div>

        {canNavigateImages ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className={cn(
                "absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow-sm ring-1 ring-black/10 transition-opacity duration-200 hover:bg-white",
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
                "absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow-sm ring-1 ring-black/10 transition-opacity duration-200 hover:bg-white",
                isRtl && "right-auto left-2",
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        ) : null}

        <div className="pointer-events-none absolute bottom-4 left-3 right-3 z-10 flex items-center justify-between gap-3">
          <div className="min-w-0 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm text-size-xs fw-medium text-white">
            {agentLabel}
          </div>
          {canNavigateImages && (
            <div className="pointer-events-auto flex flex-row items-center justify-center gap-1.5 rounded-full bg-black/20 px-2 py-1.5 backdrop-blur-sm transition-all duration-300">
              {visibleDotIndices.map((index) => (
                <button
                  key={`${propertyId}-dot-${index}`}
                  type="button"
                  onClick={(event) => goToImage(event, index)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    index === currentImageIndex
                      ? "h-3 w-3 bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
                      : "bg-white/60 hover:bg-white/85",
                  )}
                  aria-current={index === currentImageIndex}
                />
              ))}
            </div>
          )}
        </div>

        {imageOverlayContent}

        <Link
          href={href}
          target={target}
          rel={rel}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${title}`}
        />
      </div>

      <div
        className={cn(
          "relative z-20 flex flex-1 flex-col p-4",
          contentClassName,
        )}
      >
        <Link
          href={href}
          target={target}
          rel={rel}
          className="block space-y-1 rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`View details for ${title}`}
        >
          <p className="text-size-lg fw-bold leading-tight tracking-tight text-slate-900 md:text-size-xl">
            {price}
          </p>
          {summaryLine ? (
            <p
              className={cn(
                "text-size-sm leading-tight tracking-tight text-[#4A5565] md:text-size-base",
                titleClassName,
              )}
            >
              {summaryLine}
            </p>
          ) : (
            <h3
              className={cn(
                "text-size-sm leading-tight tracking-tight text-[#4A5565] md:text-size-base",
                titleClassName,
              )}
            >
              {title}
            </h3>
          )}
          <div
            className={cn(
              "flex items-center gap-1.5 text-size-xs md:text-size-sm",
              isRtl && "flex-row-reverse justify-end",
            )}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </Link>

        {hasOwnerDetails ? (
          <div
            className={cn(
              "mt-4 space-y-2 text-size-xs text-[#6A7282]",
              isRtl && "text-right",
            )}
          >
            {ownerEntries.map((owner, index) => (
              <div
                key={`${propertyId}-owner-${index}`}
                className="rounded-md bg-[#F8FAFC] px-2 py-1.5"
              >
                <p className="truncate text-size-sm text-[#364153]">
                  {owner.name || "-"}
                </p>
                {owner.phone ? (
                  <p className="mt-0.5 truncate text-size-xs text-[#6A7282]">
                    {owner.phone}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (requireLoginForContact()) return;
                setEmailModalOpen(true);
              }}
              aria-label={tSearch("email")}
              className={cn(
                "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D1D5DC] bg-white py-3 text-size-sm fw-medium text-[#364153] transition hover:bg-slate-50",
                isRtl && "flex-row-reverse",
              )}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tSearch("email")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (requireLoginForContact()) return;
                setContactModalOpen(true);
              }}
              aria-label={tSearch("call")}
              className={cn(
                "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D1D5DC] bg-white py-3 text-size-sm fw-medium text-[#364153] transition hover:bg-slate-50",
                isRtl && "flex-row-reverse",
              )}
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tSearch("call")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (requireLoginForContact()) return;
                setWhatsappModalOpen(true);
              }}
              aria-label={tSearch("whatsapp")}
              className="inline-flex w-[48px] items-center justify-center rounded-lg border border-[#D1D5DC] bg-white py-3.5 text-[#364153] transition hover:bg-slate-50"
            >
              <AuthProviderLogo
                src="/svg/whatsapp_logo.svg"
                alt="WhatsApp"
                className="h-5 w-5 shrink-0"
              />
            </button>
          </div>
        </div>
      </div>

      <EmailAgentModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        listing={{ id: propertyId, title }}
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
        listing={{ id: propertyId, title, brokerName: agentLabel }}
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
        listing={{ id: propertyId, title, brokerName: agentLabel }}
        translations={{
          title: tSearch("whatsapp"),
          quoteReference: tSearch("quoteReference"),
          whenMessagingUsWhatsApp: tSearch("whenMessagingUsWhatsApp"),
          agentLabel: tSearch("agentLabel"),
          agentName: tSearch("agentName"),
        }}
        isRtl={isRtl}
      />

      <AuthPopup
        open={authPopupOpen}
        onClose={() => setAuthPopupOpen(false)}
        locale={locale}
      />

      {toastMessage ? (
        <Toast
          kind="info"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      ) : null}
    </article>
  );
}

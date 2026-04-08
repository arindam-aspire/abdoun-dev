"use client";

import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
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
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { cn } from "@/lib/cn";
import { selectCurrentUser } from "@/store/selectors";

export interface PropertyCardNewMetric {
  icon: LucideIcon;
  label: string;
}

export interface PropertyCardNewBadge {
  label: ReactNode;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "exclusive" | "verified";
  className?: string;
}

export interface PropertyCardNewProps {
  loading?: boolean;
  title: string;
  price: string;
  location: string;
  agentLabel: string;
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
  location,
  agentLabel,
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
  const totalImages = safeImages.length;
  const canNavigateImages = showImageNavigation ?? totalImages > 1;

  const goPrev = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImageIndex((index) => (index === 0 ? totalImages - 1 : index - 1));
  }, [totalImages]);

  const goNext = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImageIndex((index) => (index === totalImages - 1 ? 0 : index + 1));
  }, [totalImages]);

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
        "group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e7ebf1] bg-white transition duration-300 hover:-translate-y-1",
        isRtl ? "text-right" : "text-left",
        cardClassName,
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="relative overflow-hidden rounded-t-[22px]">
        <div className="relative h-0 w-full pb-[67%]">
          <Image
            src={safeImages[currentImageIndex] ?? safeImages[0]}
            alt={imageAlt ?? title}
            fill
            sizes={imageSizes}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div
          className={cn(
            "absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-2.5",
            isRtl && "flex-row-reverse",
          )}
        >
          <div className={cn("flex flex-wrap items-center gap-2", isRtl && "justify-end")}>
            {badges.map((badge, index) => (
              <Badge
                key={`${propertyId}-${index}`}
                variant={badge.variant ?? "default"}
                className={cn("rounded-full px-3 py-0.5 text-size-11 fw-semibold", badge.className)}
              >
                {badge.label}
              </Badge>
            ))}
          </div>

          <FavouriteButton
            propertyId={propertyId}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-secondary shadow-[0_10px_24px_rgba(15,23,42,0.14)] ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white"
            iconClassName="h-4.5 w-4.5"
          />
        </div>

        {canNavigateImages && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className={cn(
                "absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-secondary shadow-sm opacity-0 transition duration-200 group-hover:opacity-100 hover:bg-white",
                isRtl ? "right-3" : "left-3",
              )}
              aria-label="Previous image"
            >
              {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={goNext}
              className={cn(
                "absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-secondary shadow-sm opacity-0 transition duration-200 group-hover:opacity-100 hover:bg-white",
                isRtl ? "left-3" : "right-3",
              )}
              aria-label="Next image"
            >
              {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </>
        )}

        {canNavigateImages && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {safeImages.map((_, index) => (
              <span
                key={`${propertyId}-dot-${index}`}
                className={cn(
                  "h-2 w-2 rounded-full transition",
                  index === currentImageIndex ? "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]" : "bg-white/60",
                )}
                aria-hidden
              />
            ))}
          </div>
        )}

        {imageOverlayContent}

        <Link
          href={href}
          target={target}
          rel={rel}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${title}`}
        />
      </div>

      <div className={cn("relative z-20 flex flex-1 flex-col px-5 py-4 md:px-5 md:py-4", contentClassName)}>
        <Link
          href={href}
          target={target}
          rel={rel}
          className="block space-y-1 rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`View details for ${title}`}
        >
          <p className="text-size-2xs fw-medium uppercase tracking-[0.14em] text-slate-500 md:text-size-11">
            {agentLabel}
          </p>
          <h3
            className={cn(
              "text-size-sm fw-semibold leading-tight tracking-tight text-[#2843a2] md:text-size-base",
              titleClassName,
            )}
          >
            {title}
          </h3>
          <p className="text-size-lg fw-semibold leading-tight tracking-tight text-slate-900 md:text-size-xl">
            {price}
          </p>
          <div
            className={cn(
              "flex items-center gap-1.5 text-size-xs text-slate-500 md:text-size-sm",
              isRtl && "flex-row-reverse justify-end",
            )}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </Link>

        <div className="mt-4 border-t border-[#edf1f5] pt-3.5">
          {metrics.length > 0 && (
            <div
              className={cn(
                "grid grid-cols-3 gap-2 rounded-2xl bg-[#f8fafc] px-3 py-2.5 text-size-2xs fw-medium text-slate-600 md:text-size-xs",
                isRtl && "text-right",
              )}
            >
              {metrics.map((metric, index) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={`${propertyId}-metric-${index}`}
                    className={cn(
                      "flex min-w-0 items-center gap-1.5",
                      isRtl ? "flex-row-reverse justify-end" : "justify-start",
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0 text-slate-600" />
                    <span className="truncate">{metric.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (requireLoginForContact()) return;
                setEmailModalOpen(true);
              }}
              aria-label={tSearch("email")}
              className={cn(
                "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#d9e0ea] bg-white px-3 py-2 text-size-xs fw-medium text-slate-600 transition hover:bg-slate-50",
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
                "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#d9e0ea] bg-white px-3 py-2 text-size-xs fw-medium text-slate-600 transition hover:bg-slate-50",
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
              className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[#d9e0ea] bg-white px-0 py-2 text-slate-600 transition hover:bg-slate-50"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
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

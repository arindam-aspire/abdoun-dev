"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Property,
  FeaturedTranslations,
} from "@/features/public-home/components/types";
import { PropertyCard } from "@/features/public-home/components/PropertyCard";

export interface ExclusivePropertiesSectionProps {
  translations: FeaturedTranslations;
  properties: Property[];
  isRtl?: boolean;
  useCarouselOnOverflow?: boolean;
  loading?: boolean;
  error?: string | null;
}

export function ExclusivePropertiesSection({
  translations: t,
  properties,
  isRtl,
  useCarouselOnOverflow = false,
  loading = false,
  error = null,
}: ExclusivePropertiesSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const displayedProperties = properties;
  const showSkeletonState = loading || Boolean(error);

  const shouldUseCarousel =
    useCarouselOnOverflow && displayedProperties.length > 4;

  useEffect(() => {
    if (!shouldUseCarousel) return;

    const node = scrollRef.current;
    if (!node) return;

    const updateButtons = () => {
      const firstCard = node.firstElementChild as HTMLElement | null;
      const lastCard = node.lastElementChild as HTMLElement | null;

      if (!firstCard || !lastCard) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }

      const containerRect = node.getBoundingClientRect();
      const firstRect = firstCard.getBoundingClientRect();
      const lastRect = lastCard.getBoundingClientRect();
      const threshold = 4;

      if (isRtl) {
        setCanScrollPrev(firstRect.right > containerRect.right + threshold);
        setCanScrollNext(lastRect.left < containerRect.left - threshold);
      } else {
        setCanScrollPrev(firstRect.left < containerRect.left - threshold);
        setCanScrollNext(lastRect.right > containerRect.right + threshold);
      }
    };

    updateButtons();
    node.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      node.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [isRtl, shouldUseCarousel]);

  const scrollByPage = (direction: "prev" | "next") => {
    const node = scrollRef.current;
    if (!node) return;

    const cards = Array.from(node.children) as HTMLElement[];
    if (cards.length === 0) return;

    const containerRect = node.getBoundingClientRect();
    const threshold = 4;

    let target: HTMLElement | null = null;

    if (isRtl) {
      if (direction === "next") {
        for (let i = cards.length - 1; i >= 0; i -= 1) {
          if (
            cards[i].getBoundingClientRect().left <
            containerRect.left - threshold
          ) {
            target = cards[i];
            break;
          }
        }
      } else {
        for (let i = 0; i < cards.length; i += 1) {
          if (
            cards[i].getBoundingClientRect().right >
            containerRect.right + threshold
          ) {
            target = cards[i];
            break;
          }
        }
      }
    } else if (direction === "next") {
      for (let i = 0; i < cards.length; i += 1) {
        if (
          cards[i].getBoundingClientRect().right >
          containerRect.right + threshold
        ) {
          target = cards[i];
          break;
        }
      }
    } else {
      for (let i = cards.length - 1; i >= 0; i -= 1) {
        if (
          cards[i].getBoundingClientRect().left <
          containerRect.left - threshold
        ) {
          target = cards[i];
          break;
        }
      }
    }

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      return;
    }

    const fallbackAmount = node.clientWidth * 0.9;
    node.scrollBy({
      left: direction === "next" ? fallbackAmount : -fallbackAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-14 md:px-8 md:py-18">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
          <div className={isRtl ? "md:text-right" : ""}>
            <header className="space-y-4">
              <div className="text-xl font-bold tracking-tight text-[#2843a2] md:text-3xl">
                {t.title}
              </div>
              <div className="text-lg font-medium leading-tight tracking-tight text-slate-900 md:text-3xl">
                {t.subtitle}
              </div>
            </header>
          </div>
          <div
            className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {t.viewAllHref != null ? (
              <Link
                href={t.viewAllHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#355777] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                {t.viewAll}
              </Link>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#355777] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                {t.viewAll}
              </button>
            )}
          </div>
        </div>

        {showSkeletonState ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <PropertyCard key={`exclusive-property-skeleton-${index}`} loading />
            ))}
          </div>
        ) : shouldUseCarousel ? (
          <div className="relative">
            {canScrollPrev && (
              <button
                type="button"
                aria-label="Previous properties"
                onClick={() => scrollByPage("prev")}
                className={`cursor-pointer absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_28px_rgba(15,23,42,0.14)] transition hover:bg-slate-50 lg:inline-flex ${
                  isRtl ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                }`}
              >
                {isRtl ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            )}
            {canScrollNext && (
              <button
                type="button"
                aria-label="Next properties"
                onClick={() => scrollByPage("next")}
                className={`cursor-pointer absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_28px_rgba(15,23,42,0.14)] transition hover:bg-slate-50 lg:inline-flex ${
                  isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
                }`}
              >
                {isRtl ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:h-0"
            >
              {displayedProperties.map((property) => (
                <div
                  key={property.id}
                  className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[62%] lg:basis-[calc((100%-4.5rem)/4.2)]"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!showSkeletonState && displayedProperties.length === 0 && (
          <p
            className={`mt-4 text-sm text-zinc-500 ${isRtl ? "text-right" : "text-left"}`}
          >
            No exclusive properties found.
          </p>
        )}
      </div>
    </section>
  );
}

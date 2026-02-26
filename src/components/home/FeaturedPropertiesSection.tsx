"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "./types";
import type { FeaturedTranslations } from "./types";
import { PropertyCard } from "./PropertyCard";

export interface FeaturedPropertiesSectionProps {
  translations: FeaturedTranslations;
  properties: Property[];
  isRtl?: boolean;
  useCarouselOnOverflow?: boolean;
}

export function FeaturedPropertiesSection({
  translations: t,
  properties,
  isRtl,
  useCarouselOnOverflow = false,
}: FeaturedPropertiesSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const shouldUseCarousel = useCarouselOnOverflow && properties.length > 3;

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
          if (cards[i].getBoundingClientRect().left < containerRect.left - threshold) {
            target = cards[i];
            break;
          }
        }
      } else {
        for (let i = 0; i < cards.length; i += 1) {
          if (cards[i].getBoundingClientRect().right > containerRect.right + threshold) {
            target = cards[i];
            break;
          }
        }
      }
    } else if (direction === "next") {
      for (let i = 0; i < cards.length; i += 1) {
        if (cards[i].getBoundingClientRect().right > containerRect.right + threshold) {
          target = cards[i];
          break;
        }
      }
    } else {
      for (let i = cards.length - 1; i >= 0; i -= 1) {
        if (cards[i].getBoundingClientRect().left < containerRect.left - threshold) {
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
    <section className="bg-surface" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
        <div
          className={`mb-6 flex flex-col items-start justify-between gap-4 md:mb-8 md:flex-row md:items-end`}
        >
          <div className={isRtl ? "md:text-right" : ""}>
            <p className="text-size-xs fw-semibold uppercase tracking-[0.18em] text-primary">
              {t.title}
            </p>
            <h2 className="mt-2 text-size-xl fw-semibold text-secondary md:text-size-2xl">
              {t.subtitle}
            </h2>
          </div>
          <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            {t.viewAllHref != null ? (
              <Link
                href={t.viewAllHref}
                className="text-size-sm fw-semibold text-primary hover:text-secondary"
              >
                {t.viewAll}
              </Link>
            ) : (
              <button
                type="button"
                className="text-size-sm fw-semibold text-primary hover:text-secondary"
              >
                {t.viewAll}
              </button>
            )}
          </div>
        </div>

        {shouldUseCarousel ? (
          <div className="relative">
            {canScrollPrev && (
              <div
                className={`pointer-events-none absolute inset-y-0 z-10 hidden w-20 md:block ${
                  isRtl
                    ? "right-0 bg-gradient-to-l from-surface to-transparent"
                    : "left-0 bg-gradient-to-r from-surface to-transparent"
                }`}
              />
            )}
            {canScrollNext && (
              <div
                className={`pointer-events-none absolute inset-y-0 z-10 hidden w-20 md:block ${
                  isRtl
                    ? "left-0 bg-gradient-to-r from-surface to-transparent"
                    : "right-0 bg-gradient-to-l from-surface to-transparent"
                }`}
              />
            )}

            {canScrollPrev && (
              <button
                type="button"
                aria-label="Previous properties"
                onClick={() => scrollByPage("prev")}
                className={`cursor-pointer absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-subtle bg-white text-secondary shadow-md transition hover:bg-surface md:inline-flex ${
                  isRtl ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                }`}
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
            {canScrollNext && (
              <button
                type="button"
                aria-label="Next properties"
                onClick={() => scrollByPage("next")}
                className={`cursor-pointer absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-subtle bg-white text-secondary shadow-md transition hover:bg-surface md:inline-flex ${
                  isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
                }`}
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:h-0"
            >
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[62%] md:basis-[calc((100%-3rem)/3.2)]"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}




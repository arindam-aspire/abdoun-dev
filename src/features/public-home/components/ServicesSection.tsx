"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ServicesTranslations } from "@/features/public-home/components/types";
import { ServiceCard } from "@/features/public-home/components/ServiceCard";

export interface ServicesSectionProps {
  translations: ServicesTranslations;
  ctaLabel?: string;
  ctaHref?: string;
  isRtl?: boolean;
}

export function ServicesSection({
  translations: t,
  ctaLabel,
  ctaHref,
  isRtl,
}: ServicesSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const shouldUseCarousel = t.cards.length > 3;

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
  }, [isRtl, shouldUseCarousel, t.cards.length]);

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
    <section id="services" className="bg-white container mx-auto px-4 py-16 md:px-8 md:py-20">
        <header
          className={cn(
            "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
            isRtl && "md:flex-row-reverse",
          )}
        >
          <div className={cn(isRtl ? "md:text-right" : "md:text-left")}>
            <header className="space-y-4">
              <div className="text-xl font-bold tracking-tight text-[#2843a2] md:text-3xl">
                {t.title}
              </div>
              <div className="text-lg font-medium leading-tight tracking-tight text-slate-900 md:text-3xl">
                {t.subtitle}
              </div>
            </header>
          </div>

          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#355777] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              {ctaLabel}
              <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
            </Link>
          ) : null}
        </header>

        <div className="relative mt-14">
          {shouldUseCarousel ? (
            <>
              {canScrollPrev ? (
                <button
                  type="button"
                  onClick={() => scrollByPage("prev")}
                  className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.14)] lg:inline-flex"
                  aria-label="Previous services"
                >
                  {isRtl ? (
                    <ArrowRight className="h-5 w-5" />
                  ) : (
                    <ArrowLeft className="h-5 w-5" />
                  )}
                </button>
              ) : null}

              {canScrollNext ? (
                <button
                  type="button"
                  onClick={() => scrollByPage("next")}
                  className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.14)] lg:inline-flex"
                  aria-label="Next services"
                >
                  {isRtl ? (
                    <ArrowLeft className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </button>
              ) : null}

              <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-7 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:h-0"
              >
                {t.cards.map((card) => (
                  <div
                    key={card.id}
                    className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[62%] md:basis-[calc((100%-3.5rem)/3.2)]"
                  >
                    <ServiceCard item={card} isRtl={isRtl} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid gap-7 md:grid-cols-3">
              {t.cards.map((card) => (
                <ServiceCard key={card.id} item={card} isRtl={isRtl} />
              ))}
            </div>
          )}
        </div>
    </section>
  );
}

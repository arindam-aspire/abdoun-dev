"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AboutPreviewSectionProps {
  title: string;
  subtitle?: string;
  content: string;
  stats?: Array<{ value: string; label: string }>;
  imageSrc?: string;
  imageAlt?: string;
  seeMoreLabel?: string;
  seeMoreHref?: string;
  isRtl?: boolean;
}

export function AboutPreviewSection({
  title,
  subtitle,
  content,
  stats = [],
  imageSrc = "/slider-1.jpg",
  imageAlt = "About Abdoun Real Estate",
  seeMoreLabel,
  seeMoreHref,
  isRtl,
}: AboutPreviewSectionProps) {
  return (
    <section className="bg-white container mx-auto px-4 py-14 md:px-8 md:py-18">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14",
            isRtl && "lg:grid-cols-[1.05fr_1fr]",
          )}
        >
          <div className={cn("space-y-7", isRtl && "lg:order-2 lg:text-right")}>
            <header className="space-y-4">
              <div className="text-xl font-bold tracking-tight text-[#2843a2] md:text-3xl">
                {title}
              </div>
              <div className="text-lg font-medium leading-tight tracking-tight text-slate-900 md:text-3xl">
                {subtitle}
              </div>
            </header>

            <p
              className={cn(
                "max-w-3xl text-sm leading-7 text-slate-600 md:text-lg",
                isRtl ? "text-right" : "text-left",
              )}
            >
              {content}
            </p>

            {stats.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className={cn("space-y-2", isRtl && "sm:text-right")}
                  >
                    <p className="text-xl font-bold tracking-tight text-[#2843a2] md:text-3xl">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-600 md:text-lg">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {seeMoreLabel && seeMoreHref ? (
              <Link
                href={seeMoreHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#355777] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                {seeMoreLabel}
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Link>
            ) : null}
          </div>

          <div className={cn("relative", isRtl && "lg:order-1")}>
            <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-[1.75rem] bg-[#f4dc75] lg:block" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={900}
                height={820}
                className="h-full min-h-[380px] w-full object-cover"
              />
            </div>
          </div>
      </div>
    </section>
  );
}

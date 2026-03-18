"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroTabKey } from "./types";
import type { HeroTranslations } from "./types";
import { HeroCategoryTabs, type HeroCategoryTabKey } from "./HeroCategoryTabs";
import { HeroSearchCard } from "./HeroSearchCard";

export interface HeroSectionProps {
  translations: HeroTranslations;
  isRtl: boolean;
}

export function HeroSection({ translations: t, isRtl }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<HeroTabKey>("buy");
  const [activeCategoryTab, setActiveCategoryTab] =
    useState<HeroCategoryTabKey>("realEstate");

  return (
    <section
      className="relative min-h-[420px] overflow-x-clip bg-secondary text-white md:min-h-[480px]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 z-0 min-h-[420px] md:min-h-[480px]">
        <Image
          // src="/hero-amman.png"
          src="/slider-1.jpg"
          alt="Amman city skyline"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] opacity-40 mix-blend-screen">
        <div
          className={`absolute top-24 h-80 w-80 rounded-full bg-[rgba(43,91,166,0.35)] blur-3xl ${
            isRtl ? "-right-20" : "-left-20"
          }`}
        />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[rgba(253,185,19,0.2)] blur-3xl" />
      </div>

      <div
        className={`relative z-10 mx-auto flex max-w-5xl flex-col px-4 pb-20 pt-16 md:px-6 md:pb-24 md:pt-20 ${
          isRtl ? "items-end text-right" : "items-center text-center"
        }`}
      >
        <div className="space-y-4 md:space-y-5">
          <h1 className="text-balance text-size-3xl fw-semibold leading-tight tracking-tight sm:text-size-4xl md:text-size-5xl">
            {t.title}
          </h1>
        </div>

        <div className="mt-8 w-full">
          <HeroCategoryTabs
            activeTab={activeCategoryTab}
            onTabChange={setActiveCategoryTab}
            labels={t.categoryTabs}
            isRtl={isRtl}
          />
        </div>

        <HeroSearchCard
          translations={t}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCategoryTab={activeCategoryTab}
          isRtl={isRtl}
        />
      </div>
    </section>
  );
}


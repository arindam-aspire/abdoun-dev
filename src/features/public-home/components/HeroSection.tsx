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

const HERO_OVERLAY_GRADIENT =
  "linear-gradient(180deg, rgba(18, 32, 88, 0.14) 0%, rgba(11, 28, 82, 0.32) 42%, rgba(8, 16, 42, 0.62) 100%)";

export function HeroSection({ translations: t, isRtl }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<HeroTabKey>("buy");
  const [activeCategoryTab, setActiveCategoryTab] =
    useState<HeroCategoryTabKey>("realEstate");

  return (
    <section
      className="relative flex min-h-[650px] w-full min-w-0 max-w-full flex-col overflow-hidden bg-secondary text-white md:min-h-[750px] lg:min-h-screen"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 z-0 min-w-0 overflow-hidden">
        <div className="relative size-full min-h-full min-w-0">
          <Image
            src="/Hero_Background.png"
            alt="Hero background"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[70%_center] md:object-center"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-0 z-[1] min-w-0"
        style={{ backgroundImage: HERO_OVERLAY_GRADIENT }}
      />

      <div
        className={`relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col justify-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-14 md:gap-12 md:px-8 md:py-16 lg:gap-14 lg:py-20 ${
          isRtl ? "items-end text-right" : "items-center text-center"
        }`}
      >
        <div className="w-full min-w-0 max-w-5xl space-y-3">
          <h1 className="text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:text-5xl lg:text-6xl">
            {t.title}
          </h1>
        </div>

        <div className="w-full min-w-0">
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

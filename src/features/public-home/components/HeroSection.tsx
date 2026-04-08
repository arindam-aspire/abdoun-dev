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
      className="relative min-h-[560px] overflow-x-clip bg-secondary text-white md:min-h-[700px]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/Hero_Background.png"
          alt="Hero background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(24,49,142,0.08)_0%,rgba(11,28,82,0.22)_52%,rgba(10,19,47,0.46)_100%)]" />

      <div
        className={`relative z-10 mx-auto flex max-w-6xl flex-col px-4 pb-16 pt-24 md:px-6 md:pb-24 md:pt-32 ${
          isRtl ? "items-end text-right" : "items-center text-center"
        }`}
      >
        <div className="max-w-5xl space-y-3">
          <h1 className="text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:text-5xl">
            {t.title}
          </h1>
        </div>

        <div className="mt-14 w-full">
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


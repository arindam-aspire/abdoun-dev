"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroTabKey } from "./types";
import type { HeroTranslations } from "./types";
import { HeroSearchCard } from "./HeroSearchCard";

export interface HeroSectionProps {
  translations: HeroTranslations;
  isRtl: boolean;
}

export function HeroSection({ translations: t, isRtl }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<HeroTabKey>("buy");

  return (
    <section className="relative min-h-[420px] bg-slate-900 text-white md:min-h-[480px]">
      <div className="pointer-events-none absolute inset-0 z-0 min-h-[420px] md:min-h-[480px]">
        <Image
          src="https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury villa at sunset"
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] opacity-40 mix-blend-screen">
        <div className="absolute -left-20 top-24 h-80 w-80 rounded-full bg-sky-400/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>

      <div
        className={`relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-20 pt-16 md:px-6 md:pb-24 md:pt-20 ${
          isRtl ? "text-right" : "text-center"
        }`}
      >
        <div className="space-y-4 md:space-y-5">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {t.title}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
            {t.subtitle}
          </p>
        </div>

        <HeroSearchCard
          translations={t}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isRtl={isRtl}
        />
      </div>
    </section>
  );
}

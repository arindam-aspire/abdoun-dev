"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Play,
  Eye,
  Lightbulb,
  Ribbon,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface StatData {
  target: number;
  suffix: string;
  separator?: boolean;
}

interface DisplayStat {
  icon: LucideIcon;
  value: string;
  label: string;
  iconClassName: string;
  iconBoxClassName: string;
}

interface ValueCard {
  key: "trust" | "innovation" | "transparency" | "excellence";
  icon: LucideIcon;
  iconClassName: string;
  iconBoxClassName: string;
}

const DURATION_MS = 2000;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function formatNumber(value: number, useSeparator: boolean) {
  if (!useSeparator) return String(value);
  return value.toLocaleString("en-US");
}

function useCountUp(stats: StatData[]) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [values, setValues] = useState<string[]>(stats.map(() => "0"));
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased = easeOutQuart(progress);

      setValues(
        stats.map((stat) => {
          const current = Math.round(eased * stat.target);
          return `${formatNumber(current, !!stat.separator)}${stat.suffix}`;
        }),
      );

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [stats]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animate]);

  return { ref, values };
}

const STATS: StatData[] = [
  { target: 500, suffix: "+" },
  { target: 15, suffix: "+" },
  { target: 1200, suffix: "+", separator: true },
  { target: 8, suffix: "" },
];

const VALUE_CARDS: ValueCard[] = [
  {
    key: "trust",
    icon: ShieldCheck,
    iconClassName: "text-sky-500",
    iconBoxClassName: "bg-gradient-to-br from-sky-500 to-cyan-400 shadow-[0_12px_28px_rgba(14,165,233,0.3)]",
  },
  {
    key: "innovation",
    icon: Lightbulb,
    iconClassName: "text-amber-500",
    iconBoxClassName: "bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_12px_28px_rgba(245,158,11,0.3)]",
  },
  {
    key: "transparency",
    icon: Eye,
    iconClassName: "text-fuchsia-500",
    iconBoxClassName: "bg-gradient-to-br from-violet-500 to-pink-500 shadow-[0_12px_28px_rgba(168,85,247,0.3)]",
  },
  {
    key: "excellence",
    icon: Star,
    iconClassName: "text-emerald-500",
    iconBoxClassName: "bg-gradient-to-br from-emerald-500 to-green-400 shadow-[0_12px_28px_rgba(16,185,129,0.3)]",
  },
];

const MISSION_VISION_CARDS = [
  {
    kind: "mission" as const,
    icon: Target,
    topBorder: "bg-[#f8cf35]",
    iconBoxClassName: "bg-gradient-to-br from-[#456f95] to-[#32597d]",
  },
  {
    kind: "vision" as const,
    icon: Eye,
    topBorder: "bg-[#34577a]",
    iconBoxClassName: "bg-gradient-to-br from-[#a855f7] to-[#4f46e5]",
  },
];

export interface AboutMainProps {
  language: AppLocale;
}

export function AboutMain({ language }: AboutMainProps) {
  const t = useTranslations("aboutUsPage");
  const isRtl = language === "ar";
  const { ref: statsRef, values: statValues } = useCountUp(STATS);

  const displayStats: DisplayStat[] = [
    {
      icon: Building2,
      value: statValues[0] ?? "500+",
      label: t("stats.propertiesSold"),
      iconClassName: "text-blue-500",
      iconBoxClassName: "bg-gradient-to-br from-blue-500 to-blue-400 shadow-[0_10px_24px_rgba(37,99,235,0.25)]",
    },
    {
      icon: Calendar,
      value: statValues[1] ?? "15+",
      label: t("stats.yearsExperience"),
      iconClassName: "text-violet-500",
      iconBoxClassName: "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_10px_24px_rgba(139,92,246,0.25)]",
    },
    {
      icon: Users,
      value: statValues[2] ?? "1,200+",
      label: t("stats.happyClients"),
      iconClassName: "text-emerald-500",
      iconBoxClassName: "bg-gradient-to-br from-emerald-500 to-green-400 shadow-[0_10px_24px_rgba(16,185,129,0.25)]",
    },
    {
      icon: Award,
      value: statValues[3] ?? "8",
      label: t("stats.awardsWon"),
      iconClassName: "text-amber-500",
      iconBoxClassName: "bg-gradient-to-br from-amber-500 to-yellow-400 shadow-[0_10px_24px_rgba(245,158,11,0.25)]",
    },
  ];

  return (
    <main className="bg-[#f8fafc]" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#355777_0%,#436b93_100%)] px-4 pb-14 pt-14 text-white md:px-8 md:pb-16 md:pt-18">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,215,64,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-white/14 px-4 py-1 text-size-2xs fw-semibold uppercase tracking-[0.28em] text-[#f3d560]">
              Established 2010
            </span>
           <h1 className="text-balance text-size-4xl fw-bold leading-[1.08] tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:text-size-5xl">
              {t("heroTitle")}
            </h1>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[radial-gradient(circle,rgba(248,207,53,1)_0%,rgba(248,207,53,0.25)_72%,transparent_100%)]" />
            <p className="mx-auto mt-6 max-w-2xl text-size-base text-white/78 md:text-size-lg">
              {t("heroSubtitle")}
            </p>
          </div>

          <div
            ref={statsRef}
            className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {displayStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-[14px] bg-white px-6 py-6 text-center text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                >
                  <div
                    className={cn(
                      "mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white",
                      stat.iconBoxClassName,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-size-xl fw-bold leading-none tracking-tight text-slate-900 md:text-size-3xl">
                    {stat.value}
                  </div>
                  <p className="mt-2 text-size-sm text-slate-600">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div
          className={cn(
            "mx-auto grid  items-center gap-10 lg:grid-cols-[1fr_1.05fr]",
            isRtl && "lg:grid-cols-[1.05fr_1fr]",
          )}
        >
          <div className={cn("space-y-6", isRtl && "lg:order-2 lg:text-right")}>
            <header className="space-y-4">
              <span className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-size-11 fw-semibold uppercase tracking-[0.26em] text-[#355777]">
                {t("storyLabel")}
              </span>
              <h2 className="max-w-xl text-size-2xl fw-semibold tracking-tight text-slate-900 md:text-size-3xl">
                Rooted in Amman,
                <span className="block text-[#4b7297]">Reaching Beyond</span>
              </h2>
            </header>

            <div className="max-w-xl border-l-4 border-[#f8cf35] pl-4 text-size-base text-slate-600 md:text-size-lg">
              {t("storyP1")}
            </div>

            <div className="max-w-2xl space-y-5 text-size-base text-slate-600 md:text-size-lg">
              <p>{t("storyP2")}</p>
              <p>
                Whether you&apos;re a first-time buyer, seasoned investor, or looking
                to rent your dream home, our team of dedicated professionals is here
                to guide you every step of the way.
              </p>
            </div>

            <div className={cn("flex flex-wrap items-center gap-4 pt-2", isRtl && "flex-row-reverse")}>
              <Link
                href={`/${language}/search-result`}
                className="inline-flex items-center gap-2 rounded-[14px] bg-[#355777] px-6 py-4 text-size-sm fw-semibold text-white shadow-[0_12px_28px_rgba(53,87,119,0.22)] transition hover:brightness-95"
              >
                Learn More
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Link>
              <Link
                href={`/${language}/team`}
                className="inline-flex items-center gap-3 text-size-sm fw-semibold text-[#355777] transition hover:text-[#27435f]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffd447] text-slate-900 shadow-[0_10px_24px_rgba(248,207,53,0.28)]">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                Watch Our Story
              </Link>
            </div>
          </div>

          <div className={cn("relative", isRtl && "lg:order-1")}>
            <div className="relative overflow-hidden rounded-[28px] bg-slate-200 shadow-[0_26px_60px_rgba(15,23,42,0.16)]">
              <Image
                src="/about_us_page.png"
                alt="Abdoun Real Estate overview"
                width={960}
                height={720}
                className="h-full min-h-[300px] w-full object-cover"
              />
            </div>

            <div
              className={cn(
                "absolute -bottom-5 left-5 flex items-center gap-4 rounded-[18px] bg-white px-6 py-5 shadow-[0_16px_34px_rgba(15,23,42,0.14)]",
                isRtl && "left-auto right-5 flex-row-reverse",
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)]">
                <Ribbon className="h-5 w-5" />
              </div>
              <div className={cn("leading-tight", isRtl && "text-right")}>
                <div className="text-size-xl fw-bold tracking-tight text-slate-900 md:text-size-3xl">
                  98%
                </div>
                <div className="mt-1 text-size-sm text-slate-600 md:text-size-lg">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto grid  gap-5 lg:grid-cols-2">
          {MISSION_VISION_CARDS.map((card) => {
            const Icon = card.icon;
            const label = card.kind === "mission" ? t("missionLabel") : t("visionLabel");
            const title = card.kind === "mission" ? "Empowering Your Future" : "Leading the Future";
            const body = card.kind === "mission" ? t("missionText") : t("visionText");

            return (
              <article
                key={card.kind}
                className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-8 py-7 shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
              >
                <div className={cn("absolute inset-x-0 top-0 h-1.5", card.topBorder)} />
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)]",
                    card.iconBoxClassName,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <p className="text-size-11 fw-semibold uppercase tracking-[0.28em] text-[#355777]">
                    {label}
                  </p>
                  <h3 className="mt-2 text-size-xl fw-semibold leading-tight tracking-tight text-slate-900 md:text-size-3xl">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-xl text-size-base text-slate-600 md:text-size-lg">
                    {body}
                  </p>
                  <Link
                    href={`/${language}/team`}
                    className="mt-6 inline-flex items-center gap-2 text-size-sm fw-semibold text-[#355777] transition hover:text-[#27435f]"
                  >
                    Discover More
                    <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-slate-100 px-5 py-1.5 text-size-11 fw-semibold uppercase tracking-[0.28em] text-[#355777]">
              {t("valuesLabel")}
            </span>
            <h2 className="mx-auto mt-6 max-w-4xl text-size-2xl fw-semibold tracking-tight text-slate-900 md:text-size-3xl">
              {t("valuesTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-size-base text-slate-600 md:text-size-lg">
              The principles that guide our every decision and interaction
            </p>
            <div className="mt-8 inline-flex items-center gap-3 text-size-sm text-slate-500">
              <ArrowRight className={cn("h-4 w-4", isRtl ? "" : "rotate-180")} />
              <span>Scroll to explore all values</span>
              <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {VALUE_CARDS.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.key}
                  className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.1)]"
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl text-white",
                      card.iconBoxClassName,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-size-xl fw-semibold tracking-tight text-slate-900 md:text-size-3xl">
                    {t(`values.${card.key}.title`)}
                  </h3>
                  <p className="mt-4 text-size-base text-slate-600 md:text-size-lg">
                    {t(`values.${card.key}.text`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#355777_0%,#436b93_100%)] px-4 py-18 text-white md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-size-2xl fw-bold tracking-tight md:text-size-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-size-base text-white/82 md:text-size-lg">
            Let our experienced team guide you through every step of your real
            estate journey in Jordan
          </p>

          <div className={cn("mt-10 flex flex-wrap items-center justify-center gap-4", isRtl && "flex-row-reverse")}>
            <Link
              href={`/${language}/search-result`}
              className="inline-flex min-w-[210px] items-center justify-center gap-3 rounded-[14px] bg-[#ffd447] px-7 py-4 text-size-base fw-semibold text-slate-900 shadow-[0_16px_34px_rgba(0,0,0,0.16)] transition hover:brightness-95"
            >
              Browse Properties
              <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
            </Link>
            <Link
              href={`/${language}/team`}
              className="inline-flex min-w-[210px] items-center justify-center gap-3 rounded-[14px] border border-white/80 bg-white/6 px-7 py-4 text-size-base fw-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Contact Our Team
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

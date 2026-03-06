"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import {
  Building2,
  Calendar,
  Users,
  Award,
  Target,
  Eye,
  ShieldCheck,
  Lightbulb,
  Search,
  Star,
  Heart,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import styles from "./AboutMain.module.css";

/* ─── Count-up animation hook ─── */
interface StatData {
  target: number;
  suffix: string;
  separator?: boolean;
}

const DURATION_MS = 2000;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function formatNumber(n: number, useSeparator: boolean): string {
  if (!useSeparator) return String(n);
  return n.toLocaleString("en-US");
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
        stats.map((s) => {
          const current = Math.round(eased * s.target);
          return formatNumber(current, !!s.separator) + s.suffix;
        }),
      );
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [stats]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return { ref, values };
}

const VALUE_ICONS: Record<string, React.ReactNode> = {
  trust: <ShieldCheck className="h-5 w-5" />,
  innovation: <Lightbulb className="h-5 w-5" />,
  transparency: <Search className="h-5 w-5" />,
  excellence: <Star className="h-5 w-5" />,
  integrity: <CheckCircle2 className="h-5 w-5" />,
  community: <Heart className="h-5 w-5" />,
};

const STAT_ICONS = [
  <Building2 key="b" className="h-6 w-6" />,
  <Calendar key="c" className="h-6 w-6" />,
  <Users key="u" className="h-6 w-6" />,
  <Award key="a" className="h-6 w-6" />,
];
const STATS: StatData[] = [
  { target: 500, suffix: "+" },
  { target: 15, suffix: "+" },
  { target: 1200, suffix: "+", separator: true },
  { target: 8, suffix: "" },
];
const VALUE_KEYS = ["trust", "innovation", "transparency", "excellence", "integrity", "community"] as const;

export interface AboutMainProps {
  language: AppLocale;
}

export function AboutMain({ language }: AboutMainProps) {
  const t = useTranslations("aboutUsPage");
  const isRtl = language === "ar";
  const { ref: statsRef, values: statValues } = useCountUp(STATS);

  return (
    <>
      {/* ═══ Hero Banner ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className="text-size-4xl fw-bold text-white md:text-size-5xl">
            {t("heroTitle")}
          </h1>
          <span className={styles.heroAccent} />
          <p className="mt-4 text-size-base text-white/80 md:text-size-lg">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* ═══ Stats Row ═══ */}
      <div className={styles.statsRow} ref={statsRef}>
        {STATS.map((_, i) => {
          const labelKeys = ["stats.propertiesSold", "stats.yearsExperience", "stats.happyClients", "stats.awardsWon"] as const;
          return (
            <div key={i} className={styles.statCard}>
              <div className={styles.statIcon}>{STAT_ICONS[i]}</div>
              <div className={styles.statNumber}>{statValues[i]}</div>
              <div className={styles.statLabel}>{t(labelKeys[i])}</div>
            </div>
          );
        })}
      </div>

      {/* ═══ Our Story ═══ */}
      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div className={isRtl ? "order-last md:order-first" : ""}>
            <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-3">
              {t("storyLabel")}
            </p>
            <h2 className="text-size-2xl fw-semibold text-secondary md:text-size-3xl leading-tight">
              {t("storyTitle")}
            </h2>
            <p className="mt-5 text-size-sm leading-relaxed text-[rgba(51,51,51,0.8)] md:text-size-base">
              {t("storyP1")}
            </p>
            <p className="mt-4 text-size-sm leading-relaxed text-[rgba(51,51,51,0.8)] md:text-size-base">
              {t("storyP2")}
            </p>
          </div>
          <div className={styles.storyImage}>
            {/* Decorative SVG pattern placeholder — represents Amman skyline */}
            <div className={styles.storyImagePattern}>
              <svg viewBox="0 0 400 300" fill="currentColor" className="text-white">
                <rect x="20" y="120" width="40" height="160" rx="4" />
                <rect x="70" y="80" width="35" height="200" rx="4" />
                <rect x="115" y="140" width="30" height="140" rx="4" />
                <rect x="155" y="60" width="45" height="220" rx="4" />
                <rect x="210" y="100" width="38" height="180" rx="4" />
                <rect x="258" y="50" width="42" height="230" rx="4" />
                <rect x="310" y="90" width="35" height="190" rx="4" />
                <rect x="355" y="130" width="30" height="150" rx="4" />
                {/* Dome/minaret accent */}
                <circle cx="177" cy="55" r="12" />
                <rect x="175" y="30" width="4" height="25" rx="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Mission & Vision ═══ */}
      <section className={`${styles.mvSection} ${styles.sectionPad}`}>
        <div className="container mx-auto">
          <div className={styles.mvGrid}>
            {/* Mission */}
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}>
                <Target className="h-6 w-6" />
              </div>
              <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-2">
                {t("missionLabel")}
              </p>
              <h3 className="text-size-xl fw-semibold text-secondary mb-3">
                {t("missionTitle")}
              </h3>
              <p className="text-size-sm leading-relaxed text-[rgba(51,51,51,0.8)]">
                {t("missionText")}
              </p>
            </div>
            {/* Vision */}
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}>
                <Eye className="h-6 w-6" />
              </div>
              <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-2">
                {t("visionLabel")}
              </p>
              <h3 className="text-size-xl fw-semibold text-secondary mb-3">
                {t("visionTitle")}
              </h3>
              <p className="text-size-sm leading-relaxed text-[rgba(51,51,51,0.8)]">
                {t("visionText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Core Values ═══ */}
      <section className={styles.sectionPad}>
        <div className="container mx-auto">
          <div className={`text-center mb-12 ${isRtl ? "md:text-right" : "md:text-left"}`}>
            <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-3">
              {t("valuesLabel")}
            </p>
            <h2 className="text-size-2xl fw-semibold text-secondary md:text-size-3xl leading-tight">
              {t("valuesTitle")}
            </h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUE_KEYS.map((key) => (
              <div key={key} className={styles.valueCard}>
                <div className={styles.valueIcon}>{VALUE_ICONS[key]}</div>
                <h4 className="text-size-base fw-semibold text-secondary mb-2">
                  {t(`values.${key}.title`)}
                </h4>
                <p className="text-size-sm leading-relaxed text-[rgba(51,51,51,0.7)]">
                  {t(`values.${key}.text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className="text-size-2xl fw-bold text-white md:text-size-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-3 text-size-base text-white/80">
            {t("ctaSubtitle")}
          </p>
          <Link href={`/${language}/search-result`} className={styles.ctaButton}>
            {t("ctaButton")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

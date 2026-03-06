"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { Phone, Mail, Linkedin, UserCircle2, ArrowRight } from "lucide-react";
import styles from "./TeamMain.module.css";

const MEMBER_KEYS = ["agent1", "agent2", "agent3", "agent4", "agent5", "agent6"] as const;
const AVATAR_BG = [styles.avatarBg1, styles.avatarBg2, styles.avatarBg3, styles.avatarBg4, styles.avatarBg5, styles.avatarBg6];

export interface TeamMainProps {
  language: AppLocale;
}

export function TeamMain({ language }: TeamMainProps) {
  const t = useTranslations("ourTeamPage");
  const isRtl = language === "ar";

  /** Extract first letter of a translated name for the avatar. */
  function getInitials(nameKey: string): string {
    const name = t(nameKey as Parameters<typeof t>[0]);
    return typeof name === "string" ? name.charAt(0).toUpperCase() : "?";
  }

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

      {/* ═══ Intro ═══ */}
      <section className={`${styles.introSection} ${styles.sectionPad}`}>
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-3">
            {t("introLabel")}
          </p>
          <p className="text-size-base leading-relaxed text-[rgba(51,51,51,0.8)] md:text-size-lg">
            {t("introText")}
          </p>
        </div>
      </section>

      {/* ═══ Leadership ═══ */}
      <section className={styles.sectionPad}>
        <div className="container mx-auto">
          <div className={`text-center mb-12 ${isRtl ? "md:text-right" : "md:text-left"}`}>
            <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-3">
              {t("leadershipLabel")}
            </p>
            <h2 className="text-size-2xl fw-semibold text-secondary md:text-size-3xl leading-tight">
              {t("leadershipTitle")}
            </h2>
          </div>

          <div className={styles.leadershipGrid}>
            {/* CEO */}
            <div className={styles.leaderCard}>
              <div className={`${styles.leaderAvatar} ${styles.ceo}`}>
                <div className={styles.leaderAvatarIcon}>
                  <UserCircle2 className="h-9 w-9" />
                </div>
              </div>
              <div className={styles.leaderBody}>
                <div className={styles.leaderName}>{t("leaders.ceo.name")}</div>
                <div className={styles.leaderRole}>{t("leaders.ceo.role")}</div>
                <p className={styles.leaderBio}>{t("leaders.ceo.bio")}</p>
              </div>
            </div>

            {/* COO */}
            <div className={styles.leaderCard}>
              <div className={`${styles.leaderAvatar} ${styles.coo}`}>
                <div className={styles.leaderAvatarIcon}>
                  <UserCircle2 className="h-9 w-9" />
                </div>
              </div>
              <div className={styles.leaderBody}>
                <div className={styles.leaderName}>{t("leaders.coo.name")}</div>
                <div className={styles.leaderRole}>{t("leaders.coo.role")}</div>
                <p className={styles.leaderBio}>{t("leaders.coo.bio")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Team Grid ═══ */}
      <section className={styles.sectionPad} style={{ background: "var(--surface)" }}>
        <div className="container mx-auto">
          <div className={`text-center mb-12 ${isRtl ? "md:text-right" : "md:text-left"}`}>
            <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary mb-3">
              {t("teamLabel")}
            </p>
            <h2 className="text-size-2xl fw-semibold text-secondary md:text-size-3xl leading-tight">
              {t("teamTitle")}
            </h2>
          </div>

          <div className={styles.teamGrid}>
            {MEMBER_KEYS.map((key, i) => (
              <div key={key} className={styles.memberCard}>
                <div className={`${styles.memberAvatarArea} ${AVATAR_BG[i] || ""}`}>
                  <div className={styles.memberAvatarCircle}>
                    {getInitials(`members.${key}.name`)}
                  </div>
                </div>
                <div className={styles.memberBody}>
                  <div className={styles.memberName}>{t(`members.${key}.name`)}</div>
                  <div className={styles.memberRole}>{t(`members.${key}.role`)}</div>
                  <p className={styles.memberBio}>{t(`members.${key}.bio`)}</p>
                  <div className={styles.memberContactRow}>
                    <span className={styles.memberContactIcon} title="Phone">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className={styles.memberContactIcon} title="Email">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className={styles.memberContactIcon} title="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </span>
                  </div>
                </div>
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
          <Link href={`/${language}/about`} className={styles.ctaButton}>
            {t("ctaButton")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

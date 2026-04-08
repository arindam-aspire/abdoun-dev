"use client";

import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Home,
  KeyRound,
  LayoutList,
  Phone,
  Settings2,
  Star,
  TrendingUp,
  UserRoundSearch,
  Users
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface ServiceFeature {
  text: string;
}

interface ServiceCard {
  title: string;
  description: string;
  icon: LucideIcon;
  features: ServiceFeature[];
}

interface AdditionalServiceCard {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  cta: string;
}

interface StatCard {
  value: string;
  label: string;
  caption: string;
  icon: LucideIcon;
}

interface StepCard {
  number: string;
  title: string;
  description: string;
}

interface TestimonialCard {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const primaryServices: ServiceCard[] = [
  {
    title: "Buy Property",
    description:
      "Find your ideal property with expert guidance and access to premium listings across Amman.",
    icon: Home,
    features: [
      { text: "Personalized property matching" },
      { text: "Market value and pricing insights" },
      { text: "Neighborhood guidance" },
      { text: "Secure transaction support" },
    ],
  },
  {
    title: "Rent Property",
    description:
      "Discover verified rental homes and apartments with flexible options tailored to your lifestyle.",
    icon: KeyRound,
    features: [
      { text: "Verified rental listings" },
      { text: "Tenant support services" },
      { text: "Flexible lease terms" },
      { text: "Prime residential locations" },
    ],
  },
  {
    title: "Sell Property",
    description:
      "Maximize your property value with smart marketing, buyer outreach, and negotiation support.",
    icon: TrendingUp,
    features: [
      { text: "Professional property valuation" },
      { text: "Targeted buyer marketing" },
      { text: "High-visibility promotion" },
      { text: "End-to-end negotiation support" },
    ],
  },
  {
    title: "Property Listings",
    description:
      "Access our comprehensive database of properties curated for buyers, sellers, and investors.",
    icon: LayoutList,
    features: [
      { text: "Verified and curated listings" },
      { text: "Real-time property updates" },
      { text: "Exclusive property inventory" },
      { text: "Investor-ready insights" },
    ],
  },
];

const additionalServices: AdditionalServiceCard[] = [
  {
    title: "Agent Services",
    description:
      "Connect with our professional agents for dedicated support, expert advice, and local market guidance.",
    icon: UserRoundSearch,
    features: [
      "Dedicated account assistance",
      "Market trend consultation",
      "Legal and documentation guidance",
      "Investor-focused recommendations",
    ],
    cta: "Find an Agent",
  },
  {
    title: "List Your Property",
    description:
      "Get your property in front of serious buyers and renters with premium placement and tailored promotion.",
    icon: ClipboardList,
    features: [
      "Professional listing creation",
      "Photography support",
      "Buyer lead tracking",
      "Performance analytics",
    ],
    cta: "List Now",
  },
  {
    title: "Property Management",
    description:
      "Comprehensive property management designed to protect your assets and simplify ownership.",
    icon: Settings2,
    features: [
      "Tenant screening and placement",
      "Maintenance coordination",
      "Rent collection and reporting",
      "Dispute resolution assistance",
    ],
    cta: "Get Started",
  },
];

const stats: StatCard[] = [
  {
    value: "35+",
    label: "Years Experience",
    caption: "Trusted since 1988",
    icon: Clock3,
  },
  {
    value: "5,000+",
    label: "Properties Sold",
    caption: "Across Jordan every year",
    icon: Building2,
  },
  {
    value: "98%",
    label: "Client Satisfaction",
    caption: "Based on customer reviews",
    icon: BadgeCheck,
  },
  {
    value: "50+",
    label: "Expert Agents",
    caption: "With local market insight",
    icon: Users,
  },
];

const steps: StepCard[] = [
  {
    number: "01",
    title: "Consultation",
    description: "Schedule an initial consultation and share your goals with our team.",
  },
  {
    number: "02",
    title: "Strategy",
    description: "We develop a tailored plan with market research and property options.",
  },
  {
    number: "03",
    title: "Execution",
    description: "Our team handles viewings, marketing, and negotiations with precision.",
  },
  {
    number: "04",
    title: "Success",
    description: "Secure your ideal outcome with end-to-end support through completion.",
  },
];

const testimonials: TestimonialCard[] = [
  {
    quote:
      "Abdoun made selling my first home a smooth and stress-free experience. Their responsiveness and advice were outstanding.",
    name: "Sarah Al-Hassan",
    role: "Home Seller",
    initials: "S",
  },
  {
    quote:
      "Their investment consulting service helped me find high-yield rental properties with confidence and clarity.",
    name: "Mohammed Khalil",
    role: "Property Investor",
    initials: "M",
  },
  {
    quote:
      "Selling your house became simple and efficient thanks to their marketing strategy and local network.",
    name: "Layla Ibrahim",
    role: "Property Seller",
    initials: "L",
  },
];

const sectionTitleClass =
  "text-size-2xl fw-semibold tracking-tight text-slate-900 md:text-size-3xl";
const sectionSubtitleClass =
  "mt-3 max-w-3xl text-size-base text-slate-600 md:text-size-lg";

export default function OurServiceMain() {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";

  return (
    <main className="bg-[#f7f9fc]" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/our_service_page.png"
            alt="Our services hero"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div  className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(24,49,142,0.08)_0%,rgba(11,28,82,0.22)_52%,rgba(10,19,47,0.46)_100%)]" />

        <div className="relative mx-auto flex min-h-[460px] max-w-7xl items-center px-4 py-16 text-center text-white md:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-size-4xl fw-bold tracking-tight md:text-size-5xl">
              Our Services
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-size-base text-white/88 md:text-size-lg">
              Comprehensive real estate solutions tailored to your unique needs.
              From buying and selling to renting and listing, we&apos;re with
              you every step of the way.
            </p>

            <div
              className={cn(
                "mt-8 flex flex-wrap items-center justify-center gap-3",
                isRtl && "flex-row-reverse",
              )}
            >
              <Link
                href={`/${locale}/search-result`}
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#ffd447] px-5 py-3 text-size-sm fw-semibold text-slate-900 shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition hover:brightness-95"
              >
                Get Started
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Link>
              <Link
                href={`/${locale}/team`}
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-size-sm fw-semibold text-slate-900 shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto">
          <div className="max-w-3xl">
            <h2 className={sectionTitleClass}>What We Offer</h2>
            <p className={sectionSubtitleClass}>
              Choose from our comprehensive range of real estate services
              designed to meet all your property needs.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {primaryServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="rounded-[18px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
                >
                  <div
                    className={cn(
                      "flex items-start gap-4",
                      isRtl && "flex-row-reverse text-right",
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2843a2] text-white shadow-[0_10px_24px_rgba(40,67,162,0.22)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-size-xl fw-semibold tracking-tight text-slate-900">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-size-sm text-slate-600 md:text-size-base">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <div
                        key={feature.text}
                        className={cn(
                          "flex items-start gap-2 text-size-sm text-slate-600",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/${locale}/search-result`}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2843a2] px-5 py-3 text-size-sm fw-semibold text-white transition hover:brightness-95"
                  >
                    Learn More
                    <ArrowRight
                      className={cn("h-4 w-4", isRtl && "rotate-180")}
                    />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto">
          <div className="max-w-3xl">
            <h2 className={sectionTitleClass}>Additional Services</h2>
            <p className={sectionSubtitleClass}>
              Extended support services to enhance your real estate experience.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {additionalServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="rounded-[18px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffd447] text-slate-900 shadow-[0_10px_24px_rgba(255,212,71,0.24)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-size-xl fw-semibold tracking-tight text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-size-sm text-slate-600 md:text-size-base">
                    {service.description}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className={cn(
                          "flex items-start gap-2 text-size-sm text-slate-600",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/${locale}/team`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#ffd447] px-5 py-3 text-size-sm fw-semibold text-slate-900 transition hover:brightness-95"
                  >
                    {service.cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto">
          <div className="text-center">
            <h2 className={sectionTitleClass}>
              Why Choose Abdoun Real Estate?
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-size-base text-slate-600 md:text-size-lg">
              Property services that combine local expertise, trusted guidance,
              and modern market intelligence.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-[18px] border border-[#dbe4f0] bg-white px-6 py-6 text-center shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff] text-[#2843a2]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-size-3xl fw-bold leading-none tracking-tight text-[#2843a2]">
                    {stat.value}
                  </div>
                  <p className="mt-2 text-size-sm fw-semibold text-slate-900">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-size-xs text-slate-500">{stat.caption}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto">
          <div className="text-center">
            <h2 className={sectionTitleClass}>How It Works</h2>
            <p className="mx-auto mt-3 max-w-3xl text-size-base text-slate-600 md:text-size-lg">
              A simple, transparent experience for buying, selling, renting, and
              real estate services.
            </p>
          </div>

          <div className="relative mt-12 grid gap-8 lg:grid-cols-4 lg:gap-6">
            <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-[#f0d13c] lg:block" />
            {steps.map((step) => (
              <article key={step.number} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2843a2] text-size-lg fw-bold text-white shadow-[0_14px_30px_rgba(40,67,162,0.2)]">
                  {step.number}
                </div>
                <h3 className="mt-6 text-size-xl fw-semibold tracking-tight text-slate-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-size-sm text-slate-600 md:text-size-base">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto">
          <div className="text-center">
            <h2 className={sectionTitleClass}>What Our Clients Say</h2>
            <p className="mx-auto mt-3 max-w-3xl text-size-base text-slate-600 md:text-size-lg">
              Real stories from satisfied customers.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-[18px] border border-[#dbe4f0] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center gap-1 text-[#f4c430]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-size-sm text-slate-600 md:text-size-base">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div
                  className={cn(
                    "mt-6 flex items-center gap-3",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2843a2] text-size-sm fw-semibold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="fw-semibold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-size-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#355777_0%,#436b93_100%)] px-4 py-18 text-white md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-size-2xl fw-bold tracking-tight md:text-size-3xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-size-base text-white/82 md:text-size-lg">
            Let us help you achieve your real estate goals. Contact our team
            today for a free consultation.
          </p>

          <div
            className={cn(
              "mt-10 flex flex-wrap items-center justify-center gap-4",
              isRtl && "flex-row-reverse",
            )}
          >
            <Link
              href={`/${locale}/team`}
              className="inline-flex min-w-[210px] items-center justify-center gap-3 rounded-[14px] bg-[#ffd447] px-7 py-4 text-size-base fw-semibold text-slate-900 shadow-[0_16px_34px_rgba(0,0,0,0.16)] transition hover:brightness-95"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </Link>
            <Link
              href={`/${locale}/search-result`}
              className="inline-flex min-w-[210px] items-center justify-center gap-3 rounded-[14px] border border-white/80 bg-white/6 px-7 py-4 text-size-base fw-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Email Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

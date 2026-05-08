"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { LegalDownloadContent } from "@/components/legal/LegalDownloadContent";
import { printLegalPdfFromDom } from "@/lib/print/legalPdf";

export default function PrivacyPolicyPage() {
  const locale = useLocale();
  const lastUpdated = new Date().toLocaleDateString();
  const sections = [
    { id: "data-collection", title: "Information We Collect" },
    { id: "data-usage", title: "How We Use Information" },
    { id: "cookies", title: "Cookies and Similar Technologies" },
    { id: "sharing", title: "Sharing and Disclosure" },
    { id: "retention", title: "Data Retention" },
    { id: "security", title: "Data Security" },
    { id: "rights", title: "Your Rights" },
    { id: "transfers", title: "International Transfers" },
    { id: "updates", title: "Policy Updates" },
    { id: "contact", title: "Contact" },
  ];

  const handleDownloadPdf = () => {
    printLegalPdfFromDom({
      title: "Privacy-Policy",
      contentSelector: ".legal-download-root",
    });
  };

  const renderPrivacySections = (forDownload = false) => (
    <>
      <section id={forDownload ? undefined : "data-collection"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">1. Information We Collect</h2>
        <p>
          We may collect account details (name, email, phone), profile and listing content, usage
          activity, and device/session metadata needed to provide our services.
        </p>
      </section>

      <section id={forDownload ? undefined : "data-usage"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">2. How We Use Information</h2>
        <p>
          We use collected information to operate the platform, provide support, improve product
          quality, enforce security controls, and communicate service-related updates.
        </p>
      </section>

      <section id={forDownload ? undefined : "cookies"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          3. Cookies and Similar Technologies
        </h2>
        <p>
          We use cookies and similar technologies for authentication, preferences, analytics, and
          performance optimization. You may adjust browser settings, but some features may not function
          properly if cookies are disabled.
        </p>
      </section>

      <section id={forDownload ? undefined : "sharing"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">4. Sharing and Disclosure</h2>
        <p>
          We do not sell personal information. Data may be shared with trusted service providers and
          partners only as necessary for platform operation, legal compliance, or security.
        </p>
      </section>

      <section id={forDownload ? undefined : "retention"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">5. Data Retention</h2>
        <p>
          We retain information for as long as needed to provide services, comply with legal obligations,
          resolve disputes, and enforce agreements.
        </p>
      </section>

      <section id={forDownload ? undefined : "security"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">6. Data Security</h2>
        <p>
          We apply reasonable administrative, technical, and organizational safeguards to protect
          personal data. No system is completely secure, but we continuously improve protections.
        </p>
      </section>

      <section id={forDownload ? undefined : "rights"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">7. Your Rights</h2>
        <p>
          Depending on applicable law, you may have rights to access, correct, update, delete, or
          restrict processing of your personal data, and to object to certain uses.
        </p>
      </section>

      <section id={forDownload ? undefined : "transfers"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">8. International Transfers</h2>
        <p>
          If data is processed across regions, we use appropriate safeguards as required by law to
          protect transferred personal information.
        </p>
      </section>

      <section id={forDownload ? undefined : "updates"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">9. Policy Updates</h2>
        <p>
          We may update this Privacy Policy from time to time. Material updates will be reflected by a
          revised "Last updated" date.
        </p>
      </section>

      <section id={forDownload ? undefined : "contact"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">10. Contact</h2>
        <p>
          If you have questions about privacy practices or data rights requests, contact us through our
          support channels.
        </p>
        <p className="text-sm">
          You may also read our{" "}
          <Link
            href={`/${locale}/terms-and-conditions`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Terms & Conditions
          </Link>
          .
        </p>
      </section>
    </>
  );

  return (
    <>
    <section className="relative mx-auto w-full max-w-5xl px-4 py-10 print:hidden md:px-6 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 print:hidden bg-[radial-gradient(circle_at_14%_18%,rgba(6,182,212,0.16),transparent_44%),radial-gradient(circle_at_86%_10%,rgba(79,70,229,0.14),transparent_40%)]"
      />
      <header className="mb-8 border-b border-zinc-200 pb-6 md:pb-8">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-36 w-36 translate-x-1/3 -translate-y-1/3 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div>
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy
          </span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600">
            Last updated: {lastUpdated}
          </span>
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600">
            Approx. reading time: 5 min
          </span>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
          <div>
            <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 md:text-base">
              This policy explains how personal data is collected, used, stored, and protected when you
              use our platform and related services.
            </p>
          </div>
          <div className="relative hidden h-36 overflow-hidden rounded-xl md:block">
            <Image
              src="/about_us_page.png"
              alt="Privacy and protection visual"
              fill
              className="object-cover"
              sizes="240px"
              priority={false}
            />
            <div className="absolute inset-0 bg-zinc-900/20" />
          </div>
        </div>
        </div>
      </header>

      <div className="legal-print-layout grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit border-s border-zinc-200 ps-4 lg:sticky lg:top-24 print:hidden">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            On this page
          </h2>
          <nav className="space-y-1.5">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block py-1.5 text-sm text-zinc-600 transition hover:translate-x-0.5 hover:text-zinc-900"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-7 text-zinc-700 [&>section]:border-b [&>section]:border-zinc-200 [&>section]:pb-6 [&>section]:ps-5 [&>section]:border-s-2 [&>section]:border-s-zinc-200/80 [&>section]:transition-colors [&>section]:duration-200 [&>section:hover]:border-s-primary/65 [&>section:last-child]:border-b-0 [&>section:last-child]:pb-0">
          {renderPrivacySections()}
        </div>
      </div>
    </section>
    <LegalDownloadContent
      title="Privacy Policy"
      summary="This policy explains how personal information is collected, used, stored, and protected when using our platform."
      lastUpdated={lastUpdated}
    >
      {renderPrivacySections(true)}
    </LegalDownloadContent>
    </>
  );
}

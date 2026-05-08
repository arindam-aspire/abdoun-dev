"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, Download, ScrollText } from "lucide-react";
import Image from "next/image";
import { LegalDownloadContent } from "@/components/legal/LegalDownloadContent";
import { printLegalPdfFromDom } from "@/lib/print/legalPdf";

export default function TermsAndConditionsPage() {
  const locale = useLocale();
  const lastUpdated = new Date().toLocaleDateString();
  const sections = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "accounts", title: "Eligibility and Accounts" },
    { id: "permitted-use", title: "Permitted Use" },
    { id: "listings", title: "Listings and User Content" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "availability", title: "Availability and Changes" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "governing-law", title: "Governing Law" },
    { id: "contact", title: "Contact" },
  ];

  const handleDownloadPdf = () => {
    printLegalPdfFromDom({
      title: "Terms-and-Conditions",
      contentSelector: ".legal-download-root",
    });
  };

  const renderTermsSections = (forDownload = false) => (
    <>
      <section id={forDownload ? undefined : "acceptance"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">1. Acceptance of Terms</h2>
        <p>
          By accessing or using this platform, you agree to these Terms & Conditions. If you do not
          agree, please do not use the service.
        </p>
      </section>

      <section id={forDownload ? undefined : "accounts"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">2. Eligibility and Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activities performed through your account.
        </p>
        <p>
          You must provide accurate and up-to-date information and promptly update your profile when
          details change.
        </p>
      </section>

      <section id={forDownload ? undefined : "permitted-use"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">3. Permitted Use</h2>
        <p>
          You may use the platform only for lawful purposes and in compliance with applicable
          regulations.
        </p>
        <p>
          You must not upload false, misleading, fraudulent, offensive, or unlawful content, nor attempt
          to interfere with platform security or operations.
        </p>
      </section>

      <section id={forDownload ? undefined : "listings"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">4. Listings and User Content</h2>
        <p>
          You retain ownership of content you submit, but you grant us a license to host, display,
          process, and distribute that content for platform operations.
        </p>
        <p>
          We may review, reject, suspend, or remove listings that violate policy, legal requirements, or
          quality standards.
        </p>
      </section>

      <section id={forDownload ? undefined : "intellectual-property"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">5. Intellectual Property</h2>
        <p>
          Platform trademarks, branding, software, and original content are protected by intellectual
          property laws and may not be copied, modified, or redistributed without permission.
        </p>
      </section>

      <section id={forDownload ? undefined : "availability"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">6. Availability and Changes</h2>
        <p>
          We may update, suspend, or discontinue features at any time. We do not guarantee uninterrupted
          or error-free service.
        </p>
      </section>

      <section id={forDownload ? undefined : "liability"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, the platform is provided on an "as is" and "as
          available" basis. We are not liable for indirect, incidental, or consequential damages arising
          from use of the service.
        </p>
      </section>

      <section id={forDownload ? undefined : "termination"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">8. Termination</h2>
        <p>
          We may suspend or terminate accounts for violations of these terms, misuse of services, or
          legal requirements.
        </p>
      </section>

      <section id={forDownload ? undefined : "governing-law"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">9. Governing Law</h2>
        <p>
          These terms are governed by applicable laws in the jurisdiction where the platform is operated,
          unless otherwise required by local law.
        </p>
      </section>

      <section id={forDownload ? undefined : "contact"} className="scroll-mt-24 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">10. Contact</h2>
        <p>
          Questions about these Terms & Conditions can be submitted through our support channels.
        </p>
        <p className="text-sm">
          You may also review our{" "}
          <Link
            href={`/${locale}/privacy-policy`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Privacy Policy
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
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_12%_25%,rgba(14,165,233,0.16),transparent_45%),radial-gradient(circle_at_88%_8%,rgba(99,102,241,0.14),transparent_42%)]"
      />
      <header className="mb-8 border-b border-zinc-200 pb-6 md:pb-8">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-36 w-36 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
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
            <ScrollText className="h-3.5 w-3.5" />
            Legal
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
              Terms & Conditions
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 md:text-base">
              These terms govern your access to and use of the platform. Please review them carefully
              before using any account, listing, or communication features.
            </p>
          </div>
          <div className="relative hidden h-36 overflow-hidden rounded-xl md:block">
            <Image
              src="/our_service_page.png"
              alt="Legal agreement visual"
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
          {renderTermsSections()}
        </div>
      </div>
    </section>
    <LegalDownloadContent
      title="Terms & Conditions"
      summary="These terms govern your access to and use of the platform, including account usage, listings, and communication features."
      lastUpdated={lastUpdated}
    >
      {renderTermsSections(true)}
    </LegalDownloadContent>
    </>
  );
}

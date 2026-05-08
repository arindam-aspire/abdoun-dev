"use client";

import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";

type LegalDownloadContentProps = {
  title: string;
  lastUpdated: string;
  summary: string;
  children: ReactNode;
};

export function LegalDownloadContent({
  title,
  lastUpdated,
  summary,
  children,
}: LegalDownloadContentProps) {
  return (
    <section className="legal-download-shell hidden print:block">
      <div className="legal-download-root">
        <header className="legal-download-header">
          <div className="legal-download-logo">
            <BrandLogo variant="black" imageClassName="h-10 w-auto" />
          </div>
          <h1>{title}</h1>
          <p>{summary}</p>
          <p className="legal-download-updated">Last updated: {lastUpdated}</p>
        </header>
        <div className="legal-download-content">{children}</div>
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm 12mm;
          }
          .legal-download-shell {
            display: block !important;
          }
          .legal-download-shell ~ * {
            display: none !important;
          }
          .legal-download-shell + nav,
          .legal-download-shell + footer {
            display: none !important;
          }
          html,
          body {
            background: #fff !important;
          }
          body > header,
          body footer,
          nav[role="navigation"] {
            display: none !important;
          }
          img[alt="Profile"] {
            display: none !important;
          }
          .legal-download-root {
            color: #111827 !important;
            font-size: 11.5pt !important;
            line-height: 1.6 !important;
          }
          .legal-download-header {
            margin-bottom: 16pt;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 10pt;
            text-align: center;
          }
          .legal-download-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 8pt;
          }
          .legal-download-header h1 {
            margin: 0 0 6pt;
            color: #0f172a !important;
            font-size: 19pt !important;
            line-height: 1.25 !important;
          }
          .legal-download-header p {
            margin: 0;
            color: #1f2937 !important;
          }
          .legal-download-updated {
            margin-top: 6pt !important;
            font-size: 10.5pt !important;
            color: #374151 !important;
          }
          .legal-download-content section {
            break-inside: avoid;
            page-break-inside: avoid;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 12pt;
            margin-bottom: 12pt;
          }
          .legal-download-content section:last-child {
            border-bottom: 0;
            padding-bottom: 0;
            margin-bottom: 0;
          }
          .legal-download-content section h2 {
            color: #0f172a !important;
            font-size: 14pt !important;
            line-height: 1.3 !important;
            margin: 0 0 6pt;
          }
          .legal-download-content section p,
          .legal-download-content section li {
            margin: 0 0 6pt;
            color: #1f2937 !important;
          }
          .legal-download-content section a {
            color: #111827 !important;
            text-decoration: none !important;
          }
          footer {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { routing } from "@/i18n/routing";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Abdoun Real Estate",
  description: "URL-driven internationalization with next-intl and SSR.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentLocale = await getLocale();
  const locale = hasLocale(routing.locales, currentLocale)
    ? currentLocale
    : routing.defaultLocale;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

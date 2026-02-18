"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { routing } from "@/i18n/routing";

const REDIRECT_SECONDS = 10;

export function NotFoundContent() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft > 0) return;
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${routing.defaultLocale}`);
    }
  }, [secondsLeft, router]);

  return (
    <main className="min-h-[100vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg mx-auto">
        <p className="text-6xl sm:text-8xl font-bold text-[var(--brand-primary)] tracking-tight">
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-[var(--color-charcoal)]">
          Page not found
        </h1>
        <p className="mt-3 text-[var(--color-charcoal)]/80">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--color-charcoal)]/80">
            Redirecting you back in{" "}
            <span className="font-semibold text-[var(--brand-primary)]">
              {secondsLeft}
            </span>{" "}
            second{secondsLeft !== 1 ? "s" : ""}...
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg font-medium bg-[var(--brand-primary)] text-[var(--brand-on-primary)] hover:opacity-90 transition-opacity"
          >
            Go back
          </button>
          <Link
            href={`/${routing.defaultLocale}`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-colors"
          >
            Go to home
          </Link>
        </div>
      </div>
    </main>
  );
}

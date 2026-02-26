import type { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

interface AuthCardProps {
  locale: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ locale, title, subtitle, children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex justify-center">
        <Link
          href={`/${locale}`}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm transition-colors hover:bg-sky-700"
          aria-label="Back to home"
        >
          <Building2 className="h-7 w-7" aria-hidden />
        </Link>
      </div>

      <h1 className="mt-5 text-center text-size-xl fw-bold text-zinc-900 sm:text-size-2xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-center text-size-sm text-zinc-600">{subtitle}</p> : null}

      <div className="mt-6">{children}</div>
    </div>
  );
}


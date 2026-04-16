import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";
import { BrandLogo } from "../layout/brand-logo";
import { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

export interface LoadingScreenProps {
  className?: string;
  title?: string;
  description?: string;
}

export function LoadingScreen({
  className,
  title = "Loading...",
  description = "Please wait while we fetch the latest data.",
}: LoadingScreenProps) {
  const language = useLocale() as AppLocale;

  return (
    <section
      className={cn(
        "relative flex min-h-[240px] w-full flex-col items-center justify-center overflow-hidden from-surface via-surface to-muted/40 text-center backdrop-blur-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8",
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      {/* subtle background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.05),_transparent_70%)]" />

      {/* Logo */}
      <div className="mb-4 flex justify-center animate-fade-in">
        <BrandLogo
          locale={language}
          variant="black"
          imageClassName="h-14 w-auto drop-shadow-sm"
        />
      </div>

      {/* Spinner with pulse */}
      <div className="relative flex items-center justify-center">
        <Spinner
          size="lg"
          className="relative text-primary animate-spin"
        />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-semibold text-charcoal animate-fade-in-up flex items-center text-primary">
        {title}
        <div className="flex space-x-1 mt-2.5 ms-1">
        <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1 w-1 rounded-full bg-primary animate-bounce" />
      </div>
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm text-charcoal animate-fade-in-up delay-100">
        {description}
      </p>
    </section>
  );
}
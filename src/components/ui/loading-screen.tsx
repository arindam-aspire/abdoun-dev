import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

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
  return (
    <section
      className={cn(
        "flex min-h-[280px] w-full flex-col items-center justify-center rounded-xl border border-subtle bg-surface px-6 py-10 text-center",
        className,
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" className="border-charcoal-20 border-t-primary" />
      <h3 className="mt-4 text-size-base fw-semibold text-charcoal">
        {title}
      </h3>
      <p className="mt-1 text-size-sm text-charcoal/70">
        {description}
      </p>
    </section>
  );
}




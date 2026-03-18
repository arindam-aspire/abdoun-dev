import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export interface GuardRedirectScreenProps {
  logo: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function GuardRedirectScreen({
  logo,
  title = "Taking you to the right place",
  description = "We’re checking your session and redirecting you to your dashboard.",
  className,
}: GuardRedirectScreenProps) {
  return (
    <section
      className={cn(
        "relative min-h-screen overflow-hidden bg-[var(--surface)]",
        className,
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(24,24,27,0.14) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
        <Card className="w-full border-subtle bg-surface/85 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <CardContent className="p-6 sm:p-10">
            <div className="mx-auto flex w-full max-w-md flex-col items-center">
              <div className="mb-6">{logo}</div>

              <Spinner
                size="lg"
                className="border-charcoal/20 border-t-primary"
                aria-label="Redirecting"
              />
              <h1 className="mt-5 text-size-lg fw-semibold text-charcoal sm:text-size-xl">
                {title}
              </h1>
              <p className="mt-2 text-size-sm text-charcoal/70">{description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


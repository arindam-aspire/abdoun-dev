import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="40px"
                viewBox="0 0 24 24"
                width="40px"
                fill="currentColor"
                className="animate-spin text-primary"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
              </svg>
              <h1 className="mt-5 text-size-lg fw-semibold text-charcoal sm:text-size-xl">
                {title}
              </h1>
              <p className="mt-2 text-size-sm text-charcoal/70">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


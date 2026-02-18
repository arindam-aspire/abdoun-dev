import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--brand-secondary)] text-[var(--brand-on-primary)] hover:brightness-95 focus-visible:ring-[var(--brand-secondary)]",
        accent:
          "bg-[var(--brand-accent)] text-[var(--brand-on-accent)] hover:brightness-95 focus-visible:ring-[var(--brand-primary)]",
        outline:
          "border border-[var(--border-subtle)] text-[var(--brand-secondary)] bg-white hover:bg-[var(--surface)] focus-visible:ring-[var(--brand-primary)]",
        ghost:
          "text-[var(--brand-secondary)] hover:bg-[var(--surface)] focus-visible:ring-[var(--brand-primary)] border border-transparent",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({ className, variant, size, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}


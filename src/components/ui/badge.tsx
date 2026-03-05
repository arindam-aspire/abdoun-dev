import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs fw-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-zinc-50",
        secondary: "bg-zinc-100 text-zinc-700",
        outline: "border border-zinc-300 text-zinc-700 bg-transparent",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-800",
        destructive: "bg-red-100 text-red-800",
        exclusive: "bg-[var(--color-navy)] text-white fw-semibold shadow-sm",
        verified: "bg-black/60 text-white gap-1 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

export function Badge({ className, variant, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </span>
  );
}


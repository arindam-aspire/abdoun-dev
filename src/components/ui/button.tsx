import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 disabled:opacity-50 disabled:pointer-events-none gap-2",
  {
    variants: {
      variant: {
        primary:
          "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 focus-visible:ring-zinc-900",
        accent:
          "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-600",
        outline:
          "border border-zinc-300 text-zinc-900 bg-white hover:bg-zinc-50 focus-visible:ring-zinc-900",
        ghost:
          "text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-900 border border-transparent",
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


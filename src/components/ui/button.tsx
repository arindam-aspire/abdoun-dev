import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-size-sm fw-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        primary:
          "bg-secondary text-white hover:brightness-95 focus-visible:ring-secondary",
        accent:
          "bg-accent text-on-accent hover:brightness-95 focus-visible:ring-primary",
        outline:
          "border border-subtle text-secondary bg-white hover:bg-surface focus-visible:ring-primary",
        ghost:
          "text-secondary hover:bg-surface focus-visible:ring-primary border border-transparent",
      },
      size: {
        sm: "h-8 px-3 text-size-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-size-base",
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

export function Button({
  className,
  variant,
  size,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        buttonVariants({ variant, size }),
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}




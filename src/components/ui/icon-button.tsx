import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 disabled:opacity-50 disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
        outline: "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
        ghost: "text-zinc-700 hover:bg-zinc-100",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string;
  children: ReactNode;
}

export function IconButton({
  className,
  variant,
  size,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}

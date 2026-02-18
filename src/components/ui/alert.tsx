import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:pl-8",
  {
    variants: {
      variant: {
        default: "border-zinc-200 bg-zinc-50 text-zinc-900",
        destructive:
          "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
        info:
          "border-[var(--brand-primary)] bg-[var(--surface)] text-[var(--brand-secondary)] [&>svg]:text-[var(--brand-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: ReactNode;
}

export function Alert({ className, variant, children, ...rest }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function AlertTitle({ className, children, ...rest }: AlertTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...rest}
    >
      {children}
    </h5>
  );
}

export interface AlertDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function AlertDescription({
  className,
  children,
  ...rest
}: AlertDescriptionProps) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...rest}>
      {children}
    </div>
  );
}

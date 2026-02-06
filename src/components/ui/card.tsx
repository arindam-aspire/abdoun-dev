import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4 md:p-6", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ className, children, ...rest }: CardTitleProps) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({
  className,
  children,
  ...rest
}: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-zinc-500", className)} {...rest}>
      {children}
    </p>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ className, children, ...rest }: CardContentProps) {
  return <div className={cn("p-4 pt-0 md:p-6 md:pt-0", className)} {...rest}>{children}</div>;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center p-4 pt-0 md:p-6 md:pt-0", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const linkVariants = cva(
  "font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded",
  {
    variants: {
      variant: {
        default: "text-zinc-900 hover:text-zinc-700 underline-offset-4 hover:underline",
        primary: "text-zinc-900 hover:text-zinc-700 no-underline",
        muted: "text-zinc-500 hover:text-zinc-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type LinkProps = ComponentProps<typeof NextLink> &
  VariantProps<typeof linkVariants>;

export function Link({
  className,
  variant,
  ...rest
}: LinkProps) {
  return (
    <NextLink
      className={cn(linkVariants({ variant }), className)}
      {...rest}
    />
  );
}

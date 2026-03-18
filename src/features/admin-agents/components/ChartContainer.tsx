import Link from "next/link";
import type { ReactNode } from "react";

export type ChartContainerProps = {
  href: string;
  children: ReactNode;
};

export function ChartContainer({ href, children }: ChartContainerProps) {
  return (
    <Link href={href} className="block transition hover:opacity-95">
      {children}
    </Link>
  );
}


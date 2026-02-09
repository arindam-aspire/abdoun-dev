"use client";

import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
}

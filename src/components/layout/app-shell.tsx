  "use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return <Provider store={store}>{children}</Provider>;
}


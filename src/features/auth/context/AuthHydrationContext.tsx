"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AuthHydrationContextValue = {
  isAuthLoading: boolean;
};

const AuthHydrationContext = createContext<AuthHydrationContextValue>({
  isAuthLoading: true,
});

export function AuthHydrationProvider({
  isAuthLoading,
  children,
}: {
  isAuthLoading: boolean;
  children: ReactNode;
}) {
  return (
    <AuthHydrationContext.Provider value={{ isAuthLoading }}>
      {children}
    </AuthHydrationContext.Provider>
  );
}

export function useAuthHydration(): AuthHydrationContextValue {
  return useContext(AuthHydrationContext);
}

"use client";

import { sidebarUiConfig } from "@/components/layout/sidebar.config";
import { selectCurrentUser } from "@/store/selectors";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/hooks/storeHooks";

const SIDEBAR_STORAGE_KEY = "abdoun:sidebar-open";
const SIDEBAR_COLLAPSED_STORAGE_KEY = "abdoun:sidebar-collapsed";
/** New persisted key; JSON boolean */
const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";
const SIDEBAR_ROLES = new Set(["admin", "agent"]);

function readCollapsedFromStorage(): boolean {
  if (typeof window === "undefined") {
    return sidebarUiConfig.defaultCollapsed;
  }
  const json = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (json !== null) {
    try {
      return JSON.parse(json) as boolean;
    } catch {
      return sidebarUiConfig.defaultCollapsed;
    }
  }
  const legacy = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
  if (legacy !== null) {
    return legacy === "true";
  }
  return sidebarUiConfig.defaultCollapsed;
}

type SidebarContextValue = {
  isOpen: boolean;
  isSidebarRole: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
  toggleCollapsed: () => void;
};

const defaultValue: SidebarContextValue = {
  isOpen: false,
  isSidebarRole: false,
  isMobile: false,
  isCollapsed: false,
  toggle: () => undefined,
  close: () => undefined,
  open: () => undefined,
  toggleCollapsed: () => undefined,
};

const SidebarContext = createContext<SidebarContextValue>(defaultValue);
const MOBILE_QUERY = "(max-width: 767px)";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => readCollapsedFromStorage());
  const isSidebarRole = user?.role ? SIDEBAR_ROLES.has(user.role) : false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Restore open from storage when sidebar becomes relevant—do not tie to isMobile to avoid
  // re-opening or resetting on viewport changes or navigation.
  useEffect(() => {
    if (!isSidebarRole) return;
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setIsOpen(stored === "true");
    } else {
      setIsOpen(true);
    }
  }, [isSidebarRole]);

  // Persist isOpen; do not reset isCollapsed when role is lost (stability across re-login)
  useEffect(() => {
    if (!isSidebarRole) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
  }, [isOpen, isSidebarRole]);

  useEffect(() => {
    if (!isSidebarRole) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarRole]);

  const value = useMemo(
    () => ({
      isOpen: isSidebarRole ? isOpen : false,
      isSidebarRole,
      isMobile,
      isCollapsed:
        isSidebarRole && sidebarUiConfig.allowCollapse ? isCollapsed : false,
      toggle: () => {
        if (!isSidebarRole) return;
        setIsOpen((prev) => !prev);
      },
      close: () => setIsOpen(false),
      open: () => {
        if (!isSidebarRole) return;
        setIsOpen(true);
      },
      toggleCollapsed: () => {
        if (!isSidebarRole) return;
        if (!sidebarUiConfig.allowCollapse) return;
        setIsCollapsed((prev) => {
          const next = !prev;
          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
          }
          return next;
        });
      },
    }),
    [isOpen, isSidebarRole, isMobile, isCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebarContext() {
  return useContext(SidebarContext);
}

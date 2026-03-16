import type { LogoutHandler } from "@/lib/auth/ports";

type BrowserLogoutHandlerOptions = {
  loginPath?: string;
};

/** Optional client-side navigate (e.g. Next.js router.push). When set, logout uses this instead of a full page reload. */
let clientLogoutNavigate: ((path: string) => void) | null = null;

export function setClientLogoutNavigate(navigate: ((path: string) => void) | null): void {
  clientLogoutNavigate = navigate;
}

export class BrowserLogoutHandler implements LogoutHandler {
  private readonly loginPath: string;

  constructor(options: BrowserLogoutHandlerOptions = {}) {
    this.loginPath = options.loginPath ?? "";
  }

  handleLogout(): void {
    if (typeof window === "undefined") {
      return;
    }

    const path = this.loginPath || "/";
    if (clientLogoutNavigate) {
      clientLogoutNavigate(path);
    } else {
      window.location.assign(path);
    }
  }
}

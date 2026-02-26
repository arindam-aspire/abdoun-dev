import type { LogoutHandler } from "@/lib/auth/ports";

type BrowserLogoutHandlerOptions = {
  loginPath?: string;
};

export class BrowserLogoutHandler implements LogoutHandler {
  private readonly loginPath: string;

  constructor(options: BrowserLogoutHandlerOptions = {}) {
    this.loginPath = options.loginPath ?? "";
  }

  handleLogout(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.location.assign(this.loginPath);
  }
}

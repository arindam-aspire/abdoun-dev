import { persistTokensToVault } from "@/lib/auth/adapters/vaultTokenStore";
import { clearAuthSession, persistAuthSession } from "@/lib/auth/sessionCookies";
import {
  resolveAuthBootstrapPhase,
  startAuthProfileEnrichment,
} from "@/lib/auth/runAuthBootstrap";

const getCurrentUserDedupedMock = jest.fn();
const refreshTokenMock = jest.fn();

jest.mock("@/lib/auth/currentUserRequest", () => ({
  getCurrentUserDeduped: (...args: unknown[]) => getCurrentUserDedupedMock(...args),
}));

jest.mock("@/features/auth/api/auth.api", () => ({
  toSessionUserForProfile: (user: unknown) => user,
  refreshToken: (...args: unknown[]) => refreshTokenMock(...args),
}));

describe("resolveAuthBootstrapPhase", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearAuthSession();
    getCurrentUserDedupedMock.mockReset();
    refreshTokenMock.mockReset();
  });

  it("is ready immediately for guests", () => {
    expect(resolveAuthBootstrapPhase(false)).toEqual({ kind: "ready" });
  });

  it("is ready immediately when vault has tokens (remember-me)", () => {
    persistTokensToVault({ accessToken: "a", refreshToken: "r" }, true);
    expect(resolveAuthBootstrapPhase(false)).toEqual({ kind: "ready" });
  });

  it("is ready immediately when vault has tokens (no remember-me)", () => {
    persistTokensToVault({ accessToken: "a", refreshToken: "r" }, false);
    expect(resolveAuthBootstrapPhase(false)).toEqual({ kind: "ready" });
  });

  it("needs refresh when profile cookies exist but vault is empty", () => {
    persistAuthSession(
      {
        id: "1",
        name: "User",
        email: "u@test.com",
        role: "user",
      },
      { persistent: false },
    );
    expect(resolveAuthBootstrapPhase(false)).toEqual({ kind: "needs_refresh" });
  });

  it("is ready when redux user is already set", () => {
    expect(resolveAuthBootstrapPhase(true)).toEqual({ kind: "ready" });
  });
});

describe("startAuthProfileEnrichment", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearAuthSession();
    dispatch.mockReset();
    getCurrentUserDedupedMock.mockReset();
    refreshTokenMock.mockReset();
  });

  it("does not call /auth/me when the vault has no tokens", () => {
    startAuthProfileEnrichment(dispatch, () => undefined);
    expect(getCurrentUserDedupedMock).not.toHaveBeenCalled();
    expect(refreshTokenMock).not.toHaveBeenCalled();
  });

  it("calls /auth/me when the vault has tokens", async () => {
    persistTokensToVault({ accessToken: "a", refreshToken: "r" }, false);
    getCurrentUserDedupedMock.mockResolvedValue({
      id: "1",
      name: "User",
      email: "u@test.com",
      role: "user",
    });

    startAuthProfileEnrichment(dispatch, () => undefined);
    await Promise.resolve();

    expect(getCurrentUserDedupedMock).toHaveBeenCalled();
    expect(refreshTokenMock).not.toHaveBeenCalled();
  });
});

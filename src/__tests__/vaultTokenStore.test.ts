import {
  AUTH_REFRESH_MODE_KEY,
  AUTH_TOKEN_PERSIST_MARKER_KEY,
  clearAllVaultTokenStorage,
  peekTokenVaultFromPairs,
  persistAccessTokenToVault,
  persistTokensToVault,
  purgeOrphanedEphemeralTokens,
  reconcileAuthStorageOnLoad,
  resolveTokenVault,
} from "@/lib/auth/adapters/vaultTokenStore";

const access = { accessToken: "a", refreshToken: "r" };

describe("peekTokenVaultFromPairs", () => {
  it("prefers local when persistence marker is on and local has a pair", () => {
    expect(peekTokenVaultFromPairs("1", access, access)).toBe("local");
  });

  it("prefers local when both storages have pairs and marker is off", () => {
    expect(peekTokenVaultFromPairs(null, access, access)).toBe("local");
  });

  it("uses session when only session has a pair", () => {
    expect(peekTokenVaultFromPairs(null, null, access)).toBe("session");
  });

  it("uses local when only local has a pair", () => {
    expect(peekTokenVaultFromPairs(null, access, null)).toBe("local");
  });

  it("returns null when no pair exists", () => {
    expect(peekTokenVaultFromPairs(null, null, null)).toBeNull();
  });

  it("uses session when marker is on but local pair is missing", () => {
    expect(peekTokenVaultFromPairs("1", null, access)).toBe("session");
  });
});

describe("resolveTokenVault", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("selects local for remember-me layout", () => {
    window.localStorage.setItem(AUTH_TOKEN_PERSIST_MARKER_KEY, "1");
    window.localStorage.setItem("accessToken", "a");
    window.localStorage.setItem("refreshToken", "r");
    expect(resolveTokenVault()).toBe("local");
  });

  it("migrates legacy session tokens to local and clears orphan marker", () => {
    window.localStorage.setItem(AUTH_TOKEN_PERSIST_MARKER_KEY, "1");
    window.sessionStorage.setItem("accessToken", "a");
    window.sessionStorage.setItem("refreshToken", "r");
    expect(resolveTokenVault()).toBe("local");
    expect(window.localStorage.getItem("accessToken")).toBe("a");
    expect(window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY)).toBeNull();
    expect(window.sessionStorage.getItem("accessToken")).toBeNull();
  });

  it("keeps local vault for remember-me access-only mode", () => {
    window.localStorage.setItem(AUTH_TOKEN_PERSIST_MARKER_KEY, "1");
    window.localStorage.setItem("accessToken", "a");
    expect(resolveTokenVault()).toBe("local");
    expect(window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY)).toBe("1");
  });
});

describe("remember-me storage modes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("stores access+refresh pair in localStorage without persist marker", () => {
    persistTokensToVault(access, false);
    expect(window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY)).toBeNull();
    expect(window.localStorage.getItem("accessToken")).toBe("a");
    expect(window.localStorage.getItem("refreshToken")).toBe("r");
    expect(window.localStorage.getItem(AUTH_REFRESH_MODE_KEY)).toBe("token");
    expect(window.sessionStorage.getItem("accessToken")).toBeNull();
  });

  it("stores access-only with cookie mode for remember-me", () => {
    persistAccessTokenToVault("only-access", true);
    expect(window.localStorage.getItem(AUTH_TOKEN_PERSIST_MARKER_KEY)).toBe("1");
    expect(window.localStorage.getItem("accessToken")).toBe("only-access");
    expect(window.localStorage.getItem("refreshToken")).toBeNull();
    expect(window.localStorage.getItem(AUTH_REFRESH_MODE_KEY)).toBe("cookie");
  });

  it("clears refresh mode metadata on full clear", () => {
    persistAccessTokenToVault("only-access", true);
    clearAllVaultTokenStorage();
    expect(window.localStorage.getItem(AUTH_REFRESH_MODE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(AUTH_REFRESH_MODE_KEY)).toBeNull();
  });

  it("does not purge ephemeral tokens during reconcile (login race)", () => {
    persistTokensToVault(access, false);
    reconcileAuthStorageOnLoad();
    expect(window.localStorage.getItem("accessToken")).toBe("a");
    expect(window.localStorage.getItem("refreshToken")).toBe("r");
  });

  it("purges ephemeral tokens only when session cookies are absent", () => {
    persistTokensToVault(access, false);
    purgeOrphanedEphemeralTokens();
    expect(window.localStorage.getItem("accessToken")).toBeNull();
  });
});

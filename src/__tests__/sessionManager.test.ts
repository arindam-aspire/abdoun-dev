import { clearSession, getStoredTokens, persistSession } from "@/lib/auth/sessionManager";

jest.mock("@/lib/auth/sessionCookies", () => ({
  persistAuthSession: jest.fn(),
  clearAuthSession: jest.fn(),
  readAuthSessionFromBrowser: jest.fn(),
}));

describe("sessionManager", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("persistSession stores tokens when provided", () => {
    persistSession({
      user: { id: "1", name: "U", email: "u@u", role: "user" },
      tokens: { accessToken: "a", refreshToken: "r" },
    });

    expect(window.localStorage.getItem("accessToken")).toBe("a");
    expect(window.localStorage.getItem("refreshToken")).toBe("r");
    expect(getStoredTokens()).toEqual({ accessToken: "a", refreshToken: "r" });
  });

  it("clearSession clears tokens", () => {
    window.localStorage.setItem("accessToken", "a");
    window.localStorage.setItem("refreshToken", "r");

    clearSession();

    expect(window.localStorage.getItem("accessToken")).toBeNull();
    expect(window.localStorage.getItem("refreshToken")).toBeNull();
  });
});


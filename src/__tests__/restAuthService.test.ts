import { RestAuthService } from "@/lib/auth/adapters/restAuthService";
import { AUTH_TOKEN_PERSIST_MARKER_KEY } from "@/lib/auth/adapters/vaultTokenStore";

describe("RestAuthService refresh modes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("uses token refresh payload when refresh token exists", async () => {
    const post = jest.fn().mockResolvedValue({
      data: { success: true, data: { access_token: "new-a", refresh_token: "new-r" } },
    });
    const service = new RestAuthService({
      baseURL: "http://example.test",
      client: { post } as never,
    });
    window.localStorage.setItem("authUsername", "useremail@example.com");

    const next = await service.refresh("r1");

    expect(post).toHaveBeenCalledWith("/auth/refresh", {
      refresh_token: "r1",
      username: "useremail@example.com",
    });
    expect(next).toEqual({ accessToken: "new-a", refreshToken: "new-r" });
  });

  it("uses cookie refresh payload when refresh token is missing", async () => {
    const post = jest.fn().mockResolvedValue({
      data: { success: true, data: { access_token: "new-a" } },
    });
    const service = new RestAuthService({
      baseURL: "http://example.test",
      client: { post } as never,
    });
    window.localStorage.setItem("authUsername", "useremail@example.com");

    const next = await service.refresh(null);

    expect(post).toHaveBeenCalledWith("/auth/refresh", {
      username: "useremail@example.com",
    });
    expect(next).toEqual({ accessToken: "new-a", refreshToken: "" });
  });

  it("sends only username when rememberMe is true", async () => {
    const post = jest.fn().mockResolvedValue({
      data: { success: true, data: { access_token: "new-a", refresh_token: "new-r" } },
    });
    const service = new RestAuthService({
      baseURL: "http://example.test",
      client: { post } as never,
    });
    window.localStorage.setItem("authUsername", "useremail@example.com");
    window.localStorage.setItem(AUTH_TOKEN_PERSIST_MARKER_KEY, "1");

    await service.refresh("r1");

    expect(post).toHaveBeenCalledWith("/auth/refresh", {
      username: "useremail@example.com",
    });
  });
});


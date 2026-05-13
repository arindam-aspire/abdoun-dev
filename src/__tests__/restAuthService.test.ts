import { RestAuthService } from "@/lib/auth/adapters/restAuthService";

describe("RestAuthService refresh modes", () => {
  it("uses token refresh payload when refresh token exists", async () => {
    const post = jest.fn().mockResolvedValue({
      data: { success: true, data: { access_token: "new-a", refresh_token: "new-r" } },
    });
    const service = new RestAuthService({
      baseURL: "http://example.test",
      client: { post } as never,
    });

    const next = await service.refresh("r1");

    expect(post).toHaveBeenCalledWith("/auth/refresh", {
      refresh_token: "r1",
      username: undefined,
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

    const next = await service.refresh(null);

    expect(post).toHaveBeenCalledWith("/auth/refresh", {});
    expect(next).toEqual({ accessToken: "new-a", refreshToken: "" });
  });
});


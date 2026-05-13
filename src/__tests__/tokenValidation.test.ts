import {
  isJwtAccessTokenLikelyExpired,
  normalizeAuthTokens,
  readJwtExpSeconds,
  revalidateAuthTokens,
} from "@/lib/auth/tokenValidation";

function b64urlJson(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

describe("tokenValidation", () => {
  it("normalizeAuthTokens trims and rejects empty", () => {
    expect(normalizeAuthTokens({ accessToken: "  a  ", refreshToken: "  b  " })).toEqual({
      accessToken: "a",
      refreshToken: "b",
    });
    expect(normalizeAuthTokens({ accessToken: "", refreshToken: "b" })).toBeNull();
    expect(normalizeAuthTokens(null)).toBeNull();
  });

  it("revalidateAuthTokens is idempotent on valid pair", () => {
    const t = { accessToken: "x", refreshToken: "y" };
    expect(revalidateAuthTokens(t)).toEqual(t);
  });

  it("readJwtExpSeconds parses exp", () => {
    const jwt = `${b64urlJson({ alg: "none" })}.${b64urlJson({ exp: 2000000000, sub: "u1" })}.sig`;
    expect(readJwtExpSeconds(jwt)).toBe(2000000000);
  });

  it("isJwtAccessTokenLikelyExpired respects skew", () => {
    const past = Math.floor(Date.now() / 1000) - 120;
    const jwt = `${b64urlJson({})}.${b64urlJson({ exp: past })}.x`;
    expect(isJwtAccessTokenLikelyExpired(jwt, 60)).toBe(true);
  });
});

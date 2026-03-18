import reducer, { login, logout, type AuthState } from "@/features/auth/authSlice";

describe("authSlice", () => {
  it("sets userId on login", () => {
    const state: AuthState = { userId: null };
    const next = reducer(
      state,
      login({ id: "u1", name: "U", email: "u@u", role: "user" }),
    );
    expect(next.userId).toBe("u1");
  });

  it("clears userId on logout", () => {
    const state: AuthState = { userId: "u1" };
    const next = reducer(state, logout());
    expect(next.userId).toBeNull();
  });
});


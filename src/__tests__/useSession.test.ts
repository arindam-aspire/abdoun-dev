import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const loginActionMock = jest.fn((payload) => ({ type: "auth/login", payload }));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector) =>
    selector({
      auth: { userId: null },
      profile: { userId: "", userDetails: { id: "", name: "", email: "", role: "user" } },
    }),
}));

jest.mock("@/store/selectors", () => ({
  selectCurrentUser: () => null,
}));

jest.mock("@/features/auth/authSlice", () => ({
  login: (payload) => loginActionMock(payload),
}));

jest.mock("@/lib/auth/enrichSessionUser", () => ({
  enrichWithPhoneParts: (u) => u,
}));

const getCurrentSessionMock = jest.fn();
jest.mock("@/lib/auth/sessionManager", () => ({
  getCurrentSession: () => getCurrentSessionMock(),
}));

import { useSession } from "@/features/auth/hooks/useSession";

describe("useSession", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    loginActionMock.mockClear();
    getCurrentSessionMock.mockReset();
  });

  it("returns null user when no session and no redux user", () => {
    getCurrentSessionMock.mockReturnValue(null);
    const { result } = renderHook(() => useSession());
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it("hydrates redux when session exists", () => {
    getCurrentSessionMock.mockReturnValue({
      user: { id: "1", name: "U", email: "u@u", role: "user" },
      role: "user",
      tokens: null,
    });
    renderHook(() => useSession());
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "auth/login",
      payload: { id: "1", name: "U", email: "u@u", role: "user" },
    });
  });
});


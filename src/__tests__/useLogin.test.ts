import { renderHook, act } from "@testing-library/react";

const dispatchMock = jest.fn();
const persistSessionMock = jest.fn();
const loginActionMock = jest.fn((payload) => ({ type: "auth/login", payload }));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
}));

jest.mock("@/lib/auth/sessionManager", () => ({
  persistSession: (...args) => persistSessionMock(...args),
}));

jest.mock("@/features/auth/authSlice", () => ({
  login: (payload) => loginActionMock(payload),
}));

const loginWithPasswordAndPersistMock = jest.fn();
jest.mock("@/features/auth/api/auth.api", () => ({
  loginWithPasswordAndPersist: (...args) => loginWithPasswordAndPersistMock(...args),
}));

import { useLogin } from "@/features/auth/hooks/useLogin";

describe("useLogin", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    persistSessionMock.mockClear();
    loginActionMock.mockClear();
    loginWithPasswordAndPersistMock.mockReset();
  });

  it("loginAndPersist trims username and calls API wrapper", async () => {
    loginWithPasswordAndPersistMock.mockResolvedValue({
      sessionUser: { id: "1", name: "U", email: "u@u", role: "user" },
      requiresPasswordSet: false,
    });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.loginAndPersist("  user  ", "pw");
    });

    expect(loginWithPasswordAndPersistMock).toHaveBeenCalledWith("user", "pw");
  });

  it("persistSessionAndLogin persists session and dispatches login", () => {
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.persistSessionAndLogin({
        id: "1",
        name: "U",
        email: "u@u",
        role: "user",
      });
    });
    expect(persistSessionMock).toHaveBeenCalledWith({
      user: { id: "1", name: "U", email: "u@u", role: "user" },
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "auth/login",
      payload: { id: "1", name: "U", email: "u@u", role: "user" },
    });
  });
});


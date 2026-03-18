import { renderHook, act } from "@testing-library/react";

const dispatchMock = jest.fn();
const loginActionMock = jest.fn((payload) => ({ type: "auth/login", payload }));
const setProfileExtraMock = jest.fn((payload) => ({ type: "profile/setExtra", payload }));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector) =>
    selector({
      auth: { userId: "u1" },
      profile: {
        userId: "u1",
        userDetails: {
          id: "u1",
          name: "User",
          email: "u@u",
          phone: "+1",
          role: "user",
        },
      },
    }),
}));

jest.mock("@/store/selectors", () => ({
  selectCurrentUser: (state) => state.profile.userDetails,
}));

jest.mock("@/features/auth/authSlice", () => ({
  login: (payload) => loginActionMock(payload),
}));

jest.mock("@/features/profile/profileSlice", () => ({
  setProfileExtra: (payload) => setProfileExtraMock(payload),
}));

const updateUserMock = jest.fn();
const getCurrentUserMock = jest.fn();
const toSessionUserForProfileMock = jest.fn();

jest.mock("@/features/profile/api/profile.api", () => ({
  updateUser: (...args) => updateUserMock(...args),
  getCurrentUser: () => getCurrentUserMock(),
  toSessionUserForProfile: (u) => toSessionUserForProfileMock(u),
}));

import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";

describe("useUpdateProfile", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    loginActionMock.mockClear();
    setProfileExtraMock.mockClear();
    updateUserMock.mockReset();
    getCurrentUserMock.mockReset();
    toSessionUserForProfileMock.mockReset();
  });

  it("updates via API when fullName/phone provided and dispatches login", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });
    toSessionUserForProfileMock.mockReturnValue({
      id: "u1",
      name: "New",
      email: "u@u",
      role: "user",
    });

    const { result } = renderHook(() => useUpdateProfile());

    await act(async () => {
      await result.current.updateProfile({ fullName: "New", phone: "+2" });
    });

    expect(updateUserMock).toHaveBeenCalledWith("u1", {
      full_name: "New",
      phone_number: "+2",
    });
    expect(loginActionMock).toHaveBeenCalled();
  });

  it("dispatches setProfileExtra for avatar/displayName/location without API call", async () => {
    const { result } = renderHook(() => useUpdateProfile());

    await act(async () => {
      await result.current.updateProfile({
        avatarUrl: "x",
        displayName: "D",
        location: "L",
      });
    });

    expect(updateUserMock).not.toHaveBeenCalled();
    expect(setProfileExtraMock).toHaveBeenCalledWith({
      userId: "u1",
      extra: { avatarUrl: "x", displayName: "D", location: "L" },
    });
  });
});


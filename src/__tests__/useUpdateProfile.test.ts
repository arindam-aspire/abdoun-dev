import { renderHook, act } from "@testing-library/react";

type MockRootState = {
  auth: { userId: string };
  profile: {
    userId: string;
    userDetails: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
    };
  };
};

const dispatchMock = jest.fn();
const loginActionMock = jest.fn((payload: unknown) => ({ type: "auth/login", payload }));
const setProfileExtraMock = jest.fn((payload: unknown) => ({
  type: "profile/setExtra",
  payload,
}));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: MockRootState) => unknown) =>
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
  selectCurrentUser: (state: MockRootState) => state.profile.userDetails,
}));

jest.mock("@/features/auth/authSlice", () => ({
  login: (payload: unknown) => loginActionMock(payload),
}));

jest.mock("@/features/profile/profileSlice", () => ({
  setProfileExtra: (payload: unknown) => setProfileExtraMock(payload),
}));

const persistSessionMock = jest.fn();
jest.mock("@/lib/auth/sessionManager", () => ({
  persistSession: (...args: unknown[]) => persistSessionMock(...args),
}));

jest.mock("@/lib/auth/enrichSessionUser", () => ({
  enrichWithPhoneParts: (u: unknown) => u,
}));

const requestProfileUpdateMock = jest.fn();
const getCurrentUserMock = jest.fn();
const toSessionUserForProfileMock = jest.fn();

jest.mock("@/features/profile/api/profile.api", () => ({
  requestProfileUpdate: (...args: unknown[]) => requestProfileUpdateMock(...args),
  getCurrentUser: () => getCurrentUserMock(),
  toSessionUserForProfile: (u: unknown) => toSessionUserForProfileMock(u),
}));

const uploadProfilePictureMock = jest.fn();
const deleteProfilePictureMock = jest.fn();
const dataUrlToProfileFileMock = jest.fn();
jest.mock("@/features/profile/api/profilePicture.api", () => ({
  uploadProfilePicture: (f: File) => uploadProfilePictureMock(f),
  deleteProfilePicture: () => deleteProfilePictureMock(),
  dataUrlToProfileFile: (u: string) => dataUrlToProfileFileMock(u),
}));

import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";

describe("useUpdateProfile", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    loginActionMock.mockClear();
    setProfileExtraMock.mockClear();
    requestProfileUpdateMock.mockReset();
    getCurrentUserMock.mockReset();
    toSessionUserForProfileMock.mockReset();
    persistSessionMock.mockReset();
    uploadProfilePictureMock.mockReset();
    deleteProfilePictureMock.mockReset();
    dataUrlToProfileFileMock.mockReset();
  });

  it("calls profile request API when fullName/phone provided and dispatches login", async () => {
    requestProfileUpdateMock.mockResolvedValue({
      message: "ok",
      requires_verification: false,
      verification_fields: [],
      dev_phone_otp: null,
    });
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

    expect(requestProfileUpdateMock).toHaveBeenCalledWith({
      full_name: "New",
      phone_number: "+2",
    });
    const sessionPayload = {
      id: "u1",
      name: "New",
      email: "u@u",
      role: "user",
    };
    expect(persistSessionMock).toHaveBeenCalledWith({ user: sessionPayload });
    expect(loginActionMock).toHaveBeenCalledWith(sessionPayload);
  });

  it("refreshes from GET /auth/me for avatar and setProfileExtra only for displayName", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });
    toSessionUserForProfileMock.mockReturnValue({
      id: "u1",
      name: "User",
      email: "u@u",
      role: "user",
    });

    const { result } = renderHook(() => useUpdateProfile());

    await act(async () => {
      await result.current.updateProfile({
        avatarUrl: "x",
        displayName: "D",
      });
    });

    expect(requestProfileUpdateMock).not.toHaveBeenCalled();
    expect(getCurrentUserMock).toHaveBeenCalled();
    expect(setProfileExtraMock).toHaveBeenCalledWith({
      userId: "u1",
      extra: { displayName: "D" },
    });
  });

  it("throws when server requires verification for email/phone", async () => {
    requestProfileUpdateMock.mockResolvedValue({
      message: "Verify",
      requires_verification: true,
      verification_fields: ["phone_number"],
      dev_phone_otp: "123456",
    });

    const { result } = renderHook(() => useUpdateProfile());

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.updateProfile({ phone: "+962791234567" });
      } catch (e) {
        thrown = e;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
  });

  it("refreshProfile persists session and dispatches login from GET /auth/me", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });
    toSessionUserForProfileMock.mockReturnValue({
      id: "u1",
      name: "Synced",
      email: "u@u",
      role: "user",
    });

    const { result } = renderHook(() => useUpdateProfile());

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(getCurrentUserMock).toHaveBeenCalled();
    expect(persistSessionMock).toHaveBeenCalledWith({
      user: { id: "u1", name: "Synced", email: "u@u", role: "user" },
    });
    expect(loginActionMock).toHaveBeenCalledWith({
      id: "u1",
      name: "Synced",
      email: "u@u",
      role: "user",
    });
  });
});

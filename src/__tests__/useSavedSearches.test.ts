import { renderHook, waitFor } from "@testing-library/react";

const dispatchMock = jest.fn();
const state = {
  auth: { userId: "u1" },
  profile: {
    userId: "u1",
    userDetails: {
      id: "u1",
      name: "Test",
      email: "t@test.com",
      role: "user" as const,
    },
  },
  savedSearches: { items: [], hydratedUserId: "u1" },
};

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (s: typeof state) => unknown) => selector(state),
}));

jest.mock("@/features/saved-searches/api/savedSearches.api", () => ({
  createSavedSearch: jest.fn().mockResolvedValue({
    id: "new-id",
    name: "N",
    queryString: "q=1",
    createdAt: 1,
  }),
  deleteSavedSearch: jest.fn().mockResolvedValue(true),
  updateSavedSearchName: jest
    .fn()
    .mockResolvedValue({ id: "id1", name: "New", queryString: "", createdAt: 1 }),
  listSavedSearches: jest.fn().mockResolvedValue([]),
  updateSavedSearch: jest.fn(),
}));

import { useSavedSearches } from "@/features/saved-searches/hooks/useSavedSearches";

describe("useSavedSearches", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    state.savedSearches.items = [];
  });

  it("builds runUrl with or without querystring", () => {
    const { result } = renderHook(() => useSavedSearches());
    expect(result.current.runUrl({ locale: "en", queryString: "a=1" })).toBe(
      "/en/search-result?a=1",
    );
    expect(result.current.runUrl({ locale: "en", queryString: "" })).toBe(
      "/en/search-result",
    );
  });

  it("dispatches add/remove/rename actions", async () => {
    const { result } = renderHook(() => useSavedSearches());
    await result.current.add({ name: "N", queryString: "q=1" });
    await result.current.rename("id1", "New");
    await result.current.remove("id1");

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "savedSearches/addSavedSearch" }),
      );
    });
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "savedSearches/updateSavedSearch" }),
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "savedSearches/removeSavedSearch" }),
    );
  });
});

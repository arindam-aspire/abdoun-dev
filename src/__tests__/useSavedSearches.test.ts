import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const state = {
  savedSearches: { items: [], hydratedUserId: "u1" },
};

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: any) => selector(state),
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

  it("dispatches add/remove/rename actions", () => {
    const { result } = renderHook(() => useSavedSearches());
    result.current.add({ name: "N", queryString: "q=1" });
    result.current.rename("id1", "New");
    result.current.remove("id1");

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "savedSearches/addSavedSearch" }),
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "savedSearches/updateSavedSearch" }),
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "savedSearches/removeSavedSearch" }),
    );
  });
});


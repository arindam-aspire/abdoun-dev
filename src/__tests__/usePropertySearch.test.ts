import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector) =>
    selector({
      propertySearch: {
        items: [],
        total: 0,
        pageSize: 12,
        loading: false,
        error: null,
      },
    }),
}));

const fetchPropertiesMock = jest.fn((q: string) => ({ type: "x", payload: q }));
jest.mock("@/features/property-search/propertySearchSlice", () => ({
  fetchProperties: (q: string) => fetchPropertiesMock(q),
}));

import { usePropertySearch } from "@/features/property-search/hooks/usePropertySearch";

describe("usePropertySearch", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    fetchPropertiesMock.mockClear();
  });

  it("dispatches fetchProperties with computed request query", () => {
    const searchParams = new URLSearchParams({
      status: "buy",
      category: "residential",
      sort: "newest",
      view: "grid",
    });

    renderHook(() =>
      usePropertySearch({
        searchParams,
        currentPage: 2,
        defaultPageSize: 12,
        sortParamKey: "sort",
        viewParamKey: "view",
      }),
    );

    expect(fetchPropertiesMock).toHaveBeenCalledWith(
      expect.stringContaining("page=2"),
    );
    const qs = String(fetchPropertiesMock.mock.calls[0][0]);
    const out = new URLSearchParams(qs);
    expect(out.get("sort")).toBeNull();
    expect(out.get("view")).toBeNull();
    expect(out.get("pageSize")).toBe("12");
    expect(dispatchMock).toHaveBeenCalledWith({ type: "x", payload: qs });
  });
});


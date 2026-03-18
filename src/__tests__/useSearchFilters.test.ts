import { renderHook, act } from "@testing-library/react";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () =>
    new URLSearchParams({
      page: "3",
      sort: "price_asc",
      view: "grid",
      status: "buy",
    }),
}));

import { useSearchFilters } from "@/features/property-search/hooks/useSearchFilters";

describe("useSearchFilters", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("derives currentPage/sort/view from URL", () => {
    const { result } = renderHook(() => useSearchFilters());
    expect(result.current.currentPage).toBe(3);
    expect(result.current.sort).toBe("price_asc");
    expect(result.current.view).toBe("grid");
  });

  it("setSort updates sort and clears page", () => {
    const { result } = renderHook(() => useSearchFilters());
    act(() => result.current.setSort("newest"));
    expect(replaceMock).toHaveBeenCalledWith(
      expect.stringContaining("?"),
      { scroll: false },
    );
    const url = String(replaceMock.mock.calls[0][0]);
    const params = new URLSearchParams(url.replace(/^\?/, ""));
    expect(params.get("sort")).toBe("newest");
    expect(params.get("page")).toBeNull();
    expect(params.get("status")).toBe("buy");
  });

  it("setView updates view and clears page", () => {
    const { result } = renderHook(() => useSearchFilters());
    act(() => result.current.setView("list"));
    const url = String(replaceMock.mock.calls[0][0]);
    const params = new URLSearchParams(url.replace(/^\?/, ""));
    expect(params.get("view")).toBe("list");
    expect(params.get("page")).toBeNull();
  });
});


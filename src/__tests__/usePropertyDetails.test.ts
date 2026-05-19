import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const fetchPropertyDetailsMock = jest.fn((id: number) => ({ type: "pd/fetch", payload: id }));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      propertyDetails: {
        item: null,
        loading: false,
        error: null,
        currentId: null,
      },
    }),
}));

jest.mock("@/features/property-details/propertyDetailsSlice", () => ({
  fetchPropertyDetails: (id: number) => fetchPropertyDetailsMock(id),
}));

import { usePropertyDetails } from "@/features/property-details/hooks/usePropertyDetails";

describe("usePropertyDetails", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    fetchPropertyDetailsMock.mockClear();
  });

  it("parses id and dispatches fetch without requiring auth", () => {
    const { result } = renderHook(() => usePropertyDetails("12"));
    expect(fetchPropertyDetailsMock).toHaveBeenCalledWith(12);
    expect(dispatchMock).toHaveBeenCalledWith({ type: "pd/fetch", payload: 12 });
    expect(result.current.resolvedPropertyId).toBe(12);
    expect(result.current.isPropertyLoading).toBe(true);
  });

  it("does not dispatch for invalid id", () => {
    renderHook(() => usePropertyDetails("0"));
    expect(dispatchMock).not.toHaveBeenCalled();
  });
});

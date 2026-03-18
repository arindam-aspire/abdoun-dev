import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const fetchPropertyDetailsMock = jest.fn((id: number) => ({ type: "pd/fetch", payload: id }));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: any) =>
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

  it("parses id and dispatches fetch", () => {
    renderHook(() => usePropertyDetails("12"));
    expect(fetchPropertyDetailsMock).toHaveBeenCalledWith(12);
    expect(dispatchMock).toHaveBeenCalledWith({ type: "pd/fetch", payload: 12 });
  });

  it("does not dispatch for invalid id", () => {
    renderHook(() => usePropertyDetails("0"));
    expect(dispatchMock).not.toHaveBeenCalled();
  });
});


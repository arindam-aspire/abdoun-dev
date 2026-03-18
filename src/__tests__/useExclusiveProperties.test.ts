import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const fetchOnceMock = jest.fn(() => ({ type: "exclusive/fetchOnce" }));

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector) =>
    selector({
      exclusiveProperties: {
        items: [],
        loading: false,
        error: null,
        status: "idle",
      },
    }),
}));

jest.mock("@/features/exclusive-properties/exclusivePropertiesSlice", () => ({
  fetchExclusivePropertiesOnce: () => fetchOnceMock(),
}));

import { useExclusiveProperties } from "@/features/public-home/hooks/useExclusiveProperties";

describe("useExclusiveProperties", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    fetchOnceMock.mockClear();
  });

  it("dispatches fetchExclusivePropertiesOnce when status is idle", () => {
    renderHook(() => useExclusiveProperties());
    expect(dispatchMock).toHaveBeenCalledWith({ type: "exclusive/fetchOnce" });
  });
});


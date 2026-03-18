import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const state = { compare: { propertyIds: [] as number[] } };

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: any) => selector(state),
}));

import { useCompareSelection } from "@/features/compare/hooks/useCompareSelection";

describe("useCompareSelection", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    state.compare.propertyIds = [];
  });

  it("exposes canCompare when >=2 selected", () => {
    state.compare.propertyIds = [1, 2];
    const { result } = renderHook(() => useCompareSelection());
    expect(result.current.canCompare).toBe(true);
  });

  it("dispatches removeFromCompare when toggling selected id", () => {
    state.compare.propertyIds = [5];
    const { result } = renderHook(() => useCompareSelection());
    result.current.toggleSelected(5);
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({ type: "compare/removeFromCompare" }));
  });
});


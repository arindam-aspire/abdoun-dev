import { renderHook } from "@testing-library/react";

const dispatchMock = jest.fn();
const state = {
  favourites: { propertyIds: [1, 2], hydratedUserId: "u1" },
  auth: { userId: "u1" },
};

jest.mock("@/hooks/storeHooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: any) => selector(state),
}));

jest.mock("@/store/selectors", () => ({
  selectCurrentUser: () => ({ id: "u1" }),
}));

import { useFavourites } from "@/features/favourites/hooks/useFavourites";

describe("useFavourites", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
  });

  it("isFavourite returns true for favourited id when authenticated", () => {
    const { result } = renderHook(() => useFavourites());
    expect(result.current.isFavourite(2)).toBe(true);
  });

  it("toggleFavouriteForUser dispatches when authenticated", () => {
    const { result } = renderHook(() => useFavourites());
    result.current.toggleFavouriteForUser(3);
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({ type: "favourites/toggleFavourite" }));
  });
});


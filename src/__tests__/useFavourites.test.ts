import { renderHook } from "@testing-library/react";
import { act } from "react";

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

const addFavoritePropertyMock = jest.fn().mockResolvedValue(true);
const removeFavoritePropertyMock = jest.fn().mockResolvedValue(true);

jest.mock("@/features/favourites/api/favourites.api", () => ({
  addFavoriteProperty: (...args: unknown[]) => addFavoritePropertyMock(...args),
  removeFavoriteProperty: (...args: unknown[]) => removeFavoritePropertyMock(...args),
}));

import { useFavourites } from "@/features/favourites/hooks/useFavourites";

describe("useFavourites", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    addFavoritePropertyMock.mockClear();
    removeFavoritePropertyMock.mockClear();
  });

  it("isFavourite returns true for favourited id when authenticated", () => {
    const { result } = renderHook(() => useFavourites());
    expect(result.current.isFavourite(2)).toBe(true);
  });

  it("toggleFavouriteForUser dispatches and calls add endpoint", async () => {
    const { result } = renderHook(() => useFavourites());
    await act(async () => {
      await result.current.toggleFavouriteForUser(3);
    });
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({ type: "favourites/toggleFavourite" }));
    expect(addFavoritePropertyMock).toHaveBeenCalledWith(3);
  });
});


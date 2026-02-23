import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface FavouritesState {
  propertyIds: number[];
  hydratedUserId: string | null;
}

const initialState: FavouritesState = {
  propertyIds: [],
  hydratedUserId: null,
};

const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {
    hydrateFavourites(
      state,
      action: PayloadAction<{ userId: string; propertyIds: number[] }>,
    ) {
      state.propertyIds = action.payload.propertyIds;
      state.hydratedUserId = action.payload.userId;
    },
    toggleFavourite(state, action: PayloadAction<number>) {
      const propertyId = action.payload;
      if (state.propertyIds.includes(propertyId)) {
        state.propertyIds = state.propertyIds.filter((id) => id !== propertyId);
        return;
      }
      state.propertyIds.push(propertyId);
    },
    clearFavourites(state) {
      state.propertyIds = [];
      state.hydratedUserId = null;
    },
  },
});

export const { hydrateFavourites, toggleFavourite, clearFavourites } =
  favouritesSlice.actions;
export default favouritesSlice.reducer;

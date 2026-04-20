import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SavedSearch } from "@/features/saved-searches/types";

export type SavedSearchItem = SavedSearch;

export interface SavedSearchesState {
  items: SavedSearchItem[];
  hydratedUserId: string | null;
}

const initialState: SavedSearchesState = {
  items: [],
  hydratedUserId: null,
};

const savedSearchesSlice = createSlice({
  name: "savedSearches",
  initialState,
  reducers: {
    hydrateSavedSearches(
      state,
      action: PayloadAction<{ userId: string; items: SavedSearchItem[] }>,
    ) {
      state.items = action.payload.items;
      state.hydratedUserId = action.payload.userId;
    },
    addSavedSearch(
      state,
      action: PayloadAction<SavedSearchItem>,
    ) {
      state.items.push(action.payload);
    },
    updateSavedSearch(
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.name = action.payload.name;
    },
    removeSavedSearch(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearSavedSearches(state) {
      state.items = [];
      state.hydratedUserId = null;
    },
  },
});

export const {
  hydrateSavedSearches,
  addSavedSearch,
  updateSavedSearch,
  removeSavedSearch,
  clearSavedSearches,
} = savedSearchesSlice.actions;
export default savedSearchesSlice.reducer;

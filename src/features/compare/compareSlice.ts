import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const MAX_COMPARE = 4;

export interface CompareState {
  propertyIds: number[];
}

const initialState: CompareState = {
  propertyIds: [],
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    toggleCompare(state, action: PayloadAction<number>) {
      const id = action.payload;
      const idx = state.propertyIds.indexOf(id);
      if (idx >= 0) {
        state.propertyIds.splice(idx, 1);
        return;
      }
      if (state.propertyIds.length >= MAX_COMPARE) return;
      state.propertyIds.push(id);
    },
    addToCompare(state, action: PayloadAction<number>) {
      const id = action.payload;
      if (state.propertyIds.includes(id) || state.propertyIds.length >= MAX_COMPARE) return;
      state.propertyIds.push(id);
    },
    removeFromCompare(state, action: PayloadAction<number>) {
      state.propertyIds = state.propertyIds.filter((i) => i !== action.payload);
    },
    clearCompare(state) {
      state.propertyIds = [];
    },
  },
});

export const { toggleCompare, addToCompare, removeFromCompare, clearCompare } =
  compareSlice.actions;
export const MAX_COMPARE_ITEMS = MAX_COMPARE;
export default compareSlice.reducer;

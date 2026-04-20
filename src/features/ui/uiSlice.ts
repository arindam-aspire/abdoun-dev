import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export type Language = "en" | "ar" | "fr" | "es";

export interface UiState {
  theme: Theme;
  language: Language;
  savedSearchContext: {
    id: string;
    name: string;
    queryString: string;
  } | null;
}

const initialState: UiState = {
  theme: "light",
  language: "en",
  savedSearchContext: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setSavedSearchContext(
      state,
      action: PayloadAction<{ id: string; name: string; queryString: string }>,
    ) {
      state.savedSearchContext = action.payload;
    },
    clearSavedSearchContext(state) {
      state.savedSearchContext = null;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setSavedSearchContext,
  clearSavedSearchContext,
} = uiSlice.actions;
export default uiSlice.reducer;


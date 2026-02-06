import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export type Language = "en" | "ar" | "fr" | "es";

export interface UiState {
  theme: Theme;
  language: Language;
}

const initialState: UiState = {
  theme: "light",
  language: "en",
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
  },
});

export const { setTheme, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;


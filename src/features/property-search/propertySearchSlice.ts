import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { SearchResultListing } from "@/features/property-search/types";
import { searchPropertiesByQuery } from "@/features/property-search/api/propertySearch.api";

type PropertySearchState = {
  items: SearchResultListing[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  lastQuery: string;
};

const initialState: PropertySearchState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  loading: false,
  error: null,
  lastQuery: "",
};

export const fetchProperties = createAsyncThunk(
  "propertySearch/fetchProperties",
  async (queryString: string, thunkApi) => {
    try {
      return await searchPropertiesByQuery(queryString);
    } catch (error) {
      const fallbackMessage = "Failed to load properties";
      if (error instanceof Error && error.message) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue(fallbackMessage);
    }
  },
);

const propertySearchSlice = createSlice({
  name: "propertySearch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastQuery = action.meta.arg;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
        state.page = 1;
        state.pageSize = 12;
        state.error =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load properties";
      });
  },
});

export default propertySearchSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { SearchResultListing } from "@/features/property-search/types";
import {
  searchPropertiesByQuery,
  type PropertySearchResult,
} from "@/features/property-search/api/propertySearch.api";
import { getApiErrorMessage, getThunkRejectedMessage } from "@/lib/http/apiError";
import { normalizePropertySearchQueryKey } from "@/features/property-search/utils/queryStringBuilder";

type PropertySearchState = {
  items: SearchResultListing[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  lastQuery: string;
  /** Normalized key for the request currently in flight (dedupe). */
  inFlightQueryKey: string | null;
  /** Normalized key for the last successful fetch (skip identical re-dispatch when `error` is clear). */
  lastSuccessfulQueryKey: string | null;
};

const initialState: PropertySearchState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  loading: true,
  error: null,
  lastQuery: "",
  inFlightQueryKey: null,
  lastSuccessfulQueryKey: null,
};

type PropertySearchThunkState = {
  propertySearch: PropertySearchState;
};

export const fetchProperties = createAsyncThunk<
  PropertySearchResult,
  string,
  { state: PropertySearchThunkState }
>(
  "propertySearch/fetchProperties",
  async (queryString: string, thunkApi) => {
    try {
      return await searchPropertiesByQuery(queryString);
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (queryString, { getState }) => {
      const s = getState().propertySearch;
      const key = normalizePropertySearchQueryKey(queryString);
      if (s.inFlightQueryKey === key) {
        return false;
      }
      if (s.lastSuccessfulQueryKey === key && s.error === null) {
        return false;
      }
      return true;
    },
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
        state.inFlightQueryKey = normalizePropertySearchQueryKey(action.meta.arg);
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.inFlightQueryKey = null;
        state.lastSuccessfulQueryKey = normalizePropertySearchQueryKey(action.meta.arg);
        state.items = action.payload.items;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.pageSize = action.payload.pagination.pageSize;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.loading = false;
        state.inFlightQueryKey = null;
        state.items = [];
        state.total = 0;
        state.page = 1;
        state.pageSize = 12;
        state.error = getThunkRejectedMessage(action, "Failed to load properties");
      });
  },
});

export default propertySearchSlice.reducer;

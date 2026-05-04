import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Property } from "@/features/public-home/components/types";
import { getExclusiveProperties } from "@/features/exclusive-properties/api/exclusiveProperties.api";
import { getApiErrorMessage, getThunkRejectedMessage } from "@/lib/http/apiError";

type ExclusivePropertiesState = {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: ExclusivePropertiesState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  loading: false,
  error: null,
  status: "idle",
};

export const fetchExclusivePropertiesOnce = createAsyncThunk(
  "exclusiveProperties/fetchExclusivePropertiesOnce",
  async (_: void, thunkApi) => {
    try {
      return await getExclusiveProperties();
    } catch (error) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const exclusivePropertiesSlice = createSlice({
  name: "exclusiveProperties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExclusivePropertiesOnce.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(fetchExclusivePropertiesOnce.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload.items;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.pageSize = action.payload.pagination.pageSize;
        state.status = "succeeded";
      })
      .addCase(fetchExclusivePropertiesOnce.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
        state.page = 1;
        state.pageSize = 12;
        state.error = getThunkRejectedMessage(
          action,
          "Failed to load exclusive properties",
        );
        state.status = "failed";
      });
  },
});

export default exclusivePropertiesSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchPropertyDetailsById,
  type PropertyDetailsApiResponse,
} from "@/features/property-details/api/propertyDetails.api";

type PropertyDetailsState = {
  item: PropertyDetailsApiResponse | null;
  loading: boolean;
  error: string | null;
  currentId: number | null;
};

const initialState: PropertyDetailsState = {
  item: null,
  loading: false,
  error: null,
  currentId: null,
};

export const fetchPropertyDetails = createAsyncThunk(
  "propertyDetails/fetchPropertyDetails",
  async (propertyId: number, thunkApi) => {
    try {
      return await fetchPropertyDetailsById(propertyId);
    } catch (error) {
      if (error instanceof Error && error.message) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue("Failed to load property details");
    }
  },
);

const propertyDetailsSlice = createSlice({
  name: "propertyDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyDetails.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentId = action.meta.arg;
      })
      .addCase(fetchPropertyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.item = action.payload;
      })
      .addCase(fetchPropertyDetails.rejected, (state, action) => {
        state.loading = false;
        state.item = null;
        state.error =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load property details";
      });
  },
});

export default propertyDetailsSlice.reducer;

import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  fetchLocationTaxonomy,
  type LocationTaxonomyCity,
} from "@/features/location-taxonomy/api/locationTaxonomy.api";
import { mapTaxonomyCitiesToJordanShape } from "@/features/location-taxonomy/locationTaxonomyMappers";

type LocationTaxonomyState = {
  cities: LocationTaxonomyCity[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Used to de-dupe parallel dispatches in the same session. */
  inFlight: boolean;
};

const initialState: LocationTaxonomyState = {
  cities: [],
  status: "idle",
  error: null,
  inFlight: false,
};

export const fetchLocationTaxonomyIfNeeded = createAsyncThunk<
  LocationTaxonomyCity[],
  void,
  { state: RootState }
>(
  "locationTaxonomy/fetchLocationTaxonomyIfNeeded",
  async (_, thunkApi) => {
    try {
      return await fetchLocationTaxonomy();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load location taxonomy.";
      return thunkApi.rejectWithValue(msg);
    }
  },
  {
    /**
     * Only hit the network when the location store is actually empty.
     * - If a request is already in flight → skip (prevents parallel duplicates).
     * - If we already have at least one city cached → skip (no refetch).
     * - Otherwise (idle / failed / succeeded-but-empty) → fetch.
     */
    condition: (_, { getState }) => {
      const s = getState().locationTaxonomy;
      if (s.inFlight) return false;
      if (s.cities.length > 0) return false;
      return true;
    },
  },
);

const locationTaxonomySlice = createSlice({
  name: "locationTaxonomy",
  initialState,
  reducers: {
    resetLocationTaxonomy() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationTaxonomyIfNeeded.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.inFlight = true;
      })
      .addCase(fetchLocationTaxonomyIfNeeded.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.inFlight = false;
        state.cities = action.payload ?? [];
      })
      .addCase(fetchLocationTaxonomyIfNeeded.rejected, (state, action) => {
        if (action.meta.condition === false) return;
        state.status = "failed";
        state.inFlight = false;
        state.error =
          (typeof action.payload === "string" ? action.payload : null) ||
          action.error.message ||
          "Failed to load location taxonomy.";
      });
  },
});

export const { resetLocationTaxonomy } = locationTaxonomySlice.actions;

export default locationTaxonomySlice.reducer;

export const selectLocationTaxonomyState = (state: RootState) => state.locationTaxonomy;
export const selectLocationTaxonomyCities = (state: RootState) => state.locationTaxonomy.cities;
export const selectLocationTaxonomyStatus = (state: RootState) => state.locationTaxonomy.status;
export const selectLocationTaxonomyError = (state: RootState) => state.locationTaxonomy.error;

export const selectJordanCitiesWithAreas = createSelector(
  [selectLocationTaxonomyCities],
  (cities) => mapTaxonomyCitiesToJordanShape(cities),
);

/**
 * Flatten all taxonomy areas into a unique, sorted list for "service area" selection.
 * Falls back to an empty list when taxonomy is not loaded.
 */
export const selectServiceAreaOptions = createSelector([selectLocationTaxonomyCities], (cities) => {
  const areas = cities.flatMap((c) => c.areas?.map((a) => a.name) ?? []);
  const unique = Array.from(new Set(areas.map((a) => (a ?? "").trim()).filter(Boolean)));
  unique.sort((a, b) => a.localeCompare(b));
  return unique.map((name) => ({ value: name, label: name }));
});

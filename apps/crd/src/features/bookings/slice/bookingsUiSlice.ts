// UI state for the bookings list (search + status filter). Hydrated from, and
// persisted to, crd:bookings.filters by app/store/persistence.ts.

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookingFilters } from "../types";
import { crdStorage, STORAGE_KEYS } from "../../../shared/lib/storage";

interface BookingsUiState {
  filters: BookingFilters;
}

const defaultFilters: BookingFilters = { search: "", status: "All" };

const initialState: BookingsUiState = {
  filters: {
    ...defaultFilters,
    ...crdStorage.get<Partial<BookingFilters>>(STORAGE_KEYS.BOOKING_FILTERS, {}),
  },
};

const bookingsUiSlice = createSlice({
  name: "bookingsUi",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<BookingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = defaultFilters;
    },
  },
});

export const { setFilters, resetFilters } = bookingsUiSlice.actions;
export default bookingsUiSlice.reducer;

export const selectBookingFilters = (s: { bookingsUi: BookingsUiState }) =>
  s.bookingsUi.filters;

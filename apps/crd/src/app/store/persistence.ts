// Central persistence for CRD Redux state.
//
// ONE place decides what survives a reload. Reducers stay pure; slices read their
// initial value from crdStorage at startup, and this subscriber writes changes
// back. Everything goes through the crd:-namespaced storage, so it cannot collide
// with ETS keys on the same origin.
//
// Persisted:  sidebar collapsed, booking list filters.
// NOT persisted (on purpose): auth user, API cache, form data. The access token
// is persisted by the shared token store, not here.

import { crdStorage, STORAGE_KEYS } from "../../shared/lib/storage";
import { selectCollapsed } from "../../features/navigation/slices/navigationSlice";
import { selectBookingFilters } from "../../features/bookings/slice/bookingsUiSlice";

interface MinimalStore {
  getState: () => never;
  subscribe: (listener: () => void) => () => void;
}

export const initPersistence = (store: unknown): void => {
  const s = store as MinimalStore;
  let lastCollapsed: boolean | undefined;
  let lastFilters: unknown;

  s.subscribe(() => {
    const state = s.getState() as Parameters<typeof selectCollapsed>[0] &
      Parameters<typeof selectBookingFilters>[0];

    const collapsed = selectCollapsed(state);
    if (collapsed !== lastCollapsed) {
      lastCollapsed = collapsed;
      crdStorage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    }

    // Reducers return a new object only when filters change -> reference check.
    const filters = selectBookingFilters(state);
    if (filters !== lastFilters) {
      lastFilters = filters;
      crdStorage.set(STORAGE_KEYS.BOOKING_FILTERS, filters);
    }
  });
};

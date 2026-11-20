import { createAppStorage } from "@commutr/shared";
import { APP_KEY } from "../constants/app.constants";

/**
 * The ONLY way CRD persists anything to localStorage (besides the shared
 * token/apps keys owned by @commutr/shared). Keys are stored as "crd:<key>",
 * so they can never collide with ETS keys on the same origin.
 */
export const crdStorage = createAppStorage(APP_KEY);

/** Keys used by CRD (single list = no accidental duplicates). */
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "navigation.collapsed",
  BOOKING_FILTERS: "bookings.filters",
} as const;

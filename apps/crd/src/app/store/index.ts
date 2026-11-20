// CRD Redux store — same structure as ETS:
//   regular slices + RTK Query API registry + resettable root reducer.
// To add an API: one import + one line in `apiSlices`. Nothing else.
//
// This store is private to CRD. ETS has its own store in its own bundle; the two
// never share state. The only cross-app data is the access token + apps list,
// which live in the shared localStorage keys owned by @commutr/shared.

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "../../features/auth/slices/authSlice";
import navigationReducer from "../../features/navigation/slices/navigationSlice";
import bookingsUiReducer from "../../features/bookings/slice/bookingsUiSlice";

import { authApi } from "../../features/auth/services/authApi";
import { bookingsApi } from "../../features/bookings/services/bookingsApi";

import { initPersistence } from "./persistence";

// ── API registry ──────────────────────────────────────────────────────────────
const apiSlices = [authApi, bookingsApi] as const;

const rootReducer = combineReducers({
  auth: authReducer,
  navigation: navigationReducer,
  bookingsUi: bookingsUiReducer,

  [authApi.reducerPath]: authApi.reducer,
  [bookingsApi.reducerPath]: bookingsApi.reducer,
});

// ── Reset everything on logout / account switch ───────────────────────────────
const resettableRootReducer = (
  state: ReturnType<typeof rootReducer> | undefined,
  action: { type: string },
) =>
  rootReducer(action.type === "app/resetAll" ? undefined : state, action as never);

export const resetAllState = () => ({ type: "app/resetAll" as const });

export const store = configureStore({
  reducer: resettableRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(...apiSlices.map((api) => api.middleware)),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);
initPersistence(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

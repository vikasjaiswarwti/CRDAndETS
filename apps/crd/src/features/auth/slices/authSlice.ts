// Same cookie-based flow as ETS:
//   • refresh token = HttpOnly cookie (never in Redux / localStorage)
//   • only the accessToken is kept, and it is persisted through the SHARED token
//     store (commutr_access_token) so ETS / the launcher see the same session.

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getToken } from "@commutr/shared";

export interface AuthUser {
  userId?: string;
  tenantId?: string;
  email?: string;
  name?: string;
  contactNumber?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: getToken(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    setTokens: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, setUser, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (s: { auth: AuthState }) =>
  !!s.auth.accessToken;
export const selectCurrentUser = (s: { auth: AuthState }) => s.auth.user;
export const selectAccessToken = (s: { auth: AuthState }) => s.auth.accessToken;

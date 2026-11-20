import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../shared/constants/app.constants";
import type {
  SharedCabParams,
  SharedCabResponse,
} from "../types/sharedCab.types";

// Public page — the JWT comes from the shared link, not the logged-in session,
// so this slice deliberately skips baseQueryWithReauth (no refresh / logout).
// const X_TENENT_ID = import.meta.env.VITE_X_TENENT_ID;

const sharedCabBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // const hostname = window.location.hostname;
    // const tenant =
    //   hostname === "localhost" ? X_TENENT_ID : hostname.split(".")[0];
    // headers.set("X-Tenant", tenant);
    return headers;
  },
});

export const sharedCabApi = createApi({
  reducerPath: "sharedCabApi",
  baseQuery: sharedCabBaseQuery,
  endpoints: (builder) => ({
    // GET /api/v1/Tracking/shared-cab?dsId={dsId}&access_token={jwt}
    getSharedCab: builder.query<SharedCabResponse, SharedCabParams>({
      query: ({ dsId, accessToken }) => ({
        url: "/api/v1/Tracking/shared-cab",
        method: "GET",
        params: { dsId, access_token: accessToken },
      }),
    }),
  }),
});

export const { useGetSharedCabQuery } = sharedCabApi;

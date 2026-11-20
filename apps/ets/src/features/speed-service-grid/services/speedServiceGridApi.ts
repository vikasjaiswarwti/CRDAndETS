import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type { City, CitySpeedRow } from "../types/speedServiceGrid.types";

export const speedServiceGridApi = createApi({
  reducerPath: "speedServiceGridApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CitySpeedProfile"],
  endpoints: (builder) => ({
    // GET /CitySpeed/cities
    getSpeedCities: builder.query<City[], void>({
      query: () => "/api/v1/CitySpeed/cities",
    }),

    // GET /CitySpeed/speed-profile/{cityId}
    getSpeedProfile: builder.query<CitySpeedRow[], number>({
      query: (cityId) => `/api/v1/CitySpeed/speed-profile/${cityId}`,
      transformResponse: (response: CitySpeedRow[] | null) => response ?? [],
      providesTags: (_result, _error, cityId) => [
        { type: "CitySpeedProfile", id: cityId },
      ],
    }),

    // PUT /CitySpeed/speed-profile-update
    updateSpeedProfile: builder.mutation<
      void,
      { speedID: number; avgSpeedKmh: number }
    >({
      query: (body) => ({
        url: "/api/v1/CitySpeed/speed-profile-update",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CitySpeedProfile"],
    }),
  }),
});

export const {
  useGetSpeedCitiesQuery,
  useGetSpeedProfileQuery,
  useUpdateSpeedProfileMutation,
} = speedServiceGridApi;

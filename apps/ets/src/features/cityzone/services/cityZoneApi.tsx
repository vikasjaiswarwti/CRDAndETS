// FILE 2 — services/cityZoneApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

import type {
  CityZone,
  CreateCityZoneDto,
  UpdateCityZoneDto,
  CityZoneListParams,
  PaginatedResponse,
} from "../types/cityZone.types";

export const cityZoneApi = createApi({
  reducerPath: "cityZoneApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CityZone"],
  endpoints: (builder) => ({
    // GET /api/v1/CityZones — list with pagination & filters
    // NOTE: API returns a plain array, no total/page meta.
    // We normalise it in transformResponse. total is derived from array length.
    getAllCityZones: builder.query<
      PaginatedResponse<CityZone>,
      CityZoneListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/CityZones",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      transformResponse: (
        raw: {
          items: CityZone[];
          page: number;
          pageSize: number;
          totalCount: number;
        },
      ): PaginatedResponse<CityZone> => {
        // console.log("🔥 RAW API RESPONSE:", raw);
        // console.log("📦 ITEMS:", raw.items);
        // console.log("📄 PAGINATION:", {
        //   page: raw.page,
        //   pageSize: raw.pageSize,
        //   totalCount: raw.totalCount,
        // });
        // console.log("📨 QUERY PARAMS SENT:", arg);
        // console.log("🛰️ META (headers etc):", meta);

        return {
          items: raw.items,
          totalCount: raw.totalCount,
          page: raw.page,
          pageSize: raw.pageSize,
        };
      },

      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ id }) => ({
              type: "CityZone" as const,
              id,
            })),
            { type: "CityZone", id: "LIST" },
          ]
          : [{ type: "CityZone", id: "LIST" }],
    }),

    // GET /api/v1/CityZones/{id}
    getCityZoneById: builder.query<CityZone, string>({
      query: (id) => ({ url: `/api/v1/CityZones/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "CityZone", id }],
    }),

    // POST /api/v1/CityZones
    createCityZone: builder.mutation<CityZone, CreateCityZoneDto>({
      query: (body) => ({
        url: "/api/v1/CityZones",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CityZone", id: "LIST" }],
    }),

    // PUT /api/v1/CityZones/{id}
    updateCityZone: builder.mutation<CityZone, UpdateCityZoneDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/CityZones/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CityZone", id },
        { type: "CityZone", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllCityZonesQuery,
  useGetCityZoneByIdQuery,
  useCreateCityZoneMutation,
  useUpdateCityZoneMutation,
} = cityZoneApi;

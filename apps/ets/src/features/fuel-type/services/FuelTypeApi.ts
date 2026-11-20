import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  FuelType,
  CreateFuelTypeDto,
  UpdateFuelTypeDto,
  FuelTypeListParams,
  PaginatedResponse, // ← Use shared generic type
} from "../types/fuelType.types";

export const fuelTypeApi = createApi({
  reducerPath: "fuelTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["FuelType"],

  endpoints: (builder) => ({
    // ── GET All Fuel Types ─────────────────────────────────────────────────
    getAllFuelTypes: builder.query<
      PaginatedResponse<FuelType>,
      FuelTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpFuelTypes",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),

      // Remove transformResponse unless your backend returns a very different structure
      // Most of your other APIs work fine without it now.

      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "FuelType" as const,
                id,
              })),
              { type: "FuelType", id: "LIST" },
            ]
          : [{ type: "FuelType", id: "LIST" }],
    }),

    // ── CREATE Fuel Type ───────────────────────────────────────────────────
    createFuelType: builder.mutation<FuelType, CreateFuelTypeDto>({
      query: (body) => ({
        url: "/api/v1/LkpFuelTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "FuelType", id: "LIST" }],
    }),

    // ── UPDATE Fuel Type ───────────────────────────────────────────────────
    updateFuelType: builder.mutation<FuelType, UpdateFuelTypeDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpFuelTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "FuelType", id },
        { type: "FuelType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllFuelTypesQuery,
  useCreateFuelTypeMutation,
  useUpdateFuelTypeMutation,
} = fuelTypeApi;

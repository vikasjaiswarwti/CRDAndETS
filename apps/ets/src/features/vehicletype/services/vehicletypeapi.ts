import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  VehicleType,
  CreateVehicleTypeDto,
  UpdateVehicleTypeDto,
  VehicleTypeListParams,
  PaginatedResponse,
} from "../types/vehicType.types";

export const vehicleTypeApi = createApi({
  reducerPath: "vehicleTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VehicleType"],

  endpoints: (builder) => ({
    // ── GET /api/v1/VehicleTypes ──────────────────────────────────────────
    getAllVehicleTypes: builder.query<
      PaginatedResponse<VehicleType>,
      VehicleTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/VehicleTypes",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      // No transformResponse needed — API already returns correct shape:
      // { items, page, pageSize, totalCount, hasNextPage, hasPrevPage }
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ vehicleType_Id }) => ({
                type: "VehicleType" as const,
                vehicleType_Id,
              })),
              { type: "VehicleType", id: "LIST" },
            ]
          : [{ type: "VehicleType", id: "LIST" }],
    }),

    // ── POST /api/v1/VehicleTypes ─────────────────────────────────────────
    createVehicleType: builder.mutation<VehicleType, CreateVehicleTypeDto>({
      query: (body) => ({
        url: "/api/v1/VehicleTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VehicleType", id: "LIST" }],
    }),

    // ── PUT /api/v1/VehicleTypes/{id} ─────────────────────────────────────
    updateVehicleType: builder.mutation<VehicleType, UpdateVehicleTypeDto>({
      query: ({ vehicleType_Id, ...body }) => ({
        url: `/api/v1/VehicleTypes/${vehicleType_Id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { vehicleType_Id }) => [
        { type: "VehicleType", vehicleType_Id },
        { type: "VehicleType", id: "LIST" },
      ],
    }),

    // NOTE: No GET-by-id or DELETE endpoint added (as per your comment)
  }),
});

export const {
  useGetAllVehicleTypesQuery,
  useCreateVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
} = vehicleTypeApi;

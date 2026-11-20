import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LkpBillPlanType,
  CreateBillPlanTypeDto,
  UpdateBillPlanTypeDto,
  BillPlanTypeListParams,
  PaginatedResponse,
} from "../types/bill-plan-type";

export const billPlanTypeApi = createApi({
  reducerPath: "billPlanTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BillPlanType"],

  endpoints: (builder) => ({
    // ── GET /api/v1/LkpBillPlanTypes ──────────────────────────────────────
    getAllBillPlanTypes: builder.query<
      PaginatedResponse<LkpBillPlanType>,
      BillPlanTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpBillPlanTypes",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),

      // REMOVE transformResponse - API already returns PaginatedResponse
      // The API response matches your PaginatedResponse type

      // Fix providesTags to work with the API's paginated response
      providesTags: (result, error) => {
        if (error) {
          return [{ type: "BillPlanType", id: "LIST" }];
        }

        // result is already PaginatedResponse<LkpBillPlanType>
        if (result?.items && Array.isArray(result.items)) {
          return [
            ...result.items.map(({ id }) => ({
              type: "BillPlanType" as const,
              id,
            })),
            { type: "BillPlanType", id: "LIST" },
          ];
        }

        return [{ type: "BillPlanType", id: "LIST" }];
      },
    }),

    // ── GET /api/v1/LkpBillPlanTypes/{id} ────────────────────────────────
    getBillPlanTypeById: builder.query<LkpBillPlanType, string>({
      query: (id) => ({ url: `/api/v1/LkpBillPlanTypes/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "BillPlanType", id }],
    }),

    // ── POST /api/v1/LkpBillPlanTypes ────────────────────────────────────
    createBillPlanType: builder.mutation<
      LkpBillPlanType,
      CreateBillPlanTypeDto
    >({
      query: (body) => ({
        url: "/api/v1/LkpBillPlanTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "BillPlanType", id: "LIST" }],
    }),

    // ── PUT /api/v1/LkpBillPlanTypes/{id} ────────────────────────────────
    updateBillPlanType: builder.mutation<
      LkpBillPlanType,
      UpdateBillPlanTypeDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpBillPlanTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "BillPlanType", id },
        { type: "BillPlanType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllBillPlanTypesQuery,
  useGetBillPlanTypeByIdQuery,
  useCreateBillPlanTypeMutation,
  useUpdateBillPlanTypeMutation,
} = billPlanTypeApi;

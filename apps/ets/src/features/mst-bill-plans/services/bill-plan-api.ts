import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  MstBillPlan,
  CreateBillPlanDto,
  UpdateBillPlanDto,
  BillPlanListParams,
  PaginatedResponse,
} from "../types/bill-plan.types";

export const billPlanApi = createApi({
  reducerPath: "billPlanApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BillPlan"],

  endpoints: (builder) => ({
    // ── GET /api/v1/MstBillPlans ──────────────────────────────────────────

    // ── GET /api/v1/MstBillPlans ──────────────────────────────────────────
    getAllBillPlans: builder.query<
      PaginatedResponse<MstBillPlan>,
      BillPlanListParams
    >({
      query: ({
        location="",
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/MstBillPlans",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize, location },
      }),

      // ────────────────────────────────────────────────────────────────
      // Backend already returns correct PaginatedResponse shape → NO heavy transform needed
      // ────────────────────────────────────────────────────────────────
      transformResponse: (response: any): PaginatedResponse<MstBillPlan> => {
        // Minimal safeguard only (in case of null/undefined)
        if (!response || typeof response !== "object") {
          return {
            items: [],
            page: 1,
            pageSize: 10,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }

        return {
          items: response.items || [],
          page: response.page ?? 1,
          pageSize: response.pageSize ?? 10,
          totalCount: response.totalCount ?? (response.items?.length || 0),
          hasNextPage: response.hasNextPage ?? false,
          hasPrevPage: response.hasPrevPage ?? false,
        };
      },

      providesTags: (result, error) => {
        if (error || !result) {
          return [{ type: "BillPlan", id: "LIST" }];
        }

        return [
          ...(result.items || []).map(({ id }) => ({
            type: "BillPlan" as const,
            id,
          })),
          { type: "BillPlan", id: "LIST" },
        ];
      },
    }),

    // ── GET /api/v1/MstBillPlans/{id} ─────────────────────────────────────
    getBillPlanById: builder.query<MstBillPlan, string>({
      query: (id) => ({ url: `/api/v1/MstBillPlans/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "BillPlan", id }],
    }),

    // ── POST /api/v1/MstBillPlans ─────────────────────────────────────────
    createBillPlan: builder.mutation<MstBillPlan, CreateBillPlanDto>({
      query: (body) => ({
        url: "/api/v1/MstBillPlans",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "BillPlan", id: "LIST" }],
    }),

    // ── PUT /api/v1/MstBillPlans/{id} ─────────────────────────────────────
    updateBillPlan: builder.mutation<MstBillPlan, UpdateBillPlanDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/MstBillPlans/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "BillPlan", id },
        { type: "BillPlan", id: "LIST" },
      ],
    }),
    // No DELETE endpoint as per your comment
  }),
});

export const {
  useGetAllBillPlansQuery,
  useGetBillPlanByIdQuery,
  useCreateBillPlanMutation,
  useUpdateBillPlanMutation,
} = billPlanApi;

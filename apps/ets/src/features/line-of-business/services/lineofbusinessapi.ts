import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LineOfBusiness,
  CreateLineOfBusinessDto,
  UpdateLineOfBusinessDto,
  LineOfBusinessListParams,
  PaginatedResponse,
} from "../types/line-of-business.types";

// ─── API slice ─────────────────────────────────────────────────────────────────

export const lineOfBusinessApi = createApi({
  reducerPath: "lineOfBusinessApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LineOfBusiness"],

  endpoints: (builder) => ({
    // ── GET list ──────────────────────────────────────────────────────────────
    getAllLineOfBusiness: builder.query<
      PaginatedResponse<LineOfBusiness>,
      LineOfBusinessListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LineOfBusiness",
        params: {
          searchTerm,
          sortColumn,
          sortOrder,
          page,
          pageSize,
        },
      }),

      // Backend now returns full PaginatedResponse (with totalCount, hasNextPage, etc.)
      // We only do minimal mapping for consistency with your PaginatedResponse type
      transformResponse: (response: any): PaginatedResponse<LineOfBusiness> => {
        if (!response || typeof response !== "object") {
          return {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
          };
        }

        return {
          items: response.items || [],
          total: response.totalCount ?? (response.items?.length || 0),
          page: response.page ?? 1,
          pageSize: response.pageSize ?? 10,
        };
      },

      providesTags: (result, error) => {
        if (error || !result) {
          return [{ type: "LineOfBusiness", id: "LIST" }];
        }

        return [
          ...result.items.map(({ lobCode_Id }) => ({
            type: "LineOfBusiness" as const,
            id: lobCode_Id,
          })),
          { type: "LineOfBusiness", id: "LIST" },
        ];
      },
    }),

    // ── GET by ID ─────────────────────────────────────────────────────────────
    getLineOfBusinessById: builder.query<LineOfBusiness, string>({
      query: (id) => ({ url: `/api/v1/LineOfBusiness/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "LineOfBusiness", id }],
    }),

    // ── POST create ───────────────────────────────────────────────────────────
    createLineOfBusiness: builder.mutation<
      LineOfBusiness,
      CreateLineOfBusinessDto
    >({
      query: (body) => ({
        url: "/api/v1/LineOfBusiness",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LineOfBusiness", id: "LIST" }],
    }),

    // ── PUT update ────────────────────────────────────────────────────────────
    updateLineOfBusiness: builder.mutation<
      LineOfBusiness,
      UpdateLineOfBusinessDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LineOfBusiness/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LineOfBusiness", id },
        { type: "LineOfBusiness", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLineOfBusinessQuery,
  useGetLineOfBusinessByIdQuery,
  useCreateLineOfBusinessMutation,
  useUpdateLineOfBusinessMutation,
} = lineOfBusinessApi;

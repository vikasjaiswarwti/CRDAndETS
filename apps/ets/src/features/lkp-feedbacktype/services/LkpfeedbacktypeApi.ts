import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LkpFeedbackType,
  CreateLkpFeedbackTypeDto,
  UpdateLkpFeedbackTypeDto,
  LkpFeedbackTypeListParams,
  PaginatedResponse,
} from "../types/Lkpfeedbacktype.types";

export const lkpFeedbackTypeApi = createApi({
  reducerPath: "lkpFeedbackTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LkpFeedbackType"],
  endpoints: (builder) => ({
    getAllLkpFeedbackTypes: builder.query<
      PaginatedResponse<LkpFeedbackType>,
      LkpFeedbackTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpFeedbackType",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ feedbackType_ID }) => ({
                type: "LkpFeedbackType" as const,
                id: feedbackType_ID,
              })),
              { type: "LkpFeedbackType", id: "LIST" },
            ]
          : [{ type: "LkpFeedbackType", id: "LIST" }],
    }),

    getLkpFeedbackTypeById: builder.query<LkpFeedbackType, string>({
      query: (id) => `/api/v1/LkpFeedbackType/${id}`,
      providesTags: (_result, _err, id) => [{ type: "LkpFeedbackType", id }],
    }),

    createLkpFeedbackType: builder.mutation<
      LkpFeedbackType,
      CreateLkpFeedbackTypeDto
    >({
      query: (body) => ({
        url: "/api/v1/LkpFeedbackType",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LkpFeedbackType", id: "LIST" }],
    }),

    updateLkpFeedbackType: builder.mutation<
      LkpFeedbackType,
      UpdateLkpFeedbackTypeDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpFeedbackType/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LkpFeedbackType", id },
        { type: "LkpFeedbackType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLkpFeedbackTypesQuery,
  useGetLkpFeedbackTypeByIdQuery,
  useCreateLkpFeedbackTypeMutation,
  useUpdateLkpFeedbackTypeMutation,
} = lkpFeedbackTypeApi;

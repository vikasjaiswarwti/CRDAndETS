import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  DocumentOwnerType,
  CreateDocumentOwnerTypeDto,
  UpdateDocumentOwnerTypeDto,
  DocumentOwnerTypeListParams,
  PaginatedResponse,
} from "../types/documentOwnerType.types";

export const documentOwnerTypeApi = createApi({
  reducerPath: "documentOwnerTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DocumentOwnerType"],

  endpoints: (builder) => ({
    // ── GET /api/v1/DocumentOwnerTypes ─────────────────────────────────────
    getAllDocumentOwnerTypes: builder.query<
      PaginatedResponse<DocumentOwnerType>,
      DocumentOwnerTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/DocumentOwnerTypes",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ docOwnerType_Id }) => ({
                type: "DocumentOwnerType" as const,
                id: docOwnerType_Id,
              })),
              { type: "DocumentOwnerType", id: "LIST" },
            ]
          : [{ type: "DocumentOwnerType", id: "LIST" }],
    }),

    // ── POST /api/v1/DocumentOwnerTypes ────────────────────────────────────
    createDocumentOwnerType: builder.mutation<
      DocumentOwnerType,
      CreateDocumentOwnerTypeDto
    >({
      query: (body) => ({
        url: "/api/v1/DocumentOwnerTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DocumentOwnerType", id: "LIST" }],
    }),

    // ── PUT /api/v1/DocumentOwnerTypes/{id} ────────────────────────────────
    updateDocumentOwnerType: builder.mutation<
      DocumentOwnerType,
      UpdateDocumentOwnerTypeDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/DocumentOwnerTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "DocumentOwnerType", id },
        { type: "DocumentOwnerType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllDocumentOwnerTypesQuery,
  useCreateDocumentOwnerTypeMutation,
  useUpdateDocumentOwnerTypeMutation,
} = documentOwnerTypeApi;

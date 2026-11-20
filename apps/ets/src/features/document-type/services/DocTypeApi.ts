import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  DocumentType,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  DocumentTypeListParams,
  PaginatedResponse,
} from "../types/docType.types";

export const documentTypeApi = createApi({
  reducerPath: "documentTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DocumentType"],

  endpoints: (builder) => ({
    // GET All Document Types
    getAllDocumentTypes: builder.query<
      PaginatedResponse<DocumentType>,
      DocumentTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/DocumentTypes",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ docType_Id }) => ({
                type: "DocumentType" as const,
                id: docType_Id,
              })),
              { type: "DocumentType", id: "LIST" },
            ]
          : [{ type: "DocumentType", id: "LIST" }],
    }),

    // CREATE
    createDocumentType: builder.mutation<DocumentType, CreateDocumentTypeDto>({
      query: (body) => ({
        url: "/api/v1/DocumentTypes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DocumentType", id: "LIST" }],
    }),

    // UPDATE
    updateDocumentType: builder.mutation<DocumentType, UpdateDocumentTypeDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/DocumentTypes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "DocumentType", id },
        { type: "DocumentType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
} = documentTypeApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  AddressChange,
  AddressChangeListParams,
  ApproveRejectDto,
  EmployeeApprovalRequest,
  PaginatedResponse,
} from "../types/addressChanges.types";

export const addressChangesApi = createApi({
  reducerPath: "addressChangesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AddressChange"],
  endpoints: (builder) => ({
    // getAll: builder.query<PaginatedResponse<AddressChange>, AddressChangeListParams>({
    //   query: ({ searchTerm = '', sortColumn = '', sortOrder = '', page, pageSize }) => ({
    //     url: '/api/v1/AddressChanges',
    //     params: { searchTerm, sortColumn, sortOrder, page, pageSize },
    //   }),
    //   transformResponse: (response: any) => {
    //     return response;
    //   },
    //   providesTags: (result) =>
    //     result
    //       ? [
    //         ...result.items.map(({ profileUpdate_Id }) => ({
    //           type: 'AddressChange' as const,
    //           id: profileUpdate_Id,
    //         })),
    //         { type: 'AddressChange', id: 'LIST' },
    //       ]
    //       : [{ type: 'AddressChange', id: 'LIST' }],
    // }),

    getAll: builder.query<
      PaginatedResponse<AddressChange>,
      AddressChangeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        status = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/AddressChanges",
        params: { searchTerm, sortColumn, sortOrder, status, page, pageSize },
      }),
      transformResponse: (response: any) => response,
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ profileUpdate_Id }) => ({
              type: "AddressChange" as const,
              id: profileUpdate_Id,
            })),
            { type: "AddressChange", id: "LIST" },
          ]
          : [{ type: "AddressChange", id: "LIST" }],
    }),

    approveReject: builder.mutation<void, ApproveRejectDto>({
      query: (body) => ({
        url: "/api/v1/AddressChanges/approve-reject",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { profileUpdate_Id }) => [
        { type: "AddressChange", id: profileUpdate_Id },
        { type: "AddressChange", id: "LIST" },
      ],
    }),
    bulkApproveReject: builder.mutation<void, EmployeeApprovalRequest>({
      query: (body) => ({
        url: "/api/v1/AddressChanges/bulk-approve-reject",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error) => [
        { type: "AddressChange", id: "LIST" },
      ],
    }),
  }),
});

export const {
  // useGetAllQuery,
  useLazyGetAllQuery,
  useApproveRejectMutation,
  useBulkApproveRejectMutation
} = addressChangesApi;

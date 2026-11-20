import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  EmployeeType,
  CreateEmployeeTypeDto,
  UpdateEmployeeTypeDto,
  EmployeeTypeListParams,
  PaginatedResponse,
} from "../types/emplType.types";

export const employeeTypeApi = createApi({
  reducerPath: "employeeTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["EmployeeType"],
  endpoints: (builder) => ({
    getAllEmployeeTypes: builder.query<
      PaginatedResponse<EmployeeType>,
      EmployeeTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpEmployeeType",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      // API returns EmployeeType[] directly — wrap into PaginatedResponse
      transformResponse: (raw: any, _meta, arg) => {
        const data = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : [];

        return {
          items: data,
          totalCount: data.length,
          page: arg.page,
          pageSize: arg.pageSize,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ empTypeCode_Id }) => ({
                type: "EmployeeType" as const,
                id: empTypeCode_Id,
              })),
              { type: "EmployeeType", id: "LIST" },
            ]
          : [{ type: "EmployeeType", id: "LIST" }],
    }),

    getEmployeeTypeById: builder.query<EmployeeType, string>({
      query: (id) => ({ url: `/api/v1/LkpEmployeeType/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "EmployeeType", id }],
    }),

    createEmployeeType: builder.mutation<EmployeeType, CreateEmployeeTypeDto>({
      query: (body) => ({
        url: "/api/v1/LkpEmployeeType",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "EmployeeType", id: "LIST" }],
    }),

    updateEmployeeType: builder.mutation<EmployeeType, UpdateEmployeeTypeDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpEmployeeType/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "EmployeeType", id },
        { type: "EmployeeType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllEmployeeTypesQuery,
  useGetEmployeeTypeByIdQuery,
  useCreateEmployeeTypeMutation,
  useUpdateEmployeeTypeMutation,
} = employeeTypeApi;

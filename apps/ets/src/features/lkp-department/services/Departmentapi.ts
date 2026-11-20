import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentListParams,
  PaginatedResponse,
} from "../types/department.type";

export const departmentApi = createApi({
  reducerPath: "departmentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    getAllDepartments: builder.query<
      PaginatedResponse<Department>,
      DepartmentListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpDepartment",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      // API returns Department[] directly — wrap into PaginatedResponse
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
              ...result.items.map(({ dept_Id }) => ({
                type: "Department" as const,
                id: dept_Id,
              })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),

    getDepartmentById: builder.query<Department, string>({
      query: (id) => ({ url: `/api/v1/LkpDepartment/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Department", id }],
    }),

    createDepartment: builder.mutation<Department, CreateDepartmentDto>({
      query: (body) => ({
        url: "/api/v1/LkpDepartment",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Department", id: "LIST" }],
    }),

    updateDepartment: builder.mutation<Department, UpdateDepartmentDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpDepartment/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} = departmentApi;

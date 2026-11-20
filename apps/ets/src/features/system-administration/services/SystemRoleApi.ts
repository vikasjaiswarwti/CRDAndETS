import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleListParams,
  PaginatedResponse,
} from "../types/SystemRolePermission.types";

export const roleApi = createApi({
  reducerPath: "systemRoleApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    getAllRoles: builder.query<PaginatedResponse<Role>, RoleListParams>({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/RoleManagement",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Role" as const,
                id,
              })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
    }),

    getRoleById: builder.query<Role, string>({
      query: (id) => ({ url: `/api/v1/RoleManagement/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Role", id }],
    }),

    createRole: builder.mutation<Role, CreateRoleDto>({
      query: (body) => ({
        url: "/api/v1/RoleManagement",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRole: builder.mutation<Role, UpdateRoleDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/RoleManagement/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} = roleApi;

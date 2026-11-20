// src/features/role-menu-mapping/services/roleMenuMappingApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  RoleMenuMapping,
  CreateRoleMenuMappingDto,
  UpdateRoleMenuMappingDto,
  RoleMenuMappingListParams,
  PaginatedResponse,
} from "../types/roleMenuMapping.types";

export const roleMenuMappingApi = createApi({
  reducerPath: "roleMenuMappingListApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RoleMenuMapping"],

  endpoints: (builder) => ({
    getAllRoleMenuMappings: builder.query<
      PaginatedResponse<RoleMenuMapping>,
      RoleMenuMappingListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page = 1,
        pageSize = 10,
      }) => ({
        url: "/api/v1/RoleMenuMapping",
        params: {
          searchTerm,
          sortColumn,
          sortOrder,
          page,
          pageSize,
        },
      }),
      // ← Removed transformResponse — let RTK Query use the raw response directly
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "RoleMenuMapping" as const,
                id,
              })),
              { type: "RoleMenuMapping", id: "LIST" },
            ]
          : [{ type: "RoleMenuMapping", id: "LIST" }],
    }),

    getRoleMenuMappingById: builder.query<RoleMenuMapping, string>({
      query: (id) => ({ url: `/api/v1/RoleMenuMapping/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "RoleMenuMapping", id }],
    }),

    createRoleMenuMapping: builder.mutation<
      RoleMenuMapping,
      CreateRoleMenuMappingDto
    >({
      query: (body) => ({
        url: "/api/v1/RoleMenuMapping",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RoleMenuMapping", id: "LIST" }],
    }),

    updateRoleMenuMapping: builder.mutation<
      RoleMenuMapping,
      UpdateRoleMenuMappingDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/RoleMenuMapping/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "RoleMenuMapping", id },
        { type: "RoleMenuMapping", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllRoleMenuMappingsQuery,
  useGetRoleMenuMappingByIdQuery,
  useCreateRoleMenuMappingMutation,
  useUpdateRoleMenuMappingMutation,
} = roleMenuMappingApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type { PaginatedResponse } from "../types/SystemRolePermission.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleMenuMapping {
  id: string;
  roleId: string;
  menuId: string | null;
  isActive: boolean;
}

export interface RoleMenuMappingListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface CreateRoleMenuMappingDto {
  roleId: string;
  menuId: string;
  isActive: boolean;
}

export interface UpdateRoleMenuMappingDto {
  id: string;
  roleId: string;
  menuId: string;
  isActive: boolean;
}

/** Shape returned by /tree/{roleId} — mirrors your MenuItem but with isAssigned populated */
export interface RoleMenuTreeItem {
  menuId: string;
  menuName: string;
  parentMenuId: string | null;
  orderNo: number;
  isAssigned: boolean;
  routeUrl: string;
  icon: string;
  isShow?: boolean;
  isActive: boolean;
  mappingId?: string; // the RoleMenuMapping.id, present when isAssigned === true
  children?: RoleMenuTreeItem[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const roleMenuMappingApi = createApi({
  reducerPath: "roleMenuMappingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RoleMenuMapping"],
  endpoints: (builder) => ({
    /** GET /api/v1/RoleMenuMapping?... — paginated flat list */
    getAllRoleMenuMappings: builder.query<
      PaginatedResponse<RoleMenuMapping>,
      RoleMenuMappingListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/RoleMenuMapping",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
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

    /** GET /api/v1/RoleMenuMapping/{id} */
    getRoleMenuMappingById: builder.query<RoleMenuMapping, string>({
      query: (id) => ({ url: `/api/v1/RoleMenuMapping/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "RoleMenuMapping", id }],
    }),

    /**
     * GET /api/v1/RoleMenuMapping/tree/{roleId}
     * Returns full menu tree with isAssigned reflecting what is mapped to this role.
     */
    getRoleMenuTree: builder.query<RoleMenuTreeItem[], string>({
      query: (roleId) => ({ url: `/api/v1/RoleMenuMapping/tree/${roleId}` }),
      providesTags: (_r, _e, roleId) => [
        { type: "RoleMenuMapping", id: `TREE-${roleId}` },
      ],
    }),

    /** POST /api/v1/RoleMenuMapping — assign a single menu to a role */
    createRoleMenuMapping: builder.mutation<
      RoleMenuMapping,
      CreateRoleMenuMappingDto
    >({
      query: (body) => ({
        url: "/api/v1/RoleMenuMapping",
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "RoleMenuMapping", id: "LIST" },
        { type: "RoleMenuMapping", id: `TREE-${arg.roleId}` },
      ],
    }),

    /** PUT /api/v1/RoleMenuMapping/{id} — update a single mapping (toggle isActive) */
    updateRoleMenuMapping: builder.mutation<
      RoleMenuMapping,
      UpdateRoleMenuMappingDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/RoleMenuMapping/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "RoleMenuMapping", id: arg.id },
        { type: "RoleMenuMapping", id: "LIST" },
        { type: "RoleMenuMapping", id: `TREE-${arg.roleId}` },
      ],
    }),

    /**
     * POST /api/v1/RoleMenuMapping/roles/{roleId}/menus
     * Bulk-assign an array of menuIds to a role (replaces all existing mappings).
     * Body: string[]  (array of menuId strings)
     */
    bulkAssignMenusToRole: builder.mutation<
      void,
      { roleId: string; menuIds: string[] }
    >({
      query: ({ roleId, menuIds }) => ({
        url: `/api/v1/RoleMenuMapping/roles/${roleId}/menus`,
        method: "POST",
        body: menuIds,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "RoleMenuMapping", id: "LIST" },
        { type: "RoleMenuMapping", id: `TREE-${arg.roleId}` },
      ],
    }),
  }),
});

export const {
  useGetAllRoleMenuMappingsQuery,
  useGetRoleMenuMappingByIdQuery,
  useGetRoleMenuTreeQuery,
  useCreateRoleMenuMappingMutation,
  useUpdateRoleMenuMappingMutation,
  useBulkAssignMenusToRoleMutation,
} = roleMenuMappingApi;

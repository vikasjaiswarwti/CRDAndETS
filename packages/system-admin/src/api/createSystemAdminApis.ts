// ─────────────────────────────────────────────────────────────────────────────
// Data layer for System Administration.
//
// The screens are shared between apps, the DATA is not: each app calls this
// factory with ITS OWN base query and URL prefix and gets its own RTK Query
// APIs (registered in that app's store). Nothing here knows about ETS or CRD.
//
//   ETS: createSystemAdminApis({ baseQuery: etsBaseQuery, basePath: "/api/v1" })
//   CRD: createSystemAdminApis({ baseQuery: crdBaseQuery, basePath: "/v1" })
//        (CRD's base query already prepends /crd-api)
//
// Backend contract (identical shape for every app):
//   {basePath}/RoleManagement, /Menu, /RoleMenuMapping
//   (+ /RoleMenuMapping/tree/{roleId}, /RoleMenuMapping/roles/{roleId}/menus)
//   {basePath}/Permissions/menu/{menuId}/role/{roleId}
//   {basePath}/Permissions/role/bulk-update
//
// reducerPaths are kept exactly as ETS had them, so the ETS store state shape
// does not change.
// ─────────────────────────────────────────────────────────────────────────────

import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleListParams,
  PaginatedResponse,
  CreateMenuResponse,
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  MenuListParams,
} from "../types/SystemRolePermission.types";
import type {
  MenuPermissionsResponse,
  BulkUpdatePermissionsDto,
  RoleMenuMapping,
  RoleMenuMappingListParams,
  CreateRoleMenuMappingDto,
  UpdateRoleMenuMappingDto,
  RoleMenuTreeItem,
} from "./types";

export type SystemAdminBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;

export interface SystemAdminApiConfig {
  /** The app's own base query (adds auth header, tenant, token refresh...). */
  baseQuery: SystemAdminBaseQuery;
  /** URL prefix in front of RoleManagement / Menu / ..., e.g. "/api/v1". No trailing slash. */
  basePath: string;
}

export const createSystemAdminApis = ({
  baseQuery,
  basePath,
}: SystemAdminApiConfig) => {
  // ── Roles ──────────────────────────────────────────────────────────────────
  const roleApi = createApi({
    reducerPath: "systemRoleApi",
    baseQuery,
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
          url: `${basePath}/RoleManagement`,
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
        query: (id) => ({ url: `${basePath}/RoleManagement/${id}` }),
        providesTags: (_result, _error, id) => [{ type: "Role", id }],
      }),

      createRole: builder.mutation<Role, CreateRoleDto>({
        query: (body) => ({
          url: `${basePath}/RoleManagement`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "Role", id: "LIST" }],
      }),

      updateRole: builder.mutation<Role, UpdateRoleDto>({
        query: ({ id, ...body }) => ({
          url: `${basePath}/RoleManagement/${id}`,
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

  // ── Menus ──────────────────────────────────────────────────────────────────
  const menuApi = createApi({
    reducerPath: "adminMenuApi",
    baseQuery,
    tagTypes: ["Menu"],
    endpoints: (builder) => ({
      getAllMenus: builder.query<PaginatedResponse<MenuItem>, MenuListParams>({
        query: ({
          searchTerm = "",
          sortColumn = "",
          sortOrder = "",
          page,
          pageSize,
        }) => ({
          url: `${basePath}/Menu`,
          params: { searchTerm, sortColumn, sortOrder, page, pageSize },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.items.map(({ menuId }) => ({
                  type: "Menu" as const,
                  id: menuId,
                })),
                { type: "Menu", id: "LIST" },
              ]
            : [{ type: "Menu", id: "LIST" }],
      }),

      getMenuById: builder.query<MenuItem, string>({
        query: (id) => ({ url: `${basePath}/Menu/${id}` }),
        providesTags: (_result, _error, id) => [{ type: "Menu", id }],
      }),

      createMenu: builder.mutation<CreateMenuResponse, CreateMenuDto>({
        query: (body) => ({
          url: `${basePath}/Menu`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "Menu", id: "LIST" }],
      }),

      updateMenu: builder.mutation<MenuItem, UpdateMenuDto>({
        query: ({ id, ...body }) => ({
          url: `${basePath}/Menu/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Menu", id },
          { type: "Menu", id: "LIST" },
        ],
      }),
    }),
  });

  // ── Permissions ────────────────────────────────────────────────────────────
  const permissionApi = createApi({
    reducerPath: "systemPermissionApi",
    baseQuery,
    tagTypes: ["Permission"],
    endpoints: (builder) => ({
      getMenuPermissions: builder.query<
        MenuPermissionsResponse,
        { menuId: string; roleId: string }
      >({
        query: ({ menuId, roleId }) => ({
          url: `${basePath}/Permissions/menu/${menuId}/role/${roleId}`,
        }),
        providesTags: (_r, _e, { menuId, roleId }) => [
          { type: "Permission", id: `${menuId}-${roleId}` },
        ],
      }),

      bulkUpdatePermissions: builder.mutation<void, BulkUpdatePermissionsDto>({
        query: (body) => ({
          url: `${basePath}/Permissions/role/bulk-update`,
          method: "POST",
          body,
        }),
        invalidatesTags: (_r, _e, { menuId, roleId }) => [
          { type: "Permission", id: `${menuId}-${roleId}` },
        ],
      }),
    }),
  });

  // ── Role ↔ menu mapping ────────────────────────────────────────────────────
  const roleMenuMappingApi = createApi({
    reducerPath: "roleMenuMappingApi",
    baseQuery,
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
          page,
          pageSize,
        }) => ({
          url: `${basePath}/RoleMenuMapping`,
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

      getRoleMenuMappingById: builder.query<RoleMenuMapping, string>({
        query: (id) => ({ url: `${basePath}/RoleMenuMapping/${id}` }),
        providesTags: (_r, _e, id) => [{ type: "RoleMenuMapping", id }],
      }),

      /** Full menu tree with isAssigned reflecting what is mapped to this role. */
      getRoleMenuTree: builder.query<RoleMenuTreeItem[], string>({
        query: (roleId) => ({
          url: `${basePath}/RoleMenuMapping/tree/${roleId}`,
        }),
        providesTags: (_r, _e, roleId) => [
          { type: "RoleMenuMapping", id: `TREE-${roleId}` },
        ],
      }),

      createRoleMenuMapping: builder.mutation<
        RoleMenuMapping,
        CreateRoleMenuMappingDto
      >({
        query: (body) => ({
          url: `${basePath}/RoleMenuMapping`,
          method: "POST",
          body,
        }),
        invalidatesTags: (_r, _e, arg) => [
          { type: "RoleMenuMapping", id: "LIST" },
          { type: "RoleMenuMapping", id: `TREE-${arg.roleId}` },
        ],
      }),

      updateRoleMenuMapping: builder.mutation<
        RoleMenuMapping,
        UpdateRoleMenuMappingDto
      >({
        query: ({ id, ...body }) => ({
          url: `${basePath}/RoleMenuMapping/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (_r, _e, arg) => [
          { type: "RoleMenuMapping", id: arg.id },
          { type: "RoleMenuMapping", id: "LIST" },
          { type: "RoleMenuMapping", id: `TREE-${arg.roleId}` },
        ],
      }),

      /** Bulk-assign menuIds to a role (replaces all existing mappings). Body: string[] */
      bulkAssignMenusToRole: builder.mutation<
        void,
        { roleId: string; menuIds: string[] }
      >({
        query: ({ roleId, menuIds }) => ({
          url: `${basePath}/RoleMenuMapping/roles/${roleId}/menus`,
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

  return { roleApi, menuApi, permissionApi, roleMenuMappingApi };
};

export type SystemAdminApis = ReturnType<typeof createSystemAdminApis>;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

export interface AvailablePermission {
  id: number;
  name: string;
  isAssigned: boolean;
}

export interface MenuPermissionsResponse {
  menuId: string;
  availablePermissions: AvailablePermission[];
}

export interface BulkUpdatePermissionsDto {
  roleId: string;
  menuId: string;
  permissionIds: number[];
}

export const systemPermissionApi = createApi({
  reducerPath: "systemPermissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Permission"],
  endpoints: (builder) => ({
    getMenuPermissions: builder.query<
      MenuPermissionsResponse,
      { menuId: string; roleId: string }
    >({
      query: ({ menuId, roleId }) => ({
        url: `/api/v1/Permissions/menu/${menuId}/role/${roleId}`,
      }),
      providesTags: (_r, _e, { menuId, roleId }) => [
        { type: "Permission", id: `${menuId}-${roleId}` },
      ],
    }),

    bulkUpdatePermissions: builder.mutation<void, BulkUpdatePermissionsDto>({
      query: (body) => ({
        url: "/api/v1/Permissions/role/bulk-update",
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { menuId, roleId }) => [
        { type: "Permission", id: `${menuId}-${roleId}` },
      ],
    }),
  }),
});

export const { useGetMenuPermissionsQuery, useBulkUpdatePermissionsMutation } =
  systemPermissionApi;

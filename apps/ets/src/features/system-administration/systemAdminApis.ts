// ETS's own System Administration data layer.
// The screens live in @commutr/system-admin; ETS supplies its base query
// (auth header, tenant, token refresh) and its API prefix.

import { createSystemAdminApis } from "@commutr/system-admin";
import { baseQueryWithReauth } from "../../shared/lib/api/baseQueryWithReauth";

export const systemAdminApis = createSystemAdminApis({
  baseQuery: baseQueryWithReauth,
  basePath: "/api/v1",
});

// Same names the store used before, so the registration there stays readable.
export const systemRoleApi = systemAdminApis.roleApi;
export const adminMenuApi = systemAdminApis.menuApi;
export const systemPermissionApi = systemAdminApis.permissionApi;
export const roleMenuMappingApi = systemAdminApis.roleMenuMappingApi;

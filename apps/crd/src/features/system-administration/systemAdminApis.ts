// CRD's own System Administration data layer.
// The screens live in @commutr/system-admin; CRD supplies ITS base query and prefix.
//
// crdBaseQuery already prepends "/crd-api" (the gateway rewrites it to CrdCore's "/api"),
// so "/v1" => CrdCore GET /api/v1/RoleManagement, /Menu, /RoleMenuMapping, /Permissions/...
// TODO: confirm the CrdCore path with the backend team; change ONLY this constant.
import { createSystemAdminApis } from "@commutr/system-admin";
import { crdBaseQuery } from "../../shared/lib/api/baseQueries";

export const CRD_SYSTEM_ADMIN_BASE_PATH = "/v1";

export const systemAdminApis = createSystemAdminApis({
  baseQuery: crdBaseQuery,
  basePath: CRD_SYSTEM_ADMIN_BASE_PATH,
});

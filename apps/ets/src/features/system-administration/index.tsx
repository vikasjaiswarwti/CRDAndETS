import { SystemAdminPage } from "@commutr/system-admin/page";
import { systemAdminApis } from "./systemAdminApis";

/** ETS route entry for /dashboard/permission-access (see Featureregistry). */
export const RolePermissionPage = () => (
  <SystemAdminPage apis={systemAdminApis} />
);

export default RolePermissionPage;

// Route entry for /system-administration/access. Default export so it can be lazy-loaded.
import { SystemAdminPage } from "@commutr/system-admin/page";
import { systemAdminApis } from "./systemAdminApis";

const SystemAdminAccessPage = () => <SystemAdminPage apis={systemAdminApis} />;

export default SystemAdminAccessPage;

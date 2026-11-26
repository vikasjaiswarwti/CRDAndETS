# @commutr/system-admin

Shared **System Administration** screens (roles, menus, permission grid) used by ETS and CRD.

**UI is shared; data is not.** Each app owns its roles/menus/permissions backend. The package only
needs a base query and a URL prefix from the app.

## Wiring an app (3 steps)

```ts
// 1. <app>/features/system-administration/systemAdminApis.ts
import { createSystemAdminApis } from "@commutr/system-admin";
export const systemAdminApis = createSystemAdminApis({
  baseQuery: appBaseQuery,   // the app's own (auth header, tenant, token refresh)
  basePath: "/api/v1",       // ETS. For CRD use the path under its base query, e.g. "/v1"
});
```

```ts
// 2. <app>/app/store/index.ts: register reducers + middleware + the UI slice
import { rolePermissionReducer, ROLE_PERMISSION_REDUCER_KEY } from "@commutr/system-admin";
const { roleApi, menuApi, permissionApi, roleMenuMappingApi } = systemAdminApis;
// reducer map:  [roleApi.reducerPath]: roleApi.reducer, ... (all four)
//               [ROLE_PERMISSION_REDUCER_KEY]: rolePermissionReducer   // key must be "rolePermissionUi"
// middleware:   roleApi.middleware, menuApi.middleware, permissionApi.middleware, roleMenuMappingApi.middleware
```

```tsx
// 3. render it from the app's router
import { SystemAdminPage } from "@commutr/system-admin/page"; // keep in a lazy route (code-split)
<SystemAdminPage apis={systemAdminApis} />
```

The app must also render under `UILibraryProvider` (from `@commutr/ui/ui-lib`) and a Redux `Provider`.

## Backend contract (same shape for every app)

Under `{basePath}`: `RoleManagement`, `Menu`, `RoleMenuMapping` (+ `/tree/{roleId}`,
`/roles/{roleId}/menus`), `Permissions/menu/{menuId}/role/{roleId}`, `Permissions/role/bulk-update`.
Types are in `src/types` and `src/api/types.ts`.

Authorisation is enforced by each app's backend, not by this UI.

## Rules for contributors

- Never import from an app (`apps/*`). Everything the screens need comes from `@commutr/ui`,
  `@commutr/shared` or the injected `apis`.
- Keep reducer paths in `createSystemAdminApis` unchanged: ETS's store state shape depends on them.

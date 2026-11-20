# Role-Based Dashboard — Integration Checklist

Complete these in order. Each item is a binary pass/fail.

---

## 1. File placement

Copy each generated file to its exact path:

```
src/shared/types/navigation.types.ts          ← MenuItem + UserMenuApiResponse
src/shared/constants/roles.constants.ts       ← ROLE_PRIORITY_ORDER + resolveActiveRole

src/features/navigation/services/menuApi.ts   ← RTK Query, transforms { menus, roles }
src/features/navigation/services/mockMenuData.ts
src/features/navigation/slices/navigationSlice.ts
src/features/navigation/hooks/useNavigation.ts
src/features/navigation/hooks/useRoleSwitcher.ts
src/features/navigation/components/RoleSwitcherWidget.tsx
src/features/navigation/index.ts

src/features/dashboard/registry/dashboardRegistry.ts
src/features/dashboard/RoleDashboard.tsx
src/features/dashboard/employee/EmployeeDashboard.tsx
src/features/dashboard/vendor/VendorDashboard.tsx
src/features/dashboard/admin/AdminDashboard.tsx
src/features/dashboard/supervisor/SupervisorDashboard.tsx

src/routes/guards/ProtectedRoute.tsx
src/routes/utils/routeUtils.ts
src/routes/registry/featureRegistry.ts
src/routes/config/routeConfig.tsx
src/routes/RouteGenerator.tsx

src/app/store.ts
src/app/App.tsx
src/app/providers.tsx
```

---

## 2. store.ts — confirm these lines exist

```ts
// In reducer map:
[menuApi.reducerPath]: menuApi.reducer,
navigation:            navigationReducer,

// In middleware chain:
.concat(menuApi.middleware)
```

☐ Both lines present

---

## 3. Verify the API response shape matches your types

Open your browser DevTools → Network tab → find the `/api/v1/Users/user-menu` call.

Confirm the response has this exact shape:

```json
{
  "menus": [ { "menuId": "...", "menuName": "...", "roles": null, ... } ],
  "roles": ["Vendor"]
}
```

☐ `menus` is an array at the top level (not `data.menus`)
☐ `roles` is a string array at the top level
☐ If your API wraps in `{ data: { menus, roles } }` — update `transformResponse` in `menuApi.ts`

---

## 4. Role normalisation

The API sends `"Vendor"` (capital V). `transformResponse` lowercases it to `"vendor"`.
`ROLE_PRIORITY_ORDER` uses lowercase slugs. They must match.

☐ `resolveActiveRole(["Vendor"])` returns `"vendor"` (test this in console)
☐ `DASHBOARD_REGISTRY` has a key `"vendor"` (lowercase)

---

## 5. Dashboard wiring

☐ `VendorDashboard` is registered in `DASHBOARD_REGISTRY` under key `"vendor"`
☐ `EmployeeDashboard` is the fallback (returned when no match found)
☐ `RoleDashboard` is mounted at the `/dashboard` index route in `routeConfig.tsx`
☐ `RoleDashboard` is also the component for any `routeUrl` ending in `"dashboard"`

---

## 6. Feature routes

For every `routeUrl` the backend sends that is NOT a dashboard:

☐ It has a corresponding entry in `FEATURE_REGISTRY`
☐ The key exactly matches the `routeUrl` string (e.g. `"/fleet/vendor"`)
☐ The import points to a real file that exists

Dev console will warn you about missing registrations — check it after login.

---

## 7. Dev mode testing

In `mockMenuData.ts`, change `MOCK_ROLES` and verify the correct dashboard appears:

```ts
export const MOCK_ROLES = ["vendor"]; // → VendorDashboard
export const MOCK_ROLES = ["employee"]; // → EmployeeDashboard
export const MOCK_ROLES = ["admin"]; // → AdminDashboard
```

☐ Each role shows its own dashboard
☐ No blank screen, no 404

---

## 8. Multi-role user test

```ts
export const MOCK_ROLES = ["vendor", "employee"];
```

☐ `selectActiveRole` returns `"employee"` (higher priority in ROLE_PRIORITY_ORDER)
☐ `RoleSwitcherWidget` renders with two pill buttons
☐ Clicking "Vendor" switches to VendorDashboard
☐ Clicking "Employee" switches back to EmployeeDashboard
☐ `canSwitch` is `true` when roles.length > 1

---

## 9. Route access guard

☐ Navigating directly to `/fleet/vendor` while logged in as vendor → renders VendorListPage
☐ Navigating to a route NOT in the user's menu → redirects to /unauthorized
☐ Navigating to any protected route while logged out → redirects to /login

---

## 10. Adding a new role in future

Only these two files change:

1. `src/shared/constants/roles.constants.ts` — add slug to `ROLE_PRIORITY_ORDER`
2. `src/features/dashboard/registry/dashboardRegistry.ts` — add component

Nothing else. Verify this by searching the codebase for hardcoded role strings
— there should be zero outside these two files.

```bash
grep -r '"employee"\|"vendor"\|"admin"' src --include="*.ts" --include="*.tsx" \
  --exclude-dir=dashboard \
  | grep -v "roles.constants\|dashboardRegistry\|mockMenuData\|EmployeeDashboard\|VendorDashboard\|AdminDashboard"
# Should return nothing
```

☐ Zero hardcoded role strings outside the approved files

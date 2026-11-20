# Vehicle Compliance Module — Codebase Reference

> Internal reference for the `src/features/vehicle-compliance/` feature.
> All paths below are relative to that feature root unless noted.

---

## Directory Map

```
compliance/
├── pages/
│   ├── VendorDashboardPage.tsx        ← Vendor/admin compliance list (Vehicle + Driver tabs)
│   └── ApprovalDashboardPage.tsx      ← Admin approval queue
├── services/
│   ├── VehicleComplianceApi.ts        ← RTK Query: dashboard stats, tab counts, vehicle list, upload
│   ├── VehicleApprovalApi.ts          ← RTK Query: approval list, document URLs, approve/reject
│   └── DriverComplianceApi.ts         ← RTK Query: driver dashboard stats + export (NO list yet)
├── hooks/
│   ├── useVehicleComplianceTable.ts   ← Table columns + tableState + search for Vehicle view
│   ├── useApprovalDashboardTable.ts   ← Table columns + tableState + filters for Approval view
│   ├── useVehicleComplianceModal.ts   ← isOpen / editingRecord / openEdit / close
│   ├── useVehicleComplianceMutations.ts ← useVehicleComplianceMutations + useApprovalMutations
│   ├── useVehicleApprovalMutations.ts ← approve / requestChanges (alternate, approval-only)
│   ├── useVehicleApprovalPanel.ts     ← selectedRecord / activeDocTab / remarks / clearPanel
│   └── useComplianceTransporter.ts    ← Role-aware transporterId resolver (Admin vs Vendor)
├── components/
│   ├── UploadDocumentsModal.tsx       ← Ultra-compact doc upload (1120px, fits 1366×768)
│   ├── ApprovalReviewPanel.tsx        ← Inline approve/reject panel (uses doc URLs from record)
│   ├── ReviewDocumentPanel.tsx        ← Card-based review panel (fetches via getApprovalDocuments)
│   ├── ApprovalStatCards.tsx          ← Stat cards for ApprovalDashboardPage
│   ├── ComplianceStatCards.tsx        ← Stat cards for VendorDashboardPage (Vehicle view)
│   └── DateFilterBar.tsx              ← 7/15/30/Custom day pill selector
├── constants/
│   ├── VehicleComplianceConstants.ts  ← COMPLIANCE_STATUS_MAP, APPROVAL_STATUS_MAP, COMPLIANCE_TABS,
│   │                                     DRIVER_TABS, TAB_COUNT_KEY, STAT_CARDS, option arrays
│   ├── Complianceroleconfig.ts        ← COMPLIANCE_ROLES, selectAuthRole, selectAuthTransporterId,
│   │                                     DEFAULT_EXPIRY_DAYS, TAB_FILTER_MAP
│   ├── Vehicleapprovalconstants.ts    ← APPROVAL_STAT_CARDS, DOCUMENT_TABS, city/doc-type options
│   └── tokens.ts                      ← BRAND, SPACING, RADIUS, SHADOW, FONT + useTokens()
└── types/
    └── vehicleCompliance.types.ts     ← All shared TypeScript types (see §Types below)
```

---

## Shared Rules (never break these)

| Rule                      | Detail                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **No direct antd import** | Use `useUILibrary()` — only place antd enters the feature                                   |
| **AppTable columns**      | Built via `col.text()`, `col.date()`, `col.status()`, `col.actions()` + `buildColumns<T>()` |
| **Loading states**        | `ApiStateWrapper isLoading` = initial skeleton; `AppTable loading` = overlay on refetch     |
| **Mutations**             | Always `useApiMutation<TArg, TResult>` with BOTH generics                                   |
| **baseQuery**             | `baseQueryWithReauth` everywhere                                                            |
| **Design tokens**         | `useTokens()` → `{ color, spacing, radius, shadow, font }` — never hardcode                 |
| **canFetch gate**         | Admin: `isReady && vendorOptionsReady`; Vendor: `isReady` only                              |

---

## Types (`vehicleCompliance.types.ts`)

```ts
DashboardView         = 'Vehicle' | 'Driver'
DateFilter            = 7 | 15 | 30 | 'custom'
ComplianceTab         = 'active' | 'pending' | 'inactive' | 'reaching_non_compliance'
DriverTab             = 'active' | 'inactive'
VehicleComplianceStatus = number | null
ApprovalFilterStatus  = 'Pending' | 'Reject' | 'System Reject'
DocumentType          = 'Insurance' | 'RC' | 'Permit' | 'Fitness'
ApprovalAction        = 'approve' | 'reject'

VehicleCompliance      — vehicle list row (camelCase, mapped from snake_case API)
VehicleApproval        — approval list row + doc URL fields (registrationDoc, insuranceDoc, etc.)
VehicleComplianceStats — dashboard stat counts (totalVehicle, insuranceExpiry, active, inactive…)
ComplianceTabCounts    — tab badge counts { pending, active, inactive, reachingNonCompliance }
PaginatedResponse<T>   — { items, total, page, pageSize }
UploadCompliancePayload
ApproveRejectPayload   — { id, action: ApprovalAction, remarks? }
```

---

## API Services

### `VehicleComplianceApi` (`reducerPath: "vehicleComplianceApi"`)

| Hook                           | Method + URL                            | Body / Params                   | Returns                                |
| ------------------------------ | --------------------------------------- | ------------------------------- | -------------------------------------- |
| `useGetVehicleDashboardQuery`  | POST `/api/v1/Vehicles/dashboard`       | `{ transporterId, expiryDays }` | `VehicleComplianceStats`               |
| `useGetVehicleComplianceQuery` | POST `/api/v1/Vehicles/compliance`      | `{ transporterId, expiryDays }` | `ComplianceTabCounts`                  |
| `useGetVehicleListQuery`       | POST `/api/v1/Vehicles/list`            | `VehicleListBody`               | `PaginatedResponse<VehicleCompliance>` |
| `useUploadComplianceMutation`  | POST `/api/v1/Vehicles/{id}/compliance` | `UploadComplianceBody`          | `{ success: boolean }`                 |

`VehicleListBody`: `{ transporterId, expiryDays, filter: Active|Inactive|Pending|ReachingNonCompliance, page, pageSize }`

`transformResponse` in `getVehicleList` maps every snake_case API field to camelCase (`vehicle_Registration_No` → `vehicleNo`, etc.).

---

### `VehicleApprovalApi` (`reducerPath: "vehicleApprovalApi"`)

| Hook                              | Method + URL                                           | Params                 | Returns                              |
| --------------------------------- | ------------------------------------------------------ | ---------------------- | ------------------------------------ |
| `useGetAllApprovalsQuery`         | GET `/api/v1/VehicleStages`                            | `ApprovalListParams`   | `PaginatedResponse<VehicleApproval>` |
| `useGetApprovalDocumentsQuery`    | GET `/api/v1/VehicleStages/{id}`                       | `id: string`           | `ApprovalDocuments`                  |
| `useSubmitApprovalActionMutation` | POST `/api/v1/VehicleStages/{id}/approve` or `/reject` | `ApproveRejectPayload` | `unknown`                            |

`ApprovalListParams`: `{ transporterId?, status?, office?, searchTerm?, page, pageSize }`

`ApprovalDocuments`: `Record<DocumentType, { previewUrl: string | null }>`

`mapApproval()` handles both `snake_case` and `camelCase` field names via `??` fallback chains.

Doc URL fields on `VehicleApproval`: `registrationDoc`, `insuranceDoc`, `fitnessDoc`, `permitDoc`, `pucDoc` — mapped from `*ExpiryDate_Doc` or `*Doc` API fields.

---

### `DriverComplianceApi` (`reducerPath: "driverComplianceApi"`)

| Hook                         | Method + URL                     | Body / Params               | Returns                |
| ---------------------------- | -------------------------------- | --------------------------- | ---------------------- |
| `useGetDriverDashboardQuery` | POST `/api/v1/Drivers/dashboard` | `{ transporterId }`         | `DriverDashboardStats` |
| `useLazyExportDriversQuery`  | GET `/Drivers/export`            | `{ transporterId, filter }` | `Blob`                 |

**⚠️ KNOWN GAP**: No driver LIST endpoint. Driver tab in `VendorDashboardPage` currently shows no data because only stats are fetched. A `getDriverList` endpoint is needed (planned: `GET /api/v1/Drivers` with `{ transporterId, status: Active|Inactive, page, pageSize }`) — see §Pending Work.

---

## Hooks

### `useComplianceTransporter(opts?)`

Reads role from Redux (`selectAuthRole` → `navigationSlice.selectActiveRole`).

```ts
{
  (isAdmin,
    isVendor,
    transporterId,
    selectedVendorId,
    setSelectedVendorId,
    isReady,
    canFetch);
}
```

- Admin: `transporterId = selectedVendorId` (UI Select), `canFetch = isReady && vendorOptionsReady`
- Vendor: `transporterId = authTransporterId` (from `state.auth.user.transporterId`), `canFetch = isReady`

---

### `useVehicleComplianceTable({ activeTab, view, onEdit })`

Returns vehicle columns (via `buildColumns<VehicleCompliance>`) + `tableState` + `search` + `queryArgs`.

**Current state**: returns vehicle-specific columns regardless of `view`. Driver columns not yet added.

`queryArgs`: `{ tab, view, searchTerm, page, pageSize }` — page slices ready to merge into API body.

---

### `useApprovalDashboardTable({ onReview })`

Returns approval columns + `statusFilter` / `setStatusFilter` + `office` / `setOffice` + `queryArgs`.

Two versions exist in the codebase (one uses `tableStateToQueryArgs`, other builds manually). Active version imported by `ApprovalDashboardPage` uses `tableStateToQueryArgs`.

---

### `useVehicleComplianceMutations` / `useApprovalMutations`

Both use `useApiMutation<TArg, TResult>`:

- Upload: `<UploadCompliancePayload, { success: boolean }>`
- Approve/Reject: `<ApproveRejectPayload, unknown>` (return type `unknown` — server shape not relied on)

---

## Pages

### `VendorDashboardPage`

**State**: `view` (Vehicle|Driver), `activeTab` (ComplianceTab), `driverTab` (DriverTab), `dateFilter`, `customDays`

**Query flow**:

1. `useGetVehicleDashboardQuery` → stat cards (Vehicle view, skip when Driver)
2. `useGetVehicleComplianceQuery` → tab badge counts (Vehicle view)
3. `useGetVehicleListQuery` → table data (Vehicle view, body includes `TAB_FILTER_MAP[activeTab]`)
4. `useGetDriverDashboardQuery` → driver tab badge counts only (Driver view)
5. `useLazyExportDriversQuery` → blob download on button click

**Known issues (pending)**:

- `tableLoading = view === 'Vehicle' ? isLoading : driverStatsLoading` — wrong: `driverStatsLoading` is the STATS query, not a list
- `dataSource={data?.items ?? []}` — always vehicle data, even in Driver view
- `isEmpty={view !== 'Vehicle' || !data?.items?.length}` — Driver view always shows empty state
- No driver list API call → Driver table never shows row data

---

### `ApprovalDashboardPage`

**Query**: `useGetAllApprovalsQuery({ ...queryArgs, transporterId })` — skipped until `canFetch`

**Panel**: `ApprovalReviewPanel` renders in right column when `selectedRecord` is set. Wrapped in `PanelBoundary` (inline error boundary class).

**Status pills**: Pending / Reject / System Reject — toggle `statusFilter` in `useApprovalDashboardTable`.

**`DOC_URL_MAP`** in `ApprovalReviewPanel`:

```ts
{ Insurance: 'insuranceDoc', RC: 'registrationDoc', Permit: 'permitDoc', Fitness: 'fitnessDoc' }
```

Reads directly from `record[DOC_URL_MAP[activeTab]]` — no extra API call needed for doc preview.

---

## Components

### `UploadDocumentsModal`

- Width: 1120px, `centered`, `closable={false}`, custom header
- Height budget: Header 68px + Body ≤600px + Footer 56px = ~724px (fits 1366×768)
- Form: 3-column grid, 4 rows, inputs 36px height
- DocRow: 2-column grid, 54px fixed height per row, 130×32 upload button
- Pre-fills from `record`: `insuranceExpDate`, `roadTaxExpDate`, `pucExpDate`, `fitnessExpDate`, `permitExpDate`
- Uses `record.id`, `record.vehicleNo`, `record.transporterName` (NOT `vehicleId`, `registrationNumber`, `vendor`)

### `ApprovalReviewPanel` (used in `ApprovalDashboardPage`)

Uses doc URLs already on the `VehicleApproval` record. No extra fetch. Falls back to hatched "No document" placeholder.

### `ReviewDocumentPanel` (alternate, not currently used in main pages)

Fetches via `useGetApprovalDocumentsQuery(record.id)` — shows Spin while loading. Used when record doesn't carry doc URLs.

---

## Constants

### `TAB_FILTER_MAP` (in `Complianceroleconfig.ts`)

```ts
{ active: 'Active', inactive: 'Inactive', pending: 'Pending', reachingNonCompliance: 'ReachingNonCompliance' }
```

Note: `ComplianceTab` uses `'reaching_non_compliance'` (underscore) but `TAB_COUNT_KEY` maps it to `'reachingNonCompliance'` (camel) for `ComplianceTabCounts`.

### `COMPLIANCE_STATUS_MAP` — `Record<string, { label, color }>`

Keys are string status labels (`Active`, `Inactive`, `Pending`, `RC Expiring`, etc.) — NOT numeric codes despite `VehicleComplianceStatus = number | null`.

---

## Redux Store — required registrations

Each `createApi` instance needs its own entry:

```ts
// store.ts
import { vehicleComplianceApi } from '...VehicleComplianceApi'
import { vehicleApprovalApi }   from '...VehicleApprovalApi'
import { driverComplianceApi }  from '...DriverComplianceApi'

reducer: {
  [vehicleComplianceApi.reducerPath]: vehicleComplianceApi.reducer,
  [vehicleApprovalApi.reducerPath]:   vehicleApprovalApi.reducer,
  [driverComplianceApi.reducerPath]:  driverComplianceApi.reducer,
}
middleware: (gDM) => gDM().concat(
  vehicleComplianceApi.middleware,
  vehicleApprovalApi.middleware,
  driverComplianceApi.middleware,
)
```

---

## Pending Work (Driver Tab)

| #   | What                           | Where                          | Detail                                                                                                                            |
| --- | ------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Add `getDriverList` endpoint   | `DriverComplianceApi.ts`       | `GET /api/v1/Drivers` with `{ transporterId, status: 'Active'\|'Inactive', page, pageSize, searchTerm? }`, `keepUnusedDataFor: 0` |
| 2   | Export `useGetDriverListQuery` | `DriverComplianceApi.ts`       | —                                                                                                                                 |
| 3   | Add `DriverComplianceRow` type | `vehicleCompliance.types.ts`   | `{ id, driverName, licenseNo, status, vehicleNo?, mobileNo?, locationName? }`                                                     |
| 4   | Add driver columns             | `useVehicleComplianceTable.ts` | Return driver-specific columns when `view === 'Driver'`                                                                           |
| 5   | Wire driver list query         | `VendorDashboardPage.tsx`      | `skip: !canFetch \|\| view !== 'Driver'`, `refetchOnMountOrArgChange: true`                                                       |
| 6   | Fix `tableLoading`             | `VendorDashboardPage.tsx`      | Driver: use driver LIST loading, not `driverStatsLoading`                                                                         |
| 7   | Fix `dataSource`               | `VendorDashboardPage.tsx`      | Driver: `driverListData?.items ?? []`                                                                                             |
| 8   | Fix `isEmpty`                  | `VendorDashboardPage.tsx`      | Driver: `!driverListData?.items?.length`                                                                                          |
| 9   | Force refetch on tab click     | `VendorDashboardPage.tsx`      | `keepUnusedDataFor: 0` + `refetchOnMountOrArgChange: true` handles this                                                           |

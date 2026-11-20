import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  VehicleCompliance,
  VehicleComplianceStats,
  ComplianceTabCounts,
  PaginatedResponse,
} from "../types/Vehiclecompliance.types";

const LOG = (ep: string, ...a: unknown[]) =>
  console.log(
    `%c[VehicleComplianceApi][${ep}]`,
    "color:#16a34a;font-weight:bold",
    ...a,
  );

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface VehicleDashboardBody {
  transporterId: number;
  expiryDays: number;
}

/** POST /api/v1/Vehicles/list — Reaching Non-Compliance only */
export interface VehicleListBody {
  transporterId: number;
  expiryDays: number;
  filter: "ReachingNonCompliance";
  page: number;
  pageSize: number;
}

/** GET /api/v1/Vehicles — Active (isActive=true) or Inactive (isActive=false) */
export interface VehiclesByStatusParams {
  transporterId?: number;
  isActive?: boolean;
  searchTerm?: string;
  location?: number | string;
  vendorName?: string;
  sortColumn?: string;
  sortOrder?: string;
  currentStatus?: number | null;
  page: number;
  pageSize: number;
}

/** GET /api/v1/VehicleStages — Pending */
export interface PendingVehiclesParams {
  transporterId?: number;
  searchTerm?: string;
  location?: number | string;
  vendorName?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface UploadComplianceBody {
  id: string;
  [key: string]: unknown;
}

export interface UpdateVehicleStatusBody {
  id: string;
  currentStatus: number;
  transporterId?: number;
}

/** PUT /api/v1/VehicleStages/{id} — update a pending vehicle stage */
export interface UpdateVehicleStageBody {
  id: string; // GUID — used in URL, stripped from body
  vehicle_Registration_No?: string;
  vehicleTypeCode?: string | null;
  transporterId?: number | null;
  vehicle_Status?: number | null;
  gpsStatusCode: string | null;
  driverId?: null;
  locCode?: number | null;
  vehicle_Registration_Date?: string | null;
  vehicle_Induction_Date?: string | null;
  registration_Exp_Date?: string | null;
  firstAid_Kid_Date?: string | null;
  fire_Extinguisher_Date?: string | null;
  make?: string | null;
  model?: string | null;
  chassis_No?: string | null;
  permit_Expiry_Date?: string | null;
  insurance_Expiry_Date?: string | null;
  fitness_Expiry_Date?: string | null;
  road_Tax_Validity_Expiry?: string | null;
  puc_Expiry_Date?: string | null;
  owner_Name?: string | null;
  owner_Address?: string | null;
  owner_Type?: string | null;
  isGpsInstalled?: boolean | null;
  gps_Installation_Date?: string | null;
  gpsProviderCode?: string | null;
  fuelTypeCode?: string | null;
  current_Status?: number | null;
  registrationExpiryDate_Doc?: string | null;
  fireExtinguisherExp_Doc?: string | null;
  permitExpiryDate_Doc?: string | null;
  firstAidKitDateExpiry_Doc?: string | null;
  insuranceExpiryDate_Doc?: string | null;
  fitnessExpiryDate_Doc?: string | null;
  roadTaxExpiryDate_Doc?: string | null;
  pucExpiryDate_Doc?: string | null;
  allDocuments_Doc?: string | null;
  makeYear?: string | null;
  remarks?: string | null;
}

// ─── Shared mapper ────────────────────────────────────────────────────────────

function mapVehicle(v: any): VehicleCompliance {
  const currentStatus: number | null =
    v.current_Status ?? v.currentStatus ?? null;
  const statusLabels: Record<number, string> = {
    1: "Active",
    2: "Inactive",
    3: "Blacklisted",
  };

  return {
    ...v, // ← preserves ALL raw fields
    id: v.vehicle_Id,
    vehicleNo: v.vehicle_Registration_No,
    vehicleType: v.vehicleTypeName ?? v.vehicleTypeCode,
    transporterName: v.transporterName ?? "",
    locationName: v.locationName ?? "",
    make: v.make,
    model: v.model,
    ownerName: v.owner_Name,
    ownerType: v.owner_Type,
    status: v.vehicle_Status,
    currentStatus,
    currentStatusName:
      v.currentStatusName ??
      statusLabels[currentStatus ?? -1] ??
      null,
    isGpsInstalled: v.isGpsInstalled,
    registrationExpDate: v.registration_Exp_Date,
    insuranceExpDate: v.insurance_Expiry_Date,
    fitnessExpDate: v.fitness_Expiry_Date,
    permitExpDate: v.permit_Expiry_Date,
    pucExpDate: v.puc_Expiry_Date,
    roadTaxExpDate: v.road_Tax_Validity_Expiry,
    insuranceDoc: v.insuranceExpiryDate_Doc,
    fitnessDoc: v.fitnessExpiryDate_Doc,
    permitDoc: v.permitExpiryDate_Doc,
    registrationDoc: v.registrationExpiryDate_Doc,
    expiringDocumentCount: v.expiringDocumentCount,
    expiringDocuments: v.expiringDocuments ?? [],
    expiredDocumentCount: v.expiredDocumentCount,
    expiredDocuments: v.expiredDocuments ?? [],
  };
}

function toPaginated(
  raw: any,
  items: VehicleCompliance[],
): PaginatedResponse<VehicleCompliance> {
  const total = Array.isArray(raw)
    ? raw.length
    : (raw?.totalCount ?? raw?.total ?? items.length);
  return {
    items,
    totalCount: total,
    page: raw?.page ?? 1,
    pageSize: raw?.pageSize ?? items.length,
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────
const TAG = "VehicleCompliance" as const;

export const vehicleComplianceApi = createApi({
  reducerPath: "vehicleComplianceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG],
  endpoints: (builder) => ({
    // ── POST /api/v1/Vehicles/dashboard — stat cards ─────────────────────────
    getVehicleDashboard: builder.query<
      VehicleComplianceStats,
      VehicleDashboardBody
    >({
      query: (body) => {
        LOG("getVehicleDashboard", "▶ body:", body);
        return { url: "/api/v1/Vehicles/dashboard", method: "POST", body };
      },
      transformResponse: (raw: any): VehicleComplianceStats => {
        LOG("getVehicleDashboard", "✅ raw:", raw);
        return raw;
      },
      transformErrorResponse: (err: any) => {
        LOG("getVehicleDashboard", "❌", err);
        return err;
      },
      providesTags: (_r, _e, { transporterId }) => [
        { type: TAG, id: `STATS_${transporterId}` },
      ],
    }),

    // ── POST /api/v1/Vehicles/compliance — tab counts ────────────────────────
    getVehicleCompliance: builder.query<
      ComplianceTabCounts,
      VehicleDashboardBody
    >({
      query: (body) => {
        LOG("getVehicleCompliance", "▶ body:", body);
        return { url: "/api/v1/Vehicles/compliance", method: "POST", body };
      },
      transformResponse: (raw: any): ComplianceTabCounts => {
        LOG("getVehicleCompliance", "✅ raw:", raw);
        return raw;
      },
      transformErrorResponse: (err: any) => {
        LOG("getVehicleCompliance", "❌", err);
        return err;
      },
      providesTags: (_r, _e, { transporterId }) => [
        { type: TAG, id: `TAB_COUNTS_${transporterId}` },
      ],
    }),

    // ── GET /api/v1/Vehicles — Active tab (isActive=true) ────────────────────
    // ── GET /api/v1/Vehicles — Inactive tab (isActive=false) ─────────────────
    getVehiclesByStatus: builder.query<
      PaginatedResponse<VehicleCompliance>,
      VehiclesByStatusParams
    >({
      query: ({
        transporterId,
        isActive,
        searchTerm = "",
        location,
        vendorName = "",
        sortColumn = "",
        sortOrder = "",
        currentStatus = "",
        page,
        pageSize,
      }) => {
        const params: Record<string, unknown> = {
          searchTerm,
          vendorName,
          sortColumn,
          sortOrder,
          page,
          pageSize,
          isActive,
          currentStatus,
          ...(transporterId !== undefined && { transporterId }),
          ...(location !== undefined && location !== "" && { location }),
        };
        LOG("getVehiclesByStatus", `▶ isActive=${isActive} params:`, params);
        return { url: "/api/v1/Vehicles", params };
      },
      transformResponse: (raw: any): PaginatedResponse<VehicleCompliance> => {
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
        const items = sourceItems.map(mapVehicle);
        LOG("getVehiclesByStatus", `✅ mapped ${items.length} items`);
        return toPaginated(raw, items);
      },
      transformErrorResponse: (err: any) => {
        LOG("getVehiclesByStatus", "❌", err);
        return err;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ id }) => ({ type: TAG, id })),
            { type: TAG, id: "STATUS_LIST" },
          ]
          : [{ type: TAG, id: "STATUS_LIST" }],
    }),

    // ── GET /api/v1/VehicleStages — Pending tab ──────────────────────────────
    getPendingVehicles: builder.query<
      PaginatedResponse<VehicleCompliance>,
      PendingVehiclesParams
    >({
      query: ({
        transporterId,
        searchTerm = "",
        location,
        vendorName = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => {
        const params: Record<string, unknown> = {
          searchTerm,
          vendorName,
          sortColumn,
          sortOrder,
          page,
          pageSize,
          ...(transporterId !== undefined && { transporterId }),
          ...(location !== undefined && location !== "" && { location }),
        };
        LOG("getPendingVehicles", "▶ params:", params);
        return { url: "/api/v1/VehicleStages", params };
      },
      transformResponse: (raw: any): PaginatedResponse<VehicleCompliance> => {
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
        const items = sourceItems.map(mapVehicle);
        LOG("getPendingVehicles", `✅ mapped ${items.length} items`);
        return toPaginated(raw, items);
      },
      transformErrorResponse: (err: any) => {
        LOG("getPendingVehicles", "❌", err);
        return err;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ id }) => ({ type: TAG, id })),
            { type: TAG, id: "PENDING_LIST" },
          ]
          : [{ type: TAG, id: "PENDING_LIST" }],
    }),

    // ── POST /api/v1/Vehicles/list — Reaching Non-Compliance tab ────────────
    getVehicleList: builder.query<
      PaginatedResponse<VehicleCompliance>,
      VehicleListBody
    >({
      query: (body) => {
        LOG("getVehicleList", "▶ body:", body);
        return { url: "/api/v1/Vehicles/list", method: "POST", body };
      },
      transformResponse: (raw: any): PaginatedResponse<VehicleCompliance> => {
        const items = (raw.items ?? []).map(mapVehicle);
        LOG("getVehicleList", `✅ mapped ${items.length} items`);
        return {
          items,
          totalCount: raw.totalCount,
          page: raw.page,
          pageSize: raw.pageSize,
        };
      },
      transformErrorResponse: (err: any) => {
        LOG("getVehicleList", "❌", err);
        return err;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ id }) => ({ type: TAG, id })),
            { type: TAG, id: "LIST" },
          ]
          : [{ type: TAG, id: "LIST" }],
    }),

    // ── POST /api/v1/Vehicles/{id}/compliance — upload (active/inactive) ───────
    uploadCompliance: builder.mutation<
      { success: boolean },
      UploadComplianceBody
    >({
      query: ({ id, ...body }) => {
        LOG("uploadCompliance", "▶ id:", id, "body:", body);
        return {
          url: `/api/v1/Vehicles/${id}/compliance`,
          method: "POST",
          body,
        };
      },
      transformResponse: (raw: any) => {
        LOG("uploadCompliance", "✅", raw);
        return raw;
      },
      transformErrorResponse: (err: any) => {
        LOG("uploadCompliance", "❌", err);
        return err;
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: TAG, id },
        { type: TAG, id: "LIST" },
        { type: TAG, id: "STATUS_LIST" },
        { type: TAG, id: "PENDING_LIST" },
      ],
    }),

    // ── PUT /api/v1/VehicleStages/{id} — update pending vehicle ─────────────
    updateVehicleStage: builder.mutation<
      { success: boolean },
      UpdateVehicleStageBody
    >({
      query: ({ id, ...body }) => {
        LOG("updateVehicleStage", "▶ id:", id, "body:", body);
        return { url: `/api/v1/VehicleStages/${id}`, method: "PUT", body };
      },
      transformResponse: (raw: any) => {
        LOG("updateVehicleStage", "✅", raw);
        return raw;
      },
      transformErrorResponse: (err: any) => {
        LOG("updateVehicleStage", "❌", err);
        return err;
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: TAG, id },
        { type: TAG, id: "PENDING_LIST" },
        { type: TAG, id: "LIST" },
        { type: TAG, id: "STATUS_LIST" },
      ],
    }),

    updateVehicle: builder.mutation<void, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/api/v1/Vehicles/${id}`,
        method: "PUT",
        body,
      }),
    }),

    updateVehicleStatus: builder.mutation<unknown, UpdateVehicleStatusBody>({
      query: ({ id, currentStatus }) => ({
        url: `/api/v1/Vehicles/${id}/status`,
        method: "PATCH",
        body: { currentStatus },
        responseHandler: async (response: Response) => {
          const text = await response.text();
          return text ? JSON.parse(text) : null;
        },
      }),
      invalidatesTags: (_result, _error, { id, transporterId }) => [
        { type: TAG, id },
        { type: TAG, id: "LIST" },
        { type: TAG, id: "STATUS_LIST" },
        { type: TAG, id: "PENDING_LIST" },
        ...(transporterId !== undefined
          ? [
              { type: TAG, id: `STATS_${transporterId}` },
              { type: TAG, id: `TAB_COUNTS_${transporterId}` },
            ]
          : []),
      ],
    }),

    getVehicleQrImage: builder.query<string, string>({
      query: (vehicleId) => ({
        url: `/api/v1/Vehicles/${vehicleId}/qr/image`,
        responseHandler: (response: Response) => response.blob(),
      }),
      transformResponse: (blob: Blob) => {
        if (!blob || blob.size === 0) return "";
        return URL.createObjectURL(blob);
      },
      async onCacheEntryAdded(
        _vehicleId,
        { cacheDataLoaded, cacheEntryRemoved, getCacheEntry },
      ) {
        try {
          await cacheDataLoaded;
        } catch {
          return;
        }
        await cacheEntryRemoved;
        const cached = getCacheEntry();
        if (cached?.data) URL.revokeObjectURL(cached.data);
      },
    }),

    regenerateVehicleQr: builder.mutation<any, string>({
      query: (vehicleId) => ({
        url: `/api/v1/Vehicles/${vehicleId}/regenerate-qr`,
        method: "POST",
      }),
      transformResponse: (raw: any) => raw?.result ?? raw,
      invalidatesTags: (_r, _e, vehicleId) => [{ type: TAG, id: vehicleId }],
    }),
  }),
});

export const {
  useGetVehicleDashboardQuery,
  useGetVehicleComplianceQuery,
  useGetVehiclesByStatusQuery,
  useGetPendingVehiclesQuery,
  useGetVehicleListQuery,
  useUploadComplianceMutation,
  useUpdateVehicleStageMutation,
  useUpdateVehicleMutation,
  useUpdateVehicleStatusMutation,
  useGetVehicleQrImageQuery,
  useRegenerateVehicleQrMutation,
} = vehicleComplianceApi;

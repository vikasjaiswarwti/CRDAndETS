// src/features/vehicle-compliance/services/VehicleApprovalApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  VehicleApproval,
  ApproveRejectPayload,
  PaginatedResponse,
  DocumentType,
} from "../types/Vehiclecompliance.types";
import type { DriverApproval } from "../hooks/useApprovalDashboardTable";

/** Shape returned by useGetApprovalDocumentsQuery */
export type ApprovalDocuments = Record<
  DocumentType,
  { previewUrl: string | null }
>;

const LOG = (ep: string, ...a: unknown[]) =>
  console.log(
    `%c[VehicleApprovalApi][${ep}]`,
    "color:#f59e0b;font-weight:bold",
    ...a,
  );

// ─── Request shapes ────────────────────────────────────────────────────────────

export interface ApprovalListParams {
  transporterId?: number;
  /** actionType=P (Pending) | actionType=R (Reject) — sent directly to API */
  actionType?: string;
  office?: string;
  searchTerm?: string;
  location?: number | string;
  vendorName?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
  /** Consumed by the page to decide which query to call — NOT sent to the API */
  view?: string;
}

/** Params for GET /api/v1/Vehicles (approved / active vehicles) */
export interface ApprovedVehiclesParams {
  searchTerm?: string;
  /** locCode / location filter */
  location?: number | string;
  vendorName?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

/** Params for GET /api/v1/Drivers (approved / active drivers) */
export interface ApprovedDriversParams {
  transporterId?: number;
  searchTerm?: string;
  page: number;
  pageSize: number;
}

// ─── Field mappers ────────────────────────────────────────────────────────────

function mapApproval(v: any): VehicleApproval {
  return {
    id: v.vehicle_Id ?? v.id ?? "",
    vehicleNo: v.vehicle_Registration_No ?? v.vehicleNo ?? "",
    vehicleType: v.vehicleTypeName ?? v.vehicleTypeCode ?? v.vehicleType ?? "",
    registrationExpDate:
      v.registration_Exp_Date ?? v.registrationExpDate ?? null,
    insuranceExpDate: v.insurance_Expiry_Date ?? v.insuranceExpDate ?? null,
    fitnessExpDate: v.fitness_Expiry_Date ?? v.fitnessExpDate ?? null,
    permitExpDate: v.permit_Expiry_Date ?? v.permitExpDate ?? null,
    pucExpDate: v.puc_Expiry_Date ?? v.pucExpDate ?? null,
    roadTaxExpDate: v.road_Tax_Validity_Expiry ?? v.roadTaxExpDate ?? null,
    // Doc fields — map both raw API names and already-mapped shorthand names
    registrationDoc: v.registrationExpiryDate_Doc ?? v.registrationDoc ?? null,
    insuranceDoc: v.insuranceExpiryDate_Doc ?? v.insuranceDoc ?? null,
    fitnessDoc: v.fitnessExpiryDate_Doc ?? v.fitnessDoc ?? null,
    permitDoc: v.permitExpiryDate_Doc ?? v.permitDoc ?? null,
    pucDoc: v.pucExpiryDate_Doc ?? v.pucDoc ?? null,
    locationName: v.locationName ?? undefined,
    status: v.status ?? v.vehicle_Status ?? "",
    office: v.office ?? v.locationName ?? undefined,
    submittedOn: v.submittedOn ?? v.createdOn ?? undefined,
    documentsPending: Array.isArray(v.documentsPending)
      ? v.documentsPending
      : [],
  };
}

function mapDriverApproval(d: any): DriverApproval {
  return {
    ...d,
    id: d.driver_Id ?? d.id ?? "",
    driverName: d.driverName ?? d.driver_Name ?? d.name ?? "",
    mobileNo: d.mobileNo ?? d.mobile_No ?? "",
    licenseNo: d.licenseNo ?? d.license_No ?? undefined,
    driverType: d.driverType ?? d.driver_Type ?? undefined,
    office: d.office ?? d.locationName ?? undefined,
    transporterName: d.transporterName ?? undefined,
    licenseExpDate: d.licenseExpDate ?? d.license_Exp_Date ?? null,
    policeVerificationExpDate:
      d.policeVerificationExpDate ?? d.policeVerification_Exp_Date ?? null,
    status: d.status ?? d.currentStatusName ?? d.driver_Status ?? "",
    licenseDoc: d.licenseDoc ?? d.licenseExpDoc ?? null,
    policeVerificationDoc:
      d.policeVerificationDoc ?? d.policeVerificationExpDoc ?? null,
    govtIdDoc: d.govtIdDoc ?? null,
    trainingDoc: d.trainingDoc ?? d.lastTrainingDoc ?? null,
    profileDoc: d.profileDoc ?? d.profileImageDoc ?? null,
  };
}

// ─── API ───────────────────────────────────────────────────────────────────────
const TAG = "VehicleApproval" as const;

export const vehicleApprovalApi = createApi({
  reducerPath: "vehicleApprovalApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG],
  endpoints: (builder) => ({
    // ── GET /api/v1/VehicleStages — vehicle approval list ──────────────────────
    getAllApprovals: builder.query<
      PaginatedResponse<VehicleApproval>,
      Omit<ApprovalListParams, "view">
    >({
      query: ({
        transporterId,
        actionType,
        office,
        searchTerm = "",
        location,
        vendorName = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => {
        const params: Record<string, unknown> = {
          ...(transporterId !== undefined && { transporterId }),
          ...(actionType && { actionType }),
          ...(office && { office }),
          ...(searchTerm && { searchTerm }),
          ...(location !== undefined && location !== "" && { location }),
          vendorName,
          sortColumn,
          sortOrder,
          page,
          pageSize,
        };
        LOG("getAllApprovals", "▶ params:", params);
        return { url: "/api/v1/VehicleStages", params };
      },
      transformResponse: (raw: any): PaginatedResponse<VehicleApproval> => {
        LOG("getAllApprovals", "✅ raw:", raw);
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        const items = sourceItems.map(mapApproval);
        const total = Array.isArray(raw)
          ? raw.length
          : (raw?.totalCount ?? raw?.total ?? items.length);
        LOG(
          "getAllApprovals",
          `✅ mapped ${items.length} items | total=${total}`,
        );
        return {
          items,
          totalCount: total,
          page: raw?.page ?? 1,
          pageSize: raw?.pageSize ?? items.length,
        };
      },
      transformErrorResponse: (err: any) => {
        LOG("getAllApprovals", "❌ error:", err);
        return err;
      },
      onQueryStarted: async (args, { queryFulfilled }) => {
        LOG("getAllApprovals", "⏳ dispatched, args:", args);
        try {
          const { data } = await queryFulfilled;
          LOG(
            "getAllApprovals",
            "⏳ fulfilled — items:",
            (data as any)?.items?.length ?? 0,
          );
        } catch (e) {
          LOG("getAllApprovals", "⏳ rejected:", e);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG, id })),
              { type: TAG, id: "LIST" },
            ]
          : [{ type: TAG, id: "LIST" }],
    }),

    // ── GET /api/v1/Vehicles — approved / active vehicle list ─────────────────
    // Called when the "Approved" pill is active in the dashboard.
    // Endpoint: GET /api/v1/Vehicles?searchTerm=&location=&vendorName=&page=&pageSize=
    getApprovedVehicles: builder.query<
      PaginatedResponse<VehicleApproval>,
      ApprovedVehiclesParams
    >({
      query: ({
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
          ...(location !== undefined && location !== "" && { location }),
        };
        LOG("getApprovedVehicles", "▶ params:", params);
        return { url: "/api/v1/Vehicles", params };
      },
      transformResponse: (raw: any): PaginatedResponse<VehicleApproval> => {
        LOG("getApprovedVehicles", "✅ raw:", raw);
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        const items = sourceItems.map(mapApproval);
        const total = Array.isArray(raw)
          ? raw.length
          : (raw?.totalCount ?? raw?.total ?? items.length);
        LOG(
          "getApprovedVehicles",
          `✅ mapped ${items.length} items | total=${total}`,
        );
        return {
          items,
          totalCount: total,
          page: raw?.page ?? 1,
          pageSize: raw?.pageSize ?? items.length,
        };
      },
      transformErrorResponse: (err: any) => {
        LOG("getApprovedVehicles", "❌ error:", err);
        return err;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG, id })),
              { type: TAG, id: "APPROVED_LIST" },
            ]
          : [{ type: TAG, id: "APPROVED_LIST" }],
    }),

    // ── GET /api/v1/DriverStages — driver approval list ────────────────────────
    getAllDriverApprovals: builder.query<
      PaginatedResponse<DriverApproval>,
      Omit<ApprovalListParams, "view">
    >({
      query: ({
        transporterId,
        actionType,
        office,
        searchTerm = "",
        location,
        vendorName = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => {
        const params: Record<string, unknown> = {
          ...(transporterId !== undefined && { transporterId }),
          ...(actionType && { actionType }),
          ...(office && { office }),
          ...(searchTerm && { searchTerm }),
          ...(location !== undefined && location !== "" && { location }),
          vendorName,
          sortColumn,
          sortOrder,
          page,
          pageSize,
        };
        LOG("getAllDriverApprovals", "▶ params:", params);
        return { url: "/api/v1/DriverStages", params };
      },
      transformResponse: (raw: any): PaginatedResponse<DriverApproval> => {
        LOG("getAllDriverApprovals", "✅ raw:", raw);
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        const items = sourceItems.map(mapDriverApproval);
        const total = Array.isArray(raw)
          ? raw.length
          : (raw?.totalCount ?? raw?.total ?? items.length);
        LOG(
          "getAllDriverApprovals",
          `✅ mapped ${items.length} items | total=${total}`,
        );
        return {
          items,
          totalCount: total,
          page: raw?.page ?? 1,
          pageSize: raw?.pageSize ?? items.length,
        };
      },
      transformErrorResponse: (err: any) => {
        LOG("getAllDriverApprovals", "❌ error:", err);
        return err;
      },
      onQueryStarted: async (args, { queryFulfilled }) => {
        LOG("getAllDriverApprovals", "⏳ dispatched, args:", args);
        try {
          const { data } = await queryFulfilled;
          LOG(
            "getAllDriverApprovals",
            "⏳ fulfilled — items:",
            (data as any)?.items?.length ?? 0,
          );
        } catch (e) {
          LOG("getAllDriverApprovals", "⏳ rejected:", e);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG, id })),
              { type: TAG, id: "DRIVER_LIST" },
            ]
          : [{ type: TAG, id: "DRIVER_LIST" }],
    }),

    // ── GET /api/v1/Drivers — approved / active driver list ──────────────────────
    // Called when view="Driver" and the "Approved" pill is active.
    getApprovedDrivers: builder.query<
      PaginatedResponse<DriverApproval>,
      ApprovedDriversParams
    >({
      query: ({ transporterId, searchTerm = "", page, pageSize }) => {
        const params: Record<string, unknown> = {
          page,
          pageSize,
          ...(searchTerm && { searchTerm }),
          ...(transporterId !== undefined && { transporterId }),
        };
        LOG("getApprovedDrivers", "▶ params:", params);
        return { url: "/api/v1/Drivers", params };
      },
      transformResponse: (raw: any): PaginatedResponse<DriverApproval> => {
        LOG("getApprovedDrivers", "✅ raw:", raw);
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        const items = sourceItems.map(mapDriverApproval);
        const total = Array.isArray(raw)
          ? raw.length
          : (raw?.totalCount ?? raw?.total ?? items.length);
        LOG(
          "getApprovedDrivers",
          `✅ mapped ${items.length} items | total=${total}`,
        );
        return {
          items,
          totalCount: total,
          page: raw?.page ?? 1,
          pageSize: raw?.pageSize ?? items.length,
        };
      },
      transformErrorResponse: (err: any) => {
        LOG("getApprovedDrivers", "❌ error:", err);
        return err;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG, id })),
              { type: TAG, id: "APPROVED_DRIVER_LIST" },
            ]
          : [{ type: TAG, id: "APPROVED_DRIVER_LIST" }],
    }),

    // ── GET /api/v1/VehicleStages/{id} — document URLs for review panel ────────
    getApprovalDocuments: builder.query<ApprovalDocuments, string>({
      query: (id) => {
        LOG("getApprovalDocuments", "▶ id:", id);
        return { url: `/api/v1/VehicleStages/${id}` };
      },
      transformResponse: (raw: any): ApprovalDocuments => {
        LOG("getApprovalDocuments", "✅ raw:", raw);
        return {
          Insurance: {
            previewUrl:
              raw?.insuranceExpiryDate_Doc ?? raw?.insuranceDoc ?? null,
          },
          RC: {
            previewUrl:
              raw?.registrationExpiryDate_Doc ?? raw?.registrationDoc ?? null,
          },
          Permit: {
            previewUrl: raw?.permitExpiryDate_Doc ?? raw?.permitDoc ?? null,
          },
          Fitness: {
            previewUrl: raw?.fitnessExpiryDate_Doc ?? raw?.fitnessDoc ?? null,
          },
        };
      },
      transformErrorResponse: (err: any) => {
        LOG("getApprovalDocuments", "❌ error:", err);
        return err;
      },
      providesTags: (_r, _e, id) => [{ type: TAG, id }],
    }),

    // ── POST /api/v1/VehicleStages/{id}/approve  OR  /{id}/action?actionType=R ──
    submitApprovalAction: builder.mutation<unknown, ApproveRejectPayload>({
      query: ({ id, action, remarks }) => {
        LOG("submitApprovalAction", `▶ id:${id}  action:${action}`);
        // approve  → /approve
        // reject   → /action?actionType=R  (confirmed endpoint from API spec)
        const url =
          action === "approve"
            ? `/api/v1/VehicleStages/${id}/approve`
            : `/api/v1/VehicleStages/${id}/action?actionType=R`;
        return { url, method: "POST", body: remarks ? { remarks } : {} };
      },
      transformResponse: (raw: any) => {
        LOG("submitApprovalAction", "✅ raw:", raw);
        return raw;
      },
      transformErrorResponse: (err: any) => {
        LOG("submitApprovalAction", "❌ error:", err);
        return err;
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: TAG, id },
        { type: TAG, id: "LIST" },
      ],
    }),

    // ── POST /api/v1/DriverStages/{id}/approve  OR  /{id}/action?actionType=R ──
    // Separate mutation so the vehicle flow is never touched.
    // approve → /api/v1/DriverStages/{id}/approve
    // reject  → /api/v1/DriverStages/{id}/action?actionType=R
    submitDriverApprovalAction: builder.mutation<unknown, ApproveRejectPayload>(
      {
        query: ({ id, action, remarks }) => {
          LOG("submitDriverApprovalAction", `▶ id:${id}  action:${action}`);
          const url =
            action === "approve"
              ? `/api/v1/DriverStages/${id}/approve`
              : `/api/v1/DriverStages/${id}/action?actionType=R`;
          return { url, method: "POST", body: remarks ? { remarks } : {} };
        },
        transformResponse: (raw: any) => {
          LOG("submitDriverApprovalAction", "✅ raw:", raw);
          return raw;
        },
        transformErrorResponse: (err: any) => {
          LOG("submitDriverApprovalAction", "❌ error:", err);
          return err;
        },
        // Bust both the individual record and the driver stage list
        invalidatesTags: (_r, _e, { id }) => [
          { type: TAG, id },
          { type: TAG, id: "DRIVER_LIST" },
        ],
      },
    ),
  }),
});

export const {
  useGetAllApprovalsQuery,
  useGetAllDriverApprovalsQuery,
  useGetApprovedVehiclesQuery,
  useGetApprovedDriversQuery,
  useGetApprovalDocumentsQuery,
  useSubmitApprovalActionMutation,
  useSubmitDriverApprovalActionMutation,
} = vehicleApprovalApi;

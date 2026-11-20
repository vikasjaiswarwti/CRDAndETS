// compliance/services/DriverComplianceApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type { PaginatedResponse } from "../types/Vehiclecompliance.types";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DriverListParams {
  transporterId: number;
  isActive?: boolean;
  currentStatus?:number | string;
  page: number;
  pageSize: number;
  searchTerm?: string;
}

export interface DriverComplianceRow {
  /** driver_Id (GUID) from API */
  id: string;
  driverName: string;
  licenseNo: string;
  fatherName?: string | null;
  mobileNo: string;
  alternateMobileNo?: string;
  vehicleNo?: string;
  locationName?: string;
  locationCode?: number;
  transporterId?: number | null;
  transporterName?: string;
  driverType?: string;
  bloodGroup?: string;
  gender?: string;
  dob?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  inductionDate?: string | null;
  licenseExpDate?: string | null;
  licenseIssueDate?: string | null;
  driverLicenceAuthority?: string | null;
  policeVerification?: boolean | null;
  policeVerificationExpDate?: string | null;
  govtIdProof?: number | null;
  lastInternalVerificationDate?: string | null;
  externalVerificationExpDate?: string | null;
  externalVerificationAgency?: string | null;
  privateBGVExpDate?: string | null;
  lastTrainingDate?: string | null;
  trainingStatus?: string;
  /** Numeric status code: 1 = Active, 0 = Inactive, null = unknown */
  currentStatus?: number | null;
  /** Human-readable status string e.g. "Active" */
  currentStatusName?: string;
  /** Normalised status for columns — derived from currentStatusName */
  status: string;
  active?: boolean;
  remarks?: string;

  profileImageDoc?: string | null;
  licenseExpDoc?: string | null;
  policeVerificationExpDoc?: string | null;
  govtIdDoc?: string | null;
  lastTrainingDoc?: string | null;
}

// export interface DriverComplianceRow {
//   id: string;
//   driverId?: number;
//   driverName: string;
//   fatherName?: string | null;
//   licenseNo: string;
//   mobileNo: string;
//   alternateMobileNo?: string | null;
//   vehicleNo?: string;
//   locationName?: string;
//   locationCode?: number;
//   locCode?: number | null;
//   transporterId?: number | null;
//   transporterName?: string;
//   driverType?: string;
//   bloodGroup?: string | null;
//   gender?: string;
//   dob?: string | null;
//   presentAddress?: string | null;
//   permanentAddress?: string | null;
//   inductionDate?: string | null;
//   licenseExpDate?: string | null;
//   licenseIssueDate?: string | null;
//   licenseType?: string | null;
//   driverLicenceAuthority?: string | null;
//   policeVerification?: boolean | null;
//   policeVerificationExpDate?: string | null;
//   govtIdProof?: number | null;
//   lastInternalVerificationDate?: string | null;
//   externalVerificationExpDate?: string | null;
//   externalVerificationAgency?: string | null;
//   trainingStatus?: string;
//   lastTrainingDate?: string | null;
//   privateBGVExpDate?: string | null;
//   currentStatus?: number | null;
//   currentStatusName?: string;
//   status: string;
//   remarks?: string | null;
//   active?: boolean;
//   createdBy?: string;
//   createdOn?: string;
//   modBy?: string | null;
//   modOn?: string | null;
//   profileImageDoc?: string | null;
//   licenseExpDoc?: string | null;
//   policeVerificationExpDoc?: string | null;
//   govtIdDoc?: string | null;
//   lastTrainingDoc?: string | null;
// }

/** Body for POST /api/v1/DriverStages and base for PUT */
export interface CreateDriverStageBody {
  locCode?: number | null;
  transporterId?: number | null;
  driverName: string;
  fatherName?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  dob?: string | null;
  gender?: string;
  mobileNo: string;
  alternateMobileNo?: string | null;
  licenseNo?: string;
  licenseExpDate?: string | null;
  driverLicenceAuthority?: string;
  licenseIssueDate?: string | null;
  inductionDate?: string | null;
  driverType?: string | null;
  bloodGroup?: string | null;
  policeVerification?: boolean | null;
  policeVerificationExpDate?: string | null;
  govtIdProof?: number | null;
  lastInternalVerificationDate?: string;
  externalVerificationExpDate?: string | null;
  externalVerificationAgency?: string | null;
  trainingStatus?: string;
  currentStatus?: number | null;
  lastTrainingDate?: string | null;
  privateBGVExpDate?: string | null;
  profileImageDoc?: string | null;
  licenseExpDoc?: string | null;
  policeVerificationExpDoc?: string | null;
  govtIdDoc?: string | null;
  lastTrainingDoc?: string | null;
  remarks?: string | null;
  active?: boolean;
}

/** Body for PUT /api/v1/DriverStages/{id} */
export interface UpdateDriverStageBody extends CreateDriverStageBody {
  /** GUID used in the URL path */
  id: string;
  /** Numeric id sent in the request body (backend may require both) */
  numericId?: number | null;
}

export interface UpdateDriverStatusBody {
  id: string;
  currentStatus: number;
}

// ─── Field mapper — raw API → DriverComplianceRow ─────────────────────────────
function mapDriver(d: any): DriverComplianceRow {
  const currentStatus: number | null =
    d.currentStatus ?? d.current_Status ?? null;
  const statusLabels: Record<number, string> = {
    1: "Active",
    2: "Inactive",
    3: "Blacklisted",
  };
  const rawStatusName = d.currentStatusName ?? d.status ?? d.driver_Status;
  const statusName =
    typeof rawStatusName === "string" && rawStatusName
      ? rawStatusName
      : (statusLabels[currentStatus ?? -1] ?? "");

  return {
    id: d.driver_Id ?? d.id ?? "",
    driverName: d.driverName ?? d.driver_Name ?? d.name ?? "",
    fatherName: d.fatherName ?? null,
    licenseNo: d.licenseNo ?? d.license_No ?? "",
    mobileNo: d.mobileNo ?? d.mobile_No ?? "",
    alternateMobileNo: d.alternateMobileNo ?? undefined,
    vehicleNo: d.vehicleNo ?? d.vehicle_No ?? undefined,
    locationName: d.locationName ?? d.location_Name ?? undefined,
    locationCode: d.locCode ?? undefined,
    transporterName: d.transporterName ?? undefined,
    driverType: d.driverType ?? d.driver_Type ?? undefined,
    bloodGroup: d.bloodGroup ?? undefined,
    gender: d.gender ?? undefined,
    dob: d.dob ?? null,
    presentAddress: d.presentAddress ?? null,
    permanentAddress: d.permanentAddress ?? null,
    inductionDate: d.inductionDate ?? d.induction_Date ?? null,
    licenseExpDate: d.licenseExpDate ?? d.license_Exp_Date ?? null,
    licenseIssueDate: d.licenseIssueDate ?? null,
    driverLicenceAuthority: d.driverLicenceAuthority ?? null,
    policeVerification: d.policeVerification ?? null,
    policeVerificationExpDate: d.policeVerificationExpDate ?? null,
    trainingStatus: d.trainingStatus ?? undefined,
    govtIdProof: d.govtIdProof ?? null,
    lastInternalVerificationDate: d.lastInternalVerificationDate ?? null,
    externalVerificationExpDate: d.externalVerificationExpDate ?? null,
    externalVerificationAgency: d.externalVerificationAgency ?? null,
    lastTrainingDate: d.lastTrainingDate ?? null,
    privateBGVExpDate: d.privateBGVExpDate ?? null,
    currentStatus,
    currentStatusName: statusName,
    status: statusName,
    remarks: d.remarks ?? undefined,
    active: d.active ?? false,
    profileImageDoc: d.profileImageDoc ?? null,
    licenseExpDoc: d.licenseExpDoc ?? null,
    policeVerificationExpDoc: d.policeVerificationExpDoc ?? null,
    govtIdDoc: d.govtIdDoc ?? null,
    lastTrainingDoc: d.lastTrainingDoc ?? null,
  };
}

// function mapDriver(d: any): DriverComplianceRow {
//   const statusName: string =
//     d.currentStatusName ?? d.status ?? d.driver_Status ?? "";

//   return {
//     ...d,
//     id:                          d.driver_Id ?? d.id ?? "",
//     driverId:                    d.driverId ?? undefined,
//     driverName:                  d.driverName ?? d.driver_Name ?? "",
//     fatherName:                  d.fatherName ?? null,
//     licenseNo:                   d.licenseNo ?? d.license_No ?? "",
//     mobileNo:                    d.mobileNo ?? d.mobile_No ?? "",
//     alternateMobileNo:           d.alternateMobileNo ?? null,
//     locationName:                d.locationName ?? d.location_Name ?? undefined,
//     locationCode:                d.locCode ?? undefined,
//     locCode:                     d.locCode ?? null,
//     transporterId:               d.transporterId ?? null,
//     transporterName:             d.transporterName ?? undefined,
//     driverType:                  d.driverType ?? d.driver_Type ?? undefined,
//     bloodGroup:                  d.bloodGroup ?? null,
//     gender:                      d.gender ?? undefined,
//     dob:                         d.dob ?? null,
//     presentAddress:              d.presentAddress ?? null,
//     permanentAddress:            d.permanentAddress ?? null,
//     inductionDate:               d.inductionDate ?? d.induction_Date ?? null,
//     licenseExpDate:              d.licenseExpDate ?? d.license_Exp_Date ?? null,
//     licenseIssueDate:            d.licenseIssueDate ?? null,
//     licenseType:                 d.licenseType ?? null,
//     driverLicenceAuthority:      d.driverLicenceAuthority ?? null,
//     policeVerification:          d.policeVerification ?? null,
//     policeVerificationExpDate:   d.policeVerificationExpDate ?? null,
//     govtIdProof:                 d.govtIdProof ?? null,
//     lastInternalVerificationDate: d.lastInternalVerificationDate ?? null,
//     externalVerificationExpDate: d.externalVerificationExpDate ?? null,
//     externalVerificationAgency:  d.externalVerificationAgency ?? null,
//     trainingStatus:              d.trainingStatus ?? undefined,
//     lastTrainingDate:            d.lastTrainingDate ?? null,
//     privateBGVExpDate:           d.privateBGVExpDate ?? null,
//     currentStatus:               d.currentStatus ?? null,
//     currentStatusName:           statusName,
//     status:                      statusName,
//     remarks:                     d.remarks ?? null,
//     active:                      d.active ?? false,
//     createdBy:                   d.createdBy ?? undefined,
//     createdOn:                   d.createdOn ?? undefined,
//     modBy:                       d.modBy ?? null,
//     modOn:                       d.modOn ?? null,
//     profileImageDoc:             d.profileImageDoc ?? null,
//     licenseExpDoc:               d.licenseExpDoc ?? null,
//     policeVerificationExpDoc:    d.policeVerificationExpDoc ?? null,
//     govtIdDoc:                   d.govtIdDoc ?? null,
//     lastTrainingDoc:             d.lastTrainingDoc ?? null,
//   };
// }

const TAG = "DriverCompliance" as const;

// ─── API slice ────────────────────────────────────────────────────────────────
export const driverComplianceApi = createApi({
  reducerPath: "driverComplianceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG],
  endpoints: (builder) => ({
    // GET /api/v1/Drivers  →  paginated list
    getDriverList: builder.query<
      PaginatedResponse<DriverComplianceRow>,
      DriverListParams
    >({
      query: ({ transporterId, currentStatus="", isActive, page, pageSize, searchTerm }) => {
        const params: Record<string, unknown> = {
          transporterId,
          isActive,
          currentStatus,
          page,
          pageSize,
        };
        if (searchTerm) params.searchTerm = searchTerm;
        return { url: "/api/v1/Drivers", params };
      },
      transformResponse: (raw: any): PaginatedResponse<DriverComplianceRow> => {
        const sourceItems: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];

        const items = sourceItems.map(mapDriver);

        console.log("items from transformResponse", items);

        const total: number = Array.isArray(raw)
          ? raw.length
          : (raw?.totalCount ?? raw?.total ?? items.length);

        return {
          items,
          totalCount: total,
          page: raw?.page ?? 1,
          pageSize: raw?.pageSize ?? items.length,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG, id })),
              { type: TAG, id: "LIST" },
            ]
          : [{ type: TAG, id: "LIST" }],
      keepUnusedDataFor: 0,
    }),

    // POST /api/v1/DriverStages  →  create new driver
    // The endpoint returns 201 with an empty body — the default fetchBaseQuery
    // tries JSON.parse("") which throws a SyntaxError and RTK Query surfaces it
    // as an error even though the request succeeded. The responseHandler below
    // safely handles both empty and JSON bodies.
    createDriverStage: builder.mutation<
      { success: boolean },
      CreateDriverStageBody
    >({
      query: (body) => ({
        url: "/api/v1/DriverStages",
        method: "POST",
        body,
        responseHandler: async (response: Response) => {
          const text = await response.text();
          if (!text || !text.trim()) return { success: true };
          try {
            return JSON.parse(text);
          } catch {
            return { success: true };
          }
        },
      }),
      invalidatesTags: [{ type: TAG, id: "LIST" }],
    }),

    // PUT /api/v1/DriverStages/{id}  →  update pending driver stage
    updateDriverStage: builder.mutation<
      { success: boolean },
      UpdateDriverStageBody
    >({
      query: ({ id, numericId, ...rest }) => ({
        url: `/api/v1/DriverStages/${id}`,
        method: "PUT",
        body: {
          // numeric id in request body; fall back to 0 if not available
          id: numericId ?? 0,
          ...rest,
        },
        responseHandler: async (response: Response) => {
          const text = await response.text();
          if (!text || !text.trim()) return { success: true };
          try {
            return JSON.parse(text);
          } catch {
            return { success: true };
          }
        },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: TAG, id },
        { type: TAG, id: "LIST" },
      ],
    }),

    // GET /Drivers/export  →  Excel blob
    exportDrivers: builder.query<
      Blob,
      { transporterId: number; filter?: string }
    >({
      query: ({ transporterId, filter }) => ({
        url: "/Drivers/export",
        params: { transporterId, ...(filter && { filter }) },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    updateDriver: builder.mutation<void, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/api/v1/Drivers/${id}`,
        method: "PUT",
        body,
      }),
    }),

    updateDriverStatus: builder.mutation<unknown, UpdateDriverStatusBody>({
      query: ({ id, currentStatus }) => ({
        url: `/api/v1/Drivers/${id}/status`,
        method: "PATCH",
        body: { currentStatus },
        responseHandler: async (response: Response) => {
          const text = await response.text();
          return text ? JSON.parse(text) : null;
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: TAG, id },
        { type: TAG, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDriverListQuery,
  useCreateDriverStageMutation,
  useUpdateDriverStageMutation,
  useLazyExportDriversQuery,
  useUpdateDriverMutation,
  useUpdateDriverStatusMutation,
} = driverComplianceApi;

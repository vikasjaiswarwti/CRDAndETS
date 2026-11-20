// src/features/routeManagement/services/routeManagementApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  RouteManagementQueryArgs,
  RouteManagementApiResponse,
  RawTripManagementResponse,
  RawRoutePlanningRow,
  RawTripPublishingRow,
  RoutePlanningRow,
  TripPublishingRow,
  RouteStats,
  RawRouteEditDropdownResponse,
  RouteEditDropdownResult,
  RosterEmployeesResult,
  CopyRouteAnalysisResult,
  UserDumpRecord,
  AppRegistrationRecord,
  TripCancellationRecord,
  ReplicateShiftwiseArgs,
  ReplicateShiftwiseResult,
  ShiftFilterItem,
  RawShiftFilterResponse,
  NotificationSummaryResponse,
} from "../types/RouteTypes";

export interface TripPublishItem {
  tripId: number;
  vehicle_registration_no: string;
  officeName: string;
  tripTypeDesc: string;
  schStartTime: string;
  schEndTime: string;
  totalPax: number;
  tripStatus: string;
}

// Backend returns JSON `{ message }` on success (HTTP 200) but an .xlsx blob
// (a row-by-row error report) when the upload fails — no `isSuccess` flag
// anywhere. Success/failure is entirely: did we get an error-report blob back?
export interface UploadTripAssignmentsResult {
  message: string;
  errorReport?: Blob;
}

// Add type near other interfaces at top of file
export interface TripBatchNotificationItem {
  batchId?: number;
  notificationType?: string;
  sentAt?: string;
  status?: string;
  totalSent?: number;
  totalDelivered?: number;
  totalFailed?: number;
  message?: string;
}

// ── Transformers ──────────────────────────────────────────────────────────────

function transformStats(
  raw: RawTripManagementResponse["result"]["tripManagement"]["dashboard"],
): RouteStats {
  return {
    totalEmployees: raw.totalEmployees,
    maleEmployees: 0, // not in API dashboard — wire when backend adds
    femaleEmployees: 0,
    adhocEmployees: raw.adhocEmployees,
    routesGenerated: raw.routesGenerated,
    employeesInTripSheets: raw.totalEmployeesInTripSheets,
    avgOccupancy: raw.totalAverageOccupancy,
    guardTrips: raw.totalGuardTrips,
  };
}

function transformRoutePlanningRow(raw: RawRoutePlanningRow): RoutePlanningRow {
  return {
    id: `${raw.shiftId}-${raw.tripType}`,
    shiftId: raw.shiftId,
    tripType: raw.tripType,
    shiftTime: raw.shiftTime,
    loginType: raw.tripType === 1 ? "Login" : "Logout",
    employeeCount: raw.totalPax,
    scheduledPax: raw.scheduledPax,
    adhocRequests: raw.adhocRequests,
    isLocked: raw.isLocked === "Y",
    routeStatus: raw.routeStatus ?? "",
    status:
      raw.isRouteGenerated === 1
        ? "Routes Generated"
        : raw.routeStatus === "Scheduled"
          ? "Scheduled"
          : "Not Generated",
    isRouteGenerated: raw.isRouteGenerated === 1,
    vehicleVendorRouteText: raw.vehicleVendorRouteText, // ← ADD
    // vehicleVendorRouteText:raw.vehicleVendorRouteText
    // vehicle/vendor/route are NOT on planning rows — removed from type
  };
}

function transformTripPublishingRow(
  raw: RawTripPublishingRow,
): TripPublishingRow {
  return {
    id: `tp-${raw.shiftId}-${raw.tripType}`,
    shiftId: raw.shiftId, // ← ADD
    tripType: raw.tripType, // ← ADD
    shiftTime: raw.shiftTime,
    // ── Correct field mappings from actual API response ───────────────────
    totalEmployees: raw.totalEmployeesInTripSheets,
    // : maleFemaleGuardText
    adhocEmployees: raw.adhocEmployeesInTrips,
    occupancyPct: raw.averageOccupancy,
    vehicleInfo: raw.averageOccupancyText, // "2.71 / cab"
    vehicle: raw.vehicleAllocatedTrips,
    vendor: raw.vendorAllocatedTrips,
    route: raw.routedTrips,
    maleGuard: raw.guardTrips, // no male/female split
    femaleGuard: 0,
    maleFemaleGuardText: raw.maleFemaleGuardText ?? String(raw.guardTrips ?? 0),
    communicationStatus: "none" as const,
    communicationDetail: null,
    notifications: raw.notifications ?? [],
    maleEmployees: raw.maleEmployees ?? 0,
    femaleEmployees: raw.femaleEmployees ?? 0,
  };
}

function transformResponse(
  raw: RawTripManagementResponse,
): RouteManagementApiResponse {
  const tm = raw.result.tripManagement;

  const stats = transformStats(tm.dashboard);

  // Dashboard object has no gender split — sum it from tripPublishing rows
  stats.maleEmployees = tm.tripPublishing.reduce(
    (s, r) => s + (r.maleEmployees ?? 0),
    0,
  );
  stats.femaleEmployees = tm.tripPublishing.reduce(
    (s, r) => s + (r.femaleEmployees ?? 0),
    0,
  );

  return {
    // stats: transformStats(tm.dashboard),
    stats,
    routePlanningRows: tm.routePlanning.map(transformRoutePlanningRow),
    tripPublishingRows: tm.tripPublishing.map(transformTripPublishingRow),
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const routeManagementApi = createApi({
  reducerPath: "routeManagementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RouteManagement", "RouteDropdown"],

  endpoints: (builder) => ({
    // ── Dashboard data ────────────────────────────────────────────────────
    getRouteManagementData: builder.query<
      RouteManagementApiResponse,
      RouteManagementQueryArgs
    >({
      query: (args) => ({
        url: "/api/v1/TripManagement/dashboard",
        method: "POST",
        body: {
          locCode: args.locCode,
          tripType: args.tripType,
          tripDate: args.tripDate,
        },
      }),
      transformResponse: (raw: RawTripManagementResponse) =>
        transformResponse(raw),
      providesTags: ["RouteManagement"],
      keepUnusedDataFor: 0,
    }),

    // ── Route edit dropdown ───────────────────────────────────────────────
    // GET /api/v1/TripManagement/route-edit-dropdown
    // Returns routePlanning + routePublishing action lists.
    // Called once on page mount (no args needed).
    getRouteEditDropdown: builder.query<RouteEditDropdownResult, void>({
      query: () => ({
        url: "/api/v1/TripManagement/route-edit-dropdown",
        method: "GET",
      }),
      transformResponse: (
        raw: RawRouteEditDropdownResponse,
      ): RouteEditDropdownResult => raw.result.routeEditDropdown,
      providesTags: ["RouteDropdown"],
    }),

    // src/features/routeManagement/services/RouteManagementApi.ts
    // ADD these endpoints inside the existing createApi endpoints block:

    // ── Roster employees (Employee Details modal) ─────────────────────────────
    getShiftwiseRosterEmployees: builder.query<
      RosterEmployeesResult,
      { locCode: number; shiftId: number; tripType: number; tripDate: string }
    >({
      query: (args) => ({
        url: `/api/v1/ShiftwiseRouting/roster-employees`,
        method: "GET",
        params: args,
      }),
      providesTags: ["RouteManagement"],
    }),

    getCopyRouteAnalysis: builder.query<
      CopyRouteAnalysisResult,
      { locCode: number; shiftId: number; tripType: number; targetDate: string }
    >({
      query: (args) => ({
        url: `/api/v1/ShiftwiseRouting/copy-route-analysis`,
        method: "GET",
        params: args,
      }),
    }),
    // ── Bulk generate routes ──────────────────────────────────────────────────
    bulkGenerateRoutes: builder.mutation<
      { isSuccess: boolean; message: string },
      {
        locCode: number;
        shifts: { shiftId: number; tripType: number }[];
        tripDate: string;
      }
    >({
      query: (body) => ({
        url: `/api/v1/ShiftwiseRouting/process-bulk`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"],
    }),

    deleteRoutes: builder.mutation<
      { isSuccess: boolean; message: string },
      {
        locCode: number;
        shiftId: number;
        tripType: number;
        tripDate: string;
      }
    >({
      query: (body) => ({
        url: `/api/v1/ShiftwiseRouting/delete`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["RouteManagement"],
    }),

    // Download trip assignment template
    exportTrips: builder.mutation<
      void,
      { locCode: number; shiftId: number; tripType: number; routeDate: string }
    >({
      queryFn: async (args, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: `/api/v1/TripManagement/export-trips?LocCode=${args.locCode}&ShiftId=${args.shiftId}&TripType=${args.tripType}&RouteDate=${args.routeDate}`,
          method: "GET",
          responseHandler: (res) => res.blob(),
        });
        if (result.error) return { error: result.error };
        downloadBlob(
          result.data as Blob,
          `trip-template-${args.shiftId}-${args.routeDate}.xlsx`,
        );
        return { data: undefined };
      },
    }),

    // Upload filled assignment file
    // Success → JSON body { message }. Failure → an .xlsx blob (error report),
    // not a JSON error — so the response is read by content-type, not status.
    uploadTripAssignments: builder.mutation<
      UploadTripAssignmentsResult,
      {
        locCode: number;
        shiftId: number;
        tripType: number;
        routeDate: string;
        file: File;
      }
    >({
      queryFn: async ({ file, ...params }, _api, _extra, baseQuery) => {
        const formData = new FormData();
        formData.append("file", file);
        const result = await baseQuery({
          url: "/api/v1/TripManagement/upload-trip-assignments",
          method: "POST",
          params,
          body: formData,
          responseHandler: async (response: Response) => {
            const contentType = response.headers.get("content-type") ?? "";
            return contentType.includes("application/json")
              ? response.json()
              : response.blob();
          },
        });
        if (result.error) return { error: result.error };

        if (result.data instanceof Blob) {
          return {
            data: {
              message:
                "Some rows could not be processed. Check the downloaded report for details.",
              errorReport: result.data,
            },
          };
        }

        const body = result.data as { message?: string };
        return {
          data: { message: body.message ?? "File uploaded successfully." },
        };
      },
      invalidatesTags: ["RouteManagement"],
    }),

    // Assign physical / flap numbers
    assignFlapNumbers: builder.mutation<
      { isSuccess: boolean; message: string },
      { locCode: number; shiftId: number; tripType: number; routeDate: string }
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/assign-flap-numbers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"],
    }),

    // Reports
    downloadUserDumpReport: builder.mutation<UserDumpRecord[], void>({
      query: () => ({
        url: "/api/v1/Report/UserDumpReport",
        method: "GET",
      }),
    }),

    downloadAppRegistrationsReport: builder.mutation<
      AppRegistrationRecord[],
      void
    >({
      query: () => ({
        url: "/api/v1/Report/AppRegistrationsStatusReport",
        method: "GET",
      }),
    }),

    downloadTripCancellationReport: builder.mutation<
      TripCancellationRecord[],
      { LocCode: number; fromDate: string; toDate: string }
    >({
      query: (body) => ({
        url: "/api/v1/Report/TripCancelationReport",
        method: "POST",
        body,
      }),
    }),

    // Fetch trips available for publishing
    getTripPrintOrPublishList: builder.mutation<
      { result: TripPublishItem[]; isSuccess: boolean }, // ← result is array directly
      {
        locCode: number;
        tripId: number;
        tripDate: string;
        shiftID: number;
        tripType: number;
      },
      {
        locCode: number;
        tripId: number;
        tripDate: string;
        shiftID: number;
        tripType: number;
      }
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/TripPrintOrPublishList",
        method: "POST",
        body,
      }),
    }),

    // Publish the fetched trips
    publishTrips: builder.mutation<
      { isSuccess: boolean; message: string },
      { tripId: string } // comma-separated: "4743,4744"
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/TripPrintorPublish",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"],
    }),

    // Filter-wise trip list for UpdateTripsheetsModal
    getTripPrintOrPublishFilterWise: builder.mutation<
      { result: TripPublishItem[]; isSuccess: boolean },
      { LocCode: number; TripDate: string; TripType: number; ShiftID: number }
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/TripPrintorPublishFilterWise",
        method: "POST",
        body,
      }),
    }),

    // Add inside endpoints builder:
    getTripBatchNotification: builder.query<
      NotificationSummaryResponse,
      { dsDate: string; locCode: number; tripType: number; shiftId: number }
    >({
      query: (params) => ({
        url: "/api/v1/TripBatchNotification",
        method: "GET",
        params,
      }),
      transformResponse: (raw: any) => {
        return raw;
      },
    }),

    replicateShiftwise: builder.mutation<
      ReplicateShiftwiseResult,
      ReplicateShiftwiseArgs
    >({
      query: (body) => ({
        url: "/api/v1/Routing/replicate-shiftwise",
        method: "POST",
        body,
      }),
      // invalidatesTags: ["RouteManagement"],  // uncomment if you use cache tags
    }),

    getShiftFilterWise: builder.query<
      ShiftFilterItem[],
      { locCode: number; tripType: number; tripdate: string }
    >({
      query: (params) => ({
        url: "/api/v1/MstShiftControl/GetShiftFilterWise",
        method: "GET",
        params,
      }),
      transformResponse: (raw: RawShiftFilterResponse): ShiftFilterItem[] => {
        try {
          const jsonStr = raw.result[0]?.jsonShift;
          if (!jsonStr) return [];
          const parsed = JSON.parse(jsonStr) as {
            ShiftId: number;
            ShiftTime: string;
          }[];
          return parsed.map((s) => ({
            shiftId: s.ShiftId,
            shiftTime: s.ShiftTime,
          }));
        } catch {
          return [];
        }
      },
    }),

    cancelRosterSchedule: builder.mutation<
      { isSuccess: boolean; message: string },
      {
        LocCode: number;
        Empid: number;
        ScheduleDate: string;
        TripType: number;
        ScheduleCancelVersion: "WEB";
      }
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/CancelSchedules",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"], // ← auto-refetches both dashboard + roster list
    }),

    copyRouteNewApi: builder.mutation<
      { information?: string; dbResponse?: string },
      {
        locCode: number;
        shiftId: number;
        tripType: number;
        baseDate: string;
        targetDate: string;
        guardPlacement?: number; // omit entirely when not selected
      }
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/copy-route",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"],
    }),

    interShiftCopyRouteApi: builder.mutation<
      { information?: string; dbResponse?: string },
      {
        locCode: number;
        loginShiftId: number;
        dropShiftId: number;
        routeDate: string;
        guardPlacement?: number;
      }
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/inter-shift-copy",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"],
    }),

    tripPrintOrPublishFilterWiseWithETA: builder.mutation<
      { isSuccess: boolean; message: string },
      {
        LocCode: number;
        TripDate: string;
        TripType: number;
        ShiftID: number;
      }
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/TripPrintorPublishFilterWiseWithETA",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteManagement"], // ← auto-refetches dashboard + roster list
    }),
  }),
});

export const {
  useGetRouteManagementDataQuery,
  useGetRouteEditDropdownQuery,
  useGetShiftwiseRosterEmployeesQuery,
  useGetCopyRouteAnalysisQuery,
  useBulkGenerateRoutesMutation,
  useDeleteRoutesMutation,

  useExportTripsMutation,
  useUploadTripAssignmentsMutation,
  useAssignFlapNumbersMutation,
  useDownloadUserDumpReportMutation,
  useDownloadAppRegistrationsReportMutation,
  useDownloadTripCancellationReportMutation,

  useGetTripPrintOrPublishListMutation,
  usePublishTripsMutation,

  useGetTripPrintOrPublishFilterWiseMutation,

  useGetTripBatchNotificationQuery,

  useReplicateShiftwiseMutation,

  useGetShiftFilterWiseQuery,

  useCancelRosterScheduleMutation,

  useCopyRouteNewApiMutation,

  useInterShiftCopyRouteApiMutation,

  useTripPrintOrPublishFilterWiseWithETAMutation,
} = routeManagementApi;

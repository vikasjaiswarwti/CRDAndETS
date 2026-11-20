// src/features/route-maker/services/routeMakerApi.ts
//
// RTK Query API slice for route-analytics.
// Auth is handled entirely by baseQueryWithReauth (mutex + silent refresh).
// No logic changes — only baseQuery swapped.

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth"; // ← adjust path to match your project

import type {
  MergeTripsArgs,
  AdhocRouteResponse,
  CreateAdhocRouteArgs,
  UpdateAdhocRouteArgs,
  ReorderTripArgs,
  MoveEmployeeArgs,
  UpdateTripFlagArgs,
  VendorAllocationArgs,
  VendorAllocationItem,
  VehicleOption,
  DriverOption,
} from "../types/apiRouteTypes";
import type {
  AvailableEmployee,
  AvailableEmployeesResponse,
} from "../types/Shuttleapitypes";

// ── Query arg types ────────────────────────────────────────────────────────────

export type FemaleFilter = "single" | "all" | null;
export type ApiSortBy =
  | "extraKm"
  | "employeeCount"
  | "distance"
  | "radial"
  | null;
export type ApiSortDir = "asc" | "desc";

export interface RouteAnalyticsArgs {
  // Required
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string; // "YYYY-MM-DD"

  // Optional filter flags (omitted = not sent to server)
  guardTrip?: boolean;
  singleEmployee?: boolean;
  vendorAssigned?: boolean | null;
  vehicleAssigned?: boolean | null;
  femaleFilter?: FemaleFilter;
  specialNeeds?: boolean;

  // Optional sort (omitted = backend default)
  sortBy?: ApiSortBy;
  sortDir?: ApiSortDir;
  flagTrip?: boolean;
}

export interface AddEmployeeToTripArgs {
  tripID: number;
  empID: number;
  tripType: number;
}

export interface UpdatePschTimeArgs {
  dsId: number;
  empId: number;
  pschTime: string; // "YYYY-MM-DDTHH:MM:SS"
}

// ── Param builder (same logic as before) ─────────────────────────────────────

function buildParams(args: RouteAnalyticsArgs): Record<string, string> {
  const params: Record<string, string> = {
    locCode: String(args.locCode),
    shiftId: String(args.shiftId),
    tripType: String(args.tripType),
    routeDate: args.routeDate,
  };

  if (args.guardTrip) params.guardTrip = "true";
  if (args.singleEmployee) params.singleEmployee = "true";

  if (args.vendorAssigned !== undefined && args.vendorAssigned !== null) {
    params.vendorAssigned = String(args.vendorAssigned);
  }
  if (args.vehicleAssigned !== undefined && args.vehicleAssigned !== null) {
    params.vehicleAssigned = String(args.vehicleAssigned);
  }

  if (args.femaleFilter) params.femaleFilter = args.femaleFilter;
  if (args.specialNeeds) params.specialNeeds = "true";
  if (args.sortBy) params.sortBy = args.sortBy;
  if (args.sortBy && args.sortDir) params.sortDir = args.sortDir;

  // In buildParams() — add after specialNeeds:
  if (args.flagTrip !== undefined) params.flagTrip = String(args.flagTrip);

  return params;
}

/** POST /VendorServices/assign-vendor */
export interface AssignVendorArgs {
  dsIds: number[];
  transporterId: number;
}

export interface DeletePaxArgs {
  dsid: number;
  EmpID: number;
}

export interface GuradAllocateArgs {
  dsid: number;
  isGuard: boolean;
}

/** POST /TripManagement/shift-route-info */
export interface ShiftRouteInfoArgs {
  locCode: number;
  tripType: number;
  dsDate: string; // "YYYY-MM-DD"
}

export interface ShiftRouteInfoItem {
  shiftId: number;
  shiftTime: string;
}

export interface ShiftRouteInfoResponse {
  result: { shifts: ShiftRouteInfoItem[] };
  isSuccess: boolean;
  message: string;
}

/** POST /VendorServices/unassign */
export interface UnassignVehicleArgs {
  dsId: number;
}

/** POST /TripManagement/TripPrintorPublish */
export interface TripPrintOrPublishArgs {
  LocCode: number;
  TripDate: string; // "YYYY-MM-DD"
  TripType: number;
  ShiftID: number;
  TripId: string;
}

export interface TripPrintOrPublishResponse {
  result: unknown;
  isSuccess: boolean;
  message: string;
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const routeMakerApi = createApi({
  reducerPath: "routeMakerApi",

  // ← only change: was fetchBaseQuery({ baseUrl, prepareHeaders })
  baseQuery: baseQueryWithReauth,

  tagTypes: ["RouteAnalytics"],

  endpoints: (builder) => ({
    getRouteAnalytics: builder.query<unknown, RouteAnalyticsArgs>({
      query: (args) => ({
        url: "/api/v1/TripManagement/route-analytics",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (_result, _error, args) => [
        {
          type: "RouteAnalytics" as const,
          id: `${args.locCode}-${args.shiftId}-${args.tripType}-${args.routeDate}`,
        },
      ],
    }),

    getAdhocRoute: builder.query<AdhocRouteResponse, number>({
      query: (dsId) => ({
        url: `/api/v1/TripManagement/get-adhoc-route/${dsId}`,
        method: "GET",
      }),
    }),

    /** Bulk assign a vendor to one or more trips */
    assignVendor: builder.mutation<unknown, AssignVendorArgs>({
      query: (body) => ({
        url: "/api/v1/VendorServices/assign-vendor",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    /** Merge two trips into one optimized route */
    mergeTrips: builder.mutation<unknown, MergeTripsArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/merge-trips",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    /** Create an adhoc route from employee IDs */
    createAdhocRoute: builder.mutation<unknown, CreateAdhocRouteArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/create-adhoc-route",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    /** Update an existing adhoc route */
    updateAdhocRoute: builder.mutation<unknown, UpdateAdhocRouteArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/update-adhoc-route",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    /** Reorder passengers within a trip */
    reorderTrip: builder.mutation<unknown, ReorderTripArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/reorder-trip",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    moveEmployeeBetweenTrips: builder.mutation<unknown, MoveEmployeeArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/move-employee-between-trips",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    // inside endpoints:
    updateTripFlagApprovalStatus: builder.mutation<unknown, UpdateTripFlagArgs>(
      {
        query: (body) => ({
          url: "/api/v1/TripManagement/UpdateTripFlagApprovalStatus",
          method: "POST",
          body,
        }),
        invalidatesTags: ["RouteAnalytics"],
      },
    ),

    // inside endpoints:
    getVendorRouteAllocation: builder.query<
      { result: VendorAllocationItem[]; isSuccess: boolean },
      VendorAllocationArgs
    >({
      query: (body) => ({
        url: "/api/v1/VendorServices/GetVendorRouteAllocationPercentage",
        method: "POST",
        body,
      }),
    }),

    getAvailableVehicles: builder.query<
      VehicleOption[],
      { dsId: number; vendorId: number }
    >({
      query: ({ dsId, vendorId }) =>
        `/api/v1/VendorServices/trips/${dsId}/available-vehicles?vendorId=${vendorId}`,
      providesTags: (_result, _error, { dsId }) => [
        { type: "RouteAnalytics", id: `vehicles-${dsId}` },
      ],
    }),

    getAvailableDrivers: builder.query<
      DriverOption[],
      { dsId: number; vendorId: number }
    >({
      query: ({ dsId, vendorId }) =>
        `/api/v1/VendorServices/trips/${dsId}/available-drivers?vendorId=${vendorId}`,
      providesTags: (_result, _error, { dsId }) => [
        { type: "RouteAnalytics", id: `drivers-${dsId}` },
      ],
    }),

    allocateVehicleAndDriver: builder.mutation<
      void,
      { dsId: number; vehicleId: number; driverId: number | null }
    >({
      query: (body) => ({
        url: `/api/v1/VendorServices/allocate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { dsId }) => [
        { type: "RouteAnalytics", id: dsId },
        { type: "RouteAnalytics", id: `vehicles-${dsId}` },
        { type: "RouteAnalytics", id: `drivers-${dsId}` },
      ],
    }),

    addEmployeeToTrip: builder.mutation<unknown, AddEmployeeToTripArgs>({
      query: (body) => ({
        url: "/api/v1/DriversApp/add-employee-to-trip",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    splitTrip: builder.mutation<void, { dsId: number; empIds: number[] }>({
      query: (body) => ({
        url: "/api/v1/TripManagement/split-trip",
        method: "POST",
        body,
      }),
    }),

    // Add inside endpoints:
    updatePschTime: builder.mutation<unknown, UpdatePschTimeArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/UpdatePschTime",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    deletePaxFromRoute: builder.mutation<unknown, DeletePaxArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/TranstripPaxDeleteinRoute",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    allocateGuardOnTrip: builder.mutation<unknown, GuradAllocateArgs>({
      query: (body) => ({
        url: "/api/v1/TripManagement/update-trip-guard",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    getAvailableEscorts: builder.query<
      {
        escortId: number;
        name: string;
        mobileNo?: string;
        escortVendorName?: string;
      }[],
      { dsId: number }
    >({
      query: ({ dsId }) =>
        `/api/v1/VendorServices/trips/${dsId}/available-escorts`,
    }),

    assignEscort: builder.mutation<unknown, { dsId: number; escortId: number }>(
      {
        query: (body) => ({
          url: "/api/v1/VendorServices/assign-escort",
          method: "POST",
          body,
        }),
        invalidatesTags: ["RouteAnalytics"],
      },
    ),

    /** Shifts available for a location/tripType/date — drives the header shift selector */
    getShiftRouteInfo: builder.query<
      ShiftRouteInfoResponse,
      ShiftRouteInfoArgs
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/shift-route-info",
        method: "POST",
        body,
      }),
    }),

    /** Deallocate the vendor/vehicle currently assigned to a trip */
    unassignVehicle: builder.mutation<unknown, UnassignVehicleArgs>({
      query: (body) => ({
        url: "/api/v1/VendorServices/unassign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    /** Print/publish a single trip */
    tripPrintOrPublish: builder.mutation<
      TripPrintOrPublishResponse,
      TripPrintOrPublishArgs
    >({
      query: (body) => ({
        url: "/api/v1/TripManagement/TripPrintorPublish",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RouteAnalytics"],
    }),

    // ── Shuttle ───────────────────────────────────────────────────────────────
    getShuttleRouteAnalytics: builder.query<
      unknown,
      {
        locCode: number;
        shiftId: number;
        tripType: number;
        routeDate: string;
      }
    >({
      query: (args) => ({
        url: "/api/v1/TripManagement/shuttle-route-analytics",
        method: "GET",
        params: {
          locCode: String(args.locCode),
          shiftId: String(args.shiftId),
          tripType: String(args.tripType),
          routeDate: args.routeDate,
        },
      }),
      providesTags: (_result, _error, args) => [
        {
          type: "RouteAnalytics" as const,
          id: `shuttle-${args.locCode}-${args.shiftId}-${args.tripType}-${args.routeDate}`,
        },
      ],
    }),

    // // Inside builder:
    // getAvailableEmployees: builder.query<AvailableEmployee[], { dsId: number }>(
    //   {
    //     query: ({ dsId }) =>
    //       `/NodalPoints/trip/available-employees?dsId=${dsId}`,
    //   },
    // ),

    // Update the query — use transformResponse to unwrap the array:
    getAvailableEmployees: builder.query<AvailableEmployee[], { dsId: number }>(
      {
        query: ({ dsId }) =>
          `/api/v1/NodalPoints/trip/available-employees?dsId=${dsId}`,
        transformResponse: (res: AvailableEmployeesResponse) => res.employees,
      },
    ),

    addEmployeeToShuttleTrip: builder.mutation<
      void,
      { dsId: number; empId: number }
    >({
      query: (body) => ({
        url: "/api/v1/NodalPoints/trip/add-employee",
        method: "POST",
        body,
      }),
    }),

    markNoShow: builder.mutation<
      any,
      {
        dsId: number;
        empID: number;
        tripType: number;
        mobileNo: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/DriversApp/mark-no-show",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteAnalytics", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRouteAnalyticsQuery,
  useGetAdhocRouteQuery,
  useAssignVendorMutation,
  useMergeTripsMutation,
  useCreateAdhocRouteMutation,
  useUpdateAdhocRouteMutation,
  useReorderTripMutation,
  useMoveEmployeeBetweenTripsMutation,
  useUpdateTripFlagApprovalStatusMutation,
  useGetVendorRouteAllocationQuery,

  useGetAvailableVehiclesQuery,
  useGetAvailableDriversQuery,
  useAllocateVehicleAndDriverMutation,

  useSplitTripMutation,

  useAddEmployeeToTripMutation,

  useUpdatePschTimeMutation,

  useDeletePaxFromRouteMutation,

  useAllocateGuardOnTripMutation,

  useGetAvailableEscortsQuery,
  useAssignEscortMutation,

  useGetShuttleRouteAnalyticsQuery,

  useGetAvailableEmployeesQuery,
  useAddEmployeeToShuttleTripMutation,

  useMarkNoShowMutation,

  useGetShiftRouteInfoQuery,
  useUnassignVehicleMutation,
  useTripPrintOrPublishMutation,
} = routeMakerApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  PaginatedResponse,
  LookupParams,
  LookupParamsForEmployee,
} from "../types/lookups.types";

export interface LkpLocation {
  locCode: number;
  locName: string;
}

// interface LocationSpecific {
//   locCode: number;
//   locName: string;
// }

export const lookupsApi = createApi({
  reducerPath: "lookupsApi",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true, // ← add this
  tagTypes: [
    "CityZone",
    "Location",
    "BillPlanType",
    "Role",
    "Menu",
    "DocumentOwnerType",
    "EscortVendors",
    "Department", // NEW
    "Process", // NEW (Project)
    "LOB",
    "Intervals",
    "DocumentType",
    "CurrentStatus",
    "State",
    "Vendor",
    "VehicleStatus",

    // ---------
    "FuelType",
    "Driver",
    "VehicleType",
    // ---
    "EhsChecks",
    "Vehicle",
    "SpecialCase",
    "User",
    // ----
    "MstShift",
    "LkpLocation", // ← for GET /api/v1/LkpLocation/locations"
  ],

  endpoints: (builder) => ({
    getAllCityZones: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/CityZones",
        params: {
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      providesTags: ["CityZone"],
    }),

    getAllLocationsForMapping: builder.query<
      PaginatedResponse<any>,
      LookupParams
    >({
      query: (params) => ({
        url: "/api/v1/LkpLocation", // ← Add your Location endpoint here
        params: {
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      providesTags: ["Location"],
    }),

    getAllLocations: builder.query<Location[], void>({
      query: () => ({
        url: "/api/v1/LkpLocation/locations",
      }),
      providesTags: ["Location"],
    }),

    getAllBillPlanTypes: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/LkpBillPlanTypes",
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10, // usually small like 100 or 500 for lookups
        },
      }),
      providesTags: (result, error) => {
        if (error || !result) {
          return [{ type: "BillPlanType", id: "LIST" }];
        }

        if (result?.items && Array.isArray(result.items)) {
          return [
            ...result.items.map((item: any) => ({
              type: "BillPlanType" as const,
              id: item.id,
            })),
            { type: "BillPlanType", id: "LIST" },
          ];
        }

        return [{ type: "BillPlanType", id: "LIST" }];
      },
    }),

    // ── NEW: Role Lookup ─────────────────────────────────────────────────────
    getAllRoles: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/RoleManagement", // Adjust endpoint if different
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: ["Role"],
    }),

    // ── NEW: Admin Menu Lookup ───────────────────────────────────────────────
    getAllMenus: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/Menu", // Adjust endpoint if different
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: ["Menu"],
    }),

    // ── Document Owner Type Lookup ─────────────────────────────────────────
    getAllDocumentOwnerTypes: builder.query<
      PaginatedResponse<any>,
      LookupParams
    >({
      query: (params) => ({
        url: "/api/v1/DocumentOwnerTypes",
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: ["DocumentOwnerType"],
    }),

    // ──  Escort vendor Lookup ─────────────────────────────────────────
    getAllEscortVendors: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/EscortVendors",
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: ["EscortVendors"],
    }),

    getAllDepartments: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/LkpDepartment",
        params: { page: params.page ?? 1, pageSize: params.pageSize ?? 1000 },
      }),
      providesTags: ["Department"],
    }),

    getAllProjects: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/LkpProcess",
        params: { page: params.page ?? 1, pageSize: params.pageSize ?? 1000 },
      }),
      providesTags: ["Process"],
    }),

    getAllLOBs: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/LineOfBusiness",
        params: { page: params.page ?? 1, pageSize: params.pageSize ?? 1000 },
      }),
      providesTags: ["LOB"],
    }),

    getAllIntervals: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/LkpShiftInterval",
        params: { page: params.page ?? 1, pageSize: params.pageSize ?? 1000 },
      }),
      providesTags: ["Intervals"],
    }),

    // ── NEW: Document Type Lookup ──────────────────────────────────────────
    getAllDocumentTypes: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/DocumentTypes",
        params: {
          searchTerm: params.searchTerm || "",
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: ["DocumentType"],
    }),

    // ── NEW: Current Status Lookup ──────────────────────────────────────────
    getAllCurrentStatuses: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/CurrentStatuses",
        params: {
          searchTerm: params.searchTerm || "",
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: ["CurrentStatus"],
    }),

    // ── NEW: State Lookup ──────────────────────────────────────────────────
    getAllStates: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/State",
        params: {
          searchTerm: params.searchTerm || "",
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      transformResponse: (response: any): PaginatedResponse<any> => {
        if (Array.isArray(response)) {
          return {
            items: response,
            page: 1,
            pageSize: response.length,
            totalCount: response.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
        return response;
      },
      providesTags: ["State"],
    }),

    // ── NEW: Vendor Lookup ──────────────────────────────────────────────────
    getAllVendors: builder.query<PaginatedResponse<any>, LookupParams>({
      query: (params) => ({
        url: "/api/v1/Vendors",
        params: {
          searchTerm: params.searchTerm || "",
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 1000,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item: any) => ({
                type: "Vendor" as const,
                id: item.mstVendor_Id,
              })),
              { type: "Vendor", id: "LIST" },
            ]
          : [{ type: "Vendor", id: "LIST" }],
    }),

    // ── NEW: VehicleStatus Lookup ──────────────────────────────────────────────────
    getAllVehicleStatus: builder.query<PaginatedResponse<any>, LookupParams>({
      query: () => ({ url: "/api/v1/VehicleStatus" }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item: any) => ({
                type: "VehicleStatus" as const,
                id: item.vehicleStatus_Id,
              })),
              { type: "VehicleStatus", id: "LIST" },
            ]
          : [{ type: "VehicleStatus", id: "LIST" }],
    }),

    // ── GET All Fuel Types ─────────────────────────────────────────────────
    getAllFuelTypes: builder.query<PaginatedResponse<any>, LookupParams>({
      query: ({ searchTerm = "", page, pageSize }) => ({
        url: "/api/v1/LkpFuelTypes",
        params: { searchTerm, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "FuelType" as const,
                id,
              })),
              { type: "FuelType", id: "LIST" },
            ]
          : [{ type: "FuelType", id: "LIST" }],
    }),
    // ── GET All Aprove Driver Types ─────────────────────────────────────────────────
    getAllDrivers: builder.query<PaginatedResponse<any>, LookupParams>({
      query: ({ searchTerm = "", page, pageSize }) => ({
        url: "/api/v1/Drivers",
        params: { searchTerm, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ driver_Id }) => ({
                type: "Driver" as const,
                driver_Id,
              })),
              { type: "Driver", id: "LIST" },
            ]
          : [{ type: "Driver", id: "LIST" }],
    }),
    // ── GET /api/v1/VehicleTypes ──────────────────────────────────────────
    getAllVehicleTypes: builder.query<PaginatedResponse<any>, LookupParams>({
      query: ({ searchTerm = "", page, pageSize }) => ({
        url: "/api/v1/VehicleTypes",
        params: { searchTerm, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ vehicleType_Id }) => ({
                type: "VehicleType" as const,
                vehicleType_Id,
              })),
              { type: "VehicleType", id: "LIST" },
            ]
          : [{ type: "VehicleType", id: "LIST" }],
    }),
    getAllEhsChecks: builder.query<PaginatedResponse<any>, LookupParams>({
      query: ({ searchTerm = "", page, pageSize }) => ({
        url: "/api/v1/EhsChecks",
        params: { searchTerm, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ ehs_Id }) => ({
                type: "EhsChecks" as const,
                id: ehs_Id,
              })),
              { type: "EhsChecks", id: "LIST" },
            ]
          : [{ type: "EhsChecks", id: "LIST" }],
    }),
    getAllVehicles: builder.query<PaginatedResponse<any>, LookupParams>({
      query: ({ searchTerm = "", page, pageSize }) => ({
        url: "/api/v1/Vehicles",
        params: { searchTerm, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ vehicle_Id }) => ({
                type: "Vehicle" as const,
                id: vehicle_Id,
              })),
              { type: "Vehicle", id: "LIST" },
            ]
          : [{ type: "Vehicle", id: "LIST" }],
    }),
    getAllSpecialCase: builder.query<PaginatedResponse<any>, LookupParams>({
      query: ({ searchTerm = "", page, pageSize }) => ({
        url: "/api/v1/SpecialCases",
        params: { searchTerm, page, pageSize },
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ specialCase_Id }) => ({
                type: "SpecialCase" as const,
                id: specialCase_Id,
              })),
              { type: "SpecialCase", id: "LIST" },
            ]
          : [{ type: "SpecialCase", id: "LIST" }],
    }),

    getAllUsers: builder.query<PaginatedResponse<any>, LookupParamsForEmployee>(
      {
        query: (params) => ({
          url: "/api/v1/Users",
          params: {
            locCode: params.locCode,
            searchTerm: params.searchTerm ?? "",
            sortColumn: params.sortColumn ?? "",
            sortOrder: params.sortOrder ?? "",
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 1000,
            isSystem: false,
          },
        }),

        providesTags: (result) =>
          result?.items
            ? [
                ...result.items.map((item: any) => ({
                  type: "User" as const,
                  id: item.id,
                })),
                { type: "User" as const, id: "LIST" },
              ]
            : [{ type: "User" as const, id: "LIST" }],
      },
    ),
    // ------------- /api/v1/MstShift?searchTerm
    getMstShift: builder.query<PaginatedResponse<any>, LookupParamsForEmployee>(
      {
        query: ({ locCode }) => ({
          url: "/api/v1/MstShiftControl/GetUserShiftWeb",
          params: {
            locCode: locCode,
            page: 1,
            pageSize: 1000,
          },
        }),

        providesTags: (result) =>
          result?.items
            ? [
                ...result.items.map((item: any) => ({
                  type: "MstShift" as const,
                  id: item.id,
                })),
                { type: "MstShift" as const, id: "LIST" },
              ]
            : [{ type: "MstShift" as const, id: "LIST" }],
      },
    ),

    getAllLkpLocations: builder.query<LkpLocation[], void>({
      query: () => ({
        url: "/api/v1/LkpLocation/locations",
      }),
      transformResponse: (raw: any): LkpLocation[] =>
        Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []),
      providesTags: ["LkpLocation"],
    }),
  }),
});

export const {
  useGetAllCityZonesQuery,

  useGetAllLocationsForMappingQuery,
  useGetAllLocationsQuery,
  useGetAllBillPlanTypesQuery,
  useGetAllRolesQuery,
  useGetAllMenusQuery,
  useGetAllDocumentOwnerTypesQuery,
  useGetAllEscortVendorsQuery,
  useGetAllDepartmentsQuery,
  useGetAllProjectsQuery,
  useGetAllLOBsQuery,
  useGetAllDocumentTypesQuery,
  useGetAllCurrentStatusesQuery,
  useGetAllStatesQuery,
  useGetAllVendorsQuery,
  useGetAllVehicleStatusQuery,
  useGetAllIntervalsQuery,
  // ----------------
  useGetAllFuelTypesQuery,
  useGetAllDriversQuery,
  useGetAllVehicleTypesQuery,
  // ======
  useGetAllEhsChecksQuery,
  useGetAllVehiclesQuery,
  useGetAllSpecialCaseQuery,
  // Approved Employee
  useGetAllUsersQuery,
  useGetMstShiftQuery,

  useGetAllLkpLocationsQuery, // ← used by useLocationLookup
} = lookupsApi;

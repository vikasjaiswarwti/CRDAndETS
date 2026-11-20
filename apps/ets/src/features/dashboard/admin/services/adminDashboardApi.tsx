import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../shared/lib/api/baseQueryWithReauth";
import type {
  DashboardApiResponse,
  ParsedDashboardData,
  EmployeeDetails,
  TripDetailsResponse,
  VehicleDetails,
  UserSearchParams,
  VehicleApiResponse,
  VehicleDetailResp,
  EmployeeProfile,
  UserFilterParams,
  EmployeeSchedule,
  WeeklyOff,
  HelpDeskReport,
  HelpDeskRequest,
} from "../types/admin.types";
import type {
  UserDetailsApiRow,
  UserFilterDataResult,
  UserFilterDataParams,
} from "../../../roaster/types/Individualroster.types";
import { parseDashboardResponse } from "../config/parsers";

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  modelName: string | null;
  appVersion:string| null
}

export interface LoginUserReport {
  success: boolean;
  data: LoginUser[];
  count: number;
  message: string;
}

function parseEnvelope<T>(rows: UserDetailsApiRow[]): T {
  const first = rows?.[0];
  if (!first) throw new Error("Empty API response");
  if (first.errorCode !== 0) throw new Error(first.dB_Response || "API error");
  try {
    return JSON.parse(first.result) as T;
  } catch {
    throw new Error("Failed to parse API result JSON");
  }
}

export interface AdminDashboardRequest {
  locCode: number;
  fromDate: string;
  toDate: string;
}

export const adminDashboardApi = createApi({
  reducerPath: "adminDashboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminDashboard"],
  endpoints: (builder) => ({
    getAdminDashboardReport: builder.mutation<
      ParsedDashboardData,
      AdminDashboardRequest
    >({
      query: ({ locCode, fromDate, toDate }) => ({
        url: "/api/v1/Report/AdminDashboardReport",
        method: "POST",
        body: {
          LocCode: locCode,
          fromDate,
          toDate,
        },
      }),
      transformResponse: (raw: DashboardApiResponse[]) =>
        parseDashboardResponse(raw[0]),
    }),
    getUserDetails: builder.query<EmployeeDetails[], UserSearchParams>({
      query: ({ empName = "", empId = "", mobileNo = "", emailId = "" }) => ({
        url: "/api/v1/Users/user-details",
        params: { empName, empId, mobileNo, emailId },
      }),
    }),
    getTripDetails: builder.query<TripDetailsResponse, string>({
      query: (tripId) => `/api/v1/DriversApp/trip/${tripId}`,
    }),
    getVehicleDetails: builder.query<VehicleDetails[], string>({
      query: (registrationNo) => ({
        url: "/api/v1/Vehicles/details",
        params: { registrationNo },
      }),
      transformResponse: (raw: VehicleApiResponse): VehicleDetails[] => {
        if (!raw?.isSuccess || !raw.result) return [];
        const r = raw.result;
        return [
          {
            vehicle_Id: r.vehicle_Id,
            vehicleId: r.vehicleId,
            registrationNo: r.vehicle_Registration_No,
            vendorName: r.vendorName,
            driverName: r.driverName === "N/A" ? null : r.driverName,
            locCode: r.locCode,
            currentStatus: r.current_Status,
          },
        ];
      },
    }),
    getVehicleById: builder.query<VehicleDetailResp, string | number>({
      query: (id) => `/api/v1/Vehicles/${id}`,
    }),
    getUserById: builder.query<EmployeeProfile, string | number>({
      query: (id) => `/api/v1/Users/${id}`,
    }),

    // ─── NEW ────────────────────────────────────────────────────────────────
    getUserFilterData: builder.query<EmployeeSchedule[], UserFilterParams>({
      query: ({ dateFrom, dateTo, empId }) => ({
        url: `/api/v1/TransRoster/ViewSchedules`,
        params: { empId, dateFrom, dateTo },
      }),
      transformResponse: (response: any) => {
        console.log(response, "response 92");
        return response;
      },
    }),
    getWeeklyOffData: builder.query<WeeklyOff, number | string>({
      query: (empId) => ({
        url: `/api/v1/MstWeeklyOff/byemp/${empId}`,
        // params: { empId },
      }),
      transformResponse: (response: WeeklyOff) => {
        console.log(response, "response 98");
        return response;
      },
    }),
    // ── GET /api/v1/TransRoster/GetUserShiftData ─────────────────────────
    getUserShiftData: builder.query<UserFilterDataResult, UserFilterDataParams>(
      {
        query: ({ LocCode, EmpId }) => ({
          url: "/api/v1/TransRoster/GetUserFilterData",
          params: { LocCode, EmpId },
        }),
        transformResponse: (res: UserDetailsApiRow[]) =>
          parseEnvelope<UserFilterDataResult>(res),
        // providesTags: [{ type: TAG.SHIFTS, id: "SELF" }],
      },
    ),
    getLoginUserReport: builder.query<LoginUserReport, void>({
      query: () => "/api/v1/Users/tenant-users",
    }),
    // ── POST /api/v1/Report/GetHelpDesk ───────────────────────────────────
    getHelpDeskReport: builder.query<HelpDeskReport, HelpDeskRequest>({
      query: ({ EmpID, DateFrom, DateTo }) => ({
        url: "/api/v1/Report/GetHelpDesk",
        method: "POST",
        body: { EmpID, DateFrom, DateTo },
      }),
    }),
  }),
});

export const {
  useGetAdminDashboardReportMutation,
  useLazyGetUserDetailsQuery,
  useLazyGetTripDetailsQuery,
  useLazyGetVehicleDetailsQuery,
  useLazyGetVehicleByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUserFilterDataQuery,
  useGetWeeklyOffDataQuery,
  useGetUserShiftDataQuery,
  useGetLoginUserReportQuery,
  useGetHelpDeskReportQuery,
} = adminDashboardApi;
export const MOCK_RAW: DashboardApiResponse = {
  kpi: JSON.stringify({
    TotalUsers: 0,
    TotalTrip: 0,
    NoShow: 0,
    AdhocActivities: 0,
    ActiveDriver: 0,
  }),

  tripSummary: JSON.stringify([
    { TripDate: "2026-06-06", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-07", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-08", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-09", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-10", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-11", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-12", LoginTrips: 0, LogoutTrips: 0 },
    { TripDate: "2026-06-13", LoginTrips: 0, LogoutTrips: 0 },
  ]),

  userInfo: JSON.stringify({
    RegisteredUsers: 0,
    ActiveUsers: 0,
    Inactive: 0,
  }),

  jsonOTAOTD: JSON.stringify({
    Perc_OTA: 0,
    Perc_OTD: 0,
  }),

  jsonAdhocRequest: JSON.stringify({
    AdhocRequests_Pickup: 0,
    AdhocRequests_Drop: 0,
    AdhocRequests_Total: 0,
  }),

  jsonVehicleDriver: JSON.stringify({
    VehicleTotal: 0,
    DriverTotal: 0,
  }),

  jsonSafetyandSecurity: JSON.stringify({
    SingleFemaleTravelled: 0,
    FemaleTravelled: 0,
  }),

  jsonUniqueVehicleDriver: JSON.stringify({
    VehicleTotal: 0,
    DriverTotal: 0,
  }),

  vehicleDriverCompliance: JSON.stringify({
    VehicleCompliance: 0,
    DriverCompliance: 0,
  }),

  jsonVehicleDeployment: JSON.stringify([
    { VehicleDeployment: "Dzire", Total: 0 },
    { VehicleDeployment: "Hatchback", Total: 0 },
    { VehicleDeployment: "Sedan", Total: 0 },
    { VehicleDeployment: "SUV", Total: 0 },
  ]),

  jsonFeedbackReport: JSON.stringify({
    TotalTrips: 0,
    TotalUsers: 0,
    TotalFeedbacks: 0,
  }),

  jsonVehicleType: JSON.stringify([
    { VehicleTypeWise: "Dzire", Total: 0 },
    { VehicleTypeWise: "Sedan", Total: 0 },
    { VehicleTypeWise: "SUV", Total: 0 },
  ]),

  jsonVehicleUtilization: JSON.stringify([
    { ReportType: "VUI %", Total: 0 },
    { ReportType: "BCS %", Total: 0 },
    { ReportType: "TT %", Total: 0 },
  ]),
};

export const MOCK_DATA: ParsedDashboardData = parseDashboardResponse(MOCK_RAW);

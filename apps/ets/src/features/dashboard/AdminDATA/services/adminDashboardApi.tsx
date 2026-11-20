import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../shared/lib/api/baseQueryWithReauth";
import type {
  DashboardApiResponse,
  ParsedDashboardData,
} from "../types/admin.types";
import { parseDashboardResponse } from "../config/parsers";

export interface AdminDashboardRequest {
  locCode: number;
  fromDate: string;
  toDate: string;
}

export const adminDashboardApi = createApi({
  reducerPath: "adminDataDashboardApi",
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
  }),
});

export const { useGetAdminDashboardReportMutation } = adminDashboardApi;
export const MOCK_RAW: DashboardApiResponse = {
  jsonUsers:
    '{"RegisteredUsers":230,"NewJoiners":23,"Attritions":0,"NoShowLogin":7,"NoShowLogout":9,"NoShowTotal":16,"LoginTrips":210,"LogoutTrips":279,"TotalTrips":489,"UniqueUserTravelled":187,"VendorSpocs":3,"SingleFemaleTrips":33}',
  jsonOTAOTD: '{"Perc_OTA":166,"Perc_OTD":50}',
  jsonAdhocRequest:
    '{"AdhocRequests_Pickup":2,"AdhocRequests_Drop":0,"AdhocRequests_Total":2}',
  jsonOccupancy:
    '{"PickOccupancy":65,"DropOccupancy":66,"OverallOccupancy":65}',
  jsonSafetySecurity:
    '{"FemaleTravelled":81,"FemaletravelledinOddHours":81,"ReachedConfirmations":0,"EscourtOnRoute":1}',
  jsonUniqueVehicleDriver: '{"VehicleTotal":4,"DriverTotal":8}',
  vehicleDriverCompliance: '{"VehicleCompliance":75,"DriverCompliance":50}',
  jsonVehicleType:
    '[{"VehicleTypeWise":"Dzire","Total":2},{"VehicleTypeWise":"Sedan","Total":1},{"VehicleTypeWise":"SUV","Total":1}]',
  jsonFeedbackReport: '{"TotalTrips":489,"TotalUsers":1276,"TotalFeedbacks":0}',
  jsonVehicleDeployment:
    '[{"VehicleDeployment":"Dzire","Total":222},{"VehicleDeployment":"Hatchback","Total":7},{"VehicleDeployment":"Sedan","Total":74},{"VehicleDeployment":"SUV","Total":1}]',
  jsonVehicleUtilization:
    '[{"ReportType":"VUI %","Total":94},{"ReportType":"BCS %","Total":1},{"ReportType":"TT %","Total":74}]',
};

export const MOCK_DATA: ParsedDashboardData = parseDashboardResponse(MOCK_RAW);

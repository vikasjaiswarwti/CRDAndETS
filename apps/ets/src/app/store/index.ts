// src/app/store/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fix: spreading ...apiReducers into the reducer map loses the full state type,
// so TypeScript can't reconcile the middleware signatures.
// Solution: use combineReducers() explicitly — the full state type is inferred
// upfront and the middleware constraint is satisfied.
//
// To add a new API: one import + one line in apiSlices array. Nothing else.
// ─────────────────────────────────────────────────────────────────────────────

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

// ── Regular slices ────────────────────────────────────────────────────────────
import authReducer from "../../features/auth/slices/authSlice";
import navigationReducer from "../../features/navigation/slices/navigationSlice";

import shiftUiReducer from "../../features/shift-management/slice/shiftSlice";
import { shiftApi } from "../../features/shift-management/services/shiftManagementApi";

import rosterUiReducer from "../../features/roaster/slice/RosterSlice";
import { rosterApi } from "../../features/roaster/services/RosterApi";

import individualRosterReducer from "../../features/roaster/slice/IndividualRosterSlice";
import { individualRosterApi } from "../../features/roaster/services/IndividualRosterApi";

// import dashboardReducer from "../../features/dashboard/slices/dashboardSlice";

// ── RTK Query API slices ──────────────────────────────────────────────────────
import { fileApi } from "../../shared/services/fileApi";

import { authApi } from "../../features/auth/services/authApi";

// never change this ....
import { menuApi } from "../../features/navigation/services/menuApi"; // here is the user preferences calls
// import { userApi } from "../../features/user-management/services/userApi";
import { adminMenuApi } from "../../features/system-administration/services/SystemMenuapi";
import { lookupsApi } from "../../features/lookups/services/lookupsApi";

import { roleApi } from "../../features/role-management/services/roleApi";
// Same-named exports from other features; each has its OWN unique reducerPath and
// MUST be registered here (reducer + middleware) or RTK Query warns on first use.
import { roleApi as systemRoleApi } from "../../features/system-administration/services/SystemRoleApi";
import { adminMenuApi as menuManagementApi } from "../../features/menu-management/services/adminMenuApi";
import { roleMenuMappingApi as roleMenuMappingListApi } from "../../features/role-menu-mapping/services/roleMenuMappingApi";
import { adminDashboardApi as adminDataDashboardApi } from "../../features/dashboard/AdminDATA/services/adminDashboardApi";
// import { userRoleApi } from "../../features/user-role";

import { lineOfBusinessApi } from "../../features/line-of-business/services/lineofbusinessapi";
// import { lkpAdhocWeekDayApi } from "../../features/lkp-adhoc-week-day/services/lkpadhocweekdayapi";

// import { orderApi }   from "../../features/orders/services/orderApi";
// import { reportApi }  from "../../features/reports/services/reportApi";

// import { vehicleApi } from "../../features/vehicle";
import { cityZoneApi } from "../../features/cityzone/services/cityZoneApi";
import { lkpLocationApi } from "../../features/lkp-location/services/lkplocationapi";
import { billPlanTypeApi } from "../../features/mst-bill-plan-type/services/bill-plan-typeapi";
import { billPlanApi } from "../../features/mst-bill-plans/services/bill-plan-api";
import { vendorApi } from "../../features/vendors/services/vendorApi";
import { vehicleTypeApi } from "../../features/vehicletype/services/vehicletypeapi";
// import { vehicleApi } from "../../features/vehicle";

import { documentOwnerTypeApi } from "../../features/document-owner-type/services/DocOwnerTypeApi";
import { documentTypeApi } from "../../features/document-type/services/DocTypeApi";
import { fuelTypeApi } from "../../features/fuel-type/services/FuelTypeApi";
import { escortApi } from "../../features/escort/services/EscortApi";
import { escortVendorApi } from "../../features/escort-vendor/services/EscortVendorApi";
import { departmentApi } from "../../features/lkp-department/services/Departmentapi";
import { processApi } from "../../features/lkp-process/services/processApi";
import { employeeTypeApi } from "../../features/employee-type/services/EmployeeTypeApi";
import { employeeApi } from "../../features/employee/services/Employeeapi";

import rolePermissionReducer from "../../features/system-administration/slice/RolePermissionSlice";
import { roleMenuMappingApi } from "../../features/system-administration/services/Systemrolemenumappingapi";

// import { menuApi } from "../../features/navigation/services/menuApi"; // here is the user preferences calls

// import { roleMenuMappingApi } from "../../features/role-menu-mapping";
import { employeeProfileApi } from "../../features/dashboard/user/services/employeeProfileApi";
import { appControlApi } from "../../features/new-app-control/services/Appcontrolapi";
import { shiftIntervalApi } from "../../features/shiftinterval/services/shiftintervalApi";
import { businessApi } from "../../features/corporate/services/businessApi";

import { shiftValidationApi } from "../../features/shift-validation/services/shiftValidationApi";
import shiftValidationUiReducer from "../../features/shift-validation/slice/shiftValidationSlice";

import { lkpFeedbackTypeApi } from "../../features/lkp-feedbacktype/services/LkpfeedbacktypeApi";
import { lkpPenaltyTypeApi } from "../../features/lkp-penalty-type/services/LkpPenaltytypeApi";
import { lkpTripTypeApi } from "../../features/lkp-trip-type/services/LkpTripTypeApi";
import { lkpAdhocWeekDaysApi } from "../../features/lkp-adhoc-days/services/LkpAdhocWeekDaysApi";

// -----------------------
import { stateApi } from "../../features/state/services/stateApi";
import { currentStatusApi } from "../../features/currentStatus/services/currentStatusApi";
import { driverApi } from "../../features/driver/services/driverApi";
import { vehicleStatusApi } from "../../features/vehicleStatus/services/vehicleStatusApi";
import { vehicleApi } from "../../features/vehicle-management/services/vehicleApi";
import { ehsChecksApi } from "../../features/EHS/services/ehsChecksApi";
import { transEhsApi } from "../../features/EHSChecks/services/transEhsApi";
import { vendorSupervisorApi } from "../../features/VendorSuperVisor/services/vendorSupervisorApi";
import { specialCaseApi } from "../../features/specialCase/services/specialCaseApi";
import { userSupervisorApi } from "../../features/UserSupervisor/services/userSupervisorApi";
import { addressChangesApi } from "../../features/AddressChange/services/addressChangesApi";
import { notificationManagementApi } from "../../features/NotificationManagement/services/notificationManagementApi";

import commandPaletteReducer from "../../features/command-pallete/slice/Commandpaletteslice";
import { otpApi } from "../../shared/services/otpApi";

import { routeManagementApi } from "../../features/routing/services/RouteManagementApi";
import routeManagementReducer from "../../features/routing/slice/Routemanagementslice";

import { routeMakerApi } from "../../features/route-optimization/services/routeMakerApi";
import { vendorDashboardApi } from "../../features/dashboard/vendor/services/vendorDashboardApi";
import routeTrackingReducer from "../../features/route-tracking/slice/routeTrackingSlice";
import { routeTrackingApi } from "../../features/route-tracking/services/routeTrackingApi";
import { vendorTripApi } from "../../features/vendor-trip/services/vendorTripApi";
import pinnedRoutesReducer from "../../features/route-optimization/slice/pinnedRoutesSlice";
import allocationSessionReducer from "../../features/route-optimization/slice/Allocationsessionslice";
import { systemPermissionApi } from "../../features/system-administration/services/SystemPermissionApi";

import { vehicleComplianceApi } from "../../features/compliant-nonCompliant/services/VehicleComplianceApi";
import { profileApi } from "../../features/profile/services/profileApi";
import { vehicleApprovalApi } from "../../features/compliant-nonCompliant/services/VehicleApprovalApi";
import { adminDashboardApi } from "../../features/dashboard/admin/services/adminDashboardApi";
import { driverComplianceApi } from "../../features/compliant-nonCompliant/services/DrivercomplianceApi";

import vendorContextReducer from "../../features/VendorSuperVisor/slice/Vendorcontextslice";
import { reportApi } from "../../features/report-analytics/services/ReportApi";
import { reportPermissionApi } from "../../features/report-permission/services/reportPermissionApi";

import { routeReportsApi } from "../../features/routing/services/RouteReportsApi";
import { escortDashboardApi } from "../../features/dashboard/escort/services/escortDashboardApi";
import { menuPermissionApi } from "../../features/menu-permission/services/menuPermissionApi";
import { billingApi } from "../../features/billing/services/billingApi";
import { securityApi } from "../../features/security-dashboard/services/securityApi";
import playSoundReducer from "../../features/security-dashboard/slice/playSoundSlice";
// -------------
import { playSoundListenerMiddleware } from "../../features/security-dashboard/middleware/playSoundListener";
import { initPlaySoundCrossTabSync } from "../../features/security-dashboard/persistence/playSoundCrossTabSync";
import { progressTripApi } from "../../features/progressTrip/services/progressTripApi";
import progressTripsReducer from "../../features/progressTrip/slice/progressTripsSlice";
import businessReducer from "../../features/corporate/slice/businessSlice";
import { userAppConfigurationApi } from "../../features/new-app-control/services/userAppConfigurationApi";

import { vehicleQrApi } from "../../features/pocforqr/services/VehicleQrApi";

import { fleetDriverApi as FleetDriverQRFlow } from "../../features/pocforqr/services/FleetDriverApi";
import { vendorApi as VendorQRFlow } from "../../features/pocforqr/services/VendorApi";

import { bookingApi as BookingQRFlow } from "../../features/pocforqr/services/BookingApi";

import { complaintApi } from "../../features/complaint-resolution/services/ComplaintApi";
import { vehicleCheckSheetApi } from "../../features/LTR/vehicle-check-sheet/services/ltrApi";
import { penaltyApi } from "../../features/penalty/services/penaltyApi";
import { auditApi } from "../../features/audit/services/auditApi";
import { nodalPointApi } from "../../features/employee-nodal-point/services/nodalPointApi";
import { routeTableApi } from "../../features/employee-nodal-point/services/routeTableApi";
import { sharedCabApi } from "../../features/SharedCab/services/sharedCabApi";
import { speedServiceGridApi } from "../../features/speed-service-grid/services/speedServiceGridApi";
import { masterWeeklyScheduleApi } from "../../features/master-weekly-schedule/services/MasterWeeklyScheduleApi";

const rootReducer = combineReducers({
  // ── Regular slices ─────────────────────────────────────────────────────────
  auth: authReducer,
  business: businessReducer,
  progressTrips: progressTripsReducer,
  navigation: navigationReducer,
  commandPalette: commandPaletteReducer,

  shiftUi: shiftUiReducer,
  rolePermissionUi: rolePermissionReducer,

  rosterUi: rosterUiReducer,
  individualRosterUi: individualRosterReducer,

  shiftValidationUi: shiftValidationUiReducer,
  routeManagementUi: routeManagementReducer,
  routeTrackingUi: routeTrackingReducer,
  securityUi: playSoundReducer,

  allocationSession: allocationSessionReducer,

  pinnedRoutes: pinnedRoutesReducer,

  vendorContext: vendorContextReducer,
  //
  [fileApi.reducerPath]: fileApi.reducer,
  [shiftValidationApi.reducerPath]: shiftValidationApi.reducer,

  // // dashboard: dashboardReducer,
  [shiftApi.reducerPath]: shiftApi.reducer, // reducerPath = "shiftApi"
  // ── RTK Query cache reducers ────────────────────────────────────────────────
  [authApi.reducerPath]: authApi.reducer,
  [menuApi.reducerPath]: menuApi.reducer,
  [cityZoneApi.reducerPath]: cityZoneApi.reducer,

  [lookupsApi.reducerPath]: lookupsApi.reducer,
  [adminMenuApi.reducerPath]: adminMenuApi.reducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [systemRoleApi.reducerPath]: systemRoleApi.reducer,
  [menuManagementApi.reducerPath]: menuManagementApi.reducer,
  [roleMenuMappingListApi.reducerPath]: roleMenuMappingListApi.reducer,
  [adminDataDashboardApi.reducerPath]: adminDataDashboardApi.reducer,
  // [userRoleApi.reducerPath]: userRoleApi.reducer,

  [lineOfBusinessApi.reducerPath]: lineOfBusinessApi.reducer,
  [roleMenuMappingApi.reducerPath]: roleMenuMappingApi.reducer,
  [lkpLocationApi.reducerPath]: lkpLocationApi.reducer,

  [billPlanTypeApi.reducerPath]: billPlanTypeApi.reducer,
  [billPlanApi.reducerPath]: billPlanApi.reducer,
  [vendorApi.reducerPath]: vendorApi.reducer,
  [vehicleTypeApi.reducerPath]: vehicleTypeApi.reducer,
  // [vehicleApi.reducerPath]: vehicleApi.reducer,
  [documentOwnerTypeApi.reducerPath]: documentOwnerTypeApi.reducer,
  [documentTypeApi.reducerPath]: documentTypeApi.reducer,
  [fuelTypeApi.reducerPath]: fuelTypeApi.reducer,
  [escortApi.reducerPath]: escortApi.reducer,
  [escortVendorApi.reducerPath]: escortVendorApi.reducer,

  [departmentApi.reducerPath]: departmentApi.reducer,
  [processApi.reducerPath]: processApi.reducer,
  [employeeTypeApi.reducerPath]: employeeTypeApi.reducer,
  [employeeApi.reducerPath]: employeeApi.reducer,
  [employeeProfileApi.reducerPath]: employeeProfileApi.reducer,

  [appControlApi.reducerPath]: appControlApi.reducer,
  [userAppConfigurationApi.reducerPath]: userAppConfigurationApi.reducer,

  [shiftIntervalApi.reducerPath]: shiftIntervalApi.reducer,
  [businessApi.reducerPath]: businessApi.reducer,

  [lkpFeedbackTypeApi.reducerPath]: lkpFeedbackTypeApi.reducer,
  [lkpPenaltyTypeApi.reducerPath]: lkpPenaltyTypeApi.reducer,

  [lkpTripTypeApi.reducerPath]: lkpTripTypeApi.reducer,
  [stateApi.reducerPath]: stateApi.reducer,
  [currentStatusApi.reducerPath]: currentStatusApi.reducer,
  [driverApi.reducerPath]: driverApi.reducer,
  [vehicleStatusApi.reducerPath]: vehicleStatusApi.reducer,
  [lkpAdhocWeekDaysApi.reducerPath]: lkpAdhocWeekDaysApi.reducer,
  [vehicleApi.reducerPath]: vehicleApi.reducer,
  [ehsChecksApi.reducerPath]: ehsChecksApi.reducer,
  [transEhsApi.reducerPath]: transEhsApi.reducer,
  [vendorSupervisorApi.reducerPath]: vendorSupervisorApi.reducer,
  [specialCaseApi.reducerPath]: specialCaseApi.reducer,
  [userSupervisorApi.reducerPath]: userSupervisorApi.reducer,
  [addressChangesApi.reducerPath]: addressChangesApi.reducer,
  [notificationManagementApi.reducerPath]: notificationManagementApi.reducer,
  [rosterApi.reducerPath]: rosterApi.reducer,
  [otpApi.reducerPath]: otpApi.reducer,
  [routeManagementApi.reducerPath]: routeManagementApi.reducer,
  [individualRosterApi.reducerPath]: individualRosterApi.reducer,
  [routeMakerApi.reducerPath]: routeMakerApi.reducer,
  [vendorDashboardApi.reducerPath]: vendorDashboardApi.reducer,
  [vehicleComplianceApi.reducerPath]: vehicleComplianceApi.reducer,
  [vehicleApprovalApi.reducerPath]: vehicleApprovalApi.reducer,
  [systemPermissionApi.reducerPath]: systemPermissionApi.reducer,
  [routeTrackingApi.reducerPath]: routeTrackingApi.reducer,
  [vendorTripApi.reducerPath]: vendorTripApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,
  [driverComplianceApi.reducerPath]: driverComplianceApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer,
  [reportPermissionApi.reducerPath]: reportPermissionApi.reducer,
  [routeReportsApi.reducerPath]: routeReportsApi.reducer,
  [escortDashboardApi.reducerPath]: escortDashboardApi.reducer,
  [menuPermissionApi.reducerPath]: menuPermissionApi.reducer,
  [billingApi.reducerPath]: billingApi.reducer,
  [securityApi.reducerPath]: securityApi.reducer,
  [progressTripApi.reducerPath]: progressTripApi.reducer,

  [vehicleQrApi.reducerPath]: vehicleQrApi.reducer,
  [FleetDriverQRFlow.reducerPath]: FleetDriverQRFlow.reducer,
  [VendorQRFlow.reducerPath]: VendorQRFlow.reducer,
  [BookingQRFlow.reducerPath]: BookingQRFlow.reducer,
  [complaintApi.reducerPath]: complaintApi.reducer,
  [vehicleCheckSheetApi.reducerPath]: vehicleCheckSheetApi.reducer,
  [penaltyApi.reducerPath]: penaltyApi.reducer,
  [auditApi.reducerPath]: auditApi.reducer,
  [nodalPointApi.reducerPath]: nodalPointApi.reducer,
  [routeTableApi.reducerPath]: routeTableApi.reducer,
  [sharedCabApi.reducerPath]: sharedCabApi.reducer,
  [speedServiceGridApi.reducerPath]: speedServiceGridApi.reducer,
  [masterWeeklyScheduleApi.reducerPath]: masterWeeklyScheduleApi.reducer,
});

// ─────────────────────────────────────────────────────────────────────────────
// API SLICE REGISTRY — add ONE line per new createApi(). Middleware auto-built.
// ─────────────────────────────────────────────────────────────────────────────

const apiSlices = [
  fileApi,
  authApi,
  menuApi,
  // userApi,
  lookupsApi,
  cityZoneApi,
  billPlanTypeApi,
  billPlanApi,
  vendorApi,
  vehicleTypeApi,
  // vehicleApi,
  documentOwnerTypeApi,
  documentTypeApi,
  fuelTypeApi,
  escortApi,
  roleApi,
  systemRoleApi,
  menuManagementApi,
  roleMenuMappingListApi,
  adminDataDashboardApi,
  // userRoleApi,

  lineOfBusinessApi,
  escortVendorApi,
  lkpLocationApi,
  departmentApi,
  processApi,
  employeeTypeApi,
  employeeApi,
  employeeProfileApi,
  appControlApi,
  userAppConfigurationApi,

  shiftIntervalApi,
  businessApi,

  lkpFeedbackTypeApi,
  lkpPenaltyTypeApi,
  lkpTripTypeApi,
  stateApi,
  currentStatusApi,
  driverApi,
  vehicleStatusApi,
  vehicleApi,
  ehsChecksApi,
  transEhsApi,
  vendorSupervisorApi,
  addressChangesApi,
  notificationManagementApi,
  specialCaseApi,
  userSupervisorApi,

  lkpAdhocWeekDaysApi,

  adminMenuApi,
  rosterApi,

  shiftApi,

  shiftValidationApi,
  roleMenuMappingApi,
  otpApi,
  routeManagementApi,
  individualRosterApi,
  routeMakerApi,
  vendorDashboardApi,
  vehicleComplianceApi,
  vehicleApprovalApi,
  systemPermissionApi,
  routeTrackingApi,
  vendorTripApi,
  profileApi,
  adminDashboardApi,
  driverComplianceApi,
  reportApi,
  reportPermissionApi,
  routeReportsApi,
  escortDashboardApi,
  menuPermissionApi,
  billingApi,
  securityApi,
  progressTripApi,
  vehicleQrApi,
  FleetDriverQRFlow,
  VendorQRFlow,
  BookingQRFlow,
  complaintApi,
  vehicleCheckSheetApi,
  penaltyApi,
  auditApi,
  nodalPointApi,
  routeTableApi,
  sharedCabApi,
  speedServiceGridApi,
  masterWeeklyScheduleApi,
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────────────────────

const resettableRootReducer = (
  state: ReturnType<typeof rootReducer> | undefined,
  action: { type: string },
) => {
  if (action.type === "app/resetAll") {
    return rootReducer(undefined, action as any);
  }
  return rootReducer(state, action as any);
};

export const resetAllState = () => ({ type: "app/resetAll" as const });

export const store = configureStore({
  // reducer: rootReducer,

  reducer: resettableRootReducer,
  middleware: (getDefaultMiddleware) => {
    const base = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).prepend(playSoundListenerMiddleware.middleware);

    // Append all API middlewares from the registry in one loop
    return apiSlices.reduce(
      (chain, api) => chain.concat(api.middleware),
      base as any,
    ) as typeof base;
  },

  // devTools: process.env.NODE_ENV !== "production",
  // Redux DevTools: controlled by VITE_REDUX_DEVTOOLS in .env (keep unset/false in production).
  devTools: import.meta.env.VITE_REDUX_DEVTOOLS === "true",
});

setupListeners(store.dispatch);
initPlaySoundCrossTabSync(store);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

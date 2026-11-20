export {
  VendorDashboardPage,
  default as VendorDashboardPageDefault,
} from "./pages/Vendordashboardpage";
export {
  ApprovalDashboardPage,
  default as ApprovalDashboardPageDefault,
} from "./pages/Vehicleapprovalspage";
export { vehicleComplianceApi } from "./services/VehicleComplianceApi";
export { vehicleApprovalApi } from "./services/VehicleApprovalApi";
export type {
  VehicleCompliance,
  VehicleApproval,
  VehicleComplianceStats,
} from "./types/Vehiclecompliance.types";

/*
 * store.ts:
 *   [vehicleComplianceApi.reducerPath]: vehicleComplianceApi.reducer,
 *   [vehicleApprovalApi.reducerPath]:   vehicleApprovalApi.reducer,
 *   middleware: getDefaultMiddleware().concat(vehicleComplianceApi.middleware, vehicleApprovalApi.middleware)
 *
 * router:
 *   'compliance-dashboard': lazy(() => import('@/features/vehicle-compliance').then(m => ({ default: m.VendorDashboardPage   }))),
 *   'approval-dashboard':   lazy(() => import('@/features/vehicle-compliance').then(m => ({ default: m.ApprovalDashboardPage }))),
 */

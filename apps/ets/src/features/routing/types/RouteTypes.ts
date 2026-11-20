// src/features/routeManagement/types/RouteTypes.ts

import type {
  DownloadRouteDataPayload,
  DownloadReportsPayload,
} from "./RouteReportType";

// ─── Filter Types ──────────────────────────────────────────────────────────────
export interface RouteManagementFilterState {
  officeId: string;
  date: string;
  shiftType: number;
}

export interface OfficeOption {
  value: number;
  label: string;
}

export interface ShiftTypeOption {
  value: number;
  label: string;
}

export interface RouteManagementQueryArgs {
  locCode: number;
  tripType: 0 | 1 | 2;
  tripDate: string;
}

// ─── Raw API Response shapes ───────────────────────────────────────────────────

export interface RawDashboard {
  totalMovements: number;
  pickupEmployees: number;
  dropEmployees: number;
  totalEmployees: number;
  scheduledEmployees: number;
  adhocEmployees: number;
  routesGenerated: number;
  pickupRoutesGenerated: number;
  dropRoutesGenerated: number;
  totalEmployeesInTripSheets: number;
  pickupEmployeesInTripSheets: number;
  dropEmployeesInTripSheets: number;
  scheduledEmployeesInTrips: number;
  adhocEmployeesInTrips: number;
  totalVehicleAllocatedTrips: number;
  totalVendorAllocatedTrips: number;
  totalDriverAllocatedTrips: number;
  totalVehicleVendorAllocatedTrips: number;
  totalVehicleVendorDriverAllocatedTrips: number;
  totalGuardTrips: number;
  totalNoShowEmployees: number;
  totalPaxAddedEmployees: number;
  totalAverageOccupancy: number;
  totalAverageOccupancyText: string;
}

export interface RawRoutePlanningRow {
  locCode: number;
  shiftId: number;
  tripType: 1 | 2;
  tripTypeDesc: "Pick" | "Drop";
  shiftTime: string;
  scheduledPax: number;
  adhocRequests: number;
  totalPax: number;
  isLocked: "Y" | "N";
  routeStatus: string;
  isRouteGenerated: 0 | 1;
  vehicleVendorRouteText: string;
}

export interface RawTripPublishingRow {
  locCode: number;
  shiftId: number;
  tripType: 1 | 2;
  tripTypeDesc: "Pick" | "Drop";
  shiftTime: string;
  routedTrips: number;
  totalEmployeesInTripSheets: number;
  scheduledEmployeesInTrips: number;
  adhocEmployeesInTrips: number;
  vehicleAllocatedTrips: number;
  vendorAllocatedTrips: number;
  driverAllocatedTrips: number;
  vehicleVendorAllocatedTrips: number;
  vehicleVendorDriverAllocatedTrips: number;
  guardTrips: number;
  noShowEmployees: number;
  paxAddedEmployees: number;
  averageOccupancy: number;
  averageOccupancyText: string;
  vehicleVendorRouteText: string;
  vehicleVendorDriverRouteText: string;
  maleFemaleGuardText: string;
  notifications: Notification[];
  maleEmployees: number;
  femaleEmployees: number;
}

export interface RawTripManagementResponse {
  result: {
    tripManagement: {
      dashboard: RawDashboard;
      routePlanning: RawRoutePlanningRow[];
      tripPublishing: RawTripPublishingRow[];
    };
  };
  isSuccess: boolean;
  message: string;
}

// ─── Route Edit Dropdown ───────────────────────────────────────────────────────

export interface RouteDropdownItem {
  id: string;
  name: string;
}

export interface RawRouteEditDropdownResponse {
  result: {
    routeEditDropdown: {
      routePlanning: RouteDropdownItem[];
      routePublishing: RouteDropdownItem[];
    };
  };
  isSuccess: boolean;
  message: string;
}

export interface RouteEditDropdownResult {
  routePlanning: RouteDropdownItem[];
  routePublishing: RouteDropdownItem[];
}

// ─── KPI / Stats ──────────────────────────────────────────────────────────────
export interface RouteStats {
  totalEmployees: number;
  maleEmployees: number;
  femaleEmployees: number;
  adhocEmployees: number;
  routesGenerated: number;
  employeesInTripSheets: number;
  avgOccupancy: number;
  guardTrips: number;
}

// ─── Route Planning Table ──────────────────────────────────────────────────────
export type ShiftLoginType = "Login" | "Logout";
export type RouteStatus = "Routes Generated" | "Scheduled" | "Not Generated";

export interface RoutePlanningRow {
  id: string;
  shiftId: number;
  tripType: number;
  shiftTime: string;
  loginType: ShiftLoginType;
  employeeCount: number;
  scheduledPax: number;
  adhocRequests: number;
  isLocked: boolean;
  status: RouteStatus;
  isRouteGenerated: boolean;
  vehicleVendorRouteText: string;
  routeStatus: string;
}

// ─── Trip Publishing Table ─────────────────────────────────────────────────────
export type CommunicationStatus = "sent" | "pending" | "none" | "failed";
export interface Notification {
  label: string;
  batchId: string;
  channel: string;
}

export interface TripPublishingRow {
  id: string;
  shiftId: number; // ← ADD
  tripType: number;
  shiftTime: string;
  totalEmployees: number;
  adhocEmployees: number;
  occupancyPct: number;
  vehicleInfo: string | null;
  vehicle: number;
  vendor: number;
  route: number;
  maleGuard: number;
  femaleGuard: number;
  communicationStatus: CommunicationStatus;
  communicationDetail: string | null;
  maleFemaleGuardText: string;
  notifications: Notification[];
  maleEmployees: number;
  femaleEmployees: number;
}

// ─── Normalized API Response ───────────────────────────────────────────────────
export interface RouteManagementApiResponse {
  stats: RouteStats;
  routePlanningRows: RoutePlanningRow[];
  tripPublishingRows: TripPublishingRow[];
}

// ─── Shared ────────────────────────────────────────────────────────────────────
export type RowSelectionMap = Record<string, boolean>;
export type OccupancyLevel = "danger" | "warning" | "success";

// ─── Modal Payload Types ───────────────────────────────────────────────────────
// Each payload is a plain flat object — no nested key/payload wrapper.

export interface ShiftRouteRow {
  locCode: number;
  shiftId: number;
  tripType: number;
  tripTypeDesc: string;
  shiftTime: string;
  scheduledPax: number;
  adhocRequests: number;
  totalPax: number;
  isLocked: string;
  routeStatus: string;
  isRouteGenerated: number;
}

export interface GenerateRoutesPayload {
  locCode: number;
  // shifts: { shiftId: number; tripType: number }[];
  tripDate: string;
  shifts: RoutePlanningRow[];
}

export interface CopyRoutesPayload {
  locCode: number;
  shiftId: number;
  tripType: number;
  tripDate: string;
}

export interface DeleteRoutePayload {
  locCode: number;
  shifts: { shiftId: number; tripType: number }[];
  tripDate: string;
}

export interface BaseDateOptionsPayload {
  shiftId: string;
}

export interface UpdateTripsheetsPayload {
  locCode: number;
  date: string;
  shiftId: number;
  tripType: number;
  shiftTime?: string;
}

export interface UploadVehicleFilePayload {
  locCode: number; // ← ADD
  shiftId: number; // ← ADD
  tripType: number; // ← ADD
  routeDate: string; // ← ADD (was just { date: string })
}

export interface AutomaticSmsStatusPayload {
  shiftId: string;
  sentAt: string;
}

export interface PublishWithETAPayload {
  locCode: number;
  routeDate: string;
  tripType: number;
  shiftId: number;
}

// ─── Modal Key Union ───────────────────────────────────────────────────────────
export type RouteModalKey =
  | "GENERATE_ROUTES"
  | "COPY_ROUTES"
  | "BASE_DATE_OPTIONS"
  | "UPDATE_TRIPSHEETS"
  | "DOWNLOAD_REPORTS"
  | "DOWNLOAD_ROUTE_DATA"
  | "UPLOAD_VEHICLE_FILE"
  | "EMPLOYEE_DETAILS"
  | "AUTOMATIC_SMS_STATUS"
  | "DELETE_ROUTE"
  | "ASSIGN_PHYSICAL_ID"
  | "INTER_SHIFT_COPY"
  | "PublishWithETA";

// ─── Discriminated Union for modal hook state ──────────────────────────────────
export type RouteModalState =
  | { key: "GENERATE_ROUTES"; payload: GenerateRoutesPayload }
  | { key: "COPY_ROUTES"; payload: CopyRoutesPayload }
  | { key: "BASE_DATE_OPTIONS"; payload: BaseDateOptionsPayload }
  | { key: "UPDATE_TRIPSHEETS"; payload: UpdateTripsheetsPayload }
  | { key: "DOWNLOAD_REPORTS"; payload: DownloadReportsPayload }
  | { key: "DOWNLOAD_ROUTE_DATA"; payload: DownloadRouteDataPayload }
  | { key: "UPLOAD_VEHICLE_FILE"; payload: UploadVehicleFilePayload }
  | { key: "EMPLOYEE_DETAILS"; payload: RoutePlanningRow }
  | { key: "AUTOMATIC_SMS_STATUS"; payload: AutomaticSmsStatusPayload }
  | { key: "DELETE_ROUTE"; payload: DeleteRoutePayload }
  | { key: "ASSIGN_PHYSICAL_ID"; payload: AssignPhysicalIdPayload } // ← was missing
  | { key: "INTER_SHIFT_COPY"; payload: InterShiftCopyPayload } //
  | { key: "PublishWithETA"; payload: PublishWithETAPayload }
  | null;

// ─── Action Name → Modal Key map ──────────────────────────────────────────────
// Moved to constants/RouteActionRegistry.ts — that file is now the single
// source of truth for resolving a backend dropdown action to a modal + payload.

// ─── Roster Employees ──────────────────────────────────────────────────────────
export interface RosterEmployee {
  sNo: number;
  empId: string;
  employeeId: string;
  mobileNumber: string;
  id: string;
  employeeName: string;
  phone: string;
  gender: string;
  actualOffice: string;
  pickupLocation: string;
  dropLocation: string;
  isAdhoc: boolean;
}

export interface RosterEmployeesResult {
  employees: RosterEmployee[];
}

// ─── Copy Route Analysis ───────────────────────────────────────────────────────
// export interface CopyRouteAnalysisRow {
//   shiftId: number;
//   shiftTime: string;
//   tripType: number;
//   tripTypeDesc: string;
//   totalPax: number;
//   routeStatus: string;
//   isRouteGenerated: number;
// }

// export interface CopyRouteAnalysisResult {
//   rows: CopyRouteAnalysisRow[];
//   baseDate: string;
// }

export interface CopyRouteAnalysisRow {
  pastDate: string;
  totalRosteredToday: number;
  totalRoutedOnPastDate: number;
  commonEmployees: number;
  newEmployees: number;
  removedEmployees: number;
  matchPercentage: number;
}

export interface CopyRouteAnalysisResult {
  locCode: number;
  shiftId: number;
  tripType: number;
  tripTypeLabel: string;
  targetDate: string;
  totalRosteredToday: number;
  dayWiseAnalysis: CopyRouteAnalysisRow[];
}

// ─── Permissions ───────────────────────────────────────────────────────────────
export interface RouteManagementPermissions {
  canGenerateRoutes: boolean;
  canDownloadRouteData: boolean;
  canViewSmsStatus: boolean;
  canCopyRoutes: boolean;
  canDeleteRoutes: boolean;
  canUploadVehicleFile: boolean;
  canDownloadReports: boolean;
  canUpdateTripsheets: boolean;
  canViewEmployeeDetails: boolean;
  canSendSms: boolean;
  canSelectRows: boolean;
  canClickEmployeeCount: boolean;
}

export interface AssignPhysicalIdPayload {
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string;
}

export interface UserDumpRecord {
  office: string;
  commutrID: number;
  employeeID: string;
  name: string;
  gender: string;
  emailID: string;
  mobileno: string;
  address: string;
  userLAT: number;
  userLNG: number;
}

export interface AppRegistrationRecord {
  office: string;
  employeeID: string;
  userName: string;
  gender: string;
  department: string;
  projectName: string;
  lobName: string;
  mobileNumber: string;
  userType: string;
  status: string;
}

export interface TripCancellationRecord {
  office: string;
  tripDate: string;
  tripId: number;
  commutrID: number;
  requestedBy: string;
  requestFor: string;
  shift: string;
  tripType: string;
  requestSource: string;
  actionDate: string;
}

export interface InterShiftCopyPayload {
  date: string;
  locCode: number;
  shiftId: number;
  tripType: number;
}

export interface ReplicateShiftwiseArgs {
  locCode: number;
  dateToReplicate: string; // "YYYY-MM-DD"
  tripTypeToReplicate: number; // 1 = Login, 2 = Logout
  shiftToReplicate: number;
  replicateDate: string; // "YYYY-MM-DD"
  replicateTripType: number; // same as source for CopyRoutes; opposite for Intershift
  replicateShift: number;
  replicateFleetDetails: boolean; // "Copy Cabs"
  includeAdhocs: boolean; // always false
  femaleConstraint: number;
  // crypto / Math.random UUID
}

export interface ReplicateShiftwiseResult {
  isSuccess: boolean;
  message: string;
  result?: {
    information?: string;
    dbResponse?: string;
  };
}

// Parsed shape after transform
export interface ShiftFilterItem {
  shiftId: number;
  shiftTime: string;
}

// Raw response shape
export interface RawShiftFilterResponse {
  result: [{ jsonShift: string }];
  isSuccess: boolean;
  message: string;
}

// -----------------------------------------
export interface NotificationSummaryResponse {
  dsDate: string;
  locCode: number;
  tripType: number;
  shiftId: number;
  createdBy: string;
  createdOn: string;
  summary: Summary;
  batches: Batch[];
}

export interface Summary {
  totalBatches: number;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  successRate: string;
}

export interface Batch {
  batchId: string;
  name: string;
  status: string;
  eventKey: string;
  channels: string[];
  notifiedAt: string;
  channelsSent: NotificationChannel[];
  scheduledAt: string;
  completedAt: string | null;
  recipients: NotificationRecipients;
  delivered: NotificationDelivery[];
  failed: NotificationFailure[];
}

export interface NotificationChannel {
  id: number;
  name: string;
}

export interface NotificationRecipients {
  total: number;
  sent: number;
  failed: number;
}

export interface NotificationDelivery {
  [key: string]: unknown; // ← add this line
}

export interface NotificationFailure {
  [key: string]: unknown; // ← add this line
}

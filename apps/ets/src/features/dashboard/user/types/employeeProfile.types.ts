export interface GlobalUserProfile {
  user_Id: string;
  empId: number;
  employeeId: number;
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNo: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  stateCode: number;
  geocodeID: number;
  emp_Lat: number;
  emp_Lng: number;
  locCode: string | null;
  emerContactNo: string | null;
  nodal_Pick: string | null;
  nodal_Drop: string | null;
  emerContactName: string | null;
  designation: string | null;
  isActive: boolean;
  createdOn: string;
  depCode: string;
  gender: string;
  emailId: string;
  proCode: string;
  supEmployeeId: string;
  spocEmployeeId: null | string;
  special_Needs: number;
  lobName: string;
  stateName: string;
  locationName: string;
}

export interface UpdateMobileRequest {
  mobileNo: string;
}

export interface AddressChangeRequest {
  empID: number;
  locCode: string | null;
  city: string;
  pin: String | null;
  state: string | null;
  stateCode: number;
  mobileNo: string | null;
  emerContactNo: string | null;
  geocodeID: number;
  emp_Lat: number;
  emp_Lng: number;
  remarks: string | null;
  address: string | null;
  actionType: string | null;
  nodal_Pick: string | null;
  nodal_Drop: string | null;
  updatE_DATE: string | null;
  effectivedate: string | null;
  rejection_Remark: string | null;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AddressChangeResponse {
  success: boolean;
  message?: string;
}

export interface AdhocRequest {
  Remarks: string;
  ReqId: number;
  RequestDate: string;
  SHIFTTIME: string;
  STATUS: string;
  TripType: string;
}

export interface UserDashboardResponse {
  jsonUserInfo: string;
  jsonTodayTommorowTrips: string;
  jsonAdhocRequest: string;
  jsonNoshowTrips: string;
  jsonWeeklySchedule: string;
  jsonTeamCabs: string;
  jsonTeamAdhocTrips: string;
  jsonComplaint: string;
  jsonTeamComplaint: string;
}

// ---------------- User Info ----------------
export interface UserInfo {
  IsTeamLeder: number;
  EmployeeID: string;
  CommutrId: string;
  Name: string;
  Address: string;
  Mobileno: string;
  TeamCount: number;
  AddressChangeRequest: number;
  TeamTrips: number;
  TeamNoshowCount: number;
  TeamAdhoc: number;
  TeamComplaintCount: number;
  WeeklyOff: string;
}
// ---------------- Trips ----------------
export interface ApiTrip {
  Dsid: number;
  Dsdate: string;
  Triptype: "Login" | "Logout";
  Empid: number;
  Empname: string;
  Address: string;
  ETA: string;
  PaxOrder: number;
  OTP?: number;
  PickShift?: string;
  DropShift?: string;
  TripStatus:
    | "Created"
    | "Printed"
    | "Started"
    | "End"
    | "Cancelled";
}
// ---------------- Trip Home Page (GET /api/v1/UserApp/GetTripHomePage) --------
export interface TripHomeButtonConfig {
  isTripCancellationButtonShow?: boolean;
  isTripNoShowButtonShow?: boolean;
}

export interface TripHomeEntry {
  TripID: number;
  TripDate: string; // e.g. "10-Aug-2026"
  Triptype: string; // "Login" | "Logout"
  TripTypeCode?: number;
  OTP?: number;
  DeBoardOTP?: number;
  PickShift?: string | null;
  DropShift?: string | null;
  PickTime?: string;
  EMPID?: number;
  EmployeeID?: string;
  EmpIDS?: string;
  UserName?: string;
  UserAddress?: string;
  OfficeAddress?: string;
  TripLocation?: string;
  TripStatusName?: string;
  TripStatusCode?: number;
  VehicleInfo?: string;
  FlapNo?: number;
  IsBoarded?: boolean;
  IsDeBoarded?: boolean;
  PaxCount?: number;
  Paxorder?: number;
  ReachedHomeReq?: number;
  IsReached?: number;
  UserAppIVRNumber?: string;
  CancelorNoshow?: string;
  IsCancelTripByUserAfterTAT?: number;
  tripButtonUiConfig: TripHomeButtonConfig;
  TransportType?: number;
  [key: string]: unknown;
}

// One entry per day-group returned by GetTripHomePage (e.g. "Today", "Tomorrow")
export interface TripHomeGroup {
  DayName: string;
  data: TripHomeEntry[];
}
// ---------------- Adhoc ----------------
export interface AdhocRequest {
  Remarks: string;
  ReqId: number;
  RequestDate: string;
  SHIFTTIME: string;
  STATUS: string;
  TripType: string;
}
// ---------------- No Show ----------------
export interface NoShowTrip {
  ShiftTime: string;
  TripDate: string;
  TripID: number;
  TripType: "Login" | "Logout";
}
// ---------------- Weekly Schedule ----------------
export interface DaySchedule {
  WeekDate: string;
  WeekDay: string;
  In: string;
  Out: string;
}
// ---------------- Complaint ----------------
export interface FeedbackItem {
  ReferenceNo: string | number;
  ComplainType: string;
  ComplainDate: string;
  ComplainMessage: string;
  TransportReply: string;
  STATUS: string;
}
// ---------------- Team Cab ----------------
export interface TeamCab {
  Dsid: number;
  Dsdate: string;
  Triptype: "Login" | "Logout";
  Empid: number;
  Empname: string;
  EmployeeID: string;
  Address: string;
  ETA: string;
  PaxOrder: number;
  OTP?: number;
  PickShift?: string;
  DropShift?: string;
  TripStatus:
    | "Created"
    | "Printed"
    | "Started"
    | "End"
    | "Cancelled";
}

// ---------------- Parsed Response ----------------

export interface ParsedDashboardData {
  userInfo: UserInfo[];
  todayTommorowTrips: ApiTrip[];
  adhocRequest: AdhocRequest[];
  noshowTrips: NoShowTrip[];
  weeklySchedule: DaySchedule[];
  teamCabs: TeamCab[];
  teamAdhocTrips: TeamCab[];
  complaint: FeedbackItem[];
  teamComplaint: FeedbackItem[];
}
export interface TeamCabTrip {
  empId: number;
  dsId: number;
  fullName: string;
  tripType: number;
  tripTypeName: string;
  tripStatusCode: number;
  tripStatusName: string;
  dsDate: string;
  scheduledStartTime: string;
}

export interface TeamCabTrackResponse {
  isSuccess: boolean;
  message: string;
  requestedEmpId: number;
  requestedDate: string;
  trips: TeamCabTrip[];
}
// ----- Raise Complaint
export interface ComplaintLookup {
  ComplaintType: number;
  ComplainName: string;
}
export interface ComplaintOption {
  label: string;
  value: number;
}

export interface ComplaintLookupResponse {
  errorCode: number;
  dB_Response: string;
  result: string;
}
export interface CreateComplaintRequest {
  tripType: number;
  tripDate: string;
  complaintType: number;
  complainMessage: string;
  empId: number;
}

export interface CreateUserFeedbackRequest {
  empID: number;
  tripId: number;
  rating: number;
  remarks: string;
}

export interface CreateUserFeedbackResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  [key: string]: unknown;
}
// --------------------
export interface ConfirmationButton {
  id: string;
  text: string;
  action: string;
  order: number;
}

export interface TripConfirmationPopup {
  popupId: string;
  icon: string;
  title: string;
  message: string;
  buttons: ConfirmationButton[];
}

export interface UserTripCancelConfirmationItem {
  errorCode: number;
  dB_Response: string;
  result: string; // JSON string
}

export interface UserTripCancelConfirmationResponse {
  result: UserTripCancelConfirmationItem[];
  isSuccess: boolean;
  message: string;
}
export interface UserTripCancelConfirmationRequest {
  RequestFor: number;
  TripType: number;
  TripID: number;
}

export interface UserCancelTripRequest {
  RequestedBy: number;
  RequestFor: number;
  TripDate: string; // "YYYY-MM-DD"
  TripType: number;
  TripID: number;
}
export interface CancelTripResult {
  errorCode: number;
  dB_Response: string;
}

export interface UserCancelTripResponse {
  result: CancelTripResult[];
  isSuccess: boolean;
  message: string;
}

export interface AppScheduleConfig {
  adhocRequestEnabledForUser: boolean;
  boardDebaordEnabledForUser: boolean;
  hybridScheduleEnabled: boolean;
  isScheduleFillForLoginAndLogoutBoth: boolean;
  isBoardDeBoardOTPSameOrDifferent: boolean;
  isCancelTripByUserAfterTAT: boolean;
  isCancelScheduleByUserAfterTAT: boolean;
}
export interface AppControlSettingsResponse {
  AppScheduleUiConfig: {
    isCancellationScheduledAllowed: boolean;
    isEditScheduleAllowed: boolean;
    isAlreadyScheduledNoShow: boolean;
    isCancelledScheduledAllowedAfterTAT: boolean;
    isTrackingScheduledAllowed: boolean;
    IsCreateScheduleAllowed: boolean;
  };

  AppTripUiConfig: {
    isTripTrackingAllowed: boolean;
    isTripChatAllowed: boolean;
    isTripShareCabAllowed: boolean;
    isTripIvrCallAllowed: boolean;
    isTripSafeHomeReach: boolean;
    isTripCancellationAllowed: boolean;
    isTripNoShowAllowed: boolean;
    isDeboardOtpFieldAllowed: boolean;
    isTripSummaryAllowed: boolean;
  };

  CommonUiConfig: {
    IsUserUpdateProfile: boolean;
    AppIcon: string;
    IsAreaDDLEnabled: boolean;
    IsZoneDDlEnabled: boolean;
    BoardingType: number;
    DeboardingType: number;
  };
}

export type BoardingType = "B" | "D";

export interface UserBoardDeboardRequest {
  EmpId: number;
  TripID: number;
  TripType: number;
  EmpLat: string;
  EmpLng: string;
  BoardingType: BoardingType;
}

export interface UserBoardDeboardResponse {
  result: {
    errorCode: number;
    dB_Response: string;
  }[];
  isSuccess: boolean;
  message: string;
}
export interface ReachedHomeRequest {
  empId: number;
  tripID: number;
  empLat: number;
  empLng: number;
}

export interface ReachedHomeResponse {
  errorCode: number;
  dB_Response: string;
}

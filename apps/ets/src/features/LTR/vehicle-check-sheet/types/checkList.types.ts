import type { Dayjs } from "dayjs";

// ─── Inspection Configuration ────────────────────────────────────────────────

export type InspectionType = "yesNo" | "working" | "okBroken";

/**
 * captureType controls the secondary capture field after the status radio:
 *  "remark"      → text input only
 *  "expiryDate"  → single expiry DatePicker; upload shown when status=1 & date filled
 *
 * Note: "dualDate" (issue+expiry) is removed — only one date per row now.
 */
export type CaptureType = "remark" | "expiryDate";

export interface InspectionItem {
  /** number for vehicle inspection rows; string for driver compliance rows */
  id: number | string;
  label: string;
  type: InspectionType;
  captureType: CaptureType;
  /** Required for vehicle inspection rows; omitted for driver compliance rows */
  section?: "documents" | "components" | "glass" | "other";
  /** When true, a DatePicker is shown (driver compliance) or expiry date is shown (inspection) */
  allowDate?: boolean;
  /** When true, an Upload button appears when status is positive */
  allowUpload?: boolean;
}

// ─── Form Field Values ────────────────────────────────────────────────────────

/** Form state for a single inspection row */
export interface InspectionFieldValue {
  name: string;
  status: number;
  /** captureType="expiryDate" + status=1: Dayjs expiry date.
   *  captureType="remark": plain string. */
  value: Dayjs | string | null;
  /** captureType="expiryDate" + status=0 (No): remark entered instead of a date. */
  remark?: string | null;
  /** Upload file key set after upload, only for allowUpload items. */
  uploadedFileKey?: string | null;
}

export interface DriverDetails {
  driverName: string;
  gatePassNo: string;
  aadhaarNo: string;
  driverPNo: string;
  driverSNo: string;
  dlNo: string;
  dlIssueDate: Dayjs | null;
  dlExpiryDate: string | null;
  driverCompliance: Record<string, InspectionFieldValue>;
}

export interface VehicleCheckSheetFormValues {
  checkDate: Dayjs | null;

  // Vehicle Details
  siteRegion: string;
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  manufacturingDate: Dayjs | null;
  commercialPassing: "yes" | "no";
  fuel: "Petrol" | "Diesel" | "CNG" | "EV" | "Hybrid";
  bu: string;
  bodyColor:string;
  department: string;
  ownership: "Own" | "Sublet" | "DCO";
  vehicleDutyHours: "12" | "24";

  // Vendor Details
  vendorName: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorEmail: string;

  // Inspection checklist
  inspection: Record<string, InspectionFieldValue>;

  // Service & Odometer
  lastServiceDate: Dayjs | null;
  lastServiceKm: number | string;
  odometerDate: Dayjs | null;
  odometerKm: number | string;

  // Up to two drivers, each with an independent compliance checklist.
  drivers: DriverDetails[];

  // Remarks
  // otherRemarks: string;
  suggestions: string;
}

// ─── API Payload ──────────────────────────────────────────────────────────────

/**
 * Unified payload shape for both vehicle inspection rows and driver compliance rows.
 * id: number for vehicle items, string for driver compliance items.
 */
export interface InspectionPayloadItem {
  id: number | string;
  name: string;
  status: number | boolean | string | null;
  /** expiryDate + status=1: YYYY-MM-DD string. expiryDate + status=0: remark text. remark: remark text or null. */
  value: string | null;
  /** Always present — null if no file uploaded. */
  uploadedFileKey: string | null;
}

export interface VehicleCheckSheetPayload {
  checkDate: string | null;

  // Vehicle Details
  siteRegion: string;
  vehicleNumber: string;
  vehicleMake: string | null;
  vehicleModel: string;
  manufacturingDate: string | null;
  commercialPassing: string;
  fuel: string;
  bu: string;
  bodyColor:string;
  department: string;
  ownership: string;
  vehicleDutyHours: string;

  // Vendor Details
  vendorName: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorEmail: string;

  inspection: InspectionPayloadItem[];

  lastServiceDate: string | null;
  lastServiceKm: number;
  odometerDate: string | null;
  odometerKm: number;

  drivers: Array<{
    driverName: string;
    gatePassNo: string;
    aadhaarNo: string;
    driverPNo: string;
    driverSNo: string;
    dlNo: string;
    dlIssueDate: string | null;
    dlExpiryDate: string | null;
    driverCompliance: InspectionPayloadItem[];
  }>;

  // otherRemarks: string;
  suggestions: string;
}

export interface ApiSuccessResponse {
  status: boolean;
  message?: string;
}

export interface VehicleCheckSheet extends VehicleCheckSheetPayload {
  id?: number | string;
  _id?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

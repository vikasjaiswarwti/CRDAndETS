// POST /api/v1/Report/EscortDashboardReport
export interface EscortDashboardRequest {
  LocCode: number;
  TripDate: string;   // "YYYY-MM-DD"
  tripType: number;   // 1 = Login, 2 = Logout (per LkpTripType)
  ShiftId: number;
}

export interface SafetyAndSecurity {
  SingleFemaleTravelled: number;
  FemaleTravelled: number;
}

export interface EscortTrip {
  TripId: number;
  TripDate: string;       // "09-Jun-2026"
  TripType: string;       // display string: "Login" | "Logout"
  ShiftTime: string;      // "08:30"
  GaurdRequired: string;  // "Yes" | "No"  (backend spelling kept intentionally)
  EscortId: number;
  VehicleId: number | string | null,
  Vehicle_Registration_No: string | null,
  DriverId: number | string | null,
  DriverName: string | null;
  DriverMobileNo: string | null
}

export interface EscortOption {
  EscortId: number;
  Name: string;
}

// Raw envelope — each field may be a JSON string or already-parsed
export interface EscortDashboardRawResponse {
  jsonSafetyandSecurity: string | SafetyAndSecurity;
  jsonTripList: string | EscortTrip | EscortTrip[];
  jsonEscortDropdownList: string | EscortOption[];
}

// Parsed, component-friendly shape
export interface ParsedEscortDashboard {
  safety: SafetyAndSecurity;
  trips: EscortTrip[];
  escorts: EscortOption[];
}

// POST /api/v1/Escorts/EscortUpdateInTrip
export interface EscortUpdateInTripRequest {
  TripId: number;
  EscortId: number;
}
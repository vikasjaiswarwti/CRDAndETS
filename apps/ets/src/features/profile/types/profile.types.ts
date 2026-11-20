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
  locCode: string | number | null;
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

  // ── Fields returned by GET /api/v1/Users/global/{userId} but not covered
  //    above (real API casing differs from some of the legacy fields above) ──
  emercontactNo: string | null;
  phoneNo: string | null;
  geocodeId: number;
  lobCode: number;
  supId: string | null;
  spoc: string | null;
  empTypeId: number;
  locality: string | null;
  transport: boolean;
  ownTransport: boolean;
  createdBy: string;
  modBy: string | null;
  modOn: string | null;
  locationList: unknown[];
  noShowCount: number;
}

// ─── PUT /api/v1/Users/{userId} — edit-profile request body ──────────────────
// NOTE: this is a distinct shape from GlobalUserProfile (the GET response) —
// do not reuse Partial<GlobalUserProfile> for the update payload.
export interface UpdateGlobalUserProfileDto {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  mobileNo: string | null;
  emailId: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin: string | null;
  phoneNo: string | null;
  stateCode: number | null;
  emerContactNo: string | null;
  specialNeeds: number | null;
  empTypeId: number | null;
  employeeId: string | null;
  locCode: number | null;
  depCode: string | null;
  lobCode: number | null;
  proCode: string | null;
  geocodeId: number | null;
  empLat: number | null;
  empLng: number | null;
  locationName: string | null;
  supervisorName: string | null;
  supEmployeeId: string | null;
  spoc: string | null;
  spocEmployeeId: string | null;
  supId: string | null;
  locality: string | null;
  actionType: string | null;
  regisLocation: string | null;
  ipAddress: string | null;
  emp_Lat: number | null;
  emp_Lng: number | null;
}
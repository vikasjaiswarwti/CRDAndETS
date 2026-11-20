import { message } from "antd";

// ── Vehicle required docs (fireExt + firstAidKit are optional) ────────────────
const VEHICLE_REQUIRED_DOCS: { field: string; label: string }[] = [
  { field: "registrationExpiryDate_Doc", label: "Registration Doc" },
  { field: "permitExpiryDate_Doc", label: "Permit Doc" },
  { field: "fitnessExpiryDate_Doc", label: "Fitness Doc" },
  { field: "pucExpiryDate_Doc", label: "PUC Doc" },
  { field: "roadTaxExpiryDate_Doc", label: "Road Tax Doc" },
  { field: "insuranceExpiryDate_Doc", label: "Insurance Doc" },
];

// ── Vehicle required data fields — multiple aliases because stage vs approved
//    records use different casing ───────────────────────────────────────────────
const VEHICLE_REQUIRED_FIELDS: { fields: string[]; label: string }[] = [
  {
    fields: ["vehicle_Registration_No", "vehicleNo", "registrationNo"],
    label: "Registration No.",
  },
  { fields: ["vehicleTypeCode"], label: "Vehicle Type" },
  { fields: ["makeYear"], label: "Make Year" },
  { fields: ["fuelTypeCode", "fuelType"], label: "Fuel Type" },
  {
    fields: ["owner_Type", "ownerType", "vehicleOwnership"],
    label: "Owner Type",
  },
  { fields: ["vehicle_Status", "vehicleStatus"], label: "Vehicle Status" },
  { fields: ["current_Status", "currentStatus"], label: "Current Status" },
  {
    fields: ["vehicle_Registration_Date", "registrationDate"],
    label: "Registration Date",
  },
  {
    fields: ["vehicle_Induction_Date", "inductionDate"],
    label: "Induction Date",
  },
  {
    fields: ["permit_Expiry_Date", "permitExpDate", "permit_Expiry_Date"],
    label: "Permit Expiry",
  },
  {
    fields: ["insurance_Expiry_Date", "insuranceExpDate"],
    label: "Insurance Expiry",
  },
  {
    fields: ["fitness_Expiry_Date", "fitnessExpDate"],
    label: "Fitness Expiry",
  },
  {
    fields: ["road_Tax_Validity_Expiry", "roadTaxExpDate"],
    label: "Road Tax Expiry",
  },
  { fields: ["puc_Expiry_Date", "pucExpDate"], label: "PUC Expiry" },
];

// ── Driver required docs (profileImageDoc is optional) ────────────────────────
const DRIVER_REQUIRED_DOCS: { field: string; label: string }[] = [
  { field: "licenseExpDoc", label: "License Doc" },
  { field: "policeVerificationExpDoc", label: "Police Verification Doc" },
  { field: "govtIdDoc", label: "Govt ID Doc" },
  { field: "lastTrainingDoc", label: "Training Doc" },
];

const DRIVER_REQUIRED_FIELDS: { fields: string[]; label: string }[] = [
  { fields: ["driverName", "driver_Name", "name"], label: "Driver Name" },
  { fields: ["dob"], label: "Date of Birth" },
  { fields: ["gender"], label: "Gender" },
  { fields: ["bloodGroup"], label: "Blood Group" },
  { fields: ["mobileNo", "mobile_No"], label: "Mobile No." },
  { fields: ["licenseNo", "license_No"], label: "License No." },
  { fields: ["licenseExpDate", "license_Exp_Date"], label: "License Expiry" },
  { fields: ["inductionDate", "induction_Date"], label: "Induction Date" },
  { fields: ["driverLicenceAuthority"], label: "Licence Authority" },
  { fields: ["govtIdProof"], label: "Govt ID Type" },
  { fields: ["driverType", "driver_Type"], label: "Driver Type" },
  { fields: ["currentStatus", "current_Status"], label: "Driver Status" },
  { fields: ["policeVerificationExpDate"], label: "Police Verif. Expiry" },
];

// ── Resolver: checks any alias for a non-empty value ─────────────────────────
function hasValue(record: any, fields: string[]): boolean {
  return fields.some((f) => {
    const v = record[f];
    return v !== null && v !== undefined && v !== "";
  });
}

// ── Result shape ──────────────────────────────────────────────────────────────
export interface ComplianceValidationResult {
  isValid: boolean;
  missingDocs: string[];
  missingFields: string[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useComplianceValidation() {
  /** Pure check — returns result without side effects */
  function validate(
    record: any,
    view: "Vehicle" | "Driver",
  ): ComplianceValidationResult {
    if (!record) return { isValid: false, missingDocs: [], missingFields: [] };

    const requiredDocs =
      view === "Vehicle" ? VEHICLE_REQUIRED_DOCS : DRIVER_REQUIRED_DOCS;
    const requiredFields =
      view === "Vehicle" ? VEHICLE_REQUIRED_FIELDS : DRIVER_REQUIRED_FIELDS;

    const missingDocs = requiredDocs
      .filter(({ field }) => !record[field])
      .map(({ label }) => label);

    const missingFields = requiredFields
      .filter(({ fields }) => !hasValue(record, fields))
      .map(({ label }) => label);

    return {
      isValid: missingDocs.length === 0 && missingFields.length === 0,
      missingDocs,
      missingFields,
    };
  }

  /**
   * Validate + show antd error messages.
   * Returns true only if everything is present — caller should abort approval if false.
   */
  function validateAndNotify(record: any, view: "Vehicle" | "Driver"): boolean {
    const { missingDocs, missingFields, isValid } = validate(record, view);

    if (missingDocs.length > 0) {
      message.error(
        `Missing documents — please upload before approving: ${missingDocs.join(", ")}`,
        7,
      );
    }
    if (missingFields.length > 0) {
      message.warning(
        `Missing required fields — please edit before approving: ${missingFields.join(", ")}`,
        7,
      );
    }

    return isValid;
  }

  return { validate, validateAndNotify };
}

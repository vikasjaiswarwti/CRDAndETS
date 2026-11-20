export const OWNER_TYPE_OPTIONS = [
  { value: "Owned", label: "Own" },
  { value: "Attached", label: "Attached" },
];

export const YES_NO_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const GPS_PROVIDER_OPTIONS = [
  { value: 1, label: "Dhanuka" },
  { value: 2, label: "TRAQR" },
];
export const VEHICLE_DOC_KEYS = [
  "fireExtinguisherExp_Doc",
  "permitExpiryDate_Doc",
  "firstAidKitDateExpiry_Doc",
  "insuranceExpiryDate_Doc",
  "fitnessExpiryDate_Doc",
  "roadTaxExpiryDate_Doc",
  "pucExpiryDate_Doc",
  "allDocuments_Doc",
  "registrationExpiryDate_Doc",
];

export const VEHICLE_FILE_LABELS: Record<string, string> = {
  fireExtinguisherExp_Doc: "Fire Extinguisher Expiry Document",
  permitExpiryDate_Doc: "Permit Expiry Document",
  firstAidKitDateExpiry_Doc: "First Aid Kit Expiry Document",
  insuranceExpiryDate_Doc: "Insurance Expiry Document",
  fitnessExpiryDate_Doc: "Fitness Expiry Document",
  roadTaxExpiryDate_Doc: "Road Tax Expiry Document",
  pucExpiryDate_Doc: "PUC Expiry Document",
  registrationExpiryDate_Doc: "Registration Expiry Document",

  allDocuments_Doc: "All Documents",
};

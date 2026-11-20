// ─── Status map ──────────────────────────────────────────────────────────────
export const STATUS_MAP = {
  active: { label: 'Active', color: 'green' },
  inactive: { label: 'Inactive', color: 'red' },
};

// ─── Active / Inactive ────────────────────────────────────────────────────────
export const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

// ─── Gender ───────────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const GENDER_LABEL_MAP = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

// ─── Driver type ──────────────────────────────────────────────────────────────
export const DRIVER_TYPE_OPTIONS = [
  { value: 'Company', label: 'Company' },
  { value: 'Attachment', label: 'Attachment' },
];

export const DRIVER_TYPE_LABEL_MAP = Object.fromEntries(
  DRIVER_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

// ─── Blood group ─────────────────────────────────────────────────────────────
export const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export const BLOOD_GROUP_LABEL_MAP = Object.fromEntries(
  BLOOD_GROUP_OPTIONS.map((o) => [o.value, o.label]),
);

// ─── Training status ──────────────────────────────────────────────────────────
export const TRAINING_STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'InProgress', label: 'In Progress' },
];

export const TRAINING_STATUS_LABEL_MAP = Object.fromEntries(
  TRAINING_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);
export const YES_NO_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const DRIVER_DOC_KEYS = [
  "profileImageDoc",
  "licenseExpDoc",
  "policeVerificationExpDoc",
  "lastTrainingDoc",
  "govtIdDoc",
];
export const DRIVER_FILE_LABELS: Record<string, string> = {
  profileImageDoc: "Profile Image",
  licenseExpDoc: "License Document",
  policeVerificationExpDoc: "Police Verification",
  lastTrainingDoc: "Training Certificate",
  govtIdDoc: "Government ID",
};
// export const
// ─── Current status ──────────────────────────────────────────────────────────
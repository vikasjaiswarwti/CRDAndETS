import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';
// import {
//   GENDER_OPTIONS,
//   DRIVER_TYPE_OPTIONS,
//   BLOOD_GROUP_OPTIONS,
//   TRAINING_STATUS_OPTIONS,
//   CURRENT_STATUS_OPTIONS,
// } from './driverConstants';
type selectTypeI = { label: string; value: string | number | boolean }[];

interface DriverFormOptions {
  currentStatusOptions?: selectTypeI;
  statesOptions?: selectTypeI;
  vendorOptions?: selectTypeI;
  GENDER_OPTIONS?: selectTypeI;
  DRIVER_TYPE_OPTIONS?: selectTypeI;
  BLOOD_GROUP_OPTIONS?: selectTypeI;
  TRAINING_STATUS_OPTIONS?: selectTypeI;
  locationOptions?: selectTypeI;
  YES_NO_OPTIONS?: selectTypeI;
  documentTypesOptions?: selectTypeI;
}


// ─── Static form fields — defined at module level, never inside a component ──
export const getDriverFormField = ({
  currentStatusOptions = [],
  // statesOptions = [],
  vendorOptions = [],
  GENDER_OPTIONS,
  DRIVER_TYPE_OPTIONS = [],
  BLOOD_GROUP_OPTIONS = [],
  TRAINING_STATUS_OPTIONS = [],
  locationOptions = [],
  YES_NO_OPTIONS = [],
  documentTypesOptions = []
}: DriverFormOptions): FormFieldDef[] => [
    // ── Section: Basic Info ────────────────────────────────────────────────────
    {
      name: 'driverName',
      label: 'Driver Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name',
      span: 12,
    },
    {
      name: 'fatherName',
      label: "Father's Name",
      type: 'text',
      required: true,
      placeholder: "Enter father's name",
      span: 12,
    },
    {
      name: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      placeholder: 'Select DOB',
      span: 12,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      options: GENDER_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select gender',
      span: 12,
    },
    {
      name: 'mobileNo',
      label: 'Mobile No.',
      type: 'text',
      required: true,
      placeholder: 'Enter mobile number',
      span: 12,
    },
    {
      name: 'alternateMobileNo',
      label: 'Alternate Mobile No.',
      type: 'text', required: true,
      placeholder: 'Enter alternate number',
      span: 12,
    },
    {
      name: 'bloodGroup',
      label: 'Blood Group', required: true,
      type: 'select',
      options: BLOOD_GROUP_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select blood group',
      span: 12,
    },
    {
      name: 'driverType',
      label: 'Driver Type', required: true,
      type: 'select',
      options: DRIVER_TYPE_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select driver type',
      span: 12,
    },

    // ── Section: Address ───────────────────────────────────────────────────────
    {
      name: 'presentAddress',
      label: 'Present Address',
      type: 'textarea', required: true,
      placeholder: 'Enter present address',
      span: 12,
    },
    {
      name: 'permanentAddress',
      label: 'Permanent Address',
      type: 'textarea',
      required: true,
      placeholder: 'Enter permanent address',
      span: 12,
    },

    // ── Section: License ───────────────────────────────────────────────────────
    {
      name: 'licenseNo',
      label: 'License No.',
      type: 'text',
      required: true,
      placeholder: 'Enter license number',
      span: 12,
    },
    {
      name: 'driverLicenceAuthority',
      label: 'Licence Authority',
      type: 'text',
      required: true,
      placeholder: 'Enter issuing authority',
      span: 12,
    },
    {
      name: 'licenseIssueDate',
      label: 'License Issue Date',
      type: 'date', required: true,
      placeholder: 'Select issue date',
      span: 12,
    },
    {
      name: 'licenseExpDate',
      label: 'License Expiry Date',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
    },
    {
      name: 'inductionDate',
      label: 'Induction Date',
      type: 'date', required: true,
      placeholder: 'Select induction date',
      span: 12,
    },
    {
      name: 'govtIdProof',
      label: 'Govt ID Proof',
      type: 'select',
      required: true,
      options: documentTypesOptions as unknown as { value: string | number; label: string }[],
      placeholder: 'Select Govt ID Proof',
      span: 12,
    },



    // ── Section: Verification ──────────────────────────────────────────────────
    {
      name: 'policeVerification',
      label: 'Police Verification',
      type: 'select',
      placeholder: 'Verification reference',
      options: YES_NO_OPTIONS as unknown as { value: string | number; label: string }[],
      span: 12,
      required: true,
    },
    {
      name: 'policeVerificationExpDate',
      label: 'Police Verification Expiry',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
      rules: []
    },
    // "lastTrainingDoc": null,
    {
      name: 'profileImageDoc',
      label: 'profileImageDoc',
      type: 'image',
      required: true,
      placeholder: 'Enter profileImageDoc  ',
      span: 12,
      rules: []
    },
    {
      name: 'licenseExpDoc',
      label: 'licenseExpDoc Id Doc',
      type: 'image',
      required: true,
      placeholder: 'Enter licenseExpDoc ID Docs ',
      span: 12,
      rules: []
    },
    {
      name: 'policeVerificationExpDoc',
      label: 'policeVerificationExpDoc Id Doc',
      type: 'image',
      required: true,
      placeholder: 'Enter policeVerificationExpDoc ID Docs ',
      span: 12,
      rules: []
    },
    {
      name: 'lastTrainingDoc',
      label: 'Last Training Document',
      type: 'image',
      required: true,
      placeholder: 'Enter Last Training Document  ',
      span: 12,
      rules: []
    },
    {
      name: 'govtIdDoc',
      label: 'Govt Id Doc',
      type: 'image',
      required: true,
      placeholder: 'Enter govt ID Docs ',
      span: 12,
      rules: []
    },
    {
      name: 'lastInternalVerificationDate',
      label: 'Last Internal Verification',
      type: 'date', required: true,
      placeholder: 'Select date',
      span: 12,
    },
    {
      name: 'externalVerificationExpDate',
      label: 'External Verification Expiry',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
    },
    {
      name: 'externalVerificationAgency',
      label: 'External Verification Agency',
      type: 'text', required: true,
      placeholder: 'Enter agency name',
      span: 12,
    },

    // ── Section: Training & Status ─────────────────────────────────────────────
    {
      name: 'trainingStatus',
      label: 'Training Status',
      type: 'select', required: true,
      options: TRAINING_STATUS_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select training status',
      span: 12,
    },
    {
      name: 'lastTrainingDate',
      label: 'Last Training Date',
      type: 'date', required: true,
      placeholder: 'Select date',
      span: 12,
    },
    {
      name: 'currentStatus',
      label: 'Current Status',
      type: 'select', required: true,
      options: currentStatusOptions as unknown as { value: string | number; label: string }[],
      placeholder: 'Select current status',
      span: 12,
    },
    {
      name: 'privateBGVExpDate',
      label: 'Private BGV Expiry',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
    },

    // ── Section: IDs ──────────────────────────────────────────────────────────
    {
      name: 'locCode',
      label: 'Location Code',
      type: 'select',
      required: true,
      placeholder: 'Enter location code',
      options: locationOptions as unknown as { value: string | number; label: string }[],
      span: 12,
    },
    {
      name: 'transporterId',
      label: 'Transporter ID',
      type: 'select',
      options: vendorOptions as unknown as { value: string | number; label: string }[],
      required: true,
      placeholder: 'Enter transporter ID',
      span: 12,
    },

    // ── Section: Remarks & Status ─────────────────────────────────────────────
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'textarea',
      placeholder: 'Enter any remarks',
    },
    {
      name: 'active',
      label: 'Active Status',
      type: 'switch',
      hidden: (values) => !!values['driver_Id'],
    },
  ];

export const getDriverUploadFormField: FormFieldDef[] = [
  {
    name: 'upload',
    label: 'Upload Excel',
    type: 'upload',
    required: true,
    placeholder: 'e.g. forma',
  }
];
// export const excelToApiFieldMap: Record<string, string> = {
//   "Active Status": "active",
//   "Alternate Mobile Number": "alternateMobileNo",
//   "Blood Group": "bloodGroup",
//   "Current Status": "currentStatus",
//   "Date of Birth": "dob",
//   "Driving License Authority": "driverLicenceAuthority",
//   "Driver Name": "driverName",
//   "Driver Type": "driverType",
//   "External Verification Agency": "externalVerificationAgency",
//   "External Verification Expiry Date":
//     "externalVerificationExpDate",
//   "Father Name": "fatherName",
//   "Gender": "gender",
//   "Government ID Document": "govtIdDoc",
//   "Government ID Proof Type": "govtIdProof",
//   "Induction Date": "inductionDate",
//   "Last Internal Verification Date":
//     "lastInternalVerificationDate",
//   "Last Training Date": "lastTrainingDate",
//   "Last Training Document": "lastTrainingDoc",
//   "License Expiry Date": "licenseExpDate",
//   "License Expiry Document": "licenseExpDoc",
//   "License Issue Date": "licenseIssueDate",
//   "Driving License Number": "licenseNo",
//   "Location Code": "locCode",
//   "Mobile Number": "mobileNo",
//   "Permanent Address": "permanentAddress",
//   "Police Verification Completed": "policeVerification",
//   "Police Verification Expiry Date":
//     "policeVerificationExpDate",
//   "Police Verification Document":
//     "policeVerificationExpDoc",
//   "Present Address": "presentAddress",
//   "Private BGV Expiry Date": "privateBGVExpDate",
//   "Profile Image": "profileImageDoc",
//   "Remarks": "remarks",
//   "Training Status": "trainingStatus",
//   "Transporter ID": "transporterId",
// };
// export const getExcelDownload = {
//   fileName: "Driver_Template.xlsx",
//   sheetName: "Driver",
//   data: [
//     {
//       "active": true,
//       "alternateMobileNo": "9876543210",
//       "bloodGroup": "O+",
//       "currentStatus": 1,
//       "dob": "YYYY-MM-DD",
//       "driverLicenceAuthority": "RTO Delhi",
//       "driverName": "Amit",
//       "driverType": "Full-Time",
//       "externalVerificationAgency": "ABC Verification",
//       "externalVerificationExpDate": "YYYY-MM-DD",
//       "fatherName": "Amit father",
//       "gender": "Male",
//       "govtIdDoc": "null",
//       "govtIdProof": 1,
//       "inductionDate": "YYYY-MM-DD",
//       "lastInternalVerificationDate": "YYYY-MM-DD",
//       "lastTrainingDate": "YYYY-MM-DD",
//       "lastTrainingDoc": "null",
//       "licenseExpDate": "YYYY-MM-DD",
//       "licenseExpDoc": "null",
//       "licenseIssueDate": "YYYY-MM-DD",
//       "licenseNo": "DL1234567890",
//       "locCode": 102,
//       "mobileNo": "9876543210",
//       "permanentAddress": "Delhi Address",
//       "policeVerification": true,
//       "policeVerificationExpDate": "YYYY-MM-DD",
//       "policeVerificationExpDoc": "null",
//       "presentAddress": "Current Address",
//       "privateBGVExpDate": "YYYY-MM-DD",
//       "profileImageDoc": "null",
//       "remarks": "No remarks",
//       "trainingStatus": "Completed",
//       "transporterId": 1
//     }
//   ],
// }
export const getExcelDownload = {
  fileName: "Driver_Template.xlsx",
  sheetName: "Driver",
  data: [
    {
      "Alternate Mobile Number": "9876543210",
      "Blood Group": "O+",
      "Current Status": "Active",
      "Date of Birth": "YYYY-MM-DD",
      "Driving License Authority": "RTO Delhi",
      "Driver Name": "Amit",
      "Driver Type": "Full-Time",
      "External Verification Agency": "ABC Verification",
      "External Verification Expiry Date": "YYYY-MM-DD",
      "Father Name": "Amit father",
      "Gender": "male",
      "Induction Date": "YYYY-MM-DD",
      "Last Internal Verification Date": "YYYY-MM-DD",
      "Last Training Date": "YYYY-MM-DD",
      "License Expiry Date": "YYYY-MM-DD",
      "License Issue Date": "YYYY-MM-DD",
      "Driving License Number": "",
      // "Location Code": 102,
      "Mobile Number": "9876543210",
      "Permanent Address": "Delhi Address",
      "Police Verification Completed": true,
      "Police Verification Expiry Date": "YYYY-MM-DD",
      "Present Address": "Current Address",
      "Private BGV Expiry Date": "YYYY-MM-DD",
      "Remarks": "No remarks",
      "Training Status": "Completed",
      // "Transporter ID": 1
    }
  ],
};
export const getDriverFormProfileField = ({
  vendorOptions = [],
  GENDER_OPTIONS = [] }: DriverFormOptions): FormFieldDef[] => [

    {
      name: 'driverName',
      label: 'Driver Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name',
      span: 12,
    },
    {
      name: 'fatherName',
      label: "Father's Name",
      type: 'text',
      required: true,
      placeholder: "Enter father's name",
      span: 12,
    },
    {
      name: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      placeholder: 'Select DOB',
      span: 12,
    },

    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      options: GENDER_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select gender',
      span: 12,
    }, {
      name: 'transporterId',
      label: 'Transporter ID',
      type: 'select',
      options: vendorOptions as unknown as { value: string | number; label: string }[],
      required: true,
      placeholder: 'Enter transporter ID',
      span: 12,
    },

  ]
export const getDriverFormCommunicationField = ({
  BLOOD_GROUP_OPTIONS }: DriverFormOptions): FormFieldDef[] => [
    {
      name: 'mobileNo',
      label: 'Mobile No.',
      type: 'text',
      required: true,
      placeholder: 'Enter mobile number',
      span: 12,
    },
    {
      name: 'alternateMobileNo',
      label: 'Alternate Mobile No.',
      type: 'text', required: true,
      placeholder: 'Enter alternate number',
      span: 12,
    },
    {
      name: 'bloodGroup',
      label: 'Blood Group', required: true,
      type: 'select',
      options: BLOOD_GROUP_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select blood group',
      span: 12,
    },
  ]
export const getDriverFormLicenseField = ({
  documentTypesOptions = [] }: DriverFormOptions): FormFieldDef[] => [
    {
      name: 'licenseNo',
      label: 'License No.',
      type: 'text',
      required: true,
      placeholder: 'Enter license number',
      span: 12,
    },
    {
      name: 'driverLicenceAuthority',
      label: 'Licence Authority',
      type: 'text',
      required: true,
      placeholder: 'Enter issuing authority',
      span: 12,
    },
    {
      name: 'govtIdProof',
      label: 'Govt ID Proof',
      type: 'select',
      required: true,
      options: documentTypesOptions as unknown as { value: string | number; label: string }[],
      placeholder: 'Select Govt ID Proof',
      span: 12,
    }, {
      name: 'govtIdDoc',
      label: 'Govt Id Doc',
      type: 'image',
      required: true,
      placeholder: 'Enter govt ID Docs ',
      span: 12,
      rules: []
    },
    {
      name: 'licenseExpDoc',
      label: 'licenseExpDoc Id Doc',
      type: 'image',
      required: true,
      placeholder: 'Enter licenseExpDoc ID Docs ',
      span: 12,
      rules: []
    },
  ]

export const getDriverFormAddressField = (): FormFieldDef[] => [
  {
    name: 'presentAddress',
    label: 'Present Address',
    type: 'textarea', required: true,
    placeholder: 'Enter present address',
    span: 12,
  },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    type: 'textarea',
    required: true,
    placeholder: 'Enter permanent address',
    span: 12,
  },
]
export const getDriverFormTrainingField = ({
  DRIVER_TYPE_OPTIONS = [],
  TRAINING_STATUS_OPTIONS,
  currentStatusOptions }: DriverFormOptions): FormFieldDef[] => [
    {
      name: 'lastTrainingDoc',
      label: 'Last Training Document',
      type: 'image',
      required: true,
      placeholder: 'Enter Last Training Document  ',
      span: 12,
      rules: []
    },
    {
      name: 'driverType',
      label: 'Driver Type', required: true,
      type: 'select',
      options: DRIVER_TYPE_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select driver type',
      span: 12,
    },
    {
      name: 'trainingStatus',
      label: 'Training Status',
      type: 'select', required: true,
      options: TRAINING_STATUS_OPTIONS as unknown as { value: string | number; label: string }[],
      placeholder: 'Select training status',
      span: 12,
    },
    {
      name: 'lastTrainingDate',
      label: 'Last Training Date',
      type: 'date', required: true,
      placeholder: 'Select date',
      span: 12,
    },
    {
      name: 'currentStatus',
      label: 'Current Status',
      type: 'select', required: true,
      options: currentStatusOptions as unknown as { value: string | number; label: string }[],
      placeholder: 'Select current status',
      span: 12,
    },

  ]

export const getDriverFormBGVField = ({
  YES_NO_OPTIONS = [],
  locationOptions, }: DriverFormOptions): FormFieldDef[] => [

    {
      name: 'licenseIssueDate',
      label: 'License Issue Date',
      type: 'date', required: true,
      placeholder: 'Select issue date',
      span: 12,
    },
    {
      name: 'licenseExpDate',
      label: 'License Expiry Date',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
    },
    {
      name: 'inductionDate',
      label: 'Induction Date',
      type: 'date', required: true,
      placeholder: 'Select induction date',
      span: 12,
    },




    // ── Section: Verification ──────────────────────────────────────────────────
    {
      name: 'policeVerification',
      label: 'Police Verification',
      type: 'select',
      placeholder: 'Verification reference',
      options: YES_NO_OPTIONS as unknown as { value: string | number; label: string }[],
      span: 12,
      required: true,
    },
    {
      name: 'policeVerificationExpDate',
      label: 'Police Verification Expiry',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
      rules: []
    },
    // "lastTrainingDoc": null,
    {
      name: 'profileImageDoc',
      label: 'profileImageDoc',
      type: 'image',
      required: true,
      placeholder: 'Enter profileImageDoc  ',
      span: 12,
      rules: []
    },

    {
      name: 'policeVerificationExpDoc',
      label: 'policeVerificationExpDoc Id Doc',
      type: 'image',
      required: true,
      placeholder: 'Enter policeVerificationExpDoc ID Docs ',
      span: 12,
      rules: []
    },


    {
      name: 'lastInternalVerificationDate',
      label: 'Last Internal Verification',
      type: 'date', required: true,
      placeholder: 'Select date',
      span: 12,
    },
    {
      name: 'externalVerificationExpDate',
      label: 'External Verification Expiry',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
    },
    {
      name: 'externalVerificationAgency',
      label: 'External Verification Agency',
      type: 'text', required: true,
      placeholder: 'Enter agency name',
      span: 12,
    },

    // ── Section: Training & Status ─────────────────────────────────────────────

    {
      name: 'privateBGVExpDate',
      label: 'Private BGV Expiry',
      type: 'date', required: true,
      placeholder: 'Select expiry date',
      span: 12,
    },

    // ── Section: IDs ──────────────────────────────────────────────────────────
    {
      name: 'locCode',
      label: 'Location Code',
      type: 'select',
      required: true,
      placeholder: 'Enter location code',
      options: locationOptions as unknown as { value: string | number; label: string }[],
      span: 12,
    },


    // ── Section: Remarks & Status ─────────────────────────────────────────────
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'textarea',
      placeholder: 'Enter any remarks',
    },
    {
      name: 'active',
      label: 'Active Status',
      type: 'switch',
      hidden: (values) => !!values['driver_Id'],
    },
  ]
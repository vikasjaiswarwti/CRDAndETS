import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// Personal Details section fields
export const PERSONAL_FIELDS: FormFieldDef[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "e.g. John",
    span: 12,
    rules: [{ required: true, message: "First name is required" }],
  },
  {
    name: "middleName",
    label: "Middle Name",
    type: "text",
    placeholder: "e.g. Quency",
    span: 12,
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "e.g. Doe",
    span: 12,
    rules: [{ required: true, message: "Last name is required" }],
  },
  {
    name: "employeeId",
    label: "User ID",
    type: "text",
    placeholder: "EMP-0000",
    span: 12,
  },
];

// Gender is a custom radio — rendered separately, not via AppForm
export const GENDER_VALUES = ["Male", "Female", "Other"] as const;

// Address section
export const ADDRESS_FIELDS: FormFieldDef[] = [
  {
    name: "state",
    label: "State",
    type: "text",
    placeholder: "e.g. Delhi",
    span: 12,
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "e.g. Quency",
    span: 12,
  },
  {
    name: "pin",
    label: "Pincode",
    type: "text",
    placeholder: "110078",
    span: 12,
    fieldProps: { maxLength: 6 },
  },
  {
    name: "address",
    label: "Current Address",
    type: "textarea",
    placeholder: "D21 Corporate...",
    fieldProps: { rows: 2 },
  },
];

// Communication section
export const COMMUNICATION_FIELDS: FormFieldDef[] = [
  {
    name: "emailId",
    label: "Official Email ID",
    type: "email",
    placeholder: "e.g. ani@wti.com",
    span: 12,
    rules: [{ required: true, message: "Email is required" }],
  },
  {
    name: "emerContactNo",
    label: "Emergency Contact No.",
    type: "text",
    placeholder: "e.g. Quency",
    span: 12,
  },
  {
    name: "phoneNo",
    label: "Phone No.",
    type: "text",
    placeholder: "e.g. Doe",
    span: 12,
  },
  {
    name: "mobileNo",
    label: "Mobile No.",
    type: "text",
    placeholder: "e.g. John",
    span: 12,
    rules: [{ required: true, message: "Mobile number is required" }],
  },
];

// Internal-only office assignment fields (dynamic options)
export const getOfficeAssignmentFields = (
  officeOptions: { label: string; value: string }[],
  departmentOptions: { label: string; value: string }[],
  lobOptions: { label: string; value: string }[],
  projectOptions: { label: string; value: string }[],
  geocodeOptions: { label: string; value: string }[],
): FormFieldDef[] => [
    {
      name: "locCode",
      label: "Office",
      type: "select",
      options: officeOptions,
      span: 12,
      fieldProps: { showSearch: true, allowClear: true },
    },
    {
      name: "depCode",
      label: "Department",
      type: "select",
      options: departmentOptions,
      span: 12,
      fieldProps: { showSearch: true, allowClear: true },
    },
    {
      name: "lobCode",
      label: "Line of Business",
      type: "select",
      options: lobOptions,
      span: 12,
      fieldProps: { showSearch: true, allowClear: true },
    },
    {
      name: "proCode",
      label: "Project",
      type: "select",
      options: projectOptions,
      span: 12,
      fieldProps: { showSearch: true, allowClear: true },
    },
    {
      name: "geocodeId",
      label: "Geo Point",
      type: "select",
      options: geocodeOptions,
      span: 12,
      fieldProps: { showSearch: true, allowClear: true },
    },
    {
      name: "supervisorName",
      label: "Supervisor Name",
      type: "text",
      placeholder: "Optional",
      span: 12,
    },
    {
      name: "supEmployeeId",
      label: "Supervisor Employee ID",
      type: "text",
      placeholder: "Optional",
      span: 12,
    },
    {
      name: "spoc",
      label: "SPOC",
      type: "text",
      placeholder: "Optional",
      span: 12,
    },
  ];

export const getExcelDownload = {
  fileName: "user_bulk_upload_Template.xlsx",
  sheetName: "userbulkupload",
  data: [
    {
      "Employee ID": "EMP001",
      "First Name": "Rajesh",
      "Last Name": "Kumar",
      "Gender": "M",
      "Mobile Number": 9876543210,
      "Email ID": "rajesh.kumar@example.com",
      "Address": "123, Sector 15",
      "City": "Noida",
      "State": "Uttar Pradesh",
      "State Code": 9,
      "PIN Code": 201301,
      "Latitude": 28.5355,
      "Longitude": 77.3910,
      "Location Code": 101,
      "Department Code": 201,
      "LOB Code": 301,
      "Employee Type ID": 1,
    },
  ]
}
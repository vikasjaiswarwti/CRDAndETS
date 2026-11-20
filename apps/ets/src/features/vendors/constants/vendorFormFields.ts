import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface VendorFormOptions {
  locationOptions?: { label: string; value: string | number }[];
  billPlanTypeOptions?: { label: string; value: string | number }[];
}

export const getVendorFormFields = ({
  locationOptions = [],
  billPlanTypeOptions = [],
}: VendorFormOptions = {}): FormFieldDef[] => [
  {
    name: "locCode",
    label: "Office",
    type: "select",
    options: locationOptions,
    span: 12,
    rules: [{ required: true, message: "Location is required" }],
  },

  // Row 2
  {
    name: "bpId",
    label: "Bill Plan Name",
    type: "select",
    options: billPlanTypeOptions, // value = bptCode, label = bptName
    span: 12,
    rules: [{ required: true, message: "Bill plan name is required" }],
  },

  {
    name: "vendorName",
    label: "Vendor Name",
    type: "text",
    placeholder: "Enter vendor name",
    span: 12,
    rules: [
      { required: true, message: "Vendor Name is required" },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      },
    ],
  },

  // Row 3
  {
    name: "prefixTag",
    label: "Prefix Tag",
    type: "text",
    placeholder: "Enter prefix tag",
    span: 12,
  },
  {
    name: "mobile",
    label: "Mobile Number",
    type: "number",
    placeholder: "Enter mobile number",
    // rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
    rules: [
      { required: true, message: "Vendor Name is required" },
      {
        pattern: /^[6-9]\d{9}$/,
        message:
          "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9",
      },
    ],
    span: 12,
  },

  // Row 4

  {
    name: "emailId",
    label: "Email ID",
    type: "email",
    placeholder: "Enter email address",
    span: 12,
  },

  // Full width fields
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter full address",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Enter remarks / notes",
  },

  // Contact Time
  {
    name: "contactFrom",
    label: "Contract From - (yyyy/MM/dd)",
    type: "date",
    fieldProps: {
      format: "YYYY-MM-DD", // Display format
      picker: "date", // Date picker without time
    },
    placeholder: "Select date when contract starts",
    span: 12,
  },
  {
    name: "contactTo",
    label: "Contract To - (yyyy/MM/dd)",
    type: "date",
    fieldProps: {
      format: "YYYY-MM-DD", // Display format
      picker: "date", // Date picker without time
    },
    placeholder: "Select date when contract ends",
    span: 12,
  },

  {
    name: "singlePlan",
    label: "Single Plan",
    type: "switch",
    fieldProps: {
      checkedChildren: "Yes",
      unCheckedChildren: "No",
    },
    span: 12,
    rules: [
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          const fromDate = getFieldValue("contactFrom");

          // if empty skip validation
          if (!value || !fromDate) {
            return Promise.resolve();
          }

          // check contactTo > contactFrom
          if (value.isAfter(fromDate, "day")) {
            return Promise.resolve();
          }

          return Promise.reject(
            new Error(
              "Contract To date must be greater than Contract From date",
            ),
          );
        },
      }),
    ],
  },
  {
    name: "active",
    label: "Availability Status",
    type: "switch",
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
    span: 12,
  },
];

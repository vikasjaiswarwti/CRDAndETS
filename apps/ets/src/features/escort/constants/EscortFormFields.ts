import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface EscortFormFieldOptions {
  escortVendorOptions: { label: string; value: number }[];
  locationOptions: { label: string; value: string | number }[];
}

export const getEscortFormFields = ({
  escortVendorOptions = [],
  locationOptions = [],
}: EscortFormFieldOptions): FormFieldDef[] => [
    {
      name: "name",
      label: "Escort Name",
      type: "text",
      required: true,
      placeholder: "Enter escort name",
      span: 12,
      rules: [{ required: true, message: "Escort Name is required" },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      }
      ],
    },
    {
      name: "escortVendorId",
      label: "Escort Vendor",
      type: "select",
      required: true,
      placeholder: "Select escort vendor",
      options: escortVendorOptions,
      span: 12,
    },
    {
      name: "locCode",
      label: "Office",
      type: "select",
      required: true,
      placeholder: "Select Office",
      options: locationOptions,
      span: 12,
    },
    {
      name: "mobileNo",
      label: "Mobile Number",
      type: "number",
      required: true,
      placeholder: "Enter mobile number",
      span: 12,
      rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
    },
    {
      name: "emailId",
      label: "Email ID",
      type: "email",
      required: true,
      placeholder: "Enter email address",
      span: 12,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      required: true,
      placeholder: "Enter address",
      span: 24,
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      required: false,
      placeholder: "Enter remarks (optional)",
      span: 24,
    },
    {
      name: "active",
      label: "Active",
      type: "switch",
      span: 12,
      fieldProps: {
        checkedChildren: "Active",
        unCheckedChildren: "Inactive",
      },
    },
  ];
export const getEscortUploadFormFields = (): FormFieldDef[] => [
  {
    name: "upload",
    label: "Upload Excel",
    type: "upload",
    required: true,
    placeholder: "Enter escort name",
    span: 12,
  },
]

export const getExcelDownload = {
  fileName: "Escort_Template.xlsx",
  sheetName: "Escort",
  data: [
    {
      locCode: 1,
      escortVendorId: 1,
      name: "",
      address: "",
      mobileNo: "",
      emailId: "",
      remarks: "",
      active: true,
    },
  ],
}
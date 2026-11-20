import type { FormFieldDef } from "../../../../shared/components/AppForm/AppForm";

// export const MOBILE_FORM_FIELDS: FormFieldDef[] = [
//   {
//     name: "mobileNo",
//     label: "New mobile number",
//     type: "text",
//     placeholder: "Enter 10-digit mobile number",
//     fieldProps: { maxLength: 10 },
//     rules: [
//       { required: true, message: "Mobile Number is required" },
//       { pattern: /^\d{10}$/, message: "Must be exactly 10 digits" },
//     ],
//   },
// ];

export const MOBILE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "mobileNo",
    label: "New mobile number",
    type: "phone", // ← was "text", now "phone"
    placeholder: "Enter mobile number",
    rules: [
      { required: true, message: "Mobile Number is required" },
      {
        validator: (_: any, value: string) => {
          const digits = (value ?? "").replace(/\D/g, "");
          if (digits.length !== 10) {
            return Promise.reject("Enter a valid 10-digit mobile number");
          }
          return Promise.resolve();
        },
      },
    ],

    
    
  },
];

export const ADDRESS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Full address",
    rules: [{ required: true, message: "Address is required" }],
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "City",
    span: 12,
    rules: [{ required: true, message: "City Number is required" }],
  },
  {
    name: "state",
    label: "State",
    type: "text",
    placeholder: "State",
    span: 12,
    rules: [{ required: true, message: "State is required" }],
  },
  {
    name: "pin",
    label: "PIN code",
    type: "text",
    placeholder: "PIN",
    span: 12,
    fieldProps: { maxLength: 6 },
    rules: [{ required: true, message: "Pin Code is required" }],
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Optional remarks",
    span: 12,
  },
];
export const TRIP_TYPE_OPTIONS = [
  { label: "Login", value: 1 },
  { label: "Logout", value: 2 },
];

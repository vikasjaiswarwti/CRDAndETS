import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// Change: The parameter is now just the array, not an object
export const getEscortVendorFormFields = (
  locationOptions: { label: string; value: string | number }[] = [],
): FormFieldDef[] => {
  return [
    {
      name: "vendorName",
      label: "Escort Name",
      type: "text",
      placeholder: "Enter escort name",
      required: true,
      span: 12,
      rules: [{ required: true, message: "Vendor Name is required" },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      }
      ],
    },
    {
      name: "locCode",
      label: "Office",
      type: "select",
      options: locationOptions, // Using the passed array here
      required: true,
      span: 12,
      rules: [{ required: true, message: "Office Name is required" }],
    },
    {
      name: "mobile",
      label: "Mobile Number",
      type: "number",
      placeholder: "e.g. 9876543210",
      required: true,
      span: 12,
      // rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
      rules: [
        {
          pattern: /^[6-9]\d{9}$/,
          message:
            "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9",
        },
      ],
    },
    {
      name: "emailId",
      label: "Email Address",
      type: "email",
      placeholder: "example@domain.com",
      required: true,
      span: 12,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      required: true,
    },

    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
    },
    {
      name: "active",
      label: "Status",
      type: "switch",
      span: 12,
      fieldProps: {
        checkedChildren: "Active",
        unCheckedChildren: "Inactive",
      },
    },
  ];
};

import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface BillPlanFormOptions {
  locationOptions?: { label: string; value: string | number }[];
  billPlanTypeOptions?: { label: string; value: string | number }[];
}

export const getBillPlanFormFields = ({
  locationOptions = [],
  billPlanTypeOptions = [],
}: BillPlanFormOptions = {}): FormFieldDef[] => [
    {
      name: "locCode",
      label: "Office",
      type: "select",
      options: locationOptions,
      placeholder: "Select location",
      span: 12,
      rules: [{ required: true, message: "Location is required" }],
    },
    {
      name: "bptCode", // ← Changed from bpName
      label: "Bill Plan Name",
      type: "select",
      options: billPlanTypeOptions, // value = bptCode, label = bptName
      span: 12,
      rules: [{ required: true, message: "Bill plan name is required" }],
    },
    {
      name: "bpName",
      label: "Bill Plan Name",
      type: "text",
      placeholder: "Enter bill plan name",
      span: 12,
      rules: [{ required: true, message: "Bill plan name is required" },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      },

      ],
    },

    {
      name: "active",
      label: "Status",
      type: "switch",
      fieldProps: {
        checkedChildren: "Active",
        unCheckedChildren: "Inactive",
      },
      span: 12,
    },
  ];

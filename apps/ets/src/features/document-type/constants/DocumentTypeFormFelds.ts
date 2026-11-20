import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface DocumentTypeFormFieldOptions {
  docOwnerTypeOptions: { label: string; value: number }[];
}

export const getDocumentTypeFormFields = ({
  docOwnerTypeOptions,
}: DocumentTypeFormFieldOptions): FormFieldDef[] => [
    {
      name: "docOwnerTypeId",
      label: "Document Owner Type",
      type: "select",
      required: true,
      placeholder: "Select owner type",
      options: docOwnerTypeOptions,
      rules: [{ required: true, message: 'Owner Type is required' }],
      span: 12,
    },
    {
      name: "docTypeName",
      label: "Document Type Name",
      type: "text",
      required: true,
      placeholder: "Enter document type name",
      rules: [{ required: true, message: 'Document is required' },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      },
      ],
      span: 12,
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

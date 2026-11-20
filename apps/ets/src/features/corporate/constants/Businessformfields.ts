import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const BUSINESS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "businessFullName",
    label: "Business Full Name",
    type: "text",
    required: true,
    span: 12,
    placeholder: "Enter full business name",
  },
  {
    name: "businessShortName",
    label: "Business Short Name",
    type: "text",
    required: true,
    span: 12,
    placeholder: "Enter short name",
  },
  // {
  //   name: "businessUrl",
  //   label: "Business URL",
  //   type: "text",
  //   span: 12,
  //   // disabled: true,
  //   // hidden:true,
  //   placeholder: "https://example.com",
  //   fieldProps: {
  //     readOnly: true,
  //   },
  // },
  // {
  //   name: "businessId",
  //   label: "Business ID",
  //   type: "number",
  //   disabled:true,
  //   required: true,
  //   span: 12,
  //   placeholder: "Enter business ID",
  // },
  // {
  //   name: "serviceID",
  //   label: "Service ID",
  //   type: "number",
  //   required: true,
  //   span: 12,
  //   placeholder: "Enter service ID",
  // },
  
  // {
  //   name: "updation_Lmit",
  //   label: "Updation Limit",
  //   type: "number",
  //   required: true,
  //   span: 12,
  //   placeholder: "Enter updation limit",
  // },

  // {
  //   name: "scheduleUpdateVersion",
  //   label: "Schedule Update Version",
  //   type: "select",
  //   span: 12,
  //   options: [
  //     { label: "WEB", value: "WEB" },
  //     { label: "APP", value: "APP" },
  //   ],
  // },

  // {
  //   name: "isAreaZone",
  //   label: "Is Area Zone",
  //   type: "switch",
  //   span: 12,
  //   fieldProps: {
  //     checkedChildren: "Allow",
  //     unCheckedChildren: "Not Allow",
  //   },
  // },
];

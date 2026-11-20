import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";
import { DAY_OPTIONS } from "./LkpAdhocWeekDaysConstants";

interface LkpAdhocWeekDaysFormOptions {
  locationOptions: { label: string; value: string | number }[];
}

export const getLkpAdhocWeekDaysFormFields = ({
  locationOptions = [],
}: LkpAdhocWeekDaysFormOptions): FormFieldDef[] => [
  {
    name: "locCode",
    label: "Location Code",
    type: "select", // changed from text → select
    required: true,
    placeholder: "Select office",
    options: locationOptions,
    span: 12,
  },
  {
    name: "dayCode",
    label: "Day Code",
    type: "select",
    required: true,
    placeholder: "Select day code",
    options: DAY_OPTIONS as unknown as { value: string; label: string }[],
    span: 12,
  },

  {
    name: "active",
    label: "Availability Status",
    type: "switch",
    span: 12,
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
  },
];

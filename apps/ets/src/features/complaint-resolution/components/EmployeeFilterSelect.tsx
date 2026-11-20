import React, { useMemo } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useLookups } from "../../lookups"; // adjust path to actual location

interface Props {
  value: number | undefined;
  onChange: (empId: number | undefined) => void;
}

export const EmployeeFilterSelect: React.FC<Props> = ({ value, onChange }) => {
  const { Select } = useUILibrary();

  const { userOptions, isLoading: empLoading } = useLookups({
    only: ["userOptions"],
  });

  const options = useMemo(
    () =>
      (userOptions ?? []).map((u: any) => ({
        value: u.value ?? u.id ?? u.empid,
        label:
          u.label ??
          `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ??
          `Employee #${u.id ?? u.empid}`,
      })),
    [userOptions],
  );

  return (
    <Select
      showSearch
      allowClear
      loading={empLoading}
      placeholder="Filter by employee"
      value={value}
      onChange={(v: number | undefined) => onChange(v)}
      filterOption={(input: string, option: any) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      style={{ width: 240 }}
    />
  );
};

import React, { useMemo } from "react";
import { useLookups } from "../../lookups/hooks/useLookups"; // adjust path to actual location
import { Select } from "../../../shared/components/ui/Select";

interface Props {
  value: number | undefined;
  onChange: (officeCode: number | undefined) => void;
}

export const OfficeFilterSelect: React.FC<Props> = ({ value, onChange }) => {
  // The bug: `only` was asking useLookups for a key — "officeOptions" — that
  // doesn't exist in the lookups registry. useLookups only fires a request
  // for keys it recognizes in `only`, so an unknown key means it fires
  // nothing at all, which is why the Network tab showed no request.
  // The field actually being destructured below is `locationOptions`, so
  // that's the real key name — request that instead.
  const { locationOptions, isLoading: officeLoading } = useLookups({
    only: ["locationOptions"],
  });

  const options = useMemo(
    () =>
      (locationOptions ?? []).map((o: any) => ({
        value: o.value ?? o.id ?? o.locCode,
        label: o.label ?? o.name ?? `Office #${o.id ?? o.locCode}`,
      })),
    [locationOptions],
  );

  return (
    <Select
      showSearch
      allowClear
      loading={officeLoading}
      placeholder="Filter by office"
      value={value}
      onChange={(v: number | undefined) => onChange(v)}
      filterOption={(input: string, option: any) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      style={{ width: 200 }}
    />
  );
};

// src/features/dashboard/admin/components/DashboardFilters.tsx

import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import SearchSelect from "../../../../shared/components/Search/SearchSelect";
import SearchDatePicker from "../../../../shared/components/Search/SearchDatePicker";
export interface DashboardFilters {
  locCode: number;
  fromDate: string;
  toDate: string;
}
interface SelectItem {
  label: string;
  value: string | number | any;
}
interface Props {
  onSearch: (filters: DashboardFilters) => void;
  isLoading?: boolean;
  locationOptions: SelectItem[];
}

export const DashboardFilterBar: React.FC<Props> = ({
  onSearch,
  isLoading,
  locationOptions,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [locCode, setLocCode] = useState<number>(
    (locationOptions[0]?.value as number) ?? 0,
  );
  const [fromDate, setFromDate] = useState<Dayjs>(dayjs(today)); // dayjs() = today
  const [toDate, setToDate] = useState<Dayjs>(dayjs(today)); // dayjs() = today

  const handleSearch = () => {
    onSearch({
      locCode,
      fromDate: fromDate.format("YYYY-MM-DD"),
      toDate: toDate.format("YYYY-MM-DD"),
    });
  };

  return (
    <div className="filter-bar">
      {/* Tenant */}
      <SearchSelect
        placeholder="Select office"
        value={locCode}
        handleChange={(val: number) => setLocCode(val)} // AntD Select gives you the value directly
        options={locationOptions}
        width={160}
        labelHide={false}
        labelContent=""
      />
      <SearchDatePicker
        placeholder="Select From Date"
        handleChange={(val: string) => {
          if (val) setFromDate(dayjs(val)); // parse string → Dayjs
        }}
        // width={200}
        defaultValue={dayjs().format("YYYY-MM-DD")}
        labelHide={false}
      />
      <SearchDatePicker
        placeholder="Select To Date"
        handleChange={(val: string) => {
          if (val) setToDate(dayjs(val)); // parse string → Dayjs
        }}
        // width={200}
        defaultValue={dayjs().format("YYYY-MM-DD")}
        labelHide={false}
      />
      {/* Search */}
      <button
        className="filter-search-btn"
        onClick={handleSearch}
        disabled={isLoading || !locCode}
      >
        {isLoading ? (
          <span className="filter-spinner" />
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </>
        )}
      </button>
    </div>
  );
};

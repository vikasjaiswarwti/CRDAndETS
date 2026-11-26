// // src/features/dashboard/admin/components/DashboardFilters.tsx

// import React, { useEffect, useState } from "react";
// import dayjs, { Dayjs } from "dayjs";
// import SearchSelect from "../../../../shared/components/Search/SearchSelect";
// import SearchDatePicker from "../../../../shared/components/Search/SearchDatePicker";
// export interface DashboardFilters {
//   locCode: number;
//   fromDate: string;
//   toDate: string;
// }
// interface SelectItem {
//   label: string;
//   value: string | number | any;
// }
// interface Props {
//   onSearch: (filters: DashboardFilters) => void;
//   isLoading?: boolean;
//   locationOptions: SelectItem[];
// }

// export const DashboardFilterBar: React.FC<Props> = ({
//   onSearch,
//   isLoading,
//   locationOptions,
// }) => {
//   const today = new Date().toISOString().split("T")[0];

//   const [locCode, setLocCode] = useState<number>(
//     (locationOptions[0]?.value as number),
//   );
//   useEffect(() => {
//     if (locationOptions.length > 0 && locCode === undefined) {
//       setLocCode(locationOptions[0].value as number);
//     }
//   }, [locationOptions]);
//   const [fromDate, setFromDate] = useState<Dayjs>(
//     dayjs().subtract(7, "day").startOf("day"),
//   );
//   const [toDate, setToDate] = useState<Dayjs>(dayjs(today));
//   const disabledFromDate = (d: Dayjs) =>
//     d.isAfter(toDate, "day") || d.isAfter(dayjs(), "day");

//   const disabledToDate = (d: Dayjs) => d.isAfter(dayjs(), "day");

//   const handleFromChange = (val: string) => {
//     if (!val) return;
//     let d = dayjs(val);
//     if (d.isAfter(dayjs(), "day")) d = dayjs(); // not beyond today
//     if (d.isAfter(toDate, "day")) d = toDate; // not beyond toDate
//     setFromDate(d);
//   };

//   const handleToChange = (val: string) => {
//     if (!val) return;
//     let d = dayjs(val);
//     if (d.isAfter(dayjs(), "day")) d = dayjs(); // not beyond today
//     if (d.isBefore(fromDate, "day")) {
//       setFromDate(d); // or: d = fromDate; pick one behavior
//     }
//     setToDate(d);
//   };
//   const handleSearch = () => {
//     // if (fromDate.isBefore(minFromDate)) return; // safety net
//     onSearch({
//       locCode,
//       fromDate: fromDate.format("YYYY-MM-DD"),
//       toDate: toDate.format("YYYY-MM-DD"),
//     });
//   };
//   return (
//     <div className="filter-bar">
//       {/* Tenant */}
//       <SearchSelect
//         placeholder="Select office"
//         value={locCode}
//         handleChange={(val: number) => setLocCode(val)} // AntD Select gives you the value directly
//         options={locationOptions}
//         width={160}
//         labelHide={false}
//         labelContent=""
//       />
//       <SearchDatePicker
//         placeholder="Select From Date"
//         defaultValue={fromDate}
//         handleChange={handleFromChange}
//         disabledDate={disabledFromDate}
//         labelHide={false}
//       />
//       <SearchDatePicker
//         placeholder="Select To Date"
//         defaultValue={toDate}
//         handleChange={handleToChange}
//         disabledDate={disabledToDate}
//         labelHide={false}
//       />
//       {/* Search */}
//       <button
//         className="filter-search-btn"
//         onClick={handleSearch}
//         disabled={isLoading || !locCode}
//       >
//         {isLoading ? (
//           <span className="filter-spinner" />
//         ) : (
//           <>
//             <svg
//               width="14"
//               height="14"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//             >
//               <circle cx="11" cy="11" r="8" />
//               <path d="m21 21-4.35-4.35" />
//             </svg>
//             Search
//           </>
//         )}
//       </button>
//     </div>
//   );
// };
// src/features/dashboard/admin/components/DashboardFilters.tsx

import React, { useEffect, useRef, useState } from "react";
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
  // isLoading,
  locationOptions,
}) => {
  const today = dayjs();

  const [locCode, setLocCode] = useState<number | undefined>(
    locationOptions[0]?.value as number | undefined,
  );
  const [fromDate, setFromDate] = useState<Dayjs>(
    dayjs().subtract(7, "day").startOf("day"),
  );
  const [toDate, setToDate] = useState<Dayjs>(today);

  const isFirstRender = useRef(true);
  // The parent already fetches the initial report once locations are known.
  // Seeding locCode here must not trigger a second identical request.
  const skipNextSearch = useRef(false);

  // Seed locCode once options load (handles async load case)
  useEffect(() => {
    if (locationOptions.length > 0 && locCode === undefined) {
      skipNextSearch.current = true;
      setLocCode(locationOptions[0].value as number);
    }
  }, [locationOptions]);

  // Fire onSearch whenever any filter changes, but skip the very first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (!locCode) return;
    onSearch({
      locCode,
      fromDate: fromDate.format("YYYY-MM-DD"),
      toDate: toDate.format("YYYY-MM-DD"),
    });
  }, [locCode, fromDate, toDate]);

  const disabledFromDate = (d: Dayjs) =>
    d.isAfter(toDate, "day") || d.isAfter(today, "day");

  const disabledToDate = (d: Dayjs) => d.isAfter(today, "day");

  const handleFromChange = (val: string) => {
    if (!val) return;
    let d = dayjs(val);
    if (d.isAfter(today, "day")) d = today;
    if (d.isAfter(toDate, "day")) d = toDate;
    setFromDate(d);
  };

  const handleToChange = (val: string) => {
    if (!val) return;
    let d = dayjs(val);
    if (d.isAfter(today, "day")) d = today;
    if (d.isBefore(fromDate, "day")) setFromDate(d);
    setToDate(d);
  };

  return (
    <div className="filter-bar">
      <SearchSelect
        placeholder="Select office"
        value={locCode}
        handleChange={(val: number) => setLocCode(val)}
        options={locationOptions}
        width={200}
        labelHide={false}
        labelContent=""
      />
      <SearchDatePicker
        placeholder="Select From Date"
        defaultValue={fromDate}
        handleChange={handleFromChange}
        disabledDate={disabledFromDate}
        labelHide={false}
      />
      <SearchDatePicker
        placeholder="Select To Date"
        defaultValue={toDate}
        handleChange={handleToChange}
        disabledDate={disabledToDate}
        labelHide={false}
      />
    </div>
  );
};

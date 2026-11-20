import React from "react";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import { selectStyle } from "./searchCSS";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  // children?: SelectOption[];
}
const SearchSelect = ({
  placeholder = "Select...",
  options = [],
  handleChange,
  width = 200,
  labelHide = false,
  labelContent = "",
  isLoading=false,
  value, // ← add here
}: {
  placeholder?: string;
  options: SelectOption[];
  handleChange: (e: any) => void;
  style?: React.CSSProperties;
  width?: string | number;
  isLoading?:boolean;
  labelHide?: boolean;
  labelContent?: string;
  value?: string | number; // ← optional, won't affect other pages
}) => {
  const { Select } = useUILibrary();
  // console.log(options,value, "options")
  return (
    <div style={{ width: width }}>
      {labelHide && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {labelContent != "" ? labelContent : placeholder}
        </label>
      )}
      <Select
        showSearch
        allowClear={false}
        placeholder={placeholder}
        options={options as SelectOption[]}
        loading={isLoading}
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        onChange={(val: any) => handleChange?.(val)}
        style={selectStyle}
        value={value}
        // {...(value !== undefined ? { value } : {})}  // ← only applied when passed
      />
    </div>
  );
};
export default SearchSelect;

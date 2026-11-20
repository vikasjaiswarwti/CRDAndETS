import dayjs from "dayjs";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import type { Dayjs } from "dayjs";
import { selectStyle } from "./searchCSS";

const SearchDatePicker = ({
  placeholder = "Select Date",
  handleChange,
  defaultValue,
  labelHide = true,
  disabledDate,
}: {
  placeholder?: string;
  handleChange?: (dateString: string) => void;
  defaultValue?: string | Dayjs;
  labelHide?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
}) => {
  const { DatePicker } = useUILibrary();

  const handleDateChange = (_date: any, dateString: string | string[]) => {
    if (typeof dateString === "string") {
      handleChange?.(dateString);
    }
  };

  return (
    <div style={{ width: 140 }}>
      
      {labelHide && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {placeholder}
          
        </label>
      )}
      
      <DatePicker
        placeholder={placeholder}
        onChange={handleDateChange}
        style={{ width: "100%", ...selectStyle }}
        defaultValue={
          defaultValue
            ? dayjs.isDayjs(defaultValue)
              ? defaultValue
              : dayjs(defaultValue)
            : undefined
        }
        disabledDate={disabledDate}
        allowClear={false}
        inputReadOnly
      />
      
    </div>
  );
};

export default SearchDatePicker;

// import dayjs from "dayjs";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import type { Dayjs } from "dayjs";
import { selectStyle } from "./searchCSS";

const SearchRangePicker = ({
  placeholder = ["From Date", "To Date"],
  handleChange,
  value,
  labelHide = true,
  disabledDate,
}: {
  placeholder?: [string, string];
  handleChange?: (from: string, to: string) => void;
  value?: [Dayjs | null, Dayjs | null];
  labelHide?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
}) => {
  const { DatePicker } = useUILibrary();
  const { RangePicker } = DatePicker as any;

  const handleRangeChange = (
    _dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string],
  ) => {
    handleChange?.(dateStrings[0], dateStrings[1]);
  };

  return (
    <div>
      {labelHide && (
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {placeholder[0]} - {placeholder[1]}
        </label>
      )}
      <RangePicker
        placeholder={placeholder}
        onChange={handleRangeChange}
        value={value}
        format="YYYY-MM-DD"
        style={{ ...selectStyle }}
        disabledDate={disabledDate}
        allowClear
        inputReadOnly
      />
    </div>
  );
};

export default SearchRangePicker;

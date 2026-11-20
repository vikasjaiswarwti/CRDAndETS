import type { CSSProperties } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { Dayjs } from "dayjs";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// --- Types -----------------------------------------------------------
type DateRangeValue = [Dayjs | null, Dayjs | null];

interface MobileFriendlyRangePickerProps {
  value: DateRangeValue;
  onChange: (dates: DateRangeValue) => void;
  allowClear?: boolean;
  style?: CSSProperties;
}
// --- Hook --------------------------------------------------------------
// --- Component -----------------------------------------------------------

function MobileFriendlyRangePicker({
  value,
  onChange,
  allowClear = false,
  style,
}: MobileFriendlyRangePickerProps) {
  const { DatePicker } = useUILibrary();
  const { RangePicker } = DatePicker as any;

  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <RangePicker
        allowClear={allowClear}
        value={value}
        onChange={onChange}
        style={{ ...style, width: 240 }}
      />
    );
  }

  // Mobile: two stacked single-date pickers instead of the dual-calendar panel
  const [start, end] = value ?? [null, null];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <DatePicker
        value={start}
        allowClear={allowClear}
        placeholder="From date"
        style={{ width: "100%" }}
        onChange={(date: Dayjs | null) => onChange([date, end])}
        disabledDate={(current: Dayjs) => !!end && !!current && current > end}
      />
      <DatePicker
        value={end}
        allowClear={allowClear}
        placeholder="To date"
        style={{ width: "100%" }}
        onChange={(date: Dayjs | null) => onChange([start, date])}
        disabledDate={(current: Dayjs) =>
          !!start && !!current && current < start
        }
      />
    </div>
  );
}

export default MobileFriendlyRangePicker;

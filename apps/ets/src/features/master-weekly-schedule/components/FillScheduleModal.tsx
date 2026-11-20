import React, { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { T } from "../../../styles/tokens";

interface FillScheduleModalProps {
  open: boolean;
  onClose: () => void;
  officeName: string;
  onSubmit: (values: { fromDate: string; toDate: string }) => Promise<void>;
  isSubmitting: boolean;
}

type DateRange = [Dayjs | null, Dayjs | null] | null;

const DATE_FORMAT = "YYYY-MM-DD";

export const FillScheduleModal: React.FC<FillScheduleModalProps> = ({
  open,
  onClose,
  officeName,
  onSubmit,
  isSubmitting,
}) => {
  const { Modal, DatePicker } = useUILibrary();
  const { RangePicker } = DatePicker as any;

  const [range, setRange] = useState<DateRange>(null);

  useEffect(() => {
    if (!open) setRange(null);
  }, [open]);

  const disablePastDates = (current: Dayjs) =>
    !!current && current.isBefore(dayjs().startOf("day"));

  const canSubmit = !!range?.[0] && !!range?.[1] && !isSubmitting;

  const handleSave = async () => {
    if (!range?.[0] || !range?.[1]) return;
    await onSubmit({
      fromDate: range[0].format(DATE_FORMAT),
      toDate: range[1].format(DATE_FORMAT),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>
          Fill Schedule
        </div>
      }
      width={440}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        content: { borderRadius: 16 },
        header: { borderBottom: "none" },
      }}
      style={{ top: 10 }}
    >
      <div
        style={{
          padding: "10px 12px",
          background: T.formcss.inputBg,
          border: `1px solid ${T.border.default}`,
          borderRadius: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: T.text.tertiary,
            fontWeight: 500,
            marginBottom: 2,
          }}
        >
          Office
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text.secondary }}>
          {officeName || "—"}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: T.text.secondary,
            marginBottom: 5,
          }}
        >
          Date Range
        </div>
        <RangePicker
          format={DATE_FORMAT}
          value={range}
          onChange={(value: DateRange) => setRange(value)}
          disabledDate={disablePastDates}
          allowClear
          style={{ width: "100%", background: T.formcss.inputBg, border: `1px solid ${T.border.default}` }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 50,
            border: `1.5px solid ${T.formcss.textMuted}`,
            background: "#fff",
            color: T.formcss.textMuted,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSubmit}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 50,
            border: "none",
            background: canSubmit ? T.formcss.text : T.formcss.greenAccent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          {isSubmitting ? "Filling…" : "Fill Schedule"}
        </button>
      </div>
    </Modal>
  );
};

export default FillScheduleModal;

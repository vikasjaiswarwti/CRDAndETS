import React, { useEffect, useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { type WeekDayCode } from "../../roaster";
import {
  WEEK_DAYS,
  parseLockDays,
} from "../constants/MasterWeeklyScheduleConstants";
import type { MasterWeeklyScheduleItem } from "../types/masterWeeklySchedule.types";
import { T } from "../../../styles/tokens";
import { useGetUserShiftsQuery } from "../../roaster/services/RosterApi";

interface MasterWeeklyScheduleFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: MasterWeeklyScheduleItem | null;
  locCode: number | null;
  onSubmit: (values: {
    pickShiftId: number | null;
    dropShiftId: number | null;
    lockDays: WeekDayCode[];
  }) => Promise<void>;
  isSubmitting: boolean;
}

const InfoChip: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <div
      style={{
        fontSize: 10,
        color: T.text.tertiary,
        fontWeight: 500,
        marginBottom: 2,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: T.text.secondary,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value || "—"}
    </div>
  </div>
);

export const MasterWeeklyScheduleFormModal: React.FC<
  MasterWeeklyScheduleFormModalProps
> = ({ open, onClose, editingRecord, locCode, onSubmit, isSubmitting }) => {
  const { Modal, Select } = useUILibrary();

  const { data: shiftData, isLoading: shiftsLoading } =
    useGetUserShiftsQuery(locCode ?? 0, {
      skip: !locCode,
      refetchOnMountOrArgChange: true,
    });

  const pickShiftOptions = useMemo(
    () =>
      (shiftData?.pickShifts ?? []).map((s) => ({
        value: s.shiftId,
        label: `${s.shiftName}`,
      })),
    [shiftData],
  );
  const dropShiftOptions = useMemo(
    () =>
      (shiftData?.dropShifts ?? []).map((s) => ({
        value: s.shiftId,
        label: `${s.shiftName}`,
      })),
    [shiftData],
  );

  const [pickShiftId, setPickShiftId] = useState<number | null>(null);
  const [dropShiftId, setDropShiftId] = useState<number | null>(null);
  const [lockDays, setLockDays] = useState<WeekDayCode[]>([]);

  useEffect(() => {
    if (!editingRecord) return;
    setPickShiftId(
      editingRecord.pickShiftId != 0 ? editingRecord.pickShiftId : null,
    );
    setDropShiftId(
      editingRecord.dropShiftId != 0 ? editingRecord.dropShiftId : null,
    );
    setLockDays(parseLockDays(editingRecord.lock_Days));
  }, [editingRecord]);

  const toggleDay = (code: WeekDayCode) => {
    setLockDays((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code],
    );
  };

  const handleSave = async () => {
    await onSubmit({ pickShiftId, dropShiftId, lockDays });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>
          Edit Weekly Schedule
        </div>
      }
      width={480}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        content: { borderRadius: 16 },
        header: { borderBottom: "none" },
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "10px 12px",
          background: T.formcss.inputBg,
          border: `1px solid ${T.border.default}`,
          borderRadius: 8,
          marginBottom: 18,
        }}
      >
        <InfoChip label="Employee" value={editingRecord?.empname ?? ""} />
        <div
          style={{ width: 1, background: T.border.default, flexShrink: 0 }}
        />
        <InfoChip label="Mobile No" value={editingRecord?.mobileno ?? ""} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: T.text.secondary,
              marginBottom: 5,
            }}
          >
            Pick Shift
          </div>
          <Select
            value={pickShiftId ?? undefined}
            onChange={(value) => setPickShiftId(Number(value))}
            options={pickShiftOptions}
            loading={shiftsLoading}
            placeholder={shiftsLoading ? "Loading…" : "Select pick shift"}
            showSearch
            style={{ width: "100%", background: T.formcss.inputBg }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: T.text.secondary,
              marginBottom: 5,
            }}
          >
            Drop Shift
          </div>
          <Select
            value={dropShiftId ?? undefined}
            onChange={(value) => setDropShiftId(Number(value))}
            options={dropShiftOptions}
            loading={shiftsLoading}
            placeholder={shiftsLoading ? "Loading…" : "Select drop shift"}
            showSearch
            style={{ width: "100%", background: T.formcss.inputBg }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: T.text.secondary,
            marginBottom: 8,
          }}
        >
          Locked Days
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {WEEK_DAYS.map(({ code, label }) => {
            const active = lockDays.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleDay(code)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 50,
                  border: `1.5px solid ${active ? T.formcss.green : T.formcss.greenPale}`,
                  background: active ? T.formcss.green : "#fff",
                  color: active ? "#fff" : T.text.tertiary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
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
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 50,
            border: "none",
            background: isSubmitting ? T.formcss.greenAccent : T.formcss.text,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
};

export default MasterWeeklyScheduleFormModal;

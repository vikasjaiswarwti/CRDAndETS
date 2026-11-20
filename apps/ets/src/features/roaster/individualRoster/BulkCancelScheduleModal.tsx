// src/features/roaster/individualRoster/BulkCancelScheduleModal.tsx
//
// Lets the user pick a date range + trip type, then triggers the bulk
// cancellation flow (confirmation check happens in the parent page).

import React from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { CancelShiftType } from "../types/Roster.types";
import { CANCEL_SHIFT_OPTIONS, COLORS } from "../constants/Rosterconstants";

interface BulkCancelScheduleModalProps {
  open: boolean;
  dateRange: [Dayjs | null, Dayjs | null];
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null]) => void;
  tripType: CancelShiftType;
  onTripTypeChange: (type: CancelShiftType) => void;
  onConfirm: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

const BulkCancelScheduleModal: React.FC<BulkCancelScheduleModalProps> = ({
  open,
  dateRange,
  onDateRangeChange,
  tripType,
  onTripTypeChange,
  onConfirm,
  onDismiss,
  isLoading = false,
}) => {
  const { Modal, DatePicker } = useUILibrary();
  const { RangePicker } = DatePicker as typeof import("antd").DatePicker;

  const canConfirm = !!dateRange[0] && !!dateRange[1];

  const disablePastDates = (current: Dayjs) =>
    current.isBefore(dayjs().startOf("day"));

  return (
    <Modal
      open={open}
      onCancel={onDismiss}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#fff1f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="#ef4444"
                strokeWidth="1.3"
              />
              <path
                d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                stroke="#ef4444"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textBody }}>
            Bulk Delete Schedules
          </div>
        </div>
      }
      width={420}
      destroyOnClose
      footer={null}
      centered
      styles={{
        mask: { background: "rgba(0,0,0,0.25)" },
        content: { borderRadius: 14, padding: 0 },
        header: {
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${COLORS.border}`,
        },
        body: { padding: "14px 16px 16px" },
      }}
    >
      {/* Date range */}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
        Select the date range to cancel
      </div>
      <RangePicker
        format="YYYY-MM-DD"
        value={dateRange}
        onChange={(dates: [Dayjs | null, Dayjs | null] | null) =>
          onDateRangeChange(dates ?? [null, null])
        }
        disabledDate={disablePastDates}
        allowClear
        placeholder={["From date", "To date"]}
        style={{ width: "100%", marginBottom: 18 }}
      />

      {/* Trip type */}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
        Select the shift type to cancel
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {CANCEL_SHIFT_OPTIONS.map((opt) => {
          const active = tripType === opt.value;
          return (
            <div
              key={opt.value}
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() => onTripTypeChange(opt.value)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter")
                  onTripTypeChange(opt.value);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: 9,
                cursor: "pointer",
                border: `1.5px solid ${active ? COLORS.primaryDark : COLORS.border}`,
                background: active ? COLORS.lightBg : "#fff",
                userSelect: "none",
                transition: "all 0.12s",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? COLORS.primaryDark : COLORS.textBody,
                }}
              >
                {opt.label}
              </span>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `2px solid ${active ? COLORS.primaryDark : "#d1d5db"}`,
                  background: active ? COLORS.primaryDark : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {active && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onDismiss}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 50,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.textMuted,
            fontSize: 13,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading || !canConfirm}
          style={{
            flex: 2,
            padding: "9px 0",
            borderRadius: 50,
            border: "none",
            background:
              isLoading || !canConfirm ? "#fca5a5" : "#ef4444",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: isLoading || !canConfirm ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: "inherit",
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading ? (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2"
                />
                <path
                  d="M8 2a6 6 0 016 6"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Processing…
            </>
          ) : (
            "Confirm"
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
};

export default BulkCancelScheduleModal;

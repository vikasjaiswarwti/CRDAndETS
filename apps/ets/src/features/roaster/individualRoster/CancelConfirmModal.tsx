// src/features/individualRoster/components/CancelConfirmModal.tsx

import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { Tab, ActionType } from "../types/scheduleView.types";
import type { ScheduleHomepageEntry } from "../services/IndividualRosterApi";
import { COLORS } from "../constants/Rosterconstants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = dayjs(s, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d.format("DD MMM YYYY") : s;
}

interface CancelConfirmModalProps {
  open: boolean;
  tab: Tab;
  entry: ScheduleHomepageEntry | null;
  actionType: ActionType;
  isLoading: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  open,
  tab,
  entry,
  actionType,
  isLoading,
  onConfirm,
  onDismiss,
}) => {
  const { Modal } = useUILibrary();

  const isNoShow = actionType === "NOSHOW";
  const shiftLabel = tab === "LOGIN" ? "Login" : "Logout";
  const scheduleDate = fmtDate(
    tab === "LOGIN" ? entry?.LoginScheduleDate : entry?.LogoutScheduleDate,
  );
  const shiftTime =
    tab === "LOGIN" ? entry?.LoginShiftTime : entry?.LogoutShiftTime;

  const accentColor = isNoShow ? "#d97706" : "#ef4444";
  const accentBg = isNoShow ? "#fffbeb" : "#fff1f2";
  const accentBorder = isNoShow ? "#fde68a" : "#fecaca";
  const accentDark = isNoShow ? "#92400e" : "#b91c1c";

  return (
    <Modal
      open={open}
      onCancel={onDismiss}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              {isNoShow ? (
                <>
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    stroke={accentColor}
                    strokeWidth="1.3"
                  />
                  <path
                    d="M8 4.5v4"
                    stroke={accentColor}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="11" r="0.7" fill={accentColor} />
                </>
              ) : (
                <>
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    stroke={accentColor}
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                    stroke={accentColor}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 700, color: COLORS.textBody }}
            >
              {isNoShow
                ? `Mark No-Show · ${shiftLabel}`
                : `Cancel ${shiftLabel} Shift`}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {scheduleDate}
            </div>
          </div>
        </div>
      }
      width={380}
      destroyOnClose
      footer={null}
      centered
      styles={{
        mask: { background: "rgba(0,0,0,0.25)" },
        content: { borderRadius: 14, padding: 0 },
        header: {
          padding: "12px 16px 10px",
          borderBottom: `1px solid ${COLORS.border}`,
        },
        body: { padding: "12px 16px 14px" },
      }}
    >
      {/* Warning strip */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: accentBg,
          border: `1px solid ${accentBorder}`,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: accentColor,
            fontWeight: 600,
            marginBottom: 3,
          }}
        >
          {isNoShow
            ? "Are you sure you want to mark this as No-Show?"
            : "Are you sure you want to cancel this schedule?"}
        </div>
        <div style={{ fontSize: 11, color: accentDark }}>
          {shiftLabel} · {shiftTime || "—"} · {scheduleDate}
        </div>
      </div>

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
          disabled={isLoading}
          style={{
            flex: 2,
            padding: "9px 0",
            borderRadius: 50,
            border: "none",
            background: isLoading ? accentBorder : accentColor,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {isLoading ? (
            <>
              <svg
                width="12"
                height="12"
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
              {isNoShow ? "Marking…" : "Cancelling…"}
            </>
          ) : isNoShow ? (
            "Confirm No-Show"
          ) : (
            "Confirm Cancellation"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default CancelConfirmModal;

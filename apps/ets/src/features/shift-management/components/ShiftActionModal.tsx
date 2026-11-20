// features/shift-management/components/ShiftActionModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  Confirmation modal for single-row toggle AND multi-row bulk apply.
//
//  Flow:
//    1. User toggles a checkbox   → parent opens modal with rows=[row], newValue
//    2. User clicks a bulk action → parent opens modal with rows=[selected…], newValue
//    3. Modal fetches drop shifts from api/v1/MstShift/ShiftDropDown
//    4. Parses response.result[0].jsonShiftDropDown  (stringified JSON array)
//    5. Shows impact summary → user Confirms → parent calls API for each row
//
//  API response shape:
//    { result: [{ jsonShiftDropDown: "[{\"ControlId\":66,\"ShiftId\":33,\"ShiftTime\":\"16:00\"}]" }] }
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import {
  X,
  AlertCircle,
  ChevronRight,
  Loader2,
  CheckCircle2,
  MinusCircle,
  Clock,
} from "lucide-react";
import { C, F, SP, R, TR } from "../shift-grid/ShiftGridTokens";
import { BAND_CONFIG, getTimeBand } from "../shift-grid/ShiftGridCells";

// ── adjust this import to your actual api service path ───────────────────────
import { useShiftDropDownMutation } from "../services/shiftManagementApi";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ShiftActionRow {
  id: string;
  shiftTime: string;
  shiftDesc?: string | null;
  locCode?: number;
  shiftId?: number;
  pickOccupancy?: number | null;
  dropOccupancy?: number | null;
  [key: string]: unknown;
}

export interface ShiftActionModalProps {
  open: boolean;
  onClose: () => void;
  /** 1 row = single-field confirm;  N rows = bulk apply */
  rows: ShiftActionRow[];
  field: string;
  newValue: boolean;
  locCode: number;
  lockType: string;
  /** Called when user presses Confirm — parent handles actual API call */
  onConfirm: () => void | Promise<void>;
  isConfirming?: boolean;
}

// ── Field metadata ─────────────────────────────────────────────────────────────
export const FIELD_META: Record<
  string,
  { label: string; group: string; enabledDesc: string; disabledDesc: string }
> = {
  peakHour: {
    label: "Peak Hour",
    group: "General",
    enabledDesc: "This shift will be flagged as a peak-hour slot.",
    disabledDesc: "This shift will no longer be flagged as peak hour.",
  },
  isGuardPick: {
    label: "Bus Nodal Point — Pickup",
    group: "Bus Nodal",
    enabledDesc: "Bus nodal point for pickup trips will be enabled.",
    disabledDesc: "Bus nodal point for pickup trips will be disabled.",
  },
  isGuardDrop: {
    label: "Bus Nodal Point — Drop",
    group: "Bus Nodal",
    enabledDesc: "Bus nodal point for drop trips will be enabled.",
    disabledDesc: "Bus nodal point for drop trips will be disabled.",
  },
  unsPickAllwd: {
    label: "Adhoc Pickup Allowed",
    group: "Adhoc",
    enabledDesc: "Unscheduled pickup trips will be allowed for this shift.",
    disabledDesc: "Unscheduled pickup trips will be disallowed.",
  },
  unsDropAllwd: {
    label: "Adhoc Drop Allowed",
    group: "Adhoc",
    enabledDesc: "Unscheduled drop trips will be allowed for this shift.",
    disabledDesc: "Unscheduled drop trips will be disallowed.",
  },
  isSafeReachedMale: {
    label: "Safe Reach — Male",
    group: "Safe Reach",
    enabledDesc: "Safe reach will be enabled for male employees.",
    disabledDesc: "Safe reach for male employees will be disabled.",
  },
  isSafeReachedFemale: {
    label: "Safe Reach — Female",
    group: "Safe Reach",
    enabledDesc: "Safe reach will be enabled for female employees.",
    disabledDesc: "Safe reach for female employees will be disabled.",
  },
};

// ── Parse the nested stringified JSON from ShiftDropDown API ──────────────────
function parseDropResponse(raw: unknown): string[] {
  try {
    // Unwrap outer shape: { result: [{ jsonShiftDropDown: "..." }] }
    const wrapper = raw as any;
    const jsonStr =
      wrapper?.result?.[0]?.jsonShiftDropDown ??
      wrapper?.data?.[0]?.jsonShiftDropDown;
    if (typeof jsonStr === "string") {
      const items = JSON.parse(jsonStr) as Array<{
        ShiftTime?: string;
        shiftTime?: string;
      }>;
      return items.map((i) => i.ShiftTime ?? i.shiftTime ?? "").filter(Boolean);
    }
    // Already an array of objects (transformResponse already ran)
    if (Array.isArray(raw)) {
      return (raw as any[])
        .map((i) => i.ShiftTime ?? i.shiftTime ?? "")
        .filter(Boolean);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

// ── Mini helpers ──────────────────────────────────────────────────────────────
const BoolPill: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      height: 28,
      padding: "0 12px",
      borderRadius: 99,
      border: `1.5px solid ${on ? "#16A34A" : C.border}`,
      background: on ? "#DCFCE7" : "#F9FAFB",
      color: on ? "#14532D" : C.textMuted,
      fontSize: 12,
      fontWeight: 600,
    }}
  >
    {on ? (
      <CheckCircle2 size={13} strokeWidth={2.5} color="#16A34A" />
    ) : (
      <MinusCircle size={13} strokeWidth={2} color={C.textMuted} />
    )}
    {on ? "Enabled" : "Disabled"}
  </span>
);

const ArrowSvg = () => (
  <svg
    width={20}
    height={14}
    viewBox="0 0 20 14"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M1 7h14M10 2l5 5-5 5"
      stroke={C.primary}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export const ShiftActionModal: React.FC<ShiftActionModalProps> = ({
  open,
  onClose,
  rows,
  field,
  newValue,
  locCode,
  lockType,
  onConfirm,
  isConfirming = false,
}) => {
  const [dropTimes, setDropTimes] = useState<string[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);

  const [fetchDropDown] = useShiftDropDownMutation();

  const meta = FIELD_META[field] ?? {
    label: field,
    group: "",
    enabledDesc: "This field will be enabled.",
    disabledDesc: "This field will be disabled.",
  };

  const isBulk = rows.length > 1;

  // Count rows that will actually change
  const rowsToChange = rows.filter((r) => Boolean(r[field]) !== newValue);
  const rowsAlready = rows.filter((r) => Boolean(r[field]) === newValue);

  useEffect(() => {
    if (!open) {
      setDropTimes([]);
      return;
    }
    setLoadingDrops(true);
    fetchDropDown({ locCode, lockType })
      .then((result) => {
        const raw = "data" in result ? result.data : null;
        setDropTimes(parseDropResponse(raw));
      })
      .catch(() => setDropTimes([]))
      .finally(() => setLoadingDrops(false));
  }, [open, locCode, lockType]); // eslint-disable-line

  if (!open) return null;

  // Band for single row
  const singleBand =
    rows.length === 1 ? BAND_CONFIG[getTimeBand(rows[0].shiftTime)] : null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 500,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 501,
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          background: C.white,
          borderRadius: R["3xl"],
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.18s ease",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: `${SP[4]}px ${SP[5]}px ${SP[3]}px`,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: R.xl,
                background: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={18} color="#D97706" strokeWidth={2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: F.size.md,
                  fontWeight: F.weight.bold,
                  color: C.text,
                  lineHeight: 1.2,
                }}
              >
                {isBulk ? `Apply to ${rows.length} Shifts` : "Confirm Change"}
              </div>
              <div
                style={{
                  fontSize: F.size.xs,
                  color: C.textMuted,
                  marginTop: 2,
                }}
              >
                {meta.group ? `${meta.group} · ` : ""}
                {meta.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              border: `1px solid ${C.border}`,
              borderRadius: R.lg,
              background: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.textMuted,
              transition: TR.fast,
              flexShrink: 0,
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            padding: `${SP[4]}px ${SP[5]}px`,
            overflowY: "auto",
            maxHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            gap: SP[4],
          }}
        >
          {/* ── Shift card(s) ── */}
          {isBulk ? (
            <div>
              <SLabel>Shifts Selected</SLabel>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: SP[1.5],
                }}
              >
                {rows.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      height: 26,
                      padding: "0 10px",
                      borderRadius: 99,
                      border: `1px solid ${C.border}`,
                      background: "#F9FAFB",
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.text,
                    }}
                  >
                    <Clock size={11} color={C.textMuted} />
                    {r.shiftTime}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            singleBand && (
              <div
                style={{
                  borderRadius: R["2xl"],
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: singleBand.bg,
                    padding: `${SP[3]}px ${SP[4]}px`,
                    display: "flex",
                    alignItems: "center",
                    gap: SP[2],
                  }}
                >
                  {React.createElement(singleBand.icon, {
                    size: 18,
                    color: singleBand.iconColor,
                    strokeWidth: 1.8,
                  })}
                  <div>
                    <div
                      style={{
                        fontSize: F.size.base,
                        fontWeight: F.weight.bold,
                        color: C.text,
                        lineHeight: 1.2,
                      }}
                    >
                      {rows[0].shiftTime}
                    </div>
                    {rows[0].shiftDesc && (
                      <div
                        style={{
                          fontSize: F.size.xs,
                          color: C.textMuted,
                          marginTop: 1,
                        }}
                      >
                        {rows[0].shiftDesc}
                      </div>
                    )}
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <span style={{ fontSize: 11, color: C.textMuted }}>
                      {rows[0].pickOccupancy ?? "—"} pickup ·{" "}
                      {rows[0].dropOccupancy ?? "—"} drop
                    </span>
                  </div>
                </div>
              </div>
            )
          )}

          {/* ── Change section ── */}
          <div>
            <SLabel>Change Being Made</SLabel>
            <div
              style={{
                marginTop: SP[1.5],
                padding: `${SP[3]}px ${SP[4]}px`,
                borderRadius: R["2xl"],
                border: `1px solid ${C.border}`,
                background: "#FAFAFA",
                display: "flex",
                flexDirection: "column",
                gap: SP[2],
              }}
            >
              <div
                style={{
                  fontSize: F.size.sm,
                  fontWeight: F.weight.semibold,
                  color: C.text,
                }}
              >
                {meta.label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <BoolPill on={!newValue} />
                <ArrowSvg />
                <BoolPill on={newValue} />
              </div>
              <div
                style={{
                  fontSize: F.size.sm,
                  color: C.textMuted,
                  lineHeight: 1.5,
                  marginTop: SP[0.5],
                }}
              >
                {newValue ? meta.enabledDesc : meta.disabledDesc}
              </div>
            </div>
          </div>

          {/* ── Bulk impact summary ── */}
          {isBulk && (
            <div>
              <SLabel>Impact Summary</SLabel>
              <div
                style={{
                  marginTop: SP[1.5],
                  borderRadius: R["2xl"],
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                }}
              >
                {rowsToChange.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: `${SP[2]}px ${SP[3]}px`,
                      borderBottom:
                        i < rowsToChange.length - 1 || rowsAlready.length > 0
                          ? `1px solid ${C.border}`
                          : "none",
                      background: C.white,
                    }}
                  >
                    <CheckCircle2 size={14} color="#16A34A" strokeWidth={2} />
                    <span
                      style={{
                        fontSize: F.size.sm,
                        fontWeight: F.weight.semibold,
                        color: C.text,
                      }}
                    >
                      {r.shiftTime}
                    </span>
                    <BoolPill on={!newValue} />
                    <ArrowSvg />
                    <BoolPill on={newValue} />
                  </div>
                ))}
                {rowsAlready.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: `${SP[2]}px ${SP[3]}px`,
                      borderBottom:
                        i < rowsAlready.length - 1
                          ? `1px solid ${C.border}`
                          : "none",
                      background: "#F9FAFB",
                    }}
                  >
                    <MinusCircle
                      size={14}
                      color={C.textMuted}
                      strokeWidth={2}
                    />
                    <span style={{ fontSize: F.size.sm, color: C.textMuted }}>
                      {r.shiftTime}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        fontStyle: "italic",
                      }}
                    >
                      already {newValue ? "enabled" : "disabled"}, no change
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Drop shifts associated ── */}
          <div>
            <SLabel>
              Associated Drop Shifts
              {loadingDrops && (
                <Loader2
                  size={11}
                  style={{
                    marginLeft: 6,
                    animation: "spin 0.8s linear infinite",
                    verticalAlign: "middle",
                  }}
                  color={C.textMuted}
                />
              )}
            </SLabel>
            <div
              style={{
                marginTop: SP[1.5],
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                minHeight: 32,
              }}
            >
              {loadingDrops ? (
                <span style={{ fontSize: 11, color: C.textMuted }}>
                  Fetching logout shift times…
                </span>
              ) : dropTimes.length === 0 ? (
                <span style={{ fontSize: 11, color: C.textMuted }}>
                  No logout shifts linked to this location.
                </span>
              ) : (
                dropTimes.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      height: 26,
                      padding: "0 10px",
                      borderRadius: 99,
                      border: `1px solid ${C.border}`,
                      background: "#F9FAFB",
                      fontSize: 11,
                      fontWeight: 500,
                      color: C.textSub,
                    }}
                  >
                    <Clock size={10} color={C.textMuted} />
                    {t}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: `${SP[3]}px ${SP[5]}px`,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: SP[2],
            background: "#FAFAFA",
          }}
        >
          <span style={{ fontSize: 11, color: C.textMuted, flex: 1 }}>
            {isBulk
              ? rowsToChange.length === 0
                ? "No shifts need updating."
                : `${rowsToChange.length} of ${rows.length} shift${rows.length !== 1 ? "s" : ""} will be updated.`
              : "This change applies to this slot only."}
          </span>
          <div style={{ display: "flex", gap: SP[2] }}>
            <button
              onClick={onClose}
              disabled={isConfirming}
              style={{
                height: 36,
                padding: "0 18px",
                border: `1px solid ${C.border}`,
                borderRadius: R.xl,
                background: C.white,
                color: C.textSub,
                fontSize: F.size.sm,
                fontWeight: F.weight.medium,
                cursor: "pointer",
                transition: TR.fast,
                opacity: isConfirming ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirming || rowsToChange.length === 0}
              style={{
                height: 36,
                padding: "0 22px",
                border: "none",
                borderRadius: R.xl,
                background:
                  isConfirming || rowsToChange.length === 0
                    ? "#D1D5DB"
                    : C.primary,
                color:
                  isConfirming || rowsToChange.length === 0
                    ? "#9CA3AF"
                    : C.white,
                fontSize: F.size.sm,
                fontWeight: F.weight.semibold,
                cursor:
                  isConfirming || rowsToChange.length === 0
                    ? "not-allowed"
                    : "pointer",
                transition: TR.fast,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isConfirming ? (
                <>
                  <Loader2
                    size={13}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Applying…
                </>
              ) : isBulk ? (
                <>
                  <ChevronRight size={14} strokeWidth={2.5} />
                  Apply to {rowsToChange.length} Shift
                  {rowsToChange.length !== 1 ? "s" : ""}
                </>
              ) : (
                <>
                  <ChevronRight size={14} strokeWidth={2.5} />
                  Confirm Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
};

// ── Section label ──────────────────────────────────────────────────────────────
const SLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: C.textMuted,
    }}
  >
    {children}
  </div>
);

export default ShiftActionModal;

// // Both named + default export to satisfy all import styles
// export { EditSlotModal };
// export default EditSlotModal;

// shared/components/shift-grid/EditSlotModal.tsx
// ════════════════════════════════════════════════════════════════════════════
//  CHANGES FROM PREVIOUS VERSION
//  ────────────────────────────────────────────────────────────────────────────
//  DESIGN
//    • Drawer width 360 px (was 320) — matches screenshot exactly.
//    • Header: 56 px tall, band icon in a 36×36 rounded tile, "Configure Shift"
//      bold at 15 px, subtitle shows "HH:MM – Drop" from actual slot data.
//    • Contextual action banner below header — shows "You are configuring the
//      [band] shift at [time]. Changes apply to this slot only." with the band
//      icon colour so the context is always visible.
//    • Section labels are 10 px / uppercase / letter-spaced (matches screenshot).
//    • Field inputs are 34 px height, full-width in the drawer body.
//    • Drop Shift: uses DropShiftCell fed by dropShiftOptions; falls back to
//      empty option if the array is empty (never crashes).
//    • CBRow double-fire FIXED: the CB inside CBRow is now purely visual
//      (onClick is a no-op). Only the container div handles the toggle.
//    • Capacity: Users icon shown inline, full-width NumCell.
//    • Footer: 56 px, Cancel ghost + Save Changes filled (green).
//      Save disabled when no changes; spinner when isSubmitting.
//
//  DROPPOPOVER / DROP DATA
//    • dropShiftOptions is now sourced from the parent before openEdit() is
//      called (ShiftManagementPage passes allDropTimes). The field will show
//      all available logout shift times as options.
// ════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { X, Users, Zap } from "lucide-react";
import { C, F, SP, R, SH, CM, TR, Z } from "../shift-grid/ShiftGridTokens";
import {
  CB,
  NumCell,
  BAND_CONFIG,
  getTimeBand,
} from "../shift-grid/ShiftGridCells";
import { DropShiftMapper } from "./Dropshiftmapper";

// ── Editable slot shape ──────────────────────────────────────────────────────
export interface EditableSlot {
  id: number | string;
  shiftId?: number;
  shiftTime: string;
  dropShift: string | null;
  dropShiftOptions?: string[];
  pickOccupancy: number | null;
  dropOccupancy: number | null;
  peakHour: boolean;
  isGuardPick: boolean;
  isGuardDrop: boolean;
  unsPickAllwd: boolean;
  unsDropAllwd: boolean;
  isSafeReachedMale: boolean;
  isSafeReachedFemale: boolean;
  avgSpeed: number | null;
  locCode?: number;
  shiftDesc?: string | null;
  dropDayShift?: boolean;
  pickDayShift?: boolean;
}

export interface EditSlotModalProps {
  open: boolean;
  onClose: () => void;
  editingSlot: EditableSlot | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: Record<string, string> | null;
  lockType?: string; // ADD THIS
}

type FormData = Omit<EditableSlot, "id" | "locCode" | "shiftDesc">;

function slotToForm(slot: EditableSlot): FormData {
  return {
    shiftTime: slot.shiftTime,
    dropShift: slot.dropShift ?? "",
    dropShiftOptions: slot.dropShiftOptions ?? [],
    pickOccupancy: slot.pickOccupancy,
    dropOccupancy: slot.dropOccupancy,
    peakHour: slot.peakHour,
    isGuardPick: slot.isGuardPick,
    isGuardDrop: slot.isGuardDrop,
    unsPickAllwd: slot.unsPickAllwd,
    unsDropAllwd: slot.unsDropAllwd,
    isSafeReachedMale: slot.isSafeReachedMale,
    isSafeReachedFemale: slot.isSafeReachedFemale,
    avgSpeed: slot.avgSpeed,
    dropDayShift: slot.dropDayShift ?? false,
    pickDayShift: slot.pickDayShift ?? false,
  };
}

// ── Section label ─────────────────────────────────────────────────────────────
const SLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: F.weight.bold,
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      marginBottom: SP[1.5],
    }}
  >
    {children}
  </div>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: SP[0.5] }}>
    <label
      style={{
        fontSize: F.size.xs,
        fontWeight: F.weight.semibold,
        color: C.textSub,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

// ── Readonly input ────────────────────────────────────────────────────────────
const ROInput: React.FC<{ value: string }> = ({ value }) => (
  <input
    readOnly
    value={value}
    style={
      {
        width: "100%",
        height: 34,
        border: `1px solid ${C.border}`,
        borderRadius: R.lg,
        background: C.bgSub,
        color: C.textMuted,
        fontSize: F.size.sm,
        padding: `0 ${SP[2]}px`,
        outline: "none",
        cursor: "default",
        boxSizing: "border-box",
      } as React.CSSProperties
    }
  />
);

// ── CBRow — container handles toggle; CB is purely visual (no double-fire) ───
interface CBRowProps {
  checked: boolean;
  label: string;
  color?: string;
  onToggle: () => void;
}
const CBRow: React.FC<CBRowProps> = ({ checked, label, color, onToggle }) => {
  const col = color ?? C.primary;
  const isSuccess = col === C.success;
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: SP[1.5],
        padding: `${SP[1.5]}px ${SP[2]}px`,
        borderRadius: R.md,
        background: checked
          ? isSuccess
            ? "#DCFCE7"
            : C.primaryLight
          : "transparent",
        border: `1px solid ${
          checked ? (isSuccess ? "#86EFAC" : C.primaryBorder) : C.border
        }`,
        transition: TR.fast,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Visual-only CB — no onClick so no double-fire */}
      <CB checked={checked} color={col} onClick={() => {}} readonly />
      <span
        style={{
          fontSize: F.size.xs,
          fontWeight: F.weight.medium,
          color: checked ? (isSuccess ? "#15803D" : C.primary) : C.textSub,
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── CBPair — two CBRow side by side ──────────────────────────────────────────
const CBPair: React.FC<{
  leftChecked: boolean;
  leftLabel: string;
  leftColor?: string;
  onLeft: () => void;
  rightChecked: boolean;
  rightLabel: string;
  rightColor?: string;
  onRight: () => void;
}> = ({
  leftChecked,
  leftLabel,
  leftColor,
  onLeft,
  rightChecked,
  rightLabel,
  rightColor,
  onRight,
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SP[2] }}>
    <CBRow
      checked={leftChecked}
      label={leftLabel}
      color={leftColor}
      onToggle={onLeft}
    />
    <CBRow
      checked={rightChecked}
      label={rightLabel}
      color={rightColor}
      onToggle={onRight}
    />
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <SLabel>{label}</SLabel>
    {children}
  </div>
);

// ── Main drawer ───────────────────────────────────────────────────────────────
const EditSlotModal: React.FC<EditSlotModalProps> = ({
  open,
  onClose,
  editingSlot,
  onSubmit,
  isSubmitting,
  serverErrors,
  lockType = "SHIFT", // ADD THIS
}) => {
  const [form, setForm] = useState<FormData | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  console.log("editingSlot", editingSlot);

  useEffect(() => {
    if (editingSlot) {
      setForm(slotToForm(editingSlot));
      setIsDirty(false);
    }
  }, [editingSlot]);

  if (!editingSlot || !form) return null;

  const band = getTimeBand(form.shiftTime);
  const bandCfg = BAND_CONFIG[band];
  const BandIcon = bandCfg.icon;

  const toggle = (field: keyof FormData) => {
    setForm((f) => (f ? { ...f, [field]: !f[field] } : f));
    setIsDirty(true);
  };
  const setNum = (field: keyof FormData, v: number | null) => {
    setForm((f) => (f ? { ...f, [field]: v } : f));
    setIsDirty(true);
  };
  // const setStr = (field: keyof FormData, v: string) => {
  //   setForm((f) => (f ? { ...f, [field]: v } : f));
  //   setIsDirty(true);
  // };

  const handleSave = async () => {
    if (!form) return;
    await onSubmit(form as Record<string, unknown>);
  };

  // Drop shift options — use slot's options or empty array; never crash
  const dropOptions: string[] =
    Array.isArray(form.dropShiftOptions) && form.dropShiftOptions.length > 0
      ? form.dropShiftOptions
      : form.dropShift
        ? [form.dropShift]
        : [];

  const drawerW = CM.drawerW ?? 360;
  const bodyPad = SP[4] ?? 16;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: Z.modal,
          backdropFilter: "blur(1px)",
          transition: TR.normal,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: drawerW,
          background: C.white,
          boxShadow: SH.drawer,
          zIndex: Z.drawer,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: TR.drawer,
          borderRadius: `${R["3xl"]}px 0 0 ${R["3xl"]}px`,
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            height: 56,
            flexShrink: 0,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            padding: `0 ${bodyPad}px`,
            gap: SP[2.5],
          }}
        >
          {/* Band icon tile */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: bandCfg.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BandIcon size={16} color={bandCfg.iconColor} strokeWidth={2} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: F.weight.bold,
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              Configure Shift
            </div>
            <div
              style={{
                fontSize: F.size.xs,
                color: C.textMuted,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: 1,
              }}
            >
              {form.shiftTime}
              {form.dropShift ? ` — ${form.dropShift}` : ""}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              border: `1px solid ${C.border}`,
              borderRadius: R.lg,
              background: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              transition: TR.fast,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = C.bgHover)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = C.white)
            }
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        {/* ── CONTEXTUAL BANNER ── */}
        <div
          style={{
            padding: `${SP[2]}px ${bodyPad}px`,
            background: bandCfg.bg,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: SP[1.5],
          }}
        >
          <BandIcon size={13} color={bandCfg.iconColor} strokeWidth={2} />
          <span
            style={{ fontSize: F.size.xs, color: C.textSub, lineHeight: 1.4 }}
          >
            Configuring the{" "}
            <strong style={{ color: C.text }}>
              {bandCfg.label.toLowerCase()}
            </strong>{" "}
            shift at <strong style={{ color: C.text }}>{form.shiftTime}</strong>
            . Changes apply to this slot only.
          </span>
        </div>

        {/* ── BODY ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: bodyPad,
            display: "flex",
            flexDirection: "column",
            gap: SP[4],
          }}
        >
          {/* Shift Timings */}
          <Section label="Shift Timings">
            <div
              style={{ display: "flex", flexDirection: "column", gap: SP[2.5] }}
            >
              <Field label="Pickup Shift">
                <ROInput value={form.shiftTime} />
              </Field>
              <Field label="Drop Shift">
                {/* {dropOptions.length > 0 ? (
                  <DropShiftCell
                    value={form.dropShift ?? ""}
                    options={dropOptions}
                    onChange={(v) => setStr("dropShift", v)}
                    width={drawerW - bodyPad * 2}
                    height={34}
                  />
                ) : (
                  <ROInput value={form.dropShift ?? "—"} />
                )} */}

                <DropShiftMapper
                  shiftID={editingSlot.shiftId ?? editingSlot.id}
                  locCode={editingSlot.locCode ?? 0}
                  lockType={lockType}
                  dropOptions={dropOptions}
                />
              </Field>
            </div>
          </Section>

          {/* Capacity */}
          <Section label="Capacity (Cab Occupancy)">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: SP[3],
              }}
            >
              <Field label="Pickup">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SP[1.5],
                  }}
                >
                  <Users size={14} color={C.textMuted} strokeWidth={1.5} />
                  <NumCell
                    value={form.pickOccupancy}
                    onChange={(v) => setNum("pickOccupancy", v)}
                    inputWidth={(drawerW - bodyPad * 2 - SP[3]) / 2 - 22}
                    inputHeight={34}
                  />
                </div>
              </Field>
              <Field label="Drop">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SP[1.5],
                  }}
                >
                  <Users size={14} color={C.textMuted} strokeWidth={1.5} />
                  <NumCell
                    value={form.dropOccupancy}
                    onChange={(v) => setNum("dropOccupancy", v)}
                    inputWidth={(drawerW - bodyPad * 2 - SP[3]) / 2 - 22}
                    inputHeight={34}
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* Peak Hour */}
          <Section label="Peak Hour">
            <div
              onClick={() => toggle("peakHour")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: SP[2],
                padding: `${SP[2]}px ${SP[3]}px`,
                borderRadius: R.lg,
                background: form.peakHour ? C.primaryLight : "transparent",
                border: `1px solid ${form.peakHour ? C.primaryBorder : C.border}`,
                transition: TR.fast,
                cursor: "pointer",
              }}
            >
              <CB
                checked={form.peakHour}
                color={C.primary}
                onClick={() => {}}
                readonly
              />
              <Zap size={13} color={form.peakHour ? C.primary : C.textMuted} />
              <span
                style={{
                  fontSize: F.size.sm,
                  fontWeight: F.weight.medium,
                  color: form.peakHour ? C.primary : C.textSub,
                }}
              >
                This is a peak hour shift
              </span>
            </div>
          </Section>

          {/* Bus Nodal Point */}
          <Section label="Guard Allowed">
            <CBPair
              leftChecked={form.isGuardPick}
              leftLabel="Pickup"
              leftColor={C.primary}
              onLeft={() => toggle("isGuardPick")}
              rightChecked={form.isGuardDrop}
              rightLabel="Drop"
              rightColor={C.primary}
              onRight={() => toggle("isGuardDrop")}
            />
          </Section>

          {/* Safe Reach */}
          <Section label="Safe Reach">
            <CBPair
              leftChecked={form.isSafeReachedMale}
              leftLabel="Pickup"
              leftColor={C.success}
              onLeft={() => toggle("isSafeReachedMale")}
              rightChecked={form.isSafeReachedFemale}
              rightLabel="Drop"
              rightColor={C.success}
              onRight={() => toggle("isSafeReachedFemale")}
            />
          </Section>

          {/* Adhoc Allowed */}
          <Section label="Adhoc Allowed">
            <CBPair
              leftChecked={form.unsPickAllwd}
              leftLabel="Pickup"
              leftColor={C.primary}
              onLeft={() => toggle("unsPickAllwd")}
              rightChecked={form.unsDropAllwd}
              rightLabel="Drop"
              rightColor={C.primary}
              onRight={() => toggle("unsDropAllwd")}
            />
          </Section>

          {/* Avg Speed */}
          <Section label="Average Speed (km/h)">
            <div style={{ display: "flex", alignItems: "center", gap: SP[2] }}>
              <NumCell
                value={form.avgSpeed}
                onChange={(v) => setNum("avgSpeed", v)}
                inputWidth={drawerW - bodyPad * 2 - 44}
                inputHeight={34}
              />
              <span
                style={{
                  fontSize: F.size.sm,
                  color: C.textMuted,
                  fontWeight: F.weight.medium,
                  whiteSpace: "nowrap",
                }}
              >
                km/h
              </span>
            </div>
          </Section>

          {/* Server errors */}
          {serverErrors && Object.keys(serverErrors).length > 0 && (
            <div
              style={{
                background: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
                borderRadius: R.lg,
                padding: `${SP[2]}px ${SP[3]}px`,
              }}
            >
              {Object.entries(serverErrors).map(([k, v]) => (
                <p
                  key={k}
                  style={{ margin: 0, fontSize: F.size.xs, color: C.errorText }}
                >
                  {v}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            height: 56,
            flexShrink: 0,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: SP[2],
            padding: `0 ${bodyPad}px`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: 34,
              padding: `0 ${SP[4]}px`,
              border: `1px solid ${C.border}`,
              borderRadius: R.lg,
              background: C.white,
              color: C.textSub,
              fontSize: F.size.sm,
              cursor: "pointer",
              transition: TR.fast,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = C.bgHover)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = C.white)
            }
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSubmitting}
            style={{
              height: 34,
              padding: `0 ${SP[5]}px`,
              border: "none",
              borderRadius: R.lg,
              background: C.primary,
              color: C.white,
              fontSize: F.size.sm,
              fontWeight: F.weight.semibold,
              cursor: !isDirty || isSubmitting ? "not-allowed" : "pointer",
              opacity: !isDirty || isSubmitting ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: SP[1.5],
              transition: TR.fast,
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: C.white,
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                    display: "inline-block",
                  }}
                />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export { EditSlotModal };
export default EditSlotModal;

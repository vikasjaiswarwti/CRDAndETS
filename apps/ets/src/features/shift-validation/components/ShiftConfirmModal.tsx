// features/shift-validation/components/ShiftConfirmModal.tsx
//
// Enhanced confirmation modal.
//  - Computes diff (opening / closing) per trip type from original vs current state
//  - Shows office name and mode label prominently
//  - Clear opening (green) / closing (red) pill sections
//  - "No changes" guard — disables Confirm when diff is empty

import React, { useMemo } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { VALIDATION_MODES } from "../constants/shiftValidationConstants";
import type { ShiftSlot, ValidateType } from "../types/shiftValidation.types";

import { Bus, House, RefreshCw } from "lucide-react";

interface ShiftConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  locCode: number;
  officeName: string;
  currentMode: ValidateType;
  wiseId: string;
  pickupShifts: ShiftSlot[];
  dropShifts: ShiftSlot[];
  originalPickup: ShiftSlot[];
  originalDrop: ShiftSlot[];
}

const TOKEN = {
  green900: "#1B4332",
  green600: "#52796F",
  green100: "#D8F3DC",
  green50: "#F0FFF4",
  red100: "#FEE2E2",
  red600: "#DC2626",
  red50: "#FFF5F5",
  border: "#E5E7EB",
  textMuted: "#6B7280",
  textBody: "#374151",
};

// ── Diff helpers ──────────────────────────────────────────────────────────────

interface Diff {
  opening: ShiftSlot[]; // was inactive, now active
  closing: ShiftSlot[]; // was active, now inactive
}

function computeDiff(original: ShiftSlot[], current: ShiftSlot[]): Diff {
  const origMap = new Map(original.map((s) => [s.shiftId, s.active]));
  const opening: ShiftSlot[] = [];
  const closing: ShiftSlot[] = [];

  for (const slot of current) {
    const wasActive = origMap.get(slot.shiftId) ?? slot.active;
    if (!wasActive && slot.active) opening.push(slot);
    if (wasActive && !slot.active) closing.push(slot);
  }

  return { opening, closing };
}

// ── Pill row ──────────────────────────────────────────────────────────────────

interface PillRowProps {
  label: string;
  slots: ShiftSlot[];
  variant: "opening" | "closing";
}

const PillRow: React.FC<PillRowProps> = ({ label, slots, variant }) => {
  const isOpening = variant === "opening";
  const bg = isOpening ? TOKEN.green100 : TOKEN.red100;
  const color = isOpening ? TOKEN.green900 : TOKEN.red600;
  const icon = isOpening ? "▲" : "▼";

  if (slots.length === 0) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          fontSize: 12,
          fontWeight: 600,
          color,
        }}
      >
        <span>{icon}</span>
        <span>
          {label} — {slots.length} shift{slots.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {slots.map((s) => (
          <span
            key={s.shiftId}
            style={{
              padding: "3px 10px",
              borderRadius: 50,
              background: bg,
              color,
              fontSize: 11,
              fontWeight: 600,
              border: `1px solid ${color}22`,
              whiteSpace: "nowrap",
            }}
          >
            {s.shiftTime}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Trip section ──────────────────────────────────────────────────────────────

interface TripSectionProps {
  title: string;
  icon: React.ReactNode;
  diff: Diff;
}

const TripSection: React.FC<TripSectionProps> = ({ title, icon, diff }) => {
  const hasChanges = diff.opening.length > 0 || diff.closing.length > 0;

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${TOKEN.border}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "8px 14px",
          background: "#F9FAFB",
          borderBottom: `1px solid ${TOKEN.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        <span>{icon}</span>
        {title}
        {!hasChanges && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 500,
              color: TOKEN.textMuted,
              background: "#F3F4F6",
              padding: "2px 8px",
              borderRadius: 50,
            }}
          >
            No changes
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px" }}>
        {!hasChanges ? (
          <div
            style={{
              fontSize: 12,
              color: TOKEN.textMuted,
              fontStyle: "italic",
            }}
          >
            All shifts remain the same.
          </div>
        ) : (
          <>
            <PillRow label="Opening" slots={diff.opening} variant="opening" />
            <PillRow label="Closing" slots={diff.closing} variant="closing" />
          </>
        )}
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

export const ShiftConfirmModal: React.FC<ShiftConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  //   locCode,
  officeName,
  currentMode,
  wiseId,
  pickupShifts,
  dropShifts,
  originalPickup,
  originalDrop,
}) => {
  const { Modal } = useUILibrary();

  const pickupDiff = useMemo(
    () => computeDiff(originalPickup, pickupShifts),
    [originalPickup, pickupShifts],
  );

  const dropDiff = useMemo(
    () => computeDiff(originalDrop, dropShifts),
    [originalDrop, dropShifts],
  );

  const totalOpening = pickupDiff.opening.length + dropDiff.opening.length;
  const totalClosing = pickupDiff.closing.length + dropDiff.closing.length;
  const hasAnyChange = totalOpening > 0 || totalClosing > 0;

  const modeLabel = VALIDATION_MODES[currentMode]?.label ?? "Shift";

  // ── Summary sentence ────────────────────────────────────────────────────────
  const summaryParts: string[] = [];
  if (totalOpening > 0)
    summaryParts.push(
      `opening ${totalOpening} shift${totalOpening !== 1 ? "s" : ""}`,
    );
  if (totalClosing > 0)
    summaryParts.push(
      `closing ${totalClosing} shift${totalClosing !== 1 ? "s" : ""}`,
    );

  const summaryText = hasAnyChange
    ? `You are ${summaryParts.join(" and ")} for`
    : "No shift changes detected for";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: TOKEN.green100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            <RefreshCw size={16} />
          </div>
          <div>
            <div
              style={{ fontSize: 17, fontWeight: 700, color: TOKEN.green900 }}
            >
              Confirm Shift Changes
            </div>
            <div
              style={{ fontSize: 12, color: TOKEN.textMuted, fontWeight: 400 }}
            >
              {modeLabel} · Review before saving
            </div>
          </div>
        </div>
      }
      width={1000}
      destroyOnClose
      footer={null}
      style={{ top: 20 }}
    >
      {/* ── Office / summary banner ── */}
      <div
        style={{
          background: hasAnyChange ? TOKEN.green50 : "#F9FAFB",
          border: `1px solid ${hasAnyChange ? "#A7F3D0" : TOKEN.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, color: TOKEN.textBody, lineHeight: 1.6 }}>
          {summaryText}{" "}
          <strong style={{ color: TOKEN.green900 }}>{officeName}</strong>
          {wiseId && wiseId !== "0" ? (
            <span style={{ color: TOKEN.textMuted }}> ({wiseId})</span>
          ) : null}
          .
        </div>

        {/* Change count chips */}
        {hasAnyChange && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {totalOpening > 0 && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 50,
                  background: TOKEN.green100,
                  color: TOKEN.green900,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ▲ {totalOpening} Opening
              </span>
            )}
            {totalClosing > 0 && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 50,
                  background: TOKEN.red100,
                  color: TOKEN.red600,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ▼ {totalClosing} Closing
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Trip sections ── */}
      <TripSection
        title="Login Shifts"
        icon={<Bus className="h-4 w-4" />}
        diff={pickupDiff}
      />

      <TripSection
        title="Logout Shifts"
        icon={<House className="h-4 w-4" />}
        diff={dropDiff}
      />

      {/* ── No-change warning ── */}
      {!hasAnyChange && (
        <div
          style={{
            padding: "10px 14px",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: 8,
            fontSize: 12,
            color: "#92400E",
            marginBottom: 16,
            display: "flex",
            gap: 8,
          }}
        >
          <span>⚠️</span>
          <span>
            Nothing has changed from the current saved state. Toggle shifts
            before submitting.
          </span>
        </div>
      )}

      {/* ── Footer buttons ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingTop: 4,
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "9px 24px",
            borderRadius: 50,
            border: "1px solid #D1D5DB",
            background: "#fff",
            color: "#6B7280",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting || !hasAnyChange}
          style={{
            padding: "9px 28px",
            borderRadius: 50,
            border: "none",
            background:
              isSubmitting || !hasAnyChange ? TOKEN.green600 : TOKEN.green900,
            color: "#fff",
            fontSize: 13,
            cursor: isSubmitting || !hasAnyChange ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isSubmitting || !hasAnyChange ? 0.65 : 1,
          }}
        >
          {isSubmitting ? "Saving…" : "Confirm Changes"}
        </button>
      </div>
    </Modal>
  );
};

export default ShiftConfirmModal;

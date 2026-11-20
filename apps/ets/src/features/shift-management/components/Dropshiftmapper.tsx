// shared/components/shift-grid/DropShiftMapper.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Inline section inside EditSlotModal that lets the user pick one or more
// logout shift times to map against this pickup shift, then saves them via
// shiftLockUpdate in a single API call.
//
// Payload sent:
//   { lockType, locCode, shiftID, dropShift: "18:00,18:30,19:00" }
//
// Usage inside EditSlotModal:
//   <DropShiftMapper
//     shiftID={editingSlot.id}
//     locCode={editingSlot.locCode ?? 0}
//     lockType={lockType}           // from ShiftManagementPage
//     dropOptions={allDropTimes}    // already passed as dropShiftOptions
//   />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Check, X, Save } from "lucide-react";
import { C, F, SP, R, TR } from "../shift-grid/ShiftGridTokens";
import { useShiftLockUpdateMutation } from "../services/shiftManagementApi";

interface Props {
  shiftID: number | string;
  locCode: number;
  lockType: string;
  dropOptions: string[];
}

export const DropShiftMapper: React.FC<Props> = ({
  shiftID,
  locCode,
  lockType,
  dropOptions,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [shiftLockUpdate] = useShiftLockUpdateMutation();

  const toggle = (time: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(time) ? next.delete(time) : next.add(time);
      return next;
    });
    // Reset status when selection changes
    if (status !== "idle") setStatus("idle");
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setStatus("saving");
    setErrMsg(null);
    try {
      await shiftLockUpdate({
        lockType,
        locCode,
        shiftID: Number(shiftID),
        dropShift: Array.from(selected).join(","),
      }).unwrap();
      setStatus("success");
      // Reset after 2 s
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: any) {
      setStatus("error");
      setErrMsg(
        err?.data?.message ?? err?.message ?? "Failed to save mapping.",
      );
    }
  };

  if (!dropOptions.length) return null;

  return (
    <div>
      {/* Selected chips row */}
      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: SP[1],
            marginBottom: SP[2],
          }}
        >
          {Array.from(selected).map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: `2px 8px`,
                borderRadius: 999,
                background: C.primaryLight,
                border: `1px solid ${C.primaryBorder}`,
                fontSize: F.size.xs,
                fontWeight: F.weight.semibold,
                color: C.primary,
              }}
            >
              {t}
              <button
                onClick={() => toggle(t)}
                style={{
                  display: "flex",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: C.primary,
                  opacity: 0.7,
                }}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Scrollable option list */}
      <div
        style={{
          maxHeight: 180,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: SP[1],
          padding: `${SP[1]}px 0`,
          border: `1px solid ${C.border}`,
          borderRadius: R.lg,
          background: C.white,
        }}
      >
        {dropOptions.map((time) => {
          const checked = selected.has(time);
          return (
            <button
              key={time}
              onClick={() => toggle(time)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: SP[2],
                padding: `${SP[1.5]}px ${SP[3]}px`,
                border: "none",
                background: checked ? C.primaryLight : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: TR.fast,
                color: checked ? C.primary : C.textSub,
              }}
            >
              {/* Custom checkbox */}
              <span
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 4,
                  flexShrink: 0,
                  border: `2px solid ${checked ? C.primary : C.border}`,
                  background: checked ? C.primary : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: TR.fast,
                }}
              >
                {checked && <Check size={9} color="#fff" strokeWidth={3} />}
              </span>
              <span
                style={{
                  fontSize: F.size.sm,
                  fontWeight: checked ? F.weight.semibold : F.weight.regular,
                }}
              >
                {time}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer: count + save button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: SP[2],
        }}
      >
        <span style={{ fontSize: F.size.xs, color: C.textMuted }}>
          {selected.size > 0
            ? `${selected.size} shift${selected.size !== 1 ? "s" : ""} selected`
            : "Select one or more drop shifts"}
        </span>

        <button
          onClick={handleSave}
          disabled={selected.size === 0 || status === "saving"}
          style={{
            height: 30,
            padding: `0 ${SP[3]}px`,
            border: "none",
            borderRadius: R.lg,
            background:
              status === "success"
                ? C.success
                : selected.size === 0 || status === "saving"
                  ? C.border
                  : C.primary,
            color:
              selected.size === 0 && status !== "success"
                ? C.textMuted
                : "#fff",
            fontSize: F.size.xs,
            fontWeight: F.weight.semibold,
            cursor:
              selected.size === 0 || status === "saving"
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: TR.fast,
            opacity: selected.size === 0 ? 0.5 : 1,
          }}
        >
          {status === "saving" ? (
            <>
              <span
                style={{
                  width: 10,
                  height: 10,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "dsm-spin 0.6s linear infinite",
                }}
              />
              Saving…
            </>
          ) : status === "success" ? (
            <>
              <Check size={11} strokeWidth={2.5} />
              Saved
            </>
          ) : (
            <>
              <Save size={11} strokeWidth={2} />
              Map Drops
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {status === "error" && errMsg && (
        <p
          style={{
            margin: `${SP[1]}px 0 0`,
            fontSize: F.size.xs,
            color: C.errorText,
          }}
        >
          {errMsg}
        </p>
      )}

      <style>{`@keyframes dsm-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

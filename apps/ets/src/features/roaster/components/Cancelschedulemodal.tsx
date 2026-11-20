// // src/features/roster/components/CancelScheduleModal.tsx
// import React from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import type { CancelShiftType } from "../types/Roster.types";
// import { CANCEL_SHIFT_OPTIONS, COLORS } from "../constants/Rosterconstants";

// // ─── Props ────────────────────────────────────────────────────────────────────

// interface CancelScheduleModalProps {
//     open: boolean;
//     selectedType: CancelShiftType;
//     onTypeChange: (type: CancelShiftType) => void;
//     onConfirm: () => void;
//     onDismiss: () => void;
//     isLoading?: boolean;
//     selectedCount?: number;
// }

// // ─── CancelScheduleModal ──────────────────────────────────────────────────────

// const CancelScheduleModal: React.FC<CancelScheduleModalProps> = ({
//     open,
//     selectedType,
//     onTypeChange,
//     onConfirm,
//     onDismiss,
//     isLoading = false,
//     selectedCount = 0,
// }) => {
//     const { Modal, Button } = useUILibrary();

//     return (
//         <Modal
//             open={open}
//             onCancel={onDismiss}
//             title={
//                 <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.primaryDark }}>
//                     Cancel Schedule
//                 </span>
//             }
//             width={420}
//             destroyOnClose
//             footer={null}
//             centered
//             styles={{
//                 header: { borderBottom: "none", paddingBottom: 0 },
//                 mask: { background: "rgba(0, 60, 30, 0.35)" },
//             }}
//             style={{ borderRadius: 16 }}
//         >
//             {/* Subtitle */}
//             <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "0 0 20px" }}>
//                 Please select the shift type you wish to cancel.
//                 {selectedCount > 0 && (
//                     <span style={{ fontWeight: 600, color: COLORS.primaryDark, marginLeft: 4 }}>
//                         ({selectedCount} roster{selectedCount > 1 ? "s" : ""} selected)
//                     </span>
//                 )}
//             </p>

//             {/* Radio option list */}
//             <ShiftTypeSelector
//                 options={CANCEL_SHIFT_OPTIONS}
//                 selectedValue={selectedType}
//                 onSelect={onTypeChange}
//             />

//             {/* Confirm */}
//             <Button
//                 block
//                 danger
//                 shape="round"
//                 size="large"
//                 loading={isLoading}
//                 disabled={isLoading}
//                 onClick={onConfirm}
//                 style={{
//                     marginBottom: 10,
//                     fontWeight: 600,
//                     fontSize: 15,
//                 }}
//             >
//                 {isLoading ? "Cancelling…" : "Confirm Cancellation"}
//             </Button>

//             {/* Dismiss */}
//             <Button
//                 block
//                 shape="round"
//                 size="large"
//                 disabled={isLoading}
//                 onClick={onDismiss}
//                 style={{
//                     background: "#F3F4F6",
//                     border: "none",
//                     color: COLORS.textBody,
//                     fontWeight: 500,
//                     fontSize: 15,
//                 }}
//             >
//                 Dismiss
//             </Button>
//         </Modal>
//     );
// };

// // ─── ShiftTypeSelector ────────────────────────────────────────────────────────

// interface ShiftOption {
//     value: CancelShiftType;
//     label: string;
// }

// interface ShiftTypeSelectorProps {
//     options: ShiftOption[];
//     selectedValue: CancelShiftType;
//     onSelect: (value: CancelShiftType) => void;
// }

// const ShiftTypeSelector: React.FC<ShiftTypeSelectorProps> = ({
//     options, selectedValue, onSelect,
// }) => (
//     <div style={{ display: "flex", flexDirection: "column", marginBottom: 24, gap: "8px" }}>
//         {options.map((opt) => {
//             const isSelected = selectedValue === opt.value;

//             return (
//                 <div
//                     key={opt.value}
//                     role="radio"
//                     aria-checked={isSelected}
//                     tabIndex={0}
//                     onClick={() => onSelect(opt.value)}
//                     onKeyDown={(e) => {
//                         if (e.key === " " || e.key === "Enter") onSelect(opt.value);
//                     }}
//                     style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         padding: "10px 15px",
//                         border: isSelected
//                             ? `2px solid ${COLORS.primaryDark}`
//                             : `1px solid ${COLORS.border}`,
//                         borderRadius: "10px",
//                         background: isSelected ? COLORS.lightBg : "#fff",
//                         cursor: "pointer",
//                         zIndex: isSelected ? 1 : 0,
//                         position: "relative",
//                         userSelect: "none",
//                     }}
//                 >
//                     <span style={{
//                         fontSize: 14,
//                         fontWeight: isSelected ? 600 : 400,
//                         color: isSelected ? COLORS.primaryDark : COLORS.textBody,
//                     }}>
//                         {opt.label}
//                     </span>

//                     <div style={{
//                         width: 20, height: 20, borderRadius: "50%",
//                         border: `2px solid ${isSelected ? COLORS.primaryDark : COLORS.border}`,
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         flexShrink: 0,
//                     }}>
//                         {isSelected && (
//                             <div style={{
//                                 width: 10, height: 10,
//                                 borderRadius: "50%",
//                                 background: COLORS.primaryDark,
//                             }} />
//                         )}
//                     </div>
//                 </div>
//             );
//         })}
//     </div>
// );

// export default CancelScheduleModal;

// src/features/roster/components/CancelScheduleModal.tsx

import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { CancelShiftType } from "../types/Roster.types";
import { CANCEL_SHIFT_OPTIONS, COLORS } from "../constants/Rosterconstants";

interface CancelScheduleModalProps {
  open: boolean;
  selectedType: CancelShiftType;
  onTypeChange: (type: CancelShiftType) => void;
  onConfirm: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
  selectedCount?: number;
}

const CancelScheduleModal: React.FC<CancelScheduleModalProps> = ({
  open,
  selectedType,
  onTypeChange,
  onConfirm,
  onDismiss,
  isLoading = false,
  selectedCount = 0,
}) => {
  const { Modal } = useUILibrary();

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
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 700, color: COLORS.textBody }}
            >
              Cancel Schedule
            </div>
            {selectedCount > 0 && (
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                {selectedCount} roster{selectedCount > 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </div>
      }
      width={400}
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
      {/* Label */}
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
        Select the shift type to cancel
      </div>

      {/* Shift type options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {CANCEL_SHIFT_OPTIONS.map((opt) => {
          const active = selectedType === opt.value;
          return (
            <div
              key={opt.value}
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() => onTypeChange(opt.value)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") onTypeChange(opt.value);
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
              {/* Radio dot */}
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
          disabled={isLoading}
          style={{
            flex: 2,
            padding: "9px 0",
            borderRadius: 50,
            border: "none",
            background: isLoading ? "#fca5a5" : "#ef4444",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
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
              Cancelling…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              Confirm Cancellation
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
};

export default CancelScheduleModal;

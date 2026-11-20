// features/shift-validation/components/ShiftFlowHelpModal.tsx
//
// Explains the full shift setup flow in 3 steps.
// Triggered by the "?" help button in the page actions bar.

import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

interface ShiftFlowHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const TOKEN = {
  green900: "#1B4332",
  green700: "#2D6A4F",
  green100: "#D8F3DC",
  green50: "#F0FFF4",
  border: "#E5E7EB",
  textMuted: "#6B7280",
  textBody: "#374151",
  textStrong: "#111827",
};

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
  bullets: string[];
  action?: string; // button label hint
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: "⏱️",
    title: "Create Shift Intervals",
    description:
      "Intervals define the gap (in minutes) between consecutive shift slots. Every set of shifts is built on top of an interval.",
    bullets: [
      'Click "+ Add Shift Interval" to open the form.',
      "Enter the interval in minutes (e.g. 30, 60) and a readable label (e.g. `Half-Hour`).",
      "Save the interval — it now appears in the Define Shift dropdown.",
    ],
    action: "+ Add Shift Interval",
  },
  {
    number: 2,
    icon: "🗂️",
    title: "Define Shifts for an Office",
    description:
      "Once you have an interval, generate the full day's time slots for a specific office. This creates both pickup and drop slots.",
    bullets: [
      'Click "+ Define Shift" to open the form.',
      "Select the office (location) and the interval you just created.",
      "Submit — the system auto-generates all shift slots for that office.",
      "Repeat for each office that needs its own shift schedule.",
    ],
    action: "+ Define Shift",
  },
  {
    number: 3,
    icon: "✅",
    title: "Validate & Activate Shifts",
    description:
      "Now control which generated slots are actually active for pickup and drop. You can scope this per office, user, department, LOB, or process.",
    bullets: [
      "Select a validation mode using the radio buttons (Normal, User Wise, Dept Wise, etc.).",
      "Pick the office — and a department / LOB / process if required.",
      "Toggle individual shift pills on (green) or off (grey) for both Login and Logout shifts.",
      'Use "Select All" in a section to bulk-activate. Hit "Reset" to undo local changes.',
      'Click "Submit" — review the precise diff in the confirmation dialog, then confirm.',
    ],
    action: "Submit",
  },
];

const StepCard: React.FC<{ step: Step; isLast: boolean }> = ({
  step,
  isLast,
}) => (
  <div style={{ display: "flex", gap: 16, position: "relative" }}>
    {/* Left column: number + connector line */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
        width: 36,
      }}
    >
      {/* Circle */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: TOKEN.green900,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {step.number}
      </div>
      {/* Vertical connector */}
      {!isLast && (
        <div
          style={{
            flex: 1,
            width: 2,
            background: TOKEN.green100,
            margin: "6px 0",
            minHeight: 24,
          }}
        />
      )}
    </div>

    {/* Right column: card */}
    <div
      style={{
        flex: 1,
        background: TOKEN.green50,
        border: `1px solid ${TOKEN.green100}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: isLast ? 0 : 12,
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 20 }}>{step.icon}</span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: TOKEN.green900,
          }}
        >
          {step.title}
        </span>
        {step.action && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 600,
              color: TOKEN.green700,
              background: TOKEN.green100,
              padding: "2px 10px",
              borderRadius: 50,
              whiteSpace: "nowrap",
            }}
          >
            {step.action}
          </span>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: TOKEN.textBody,
          margin: "0 0 10px 0",
          lineHeight: 1.55,
        }}
      >
        {step.description}
      </p>

      {/* Bullets */}
      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {step.bullets.map((b, i) => (
          <li
            key={i}
            style={{ fontSize: 12.5, color: TOKEN.textBody, lineHeight: 1.5 }}
          >
            {b}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const ShiftFlowHelpModal: React.FC<ShiftFlowHelpModalProps> = ({
  open,
  onClose,
}) => {
  const { Modal } = useUILibrary();

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
              fontSize: 18,
            }}
          >
            💡
          </div>
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 700, color: TOKEN.green900 }}
            >
              How Shift Management Works
            </div>
            <div
              style={{ fontSize: 12, color: TOKEN.textMuted, fontWeight: 400 }}
            >
              Follow these 3 steps to set up and activate shifts for any office
            </div>
          </div>
        </div>
      }
      width={620}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 28px",
              borderRadius: 50,
              border: "none",
              background: TOKEN.green900,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      }
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.3)" },
        header: { borderBottom: "none", paddingBottom: 4 },
        content: { borderRadius: 16 },
      }}
    >
      {/* Intro banner */}
      <div
        style={{
          background: TOKEN.green900,
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 22 }}>🔄</span>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 2,
            }}
          >
            Complete Setup Flow
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
            Intervals → Define Shifts → Validate &amp; Activate
          </div>
        </div>
      </div>

      {/* Steps */}
      <div>
        {STEPS.map((step, i) => (
          <StepCard
            key={step.number}
            step={step}
            isLast={i === STEPS.length - 1}
          />
        ))}
      </div>

      {/* Tip footer */}
      <div
        style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 8,
          fontSize: 12,
          color: "#92400E",
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
        <span>
          <strong>Tip:</strong> You only need to define shifts once per office.
          After that, use the validation modes (User Wise, Dept Wise, etc.) to
          fine-tune which shifts are active for specific groups.
        </span>
      </div>
    </Modal>
  );
};

export default ShiftFlowHelpModal;

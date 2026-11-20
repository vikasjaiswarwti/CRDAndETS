// ============================================================
// FieldHelpPopover.tsx
//
// A small ⓘ info icon rendered inline after a field label.
// On hover it opens an antd Popover showing:
//   - Field title
//   - Human-readable description
//   - Optional example (italic, smaller)
//
// Usage:
//   <FieldHelpPopover fieldKey="ors_Lock_days" />
//   <FieldHelpPopover fieldKey="schLockDaysUser" />   ← persona suffix auto-stripped
// ============================================================

import React from "react";
import { Popover } from "antd";
import { Info } from "lucide-react";
import { getFieldImpact } from "../constants/Configimpactmessages";

interface Props {
  fieldKey: string;
}

export const FieldHelpPopover: React.FC<Props> = ({ fieldKey }) => {
  const impact = getFieldImpact(fieldKey);

  console.log("impact from FieldHelpPopover", impact);

  const content = (
    <div style={{ maxWidth: 280, padding: "2px 0" }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 6,
          lineHeight: 1.4,
        }}
      >
        {impact.title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#6B7280",
          lineHeight: 1.65,
        }}
      >
        {impact.description}
      </div>
      {impact.example && (
        <div
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            marginTop: 8,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          {impact.example}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="top"
      overlayStyle={{ maxWidth: 300 }}
      overlayInnerStyle={{
        padding: "10px 14px",
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: 5,
          cursor: "help",
          color: "#D1D5DB",
          flexShrink: 0,
          verticalAlign: "middle",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#D1D5DB")
        }
      >
        <Info size={13} />
      </span>
    </Popover>
  );
};

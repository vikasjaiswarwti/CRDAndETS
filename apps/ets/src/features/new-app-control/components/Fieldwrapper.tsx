// ============================================================
// FieldWrapper.tsx — Label + input slot + save indicator
//
// Keeps label and FieldSaveIndicator together so every field
// automatically displays its own per-field save state.
// ============================================================

import React from "react";
import { FieldSaveIndicator, type FieldSaveState } from "./Fieldsaveindicator";
import { FieldHelpPopover } from "./Fieldhelppopover";

interface FieldWrapperProps {
  label: string;
  children: React.ReactNode;
  saveState?: FieldSaveState;
  full?: boolean;
  fieldKey?: string;
}

const TEXT_LABEL = "#374151";

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  children,
  saveState = "idle",
  fieldKey,
}) => (
<div style={{display:"grid",gridTemplateColumns:"2fr 1fr"}}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: 13,
        fontWeight: 500,
        color: TEXT_LABEL,
        marginBottom: 8,
        gap: 0,
      }}
    >
      <span>{label}</span>

      {fieldKey && <FieldHelpPopover fieldKey={fieldKey} />}
      <FieldSaveIndicator state={saveState} />
    </div>
    {children}
  </div>
);

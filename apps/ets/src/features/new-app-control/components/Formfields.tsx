

// ============================================================
// FormFields.tsx — Reusable typed field primitives
//
// NumberField, SwitchField, SelectField
// Each accepts an onConfirmedChange callback that feeds into
// the confirmation workflow rather than calling API directly.
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { T } from "../../../styles/tokens";

const inputStyle={
   maxWidth: "100%",
}

const inputSx: React.CSSProperties = {
  ...inputStyle,
  height: 36,
  fontSize: 14,
  background:T.formcss.inputBg ,
  borderRadius: 8,
  border:`1px solid ${T.formcss.greyBorder}`
};

const selectSx: React.CSSProperties = {  ...inputStyle, fontSize: 14, background:T.formcss.inputBg };

// ── NumberField ───────────────────────────────────────────────────────────────
// Typing buffers locally. After 4 s of idle (timer resets on each keystroke),
// onConfirmedChange fires once with the final value — which opens the
// confirmation modal. This lets users type "10000" without triggering 5 modals.

const IDLE_MS = 4_000;

interface NumberFieldProps {
  value: number;
  min?: number;
  onConfirmedChange: (newVal: number) => void;
  Input: React.ComponentType<Record<string, unknown>>;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  value,
  min = 0,
  onConfirmedChange,
  Input,
}) => {
  // localStr: what the input actually shows while the user is typing
  const [localStr, setLocalStr] = useState<string>(String(value));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep display in sync when the parent value changes (e.g. after cancel/revert)
  useEffect(() => {
    setLocalStr(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalStr(raw); // show typed value immediately — no modal yet

    // Reset the idle timer on every keystroke
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const num = Number(raw);
      if (!isNaN(num)) onConfirmedChange(num); // fires modal after 4 s idle
    }, IDLE_MS);
  };

  // If user leaves the field (blur) before 4 s, fire immediately
  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const num = Number(localStr);
    if (!isNaN(num) && num !== value) onConfirmedChange(num);
  };

  return (
    <Input
      type="number"
      min={min}
      value={localStr}
      onChange={handleChange}
      onBlur={handleBlur}
      onWheel={(e: React.WheelEvent<HTMLInputElement>) =>
        e.currentTarget.blur()
      }
      size="small"
      style={inputSx}
    />
  );
};

// ── SwitchField ───────────────────────────────────────────────────────────────
interface SwitchFieldProps {
  checked: boolean;
  onConfirmedChange: (newVal: boolean) => void;
  Switch: React.ComponentType<Record<string, unknown>>;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  checked,
  onConfirmedChange,
  Switch,
}) => (
  <Switch
    checked={checked}
    onChange={(v: boolean) => onConfirmedChange(v)}
    size="small"
  />
);

// ── SelectField ───────────────────────────────────────────────────────────────
interface SelectFieldProps {
  value: unknown;
  options: { label: string; value: string | number }[];
  onConfirmedChange: (newVal: unknown) => void;
  Select: React.ComponentType<Record<string, unknown>>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  options,
  onConfirmedChange,
  Select,
}) => (
  <Select
    value={value}
    onChange={(v: unknown) => onConfirmedChange(v)}
    options={options}
    style={selectSx}
  />
);

// ── TextField ─────────────────────────────────────────────────────────────────
// Confirms on blur (like NumberField without the idle-timer typing buffer —
// free text doesn't need debounced commits the way numeric steppers do).
interface TextFieldProps {
  value: string;
  placeholder?: string;
  onConfirmedChange: (newVal: string) => void;
  Input: React.ComponentType<Record<string, unknown>>;
}

export const TextField: React.FC<TextFieldProps> = ({
  value,
  placeholder,
  onConfirmedChange,
  Input,
}) => {
  const [localStr, setLocalStr] = useState<string>(String(value));

  useEffect(() => {
    setLocalStr(String(value));
  }, [value]);

  const handleBlur = () => {
    if (localStr !== value) onConfirmedChange(localStr);
  };

  return (
    <Input
      value={localStr}
      placeholder={placeholder}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setLocalStr(e.target.value)
      }
      onBlur={handleBlur}
      size="small"
      style={inputSx}
    />
  );
};

// ── TimeField (plain input[type=time]) ────────────────────────────────────────
interface TimeFieldProps {
  value: string;
  onConfirmedChange: (newVal: string) => void;
  Input: React.ComponentType<Record<string, unknown>>;
}

export const TimeField: React.FC<TimeFieldProps> = ({
  value,
  onConfirmedChange,
  Input,
}) => (
  <Input
    type="time"
    value={value}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      onConfirmedChange(e.target.value)
    }
    size="small"
    style={inputSx}
  />
);

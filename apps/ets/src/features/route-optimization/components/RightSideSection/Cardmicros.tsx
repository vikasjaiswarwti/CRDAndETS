// ─── components/CardMicros.tsx ────────────────────────────────────────────────
// Tiny reusable primitives used across RouteStackCard sub-components.
// Each is intentionally dumb — no side-effects, no hooks, pure render.
//
// Exports:
//   Dot   — 8 px colored circle with hover popover (female / guard / special)
//   Stat  — label+value cell, optionally wrapped in a hover popover

import React from "react";
import { T } from "../../constants/designTokens";

// ─────────────────────────────────────────────────────────────────────────────
// Dot
//
// Props:
//   color   — CSS color string, e.g. "#EC4899"
//   tooltip — any ReactNode shown inside the hover popover
//   Popover — the Popover component from useUILibrary() (passed as prop so
//             this file has no hook dependencies)
// ─────────────────────────────────────────────────────────────────────────────

interface DotProps {
  color: string;
  tooltip: React.ReactNode;
  Popover: React.ComponentType<any>;
}

export function Dot({ color, tooltip, Popover }: DotProps) {
  return (
    <Popover content={tooltip} trigger="hover" title={null} placement="top">
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          cursor: "help",
          boxShadow: `0 0 0 2px ${color}33`,
        }}
      />
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat
//
// Props:
//   label   — small muted label below the value (e.g. "Duration")
//   value   — the formatted value string (e.g. "42 min")
//   accent  — if true, value is rendered in primary text color (first col)
//   tooltip — if provided the cell becomes hoverable and shows this popover
//   Popover — required when tooltip is set
// ─────────────────────────────────────────────────────────────────────────────

interface StatProps {
  label: string;
  value: string;
  accent?: boolean;
  tooltip?: React.ReactNode;
  Popover?: React.ComponentType<any>;
}

export function Stat({ label, value, accent, tooltip, Popover }: StatProps) {
  const inner = (
    <div style={{ cursor: tooltip ? "help" : undefined }}>
      <div
        style={{
          fontSize: T.fontXs,
          fontWeight: 800,
          color: accent ? T.text : T.textSm,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 9,
          color: T.muted,
          marginTop: 1,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );

  if (tooltip && Popover) {
    return (
      <Popover content={tooltip} trigger="hover" title={null} placement="top">
        {inner}
      </Popover>
    );
  }

  return inner;
}

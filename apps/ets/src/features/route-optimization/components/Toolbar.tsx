// ─── components/Toolbar.tsx ───────────────────────────────────────────────────
// Top navigation bar. Static — no props needed.

import { T } from "../constants/designTokens";
import {
  IcBack,
  IcCal,
  IcBell,
  IcChevron,
  IcMerge,
  IcRearrange,
} from "../assets/icons/RouteMakerIcons";

export default function Toolbar() {
  return (
    <div
      style={{
        // height: T.toolbarH,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* ── Left: back + title + date + logout ── */}
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.textSub,
          padding: "4px 6px",
        }}
      >
        <IcBack />
      </button>

      <span
        style={{ fontSize: 15, fontWeight: 700, color: T.text, marginRight: 8 }}
      >
        Route Maker
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: "5px 10px",
          fontSize: 12,
          color: T.textSub,
          background: T.surfaceAlt,
        }}
      >
        <IcCal /> 12/05/2026, 17:30
      </div>

      <button
        style={{
          marginLeft: 2,
          padding: "5px 12px",
          fontSize: 12,
          color: T.danger,
          border: `1px solid ${T.danger}20`,
          borderRadius: 5,
          background: `${T.danger}08`,
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <div style={{ flex: 1 }} />

      {/* ── Right: action buttons ── */}
      <button
        style={{
          padding: "6px 14px",
          fontSize: 12.5,
          fontWeight: 600,
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        New Route
      </button>

      {(
        [
          { label: "Merge", Icon: IcMerge },
          { label: "Rearrange", Icon: IcRearrange },
        ] as const
      ).map(({ label, Icon }) => (
        <button
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 11px",
            fontSize: 12,
            fontWeight: 500,
            border: `1.5px solid ${T.border}`,
            borderRadius: 6,
            background: T.surface,
            color: T.text,
            cursor: "pointer",
          }}
        >
          <Icon /> {label}
        </button>
      ))}

      {/* ── Divider ── */}
      <div
        style={{ width: 1, height: 22, background: T.border, margin: "0 4px" }}
      />

      {/* ── Bell ── */}
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.textSub,
          position: "relative",
        }}
      >
        <IcBell />
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 7,
            height: 7,
            background: T.danger,
            borderRadius: "50%",
            border: "1.5px solid white",
          }}
        />
      </button>

      {/* ── Avatar ── */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          // background: T.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        AM
      </div>
      <IcChevron />
    </div>
  );
}

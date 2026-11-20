// ─── components/CardKebabMenu.tsx ─────────────────────────────────────────────
// Content rendered inside the ⋯ (kebab) popover on each RouteStackCard.
// Owns NO state — all stateful values come from props.
//
// Three actions:
//   Pin / Unpin   — toggle route pinned status
//   Flag / Unflag — toggle flagged status (shows spinner while loading)
//   Approve       — toggle approval status (shows spinner while loading)
//
// Usage:
//   <Popover
//     content={<CardKebabMenu {...props} onClose={() => setKebabOpen(false)} />}
//     open={kebabOpen}
//     onOpenChange={setKebabOpen}
//   >
//     <KebabTriggerButton />
//   </Popover>

import { T } from "../../constants/designTokens";
import Icon from "../Icon";
import PinnedEmpty from "../../assets/icons/pinEmpty.svg";
import Pinned from "../../assets/icons/pinned.svg";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  isPinned: boolean;
  isFlagged: boolean;
  isApproved: boolean;
  isFlagLoading: boolean;
  isApproveLoading: boolean;
  onPin?: () => void;
  onFlag: () => void;
  onApprove: () => void;
  /** Called after any action so the parent can close the popover */
  onClose: () => void;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: `2px solid ${color}55`,
        borderTopColor: color,
        display: "inline-block",
        animation: "rmSpin 0.8s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CardKebabMenu({
  isPinned,
  isFlagged,
  isApproved,
  isFlagLoading,
  isApproveLoading,
  onPin,
  onFlag,
  onApprove,
  onClose,
}: Props) {
  function act(fn: () => void) {
    fn();
    onClose();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 148,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Pin ── */}
      <button
        onClick={() => act(() => onPin?.())}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "7px 10px",
          borderRadius: T.radiusSm,
          textAlign: "left",
          border: isPinned ? `1px solid ${T.border}` : "1px solid transparent",
          background: isPinned ? T.accentBg : "transparent",
          color: isPinned ? T.accent : T.text,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <Icon src={isPinned ? Pinned : PinnedEmpty} size={12} />
        {isPinned ? "Unpin" : "Pin trip"}
      </button>

      {/* ── Flag ── */}
      <button
        onClick={() => act(onFlag)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "7px 10px",
          borderRadius: T.radiusSm,
          textAlign: "left",
          border: isFlagged
            ? `1px solid ${T.flagColor}33`
            : "1px solid transparent",
          background: isFlagged ? "#FEF2F2" : "transparent",
          color: isFlagged ? T.flagColor : T.text,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {isFlagLoading ? (
          <Spinner color="#F59E0B" />
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={isFlagged ? T.flagColor : "none"}
            stroke={isFlagged ? T.flagColor : "currentColor"}
            strokeWidth="2"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        )}
        {isFlagged ? "Unflag" : "Flag trip"}
      </button>

      {/* ── Approve ── */}
      <button
        onClick={() => act(onApprove)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "7px 10px",
          borderRadius: T.radiusSm,
          textAlign: "left",
          border: isApproved ? "1px solid #86EFAC" : "1px solid transparent",
          background: isApproved ? "#F0FDF4" : "transparent",
          color: isApproved ? "#16A34A" : T.text,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {isApproveLoading ? (
          <Spinner color="#22C55E" />
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isApproved ? "#16A34A" : "currentColor"}
            strokeWidth="2.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        {isApproved ? "Revoke approval" : "Approve trip"}
      </button>
    </div>
  );
}

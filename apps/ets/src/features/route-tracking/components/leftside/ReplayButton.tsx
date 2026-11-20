// ============================================================
// components/ReplayButton.tsx
// ============================================================

import React from "react";
import type { ReplayButtonProps } from "../../types/tracking.types";
import { colors } from "../../style/styles";
import {
  toggleReplay,
  // setReplay,
  // resetRouteTrackingUi,
} from "../../slice/routeTrackingSlice";
import { useSelector, useDispatch } from "react-redux";

const ReplayButton: React.FC<ReplayButtonProps> = () => {
  const dispatch = useDispatch();
  const { isReplayPlaying } = useSelector((s: any) => s.routeTrackingUi);

  const handleClick = () => {
    dispatch(toggleReplay());
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 8px",
        gap: 10,

        width: "fit-content",
        // height: 48,

        background: isReplayPlaying
          ? "linear-gradient(135deg, #0f172a, #334155)"
          : `linear-gradient(135deg, ${colors.brandGreen}, #059669)`,

        color: "#fff",
        border: "none",
        borderRadius: 12,

        fontSize: 12,
        fontWeight: 600,

        cursor: "pointer",
        transition: "all 0.2s ease",

        boxShadow: isReplayPlaying
          ? "0 4px 12px rgba(15,23,42,.25)"
          : "0 4px 12px rgba(22,163,74,.25)",
      }}
    >
      <span style={{ fontSize: 14 }}>{isReplayPlaying ? "⏸" : "▶"}</span>

      {isReplayPlaying ? "Close Replay" : "Trip Replay"}
    </button>
  );
};

export default ReplayButton;

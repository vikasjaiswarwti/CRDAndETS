import React, { useState } from "react";
import type { VehicleRoute, Passenger } from "../types/Routemaker.types";
import { T } from "../constants/designTokens";

interface Props {
  route: VehicleRoute;
  color: string;
  maxVisible?: number; // how many chips to show before "+N more"
}

export const PassengerNamesPreview: React.FC<Props> = ({
  route,
  color,
  maxVisible = 4,
}) => {
  const [expanded, setExpanded] = useState(false);

  const sorted: Passenger[] = [...(route.Passengers ?? [])].sort(
    (a, b) => a.PickupSequence - b.PickupSequence,
  );

  if (sorted.length === 0) return null;

  const visible = expanded ? sorted : sorted.slice(0, maxVisible);
  const hiddenCount = sorted.length - visible.length;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        paddingTop: 6,
        marginTop: 6,
        borderTop: `1px dashed ${T.border}`,
      }}
    >
      {visible.map((p) => {
        const isFemale = p.Gender === "F";
        const badgeBg = isFemale ? "#EC4899" : color;
        const chipBg = isFemale ? "#FDF2F8" : `${color}12`;
        const chipBorder = isFemale ? "#F9A8D4" : `${color}33`;
        const chipText = isFemale ? "#9D174D" : T.text;

        return (
          <span
            key={p.Id}
            title={p.Firstname}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              maxWidth: 115,
              padding: "2px 6px",
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 600,
              background: chipBg,
              border: `1px solid ${chipBorder}`,
              color: chipText,
              overflow: "hidden",
            }}
          >
            {/* Sequence badge */}
            <span
              style={{
                width: 13,
                height: 13,
                flexShrink: 0,
                borderRadius: "50%",
                background: badgeBg,
                color: "#fff",
                fontSize: 7,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p.PickupSequence}
            </span>

            {/* Gender glyph */}
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: badgeBg,
                flexShrink: 0,
              }}
            >
              {isFemale ? "♀" : "♂"}
            </span>

            {/* Name */}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.Firstname}
            </span>
          </span>
        );
      })}

      {hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          style={{
            padding: "2px 8px",
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            background: "#F3F4F6",
            border: `1px solid ${T.border}`,
            color: T.muted,
            cursor: "pointer",
          }}
        >
          +{hiddenCount} more
        </button>
      )}

      {expanded && sorted.length > maxVisible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
          style={{
            padding: "2px 8px",
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            background: "#F3F4F6",
            border: `1px solid ${T.border}`,
            color: T.muted,
            cursor: "pointer",
          }}
        >
          Show less
        </button>
      )}
    </div>
  );
};

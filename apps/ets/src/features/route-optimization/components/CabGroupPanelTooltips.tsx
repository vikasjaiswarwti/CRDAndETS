// ─── components/CabGroupPanelTooltips.tsx ────────────────────────────────────
// Hover-Popover content for CabGroupPanel actions.
// Import `CAB_TOOLTIPS` in CabGroupPanel — nothing else needed.

import {
  GitMerge,
  ArrowUpDown,
  GripVertical,
  CheckSquare,
  LayoutList,
  MousePointerClick,
} from "lucide-react";

function Row({
  icon,
  label,
  sub,
  iconColor = "#6B7280",
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  sub?: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        padding: "4px 0",
        borderBottom: "1px solid #F9FAFB",
      }}
    >
      <span
        style={{
          color: iconColor,
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
        }}
      >
        {icon}
      </span>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 9,
              color: "#6B7280",
              marginTop: 1,
              lineHeight: 1.4,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function Wrap({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 210, padding: "1px 0" }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#9CA3AF",
          letterSpacing: "0.06em",
          marginBottom: 4,
          textTransform: "uppercase" as const,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Exported tooltip nodes ────────────────────────────────────────────────────

export const CAB_TOOLTIPS = {
  mergeCheckbox: (
    <Wrap title="Select for Merge">
      <Row
        icon={<CheckSquare size={11} />}
        iconColor="#10B981"
        label="Check to select this trip for merging"
        sub="Select exactly 2 trips to enable the Merge button at the top of the panel."
      />
      <Row
        icon={<GitMerge size={11} />}
        iconColor="#6366F1"
        label="Direct Merge"
        sub="Combines both trips into one optimised route automatically. Passengers are resequenced by the server."
      />
      <Row
        icon={<LayoutList size={11} />}
        iconColor="#F59E0B"
        label="Merge & Rearrange"
        sub="Merges the trips then opens the Rearrange drawer so you can manually set the pickup order before saving."
      />
    </Wrap>
  ),

  rearrange: (
    <Wrap title="Rearrange Stop Order">
      <Row
        icon={<ArrowUpDown size={11} />}
        iconColor="#6366F1"
        label="Manually reorder passenger stops"
        sub="Opens a full drawer where you can drag stops into your preferred pickup sequence and save the new order."
      />
      <Row
        icon={<MousePointerClick size={11} />}
        iconColor="#10B981"
        label="Changes are confirmed on Save"
        sub="Nothing is applied until you click Save Order inside the drawer. Cancel to discard."
      />
    </Wrap>
  ),

  dragDrop: (
    <Wrap title="Drag & Drop Passenger">
      <Row
        icon={<GripVertical size={11} />}
        iconColor="#6B7280"
        label="Drag a passenger to another trip"
        sub="Grab the drag handle and drop onto any trip card in the Route Stack (right panel) or another group here."
      />
      <Row
        icon={<GitMerge size={11} />}
        iconColor="#6366F1"
        label="Drop confirms a Move or Merge"
        sub="A dialog appears: choose Move Only (keeps source trip) or Merge & Rearrange (merges both trips)."
      />
      <Row
        icon={<CheckSquare size={11} />}
        iconColor="#F59E0B"
        label="Single-passenger trips auto-merge"
        sub="If the source trip has only 1 passenger, dropping will always trigger a merge — the empty trip is removed."
      />
    </Wrap>
  ),
};

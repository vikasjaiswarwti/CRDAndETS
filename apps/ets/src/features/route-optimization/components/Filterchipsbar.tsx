import React, { useRef } from "react";

const T = {
  bg: "#F5F6FA",
  panel: "#FFFFFF",
  card: "#FFFFFF",
  cardHover: "#F8FAFC",
  text: "#1A202C",
  muted: "#6B7280",
  subtle: "#9CA3AF",
  accent: "#16A34A",
  accentBg: "#F0FDF4",
  accentHover: "#15803D",
  success: "#16A34A",
  successBg: "#DCFCE7",
  warn: "#D97706",
  warnBg: "#FEF3C7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.07)",
  shadowLg: "0 10px 15px rgba(0,0,0,0.08)",
  radius: 10,
  radiusSm: 6,
  radiusLg: 14,
  headerH: 56,
  statsH: 52,
  sidebarW: 260,
  routeStackW: 380,
  shimmerBase: "#F1F5F9",
  shimmerHighlight: "#E2E8F0",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteFilters {
  guardTrip: boolean;
  singleEmployee: boolean;
  vendorAssigned: boolean;
  vehicleAssigned: boolean;
  femaleFilter?: "single" | "all";
  specialNeeds: boolean;
  sortBy?: "extraKm" | "employeeCount" | "distance";
  sortDir?: "asc" | "desc";
}

interface FilterChip {
  key: keyof RouteFilters;
  label: string;
  sub?: string;
}

export interface FilterChipsBarProps {
  filters: RouteFilters;
  onRemove: (key: keyof RouteFilters) => void;
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SORT_LABELS: Record<NonNullable<RouteFilters["sortBy"]>, string> = {
  extraKm: "Extra KM",
  employeeCount: "Employee Count",
  distance: "Distance",
};

function computeChips(filters: RouteFilters): FilterChip[] {
  console.log("filters forom chipse section", filters);

  const chips: FilterChip[] = [];

  if (filters.guardTrip) {
    chips.push({ key: "guardTrip", label: "Guard Trip" });
  }
  if (filters.singleEmployee) {
    chips.push({ key: "singleEmployee", label: "Single Employee" });
  }
  // if (filters.vendorAssigned) {
  //   chips.push({ key: "vendorAssigned", label: "Vendor unAssigned" });
  // }
  if (filters.vehicleAssigned) {
    chips.push({ key: "vehicleAssigned", label: "Vehicle Assigned" });
  }
  if (filters.femaleFilter === "single") {
    chips.push({ key: "femaleFilter", label: "Female Only" });
  }
  if (filters.specialNeeds) {
    chips.push({ key: "specialNeeds", label: "Special Needs" });
  }
  if (filters.sortBy) {
    const dirArrow = filters.sortDir === "desc" ? " ↓" : " ↑";
    chips.push({
      key: "sortBy",
      label: `${SORT_LABELS[filters.sortBy]}${dirArrow}`,
    });
  }

  return chips;
}

// ─── Chip component ───────────────────────────────────────────────────────────

interface ChipProps {
  chip: FilterChip;
  onRemove: () => void;
}

const Chip: React.FC<ChipProps> = ({ chip, onRemove }) => {
  const [hovered, setHovered] = React.useState(false);
  const [btnHovered, setBtnHovered] = React.useState(false);

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 6,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: T.radiusSm,
    background: hovered ? "#E6F9EE" : T.accentBg,
    border: `1px solid ${T.accent}`,
    color: T.accent,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
    cursor: "default",
    transition: "background 0.15s",
    userSelect: "none",
  };

  const removeButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "none",
    background: btnHovered ? T.accent : "transparent",
    color: btnHovered ? "#ffffff" : T.accent,
    cursor: "pointer",
    padding: 0,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1,
    flexShrink: 0,
    transition: "background 0.15s, color 0.15s",
  };

  return (
    <span
      style={chipStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {chip.label}
      {chip.sub && (
        <span style={{ opacity: 0.75, fontSize: 11 }}>{chip.sub}</span>
      )}
      <button
        style={removeButtonStyle}
        onClick={onRemove}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        aria-label={`Remove filter: ${chip.label}`}
        type="button"
      >
        ×
      </button>
    </span>
  );
};

// ─── FilterChipsBar ───────────────────────────────────────────────────────────

export const FilterChipsBar: React.FC<FilterChipsBarProps> = ({
  filters,
  onRemove,
  count,
}) => {
  if (count === 0) return null;

  const chips = computeChips(filters);

  const barStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 2,
    // Hide scrollbar cross-browser
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: T.accent,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
    padding: "0 5px",
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: T.muted,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  // Stable ID for scoped webkit scrollbar CSS — useRef ensures it never changes between renders
  const scrollIdRef = useRef(
    `filter-chips-bar-${Math.random().toString(36).slice(2, 7)}`,
  );
  const scrollId = scrollIdRef.current;

  return (
    <>
      {/* Scrollbar hiding — use data-id scoped style, no className */}
      <style>{`[data-chips-bar-id="${scrollId}"]::-webkit-scrollbar { display: none; }`}</style>
      <div
        data-chips-bar-id={scrollId}
        style={barStyle}
        role="list"
        aria-label="Active filters"
      >
        <span style={labelStyle}>Filters</span>
        <span style={badgeStyle}>{count}</span>
        {chips.map((chip) => (
          <span key={chip.key} role="listitem">
            <Chip chip={chip} onRemove={() => onRemove(chip.key)} />
          </span>
        ))}
      </div>
    </>
  );
};

export default FilterChipsBar;

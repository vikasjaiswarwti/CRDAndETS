// src/features/route-maker/components/ActiveFilterChips.tsx
//
// Removable chip strip for all currently active filters + current sort.
//
// BUGS FIXED vs previous version:
//   • T.accentBorder does not exist in the token map → changed to T.successBorder
//   • `return;` (returning undefined) → changed to `return null` (valid React)
//   • Sort chip was never shown because filters.sortBy is always undefined when
//     the SortDropdown drives sortField/sortDir as separate props →
//     now accepts sortField + sortDir as optional props and builds the chip itself
//   • "Clear all" only showed when chips.length > 1 → now shows for any chip count

import { T } from "../constants/designTokens";
import type { RouteFilters } from "../types/Routemaker.types";
import type { SortField, SortDir } from "../DropDowns/Sortdropdown";

// ---------------------------------------------------------------------------
// Internal chip descriptor
// ---------------------------------------------------------------------------

interface Chip {
  key: keyof RouteFilters | "sort";
  label: string;
}

// Human-readable sort-field labels
const SORT_LABELS: Partial<Record<SortField, string>> = {
  radial: "Radial",
  distance: "Distance",
  duration: "Duration",
  efficiency: "Efficiency",
  passengers: "Passengers",
  departure: "Departure",
};

// Human-readable filter labels (matches RouteFilters keys)

function buildChips(
  f: RouteFilters,
  sortField?: SortField,
  sortDir?: SortDir,
): Chip[] {
  const chips: Chip[] = [];

  // Boolean filter flags

  if (f.guardTrip) chips.push({ key: "guardTrip", label: "Guard Trip" });

  if (f.singleEmployee)
    chips.push({ key: "singleEmployee", label: "Single Employee" });

  // if (f.vendorAssigned == true) {
  //   chips.push({ key: "vendorAssigned", label: "Vendor Assigned" });
  // } else if (f.vendorAssigned == false) {
  //   chips.push({ key: "vendorAssigned", label: "Vendor Unassigned" });
  // }

  if (f.vehicleAssigned == true) {
    chips.push({ key: "vehicleAssigned", label: "Vehicle Assigned" });
  } else if (f.vehicleAssigned == false) {
    chips.push({ key: "vehicleAssigned", label: "Vehicle Unassigned" });
  }

  if (f.femaleFilter) chips.push({ key: "femaleFilter", label: "Female Only" });

  if (f.specialNeeds)
    chips.push({ key: "specialNeeds", label: "Special Needs" });

  if (f.flagTrip) chips.push({ key: "flagTrip", label: "Flagged Trips" });

  // Sort chip — driven by the sortField/sortDir props (not by filters.sortBy)
  // "radial" is the default; don't show a chip for it.
  if (sortField && sortField !== "radial") {
    const label = SORT_LABELS[sortField] ?? sortField;
    const dir = sortDir === "desc" ? "↓" : "↑";
    chips.push({ key: "sort", label: `${label} ${dir}` });
  }

  // Legacy: also handle filters.sortBy if it was set by an older code path
  if (!sortField && f.sortBy) {
    const legacyLabels: Record<string, string> = {
      extraKm: "Extra KM",
      employeeCount: "Employee Count",
      distance: "Distance",
    };
    const dir = f.sortDir === "desc" ? "↓" : "↑";
    chips.push({
      key: "sort",
      label: `${legacyLabels[f.sortBy] ?? f.sortBy} ${dir}`,
    });
  }

  return chips;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  filters: RouteFilters;
  onRemove: (key: Chip["key"]) => void;
  onClearAll?: () => void;
  /** Pass the panel's sortField so the sort chip is always visible */
  sortField?: SortField;
  /** Pass the panel's sortDir so the direction arrow is correct */
  sortDir?: SortDir;
  /** Called when the sort chip × is clicked; should reset sort to default */
  onRemoveSort?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
  sortField,
  sortDir,
  onRemoveSort,
}: Props) {
  // console.log("🔍 ActiveFilterChips Debug:", {
  //   filters,
  //   sortField,
  //   sortDir,
  //   hasFilters: !!filters,
  // });

  // Guard — returning null is the correct React no-render signal
  if (!filters) return "null";

  // Nothing active → render nothing (no empty bar)
  if (!filters)
    return <div style={{ color: "red" }}>Filters prop is null/undefined</div>;

  const chips = buildChips(filters, sortField, sortDir);

  // console.log("Built chips:", chips);

  if (chips.length === 0) {
    return (
      // <div style={{ padding: "6px", color: "#888", fontSize: "10px" }}>
      //   No active filters, By default all data is shown of today.
      // </div>
      <></>
    );
  }

  const handleRemove = (key: Chip["key"]) => {
    if (key === "sort") {
      onRemoveSort?.(); // caller resets sortField to "radial"
    } else {
      onRemove(key);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        flexWrap: "wrap",
        padding: "6px 12px 8px",
        borderBottom: `1px solid ${T.border}`,
        background: T.panel,
        // minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* "Filters:" label */}
      <span
        style={{
          fontSize: T.fontXs,
          color: T.muted,
          fontWeight: 600,
          flexShrink: 0,
          letterSpacing: "0.02em",
        }}
      >
        Filters:
      </span>

      {/* Chips */}
      {chips.map((chip) => (
        <span
          key={chip.key}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            borderRadius: T.radiusFull,
            // ← FIXED: T.accentBorder does not exist; use T.successBorder ("#86EFAC")
            border: `1.5px solid ${T.successBorder}`,
            background: T.accentBg,
            color: T.accent,
            fontSize: T.fontXs,
            fontWeight: 600,
            cursor: "default",
            maxWidth: "100%",
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {/* chip label */}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {chip.label}
          </span>

          {/* remove × */}
          <button
            onClick={() => handleRemove(chip.key)}
            title={`Remove "${chip.label}" filter`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 1px",
              color: T.accent,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              opacity: 0.8,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
            }}
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}

      {/* Clear all — visible whenever there is at least 1 chip */}
      {onClearAll && (
        <button
          onClick={onClearAll}
          title="Clear all active filters"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: T.fontXs,
            color: T.muted,
            fontWeight: 500,
            padding: "2px 4px",
            borderRadius: T.radiusSm,
            textDecoration: "underline",
            textDecorationColor: T.border,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = T.danger;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = T.muted;
          }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

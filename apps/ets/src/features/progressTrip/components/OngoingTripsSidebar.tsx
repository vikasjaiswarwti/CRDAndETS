import React, { useState, useMemo } from "react";
import type { TripTrackingPacket } from "../types/progressTrip.types";
// import { getTripColor } from "../utils/commonFunction";
import { ChevronDown, Search } from "lucide-react";
import TripCard from "./TripCard";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

interface OngoingTripsSidebarProps {
  trips: TripTrackingPacket[];
  selectedDsIds: number[];
  onSelectionChange: (dsIds: number[]) => void;
  onViewEmployees: (trip: TripTrackingPacket) => void;
  // refetch: () => void;
  isLoading: boolean;
}

const OngoingTripsSidebar: React.FC<OngoingTripsSidebarProps> = ({
  trips,
  selectedDsIds,
  onSelectionChange,
  onViewEmployees,
  // refetch = () => {},
  isLoading = false,
}) => {
  const isMobile=useIsMobile();
  const [search, setSearch] = useState("");
  const [groupOpen, setGroupOpen] = useState(true);

  const filtered = useMemo(
    () =>
      (trips ?? []).filter(
        (t) =>
          !search ||
          String(t.dsId).includes(search) ||
          t.vehicleNo?.toLowerCase().includes(search.toLowerCase()),
      ),
    [trips, search],
  );

  const allFilteredSelected = filtered.every((t) =>
    selectedDsIds.includes(t.dsId),
  );
  const someFilteredSelected = filtered.some((t) =>
    selectedDsIds.includes(t.dsId),
  );

  const handleGroupCheck = () => {
    if (allFilteredSelected) {
      onSelectionChange(
        selectedDsIds.filter((id) => !filtered.find((t) => t.dsId === id)),
      );
    } else {
      const newIds = new Set([
        ...selectedDsIds,
        ...filtered.map((t) => t.dsId),
      ]);
      onSelectionChange(Array.from(newIds));
    }
  };

  const handleTripCheck = (trip: TripTrackingPacket) => {
    if (selectedDsIds.includes(trip.dsId)) {
      onSelectionChange(selectedDsIds.filter((id) => id !== trip.dsId));
    } else {
      onSelectionChange([...selectedDsIds, trip.dsId]);
    }
  };

  return (
    <div
      style={{ ...styles.sidebar, ...(isMobile ? styles.sidebarMobile : {}) }}
    >
      <div style={styles.topBar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>
            <Search size={14} />
          </span>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by Trip Id & Vehicle No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          ...styles.body,
          ...(isMobile ? styles.bodyMobile : {}),
        }}
      >
        <div style={styles.groupHeader} onClick={() => setGroupOpen((o) => !o)}>
          <input
            type="checkbox"
            checked={allFilteredSelected && filtered.length > 0}
            ref={(el) => {
              if (el)
                el.indeterminate = someFilteredSelected && !allFilteredSelected;
            }}
            onChange={(e) => {
              e.stopPropagation();
              handleGroupCheck();
            }}
            style={styles.checkbox}
            onClick={(e) => e.stopPropagation()}
          />
          <span style={styles.groupLabel}>
            All
            {selectedDsIds.length > 0 && (
              <span style={styles.groupCount}>{selectedDsIds.length}</span>
            )}
          </span>
          <span
            style={{
              ...styles.chevron,
              transform: groupOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={14} />
          </span>
        </div>

        <div
          className="flex flex-col gap-3"
          style={{
            ...styles.scrollArea,
            ...(isMobile ? styles.scrollAreaMobile : {}),
          }}
        >
          {isLoading ? (
            // Render 4 skeleton cards while loading
            Array.from({ length: 4 }).map((_, idx) => (
              <TripCardSkeleton key={idx} />
            ))
          ) : (
            <>
              {groupOpen &&
                filtered.map((trip) => (
                  <TripCard
                    key={trip.dsId}
                    trip={trip}
                    isSelected={selectedDsIds.includes(trip.dsId)}
                    onToggle={() => handleTripCheck(trip)}
                    onViewEmployees={() => onViewEmployees(trip)}
                  />
                ))}
            </>
          )}
        </div>
        {groupOpen && filtered.length === 0 && (
          <div style={styles.empty}>No trips found</div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 360,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRight: "0.5px solid var(--border, #e5e5e3)",
    overflow: "hidden",
    fontFamily: "var(--font-sans, 'Inter', sans-serif)",
  },
  // ✅ mobile overrides: full width, no right border (it's inside a bottom drawer, not a side column)
  sidebarMobile: {
    width: "100%",
    borderRight: "none",
  },
  topBar: {
    padding: "10px 12px",
    borderBottom: "0.5px solid var(--border, #e5e5e3)",
    flexShrink: 0,
  },
  searchWrap: { position: "relative" },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    pointerEvents: "none",
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    paddingInline: 10,
    overflow: "hidden",
  },
  bodyMobile: {
    paddingInline: 12,
  },
  searchInput: {
    width: "100%",
    padding: "8px 10px 8px 34px",
    border: "0.5px solid var(--border, #e5e5e3)",
    borderRadius: 8,
    fontSize: 13,
    background: "var(--surface-2, #fff)",
    color: "var(--text-primary)",
    outline: "none",
  },
  scrollArea: {
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: 4,
  },
  // ✅ inside a bottom drawer the container height is already constrained
  // (e.g. Drawer height="70%"), so cap by parent flex instead of vh
  scrollAreaMobile: {
    maxHeight: "none",
    paddingBottom: 16,
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    cursor: "pointer",
    borderBottom: "0.5px solid var(--border, #e5e5e3)",
    userSelect: "none",
    background: "var(--surface-1)",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  groupCount: {
    fontSize: 11,
    fontWeight: 600,
    background: "#1677ff",
    color: "#fff",
    borderRadius: 10,
    padding: "1px 7px",
  },
  chevron: {
    fontSize: 18,
    color: "var(--text-muted)",
    transition: "transform 0.2s",
    lineHeight: 1,
  },
  checkbox: {
    width: 14,
    height: 14,
    marginRight: 2,
    cursor: "pointer",
  },
  empty: {
    padding: "20px 16px",
    fontSize: 13,
    color: "var(--text-muted)",
    textAlign: "center",
  },
};

export default OngoingTripsSidebar;

// Simple local Skeleton component mimicking TripCard
const TripCardSkeleton = () => (
  <div style={styles.skeletonCard}>
    <div style={styles.skeletonCheckbox} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ ...styles.skeletonText, width: "60%", height: 16 }} />
      <div style={{ ...styles.skeletonText, width: "40%", height: 12 }} />
    </div>
  </div>
);

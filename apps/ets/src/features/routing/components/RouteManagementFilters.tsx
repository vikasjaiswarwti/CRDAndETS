import { memo, useState } from "react";
import dayjs from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { SHIFT_TYPE_OPTIONS } from "../constants/RouteConstants";
import type { RouteManagementFilterState } from "../types/RouteTypes";
import { RM_COLOR, RM_FONT, RM_RADIUS, RM_FilterLabel } from "../Routeuiconfig";
import { Select } from "../../../shared/components/ui/Select";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useDispatch } from "react-redux";
import { AdhocModal } from "../Modals/AdhocModal";
import { routeManagementApi } from "../services/RouteManagementApi";
import { T } from "../../../styles/tokens";

interface RouteManagementFiltersProps {
  officeOptions: { value: string; label: string | any }[];
  filters: RouteManagementFilterState;
  onOfficeChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onShiftTypeChange: (val: number) => void;
}

// ── Desktop-only segment control (unchanged) ──────────────────────────────────
interface SegmentProps {
  options: { value: number; label: string }[];
  value: number;
  onChange: (val: number) => void;
}

const Segment = memo(function Segment({
  options,
  value,
  onChange,
}: SegmentProps) {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: RM_RADIUS.card,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {options.map((opt, i) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "6px 16px",
              fontSize: RM_FONT.sm,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fff" : "#374151",
              background: isActive ? RM_COLOR.green600 : "#fff",
              border: "none",
              borderLeft: i > 0 ? "1px solid #E5E7EB" : "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

// ── Filter icon SVG ───────────────────────────────────────────────────────────
function FilterIcon({ color = "#374151" }: { color?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

// ── Shift type select options for the drawer ──────────────────────────────────
const shiftSelectOptions = SHIFT_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

// ── Main component ────────────────────────────────────────────────────────────
export const RouteManagementFilters = memo(function RouteManagementFilters({
  officeOptions,
  filters,
  onOfficeChange,
  onDateChange,
  onShiftTypeChange,
}: RouteManagementFiltersProps) {
  const { DatePicker } = useUILibrary();
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adhocOpen, setAdhocOpen] = useState(false);

  // Drawer-local draft state — only committed on "Apply"
  const [draftDate, setDraftDate] = useState(filters.date);
  const [draftShift, setDraftShift] = useState(filters.shiftType);

  // const { locationOptions } = useLookups({ only: ["locationOptions"] });
  // const officeOptions = locationOptions.map((o) => ({
  //   value: String(o.value),
  //   label: o.label,
  // }));

  // Active filter count (shift + date vs today)
  const activeCount = [
    filters.shiftType !== 0,
    !!filters.date && filters.date !== dayjs().format("YYYY-MM-DD"),
  ].filter(Boolean).length;

  const openDrawer = () => {
    // Sync draft with current committed filters when opening
    setDraftDate(filters.date);
    setDraftShift(filters.shiftType);
    setDrawerOpen(true);
  };

  const handleApply = () => {
    onDateChange(draftDate || dayjs().format("YYYY-MM-DD"));
    onShiftTypeChange(draftShift);
    setDrawerOpen(false);
  };

  const handleClearAll = () => {
    setDraftDate(dayjs().format("YYYY-MM-DD"));
    setDraftShift(0);
    onDateChange(dayjs().format("YYYY-MM-DD"));
    onShiftTypeChange(0);
    setDrawerOpen(false);
  };

  // ── MOBILE ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    // Build human-readable description from COMMITTED filters (reads from `filters`, not draft).
    // This only updates after the user taps "Apply Filters" in the drawer.
    const committedOfficeLabel =
      officeOptions.find((o) => o.value === String(filters.officeId))?.label ??
      "";
    const committedShiftLabel =
      filters.shiftType === 1
        ? "Login Shift"
        : filters.shiftType === 2
          ? "Logout Shift"
          : "All Shifts";
    const committedDateLabel = dayjs(
      filters.date || dayjs().format("YYYY-MM-DD"),
      "YYYY-MM-DD",
    ).format("DD MMM YYYY");
    // Only show when an office is selected — otherwise nothing meaningful to describe
    const appliedDesc = committedOfficeLabel
      ? `${committedShiftLabel} · ${committedDateLabel} · ${committedOfficeLabel}`
      : "";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* ── Office row with filter icon ──────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Office select — flex 1, no label */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Select
              style={{ width: "100%" }}
              placeholder="Select office"
              autoSelectFirst
              value={filters.officeId || undefined}
              onChange={(v: string | number) => onOfficeChange(String(v))}
              options={officeOptions}
              showSearch
              filterOption={(input: string, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>

          {/* Filter icon button with badge */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={openDrawer}
              style={{
                width: 38,
                height: 38,
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                background: activeCount > 0 ? RM_COLOR.green600 : "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <FilterIcon color={activeCount > 0 ? "#fff" : "#374151"} />
            </button>

            {/* Badge */}
            {activeCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 99,
                  background: "#EF4444",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  border: "1.5px solid #fff",
                  lineHeight: 1,
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
        </div>

        {/* ── Applied filter description — only visible when office is set ─── */}
        {appliedDesc && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              paddingLeft: 2,
            }}
          >
            {/* Small dot indicator */}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: RM_COLOR.green600,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#64748B",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {appliedDesc}
            </span>
          </div>
        )}

        {/* ── Overlay ──────────────────────────────────────────────────── */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 900,
            }}
          />
        )}

        {/* ── Right-side filter drawer ──────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "82vw",
            maxWidth: 320,
            background: "#fff",
            zIndex: 901,
            display: "flex",
            flexDirection: "column",
            transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          }}
        >
          {/* Drawer header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              borderBottom: "1px solid #F3F4F6",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
              Filters
            </span>
            <button
              onClick={handleClearAll}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: RM_COLOR.green600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Clear All
            </button>
          </div>

          {/* Drawer body */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {/* Date */}
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Date
              </span>
              <DatePicker
                style={{ width: "100%" }}
                value={draftDate ? dayjs(draftDate, "YYYY-MM-DD") : dayjs()}
                defaultValue={dayjs()}
                format="DD/MM/YYYY"
                allowClear={false}
                onChange={(date) =>
                  setDraftDate(
                    date
                      ? date.format("YYYY-MM-DD")
                      : dayjs().format("YYYY-MM-DD"),
                  )
                }
              />
            </div>

            {/* Shift Type */}
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Shift Type
              </span>
              <Select
                style={{ width: "100%" }}
                value={draftShift}
                onChange={(v: string | number) => setDraftShift(Number(v))}
                options={shiftSelectOptions}
              />
            </div>
          </div>

          {/* Apply button — commits draft → Redux on tap */}
          <div
            style={{
              padding: "14px 18px",
              borderTop: "1px solid #F3F4F6",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleApply}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 10,
                background: RM_COLOR.green600,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
              onMouseDown={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")
              }
              onMouseUp={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
              }
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP (unchanged) ──────────────────────────────────────────────────────
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          background: "#fff",
          border: `1px solid ${RM_COLOR.gray100 ?? "#F3F4F6"}`,
          borderRadius: RM_RADIUS.card,
          padding: "10px 16px",
        }}
      >
        <span style={RM_FilterLabel}>Office</span>
        <Select
          style={{ width: "20%", background: T.formcss.inputBg  }}
          placeholder="Select office"
          autoSelectFirst
          value={filters.officeId || undefined}
          onChange={(v: string | number) => onOfficeChange(String(v))}
          options={officeOptions}
          showSearch
          filterOption={(input: string, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
        <span style={RM_FilterLabel}>Date</span>
        <DatePicker
          style={{ width: 150, background: T.formcss.inputBg, border: `1px solid ${T.formcss.greyBorder}` }}
          value={filters.date ? dayjs(filters.date, "YYYY-MM-DD") : dayjs()}
          defaultValue={dayjs()}
          format="DD/MM/YYYY"
          allowClear={false}
          onChange={(date) =>
            onDateChange(
              date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            )
          }
        />
        <span style={RM_FilterLabel}>Shift Type</span>
        <Segment
          options={SHIFT_TYPE_OPTIONS}
          value={filters.shiftType}
          onChange={onShiftTypeChange}
        />
        <button
          type="button"
          onClick={() => setAdhocOpen(true)}
          disabled={!filters.officeId}
          style={{
            marginLeft: "auto",
            padding: "6px 14px",
            fontSize: RM_FONT.md,
            fontWeight: 600,
            color: "#fff",
            background: RM_COLOR.green600,
            border: "none",
            borderRadius: RM_RADIUS.btn,
            cursor: filters.officeId ? "pointer" : "not-allowed",
            opacity: filters.officeId ? 1 : 0.5,
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          + Adhoc Trip
        </button>
      </div>

      {adhocOpen && (
        <AdhocModal
        officeOptions={officeOptions}
          open
          onClose={() => setAdhocOpen(false)}
          payload={{
            locCode: Number(filters.officeId) || 0,
            tripDate: filters.date,
            tripType: filters.shiftType || undefined,
          }}
          onSuccess={() =>
            // Refresh the dashboard so the new adhoc trip shows up
            dispatch(
              routeManagementApi.util.invalidateTags(["RouteManagement"]),
            )
          }
        />
      )}
    </div>
  );
});

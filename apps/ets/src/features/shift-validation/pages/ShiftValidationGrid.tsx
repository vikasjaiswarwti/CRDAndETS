// features/shift-validation/pages/ShiftValidationGrid.tsx
//
// Redesigned ShiftGrid:
//  - Groups flat shifts[] into 4 time bands (Morning / Afternoon / Evening / Night)
//  - flexWrap pill rows per band — no 10-column CSS grid
//  - min-width 72px pills, active = filled #1B4332, inactive = outlined #D1D5DB
//  - Select All checkbox removed from header (kept on page footer if needed)
//  - Same props interface — drop-in replacement

import React, { memo, useCallback, useMemo, type ReactNode } from "react";
import type { ShiftSlot } from "../types/shiftValidation.types";

import { Sunrise, Sun, Sunset, MoonStar } from "lucide-react";

// ── Props (unchanged) ─────────────────────────────────────────────────────────
interface ShiftGridProps {
  shifts: ShiftSlot[];
  accentColor: string;
  dotColor: string;
  title: string;
  onToggle: (shiftId: number) => void;
  onSelectAll: (checked: boolean) => void; // kept for API compat, not rendered in header
  readonly?: boolean;
  titleContent: ReactNode;
  pillBg: string;
}

const TIME_BANDS = [
  {
    label: "Morning",
    icon: Sunrise,
    from: "05:00",
    to: "11:59",
  },
  {
    label: "Afternoon",
    icon: Sun,
    from: "12:00",
    to: "17:59",
  },
  {
    label: "Evening",
    icon: Sunset,
    from: "18:00",
    to: "21:59",
  },
  {
    label: "Night",
    icon: MoonStar,
    from: "22:00",
    to: "04:59",
  },
] as const;

type BandLabel = (typeof TIME_BANDS)[number]["label"];

/** Parse HH:mm → total minutes since midnight */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function getBand(shiftTime: string): BandLabel {
  const mins = toMinutes(shiftTime);
  if (mins >= 22 * 60 || mins < 5 * 60) return "Night"; // 22:00–23:59 + 00:00–04:59
  if (mins < 12 * 60) return "Morning"; // 05:00–11:59
  if (mins < 18 * 60) return "Afternoon"; // 12:00–17:59
  if (mins < 22 * 60) return "Evening"; // 18:00–21:59
  return "Night"; // safety fallback
}

// ── Grid ──────────────────────────────────────────────────────────────────────
export const ShiftGrid = memo(
  ({
    shifts,
    onToggle,
    onSelectAll,
    readonly,
    titleContent,
    accentColor,
    dotColor,
    pillBg,
  }: ShiftGridProps) => {
    const activeCount = shifts.filter((s) => s.active).length;

    const allSelected = shifts.length > 0 && activeCount === shifts.length;

    // Group into bands preserving original order within each band
    const banded = useMemo<Record<BandLabel, ShiftSlot[]>>(() => {
      const map: Record<BandLabel, ShiftSlot[]> = {
        Morning: [],
        Afternoon: [],
        Evening: [],
        Night: [],
      };
      for (const slot of shifts) {
        map[getBand(slot.shiftTime)].push(slot);
      }
      // Night wraps midnight — sort 22:00+ before 00:00–04:59
      map.Night.sort((a, b) => {
        const toNightOrder = (t: string) => {
          const mins = toMinutes(t);
          return mins >= 22 * 60 ? mins - 22 * 60 : mins + 2 * 60; // 22:00=0, 23:59=119, 00:00=120, 04:59=419
        };
        return toNightOrder(a.shiftTime) - toNightOrder(b.shiftTime);
      });
      return map;
    }, [shifts]);

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            background: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          {/* Accent bar */}

          <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
            {titleContent}
          </span>
          {/* Active count badge */}
          <span
            style={{
              marginLeft: 10,
              fontSize: 11,
              fontWeight: 600,
              color: accentColor,
              background: `${pillBg}`,
              border: `1px solid ${accentColor}33`,
              padding: "1px 8px",
              borderRadius: 99,
              lineHeight: "18px",
            }}
          >
            {activeCount} / {shifts.length} active
          </span>

          {!readonly && shifts.length > 0 && (
            <button
              onClick={() => onSelectAll(!allSelected)}
              style={{
                marginLeft: "auto",
                padding: "4px 12px",
                borderRadius: 99,
                border: `1px solid ${allSelected ? "#D1D5DB" : accentColor}`,
                background: allSelected ? "#fff" : pillBg,
                color: allSelected ? "#6B7280" : accentColor,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                lineHeight: "18px",
                transition: "all 0.15s",
              }}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {/* ── Banded pill rows ── */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {TIME_BANDS.map(({ label, icon }) => {
            const slots = banded[label];
            if (!slots || slots.length === 0) return null;

            const Icon = icon;

            return (
              <div
                key={label}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                {/* Band label column */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                    width: 96,
                    paddingTop: 5,
                  }}
                >
                  <Icon size={16} strokeWidth={2} color="#64748B" />

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    {label}
                  </span>
                </div>

                {/* Pills */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px 6px",
                  }}
                >
                  {slots.map((slot) => (
                    <SlotPill
                      key={slot.shiftId}
                      slot={slot}
                      readonly={!!readonly}
                      onToggle={onToggle}
                      accentColor={accentColor}
                      dotColor={dotColor}
                      pillBg={pillBg}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

ShiftGrid.displayName = "ShiftGrid";

// ── Pill ──────────────────────────────────────────────────────────────────────
interface SlotPillProps {
  slot: ShiftSlot;
  accentColor: string;
  readonly: boolean;
  onToggle: (id: number) => void;
  dotColor: string;
  pillBg: string;
}

//slot -logout -#ffedd5

const SlotPill = memo(
  ({ slot, readonly, onToggle, dotColor, pillBg }: SlotPillProps) => {
    const handleClick = useCallback(() => {
      if (!readonly) onToggle(slot.shiftId);
    }, [readonly, onToggle, slot.shiftId]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!readonly && !slot.active) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgb(0, 92, 61)";
          el.style.color = "rgb(0, 92, 61)";
          el.style.background = "rgba(0, 92, 61, 0.04)";
        }
      },
      [readonly, slot.active],
    );

    const isActive = slot.active;

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!readonly && !slot.active) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "#D1D5DB";
          el.style.color = "#374151";
          el.style.background = "#ffffff";
        }
      },
      [readonly, slot.active],
    );

    return (
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          minWidth: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          padding: "6px 10px",
          borderRadius: 50,
          border: isActive ? `1px solid ${dotColor}` : "1px solid #D1D5DB",
          background: isActive ? `${pillBg}` : "#ffffff",

          //
          color: isActive ? `${dotColor}` : "#374151",
          fontSize: 11,
          fontWeight: isActive ? 700 : 400,
          cursor: readonly ? "default" : "pointer",
          transition: "border-color .1s, color .1s, background .1s",
          userSelect: "none",
          opacity: readonly && !isActive ? 0.45 : 1,
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {/* Dark green dot on active */}
        {isActive && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: `${dotColor}`, // "rgb(0, 92, 61)",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
        )}
        {slot.shiftTime}
      </div>
    );
  },
);

SlotPill.displayName = "SlotPill";

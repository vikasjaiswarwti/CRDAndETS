// hooks/useShiftFilter.ts
// Filters shift slots based on user input.
// Supports exact text match AND nearest-time window filtering.

import { useMemo, useState } from "react";
import type { ShiftSlot } from "../types/shift.mangement.types";

const WINDOW_MINUTES = 30; // ± window around typed time

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function parseInputMinutes(raw: string): number | null {
  // Accept "12:30", "1230"
  const cleaned = raw.replace(/[\s.]/g, ":");
  const match =
    cleaned.match(/^(\d{1,2}):(\d{2})$/) ?? cleaned.match(/^(\d{2})(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export interface UseShiftFilterReturn {
  filteredSlots: ShiftSlot[];
  filterTerm: string;
  setFilterTerm: (term: string) => void;
}

export function useShiftFilter(slots: ShiftSlot[]): UseShiftFilterReturn {
  const [filterTerm, setFilterTerm] = useState("");

  const filteredSlots = useMemo(() => {
    if (!filterTerm.trim()) return slots;

    const mins = parseInputMinutes(filterTerm.trim());

    if (mins !== null) {
      // Time-based window filter
      const lo = Math.max(0, mins - WINDOW_MINUTES);
      const hi = Math.min(23 * 60 + 59, mins + WINDOW_MINUTES);
      return slots.filter((s) => {
        const sm = toMinutes(s.shiftTime);
        return sm >= lo && sm <= hi;
      });
    }

    // Fallback: plain text contains match on shiftTime
    const term = filterTerm.toLowerCase();
    return slots.filter((s) => s.shiftTime.includes(term));
  }, [slots, filterTerm]);

  return { filteredSlots, filterTerm, setFilterTerm };
}

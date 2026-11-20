import { useCallback, useState } from "react";
import { DEFAULT_FILTERS } from "../constants/RouteConstants";
import type { RouteManagementFilterState } from "../types/RouteTypes";

interface UseRouteManagementFiltersReturn {
  filters: RouteManagementFilterState;
  setOffice: (val: string) => void;
  setDate: (val: string) => void;
  setShiftType: (val: number) => void;
  resetFilters: () => void;
}

/**
 * Encapsulates all filter state.
 * URL-sync ready: replace useState with useSearchParams to persist across nav.
 * RTK Query ready: pass `filters` directly into `useGetRouteManagementDataQuery(filters)`.
 */
export function useRouteManagementFilters(): UseRouteManagementFiltersReturn {
  const [filters, setFilters] =
    useState<RouteManagementFilterState>(DEFAULT_FILTERS);

  const setOffice = useCallback((val: string) => {
    setFilters((prev) => ({ ...prev, officeId: val }));
  }, []);

  const setDate = useCallback((val: string) => {
    setFilters((prev) => ({ ...prev, date: val }));
  }, []);

  const setShiftType = useCallback((val: number) => {
    // FIXED
    setFilters((prev) => ({ ...prev, shiftType: val }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, setOffice, setDate, setShiftType, resetFilters };
}

import { useCallback, useMemo, useState } from "react";
import type { RowSelectionMap } from "../types/RouteTypes";

interface UseTableSelectionReturn {
  selectedMap: RowSelectionMap;
  selectedCount: number;
  isAllSelected: boolean;
  toggleRow: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  clearSelection: () => void;
}

/**
 * Isolated, memoized row selection state.
 * No prop drilling — each table instance owns its own hook.
 */

export function useTableSelection(allIds: string[]): UseTableSelectionReturn {
  const [selectedMap, setSelectedMap] = useState<RowSelectionMap>({});

  const selectedCount = useMemo(
    () => Object.values(selectedMap).filter(Boolean).length,
    [selectedMap],
  );

  const isAllSelected = useMemo(
    () => allIds.length > 0 && allIds.every((id) => selectedMap[id]),
    [allIds, selectedMap],
  );

  const toggleRow = useCallback((id: string) => {
    setSelectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedMap((prev) => {
      const allSelected = ids.every((id) => prev[id]);
      const next: RowSelectionMap = { ...prev };
      ids.forEach((id) => {
        next[id] = !allSelected;
      });
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedMap({}), []);

  return {
    selectedMap,
    selectedCount,
    isAllSelected,
    toggleRow,
    toggleAll,
    clearSelection,
  };
}

import { useMemo, useState, useCallback } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import { STATUS_MAP } from "../constants/Lkppenaltytypeconstants";
import type { LkpPenaltyType } from "../types/Lkppenaltytype.types";
import { LKP_PENALTY_TYPE_CONFIG } from "../config";

interface UseLkpPenaltyTypeTableOptions {
  onEdit: (record: LkpPenaltyType) => void;
}

export const useLkpPenaltyTypeTable = ({
  onEdit,
}: UseLkpPenaltyTypeTableOptions) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  // ── Columns (Config-driven) ─────────────────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (LKP_PENALTY_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // future-safe
    // if (LKP_PENALTYTYPE_CONFIG.canDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<LkpPenaltyType>([
      col.text("penaltyType", "Penalty Type", { sortable: true }),

      //   col.text("applicableTo", "Applicable To", {
      //     render: (val: string | null) =>
      //       APPLICABLE_TO_LABEL_MAP[val ?? ""] ?? val ?? "—",
      //   }),

      col.status("isActive", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, { searchTerm: search }),
    [tableState, search],
  );

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
};

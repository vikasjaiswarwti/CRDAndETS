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
import { STATUS_MAP } from "../constants/Lkpfeedbacktypeconstants";
import type { LkpFeedbackType } from "../types/Lkpfeedbacktype.types";
import { LKP_FEEDBACKTYPE_CONFIG } from "../config"; // ← Import your config

interface UseLkpFeedbackTypeTableOptions {
  onEdit: (record: LkpFeedbackType) => void;
}

export const useLkpFeedbackTypeTable = ({
  onEdit,
}: UseLkpFeedbackTypeTableOptions) => {
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

  // ── Columns with Config-Driven Actions ──────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Only add Edit action if config allows update
    if (LKP_FEEDBACKTYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // You can add delete later when canDelete becomes true:
    // if (LKP_FEEDBACKTYPE_CONFIG.canDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<LkpFeedbackType>([
      col.text("feedbackType", "Feedback Type", { sortable: true }),

      col.status("isActive", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      // Actions column - only rendered if there are actions
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
};

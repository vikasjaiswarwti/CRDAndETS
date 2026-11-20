import { useState, useMemo, useCallback } from "react";
import {
  col,
  buildColumns,
  action, // ← Important: Import action helper
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { DOC_OWNER_TYPE_CONFIG } from "../config";
import { STATUS_MAP } from "../constants/DocuOwnerTypeConstants";

import type { DocumentOwnerType } from "../types/documentOwnerType.types";

interface UseDocumentOwnerTypeTableOptions {
  onEdit: (record: DocumentOwnerType) => void;
}

export function useDocumentOwnerTypeTable({
  onEdit,
}: UseDocumentOwnerTypeTableOptions) {
  // ── URL-synced table state ───────────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Handle search with page reset ────────────────────────────────────────
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState({ page: 1 });
    },
    [setTableState],
  );

  // ── Query args for RTK Query ─────────────────────────────────────────────
  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, { searchTerm: search }),
    [tableState, search],
  );

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Add Edit action only if allowed in config
    if (DOC_OWNER_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // You can add delete later when canDelete becomes true
    // if (DOC_OWNER_TYPE_CONFIG.canDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<DocumentOwnerType>([
      col.text("docOwnerTypeName", "Owner Type Name", {
        sortable: true,
        width: 280,
      }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", {
        width: 180,
      }),

      // Actions column - only added if there is at least one action
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
}

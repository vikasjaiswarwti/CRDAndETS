import { useState, useMemo, useCallback } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { DOC_TYPE_CONFIG } from "../config"; // ← Import config
import { STATUS_MAP } from "../constants/DocumentTypeConstants";
import type { DocumentType } from "../types/docType.types";

interface UseDocumentTypeTableOptions {
  onEdit: (record: DocumentType) => void;
}

export function useDocumentTypeTable({ onEdit }: UseDocumentTypeTableOptions) {
  // ── Table State ─────────────────────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search State ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Handle Search with page reset ───────────────────────────────────────
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState({ page: 1 });
    },
    [setTableState],
  );

  // ── Query Args for RTK Query ────────────────────────────────────────────
  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, { searchTerm: search }),
    [tableState, search],
  );

  // ── Column Definitions with Config-Driven Actions ───────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Add Edit action only if allowed in config
    if (DOC_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // Add Delete action in future when canDelete is enabled
    // if (DOC_TYPE_CONFIG.canDelete && onDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<DocumentType>([
      col.text("docTypeName", "Document Type Name", {
        sortable: true,
        width: 280,
      }),

      col.text("docOwnerTypeName", "Owner Type", {
        width: 160,
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

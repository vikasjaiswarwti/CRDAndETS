import { useState, useMemo, useCallback } from 'react';
import {
  col,
  buildColumns,
  action,
} from '../../../shared/components/AppTable/AppTable';
import {
  useTableState,
  tableStateToQueryArgs,
} from '../../../shared/hooks/useTableState';
import { STATUS_MAP } from '../constants/currentStatusConstants';
import type { CurrentStatusRaw } from '../types/currentStatus.types';
import { CURRENT_STATUS_CONFIG } from '../config';

interface UseCurrentStatusTableOptions {
  onEdit: (record: CurrentStatusRaw) => void;
}

export const useCurrentStatusTable = ({ onEdit }: UseCurrentStatusTableOptions) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [search, setSearch] = useState('');

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

    if (CURRENT_STATUS_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<CurrentStatusRaw>([
      col.text('statusName', 'Status Name', { width: 200, sortable: true }),

      col.status('status', 'Status', {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
        // renderAs: 'toggle',
      }),

      col.dateTime('createdOn', 'Created On', { width: 180 }),

      // Actions column — only rendered if there are actions
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
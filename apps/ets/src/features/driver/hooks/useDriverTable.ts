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
import { STATUS_MAP } from '../constants/driverConstants';
import type { Driver } from '../types/driver.types';
import { usePermittedHook } from "./usePermittedHook"

interface UseDriverTableOptions {
  onEdit: (record: Driver) => void;
  onView: (record: Driver) => void;
}

// ── Main Driver Table ───────────────────────────────────────────────────────
export const useDriverTable = ({ onEdit, onView = () => { } }: UseDriverTableOptions) => {
  const { DRIVER_CONFIG } = usePermittedHook();
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [search, setSearch] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  // ✅ Reset page to 1 when vendor filter changes
  const handleVendorName = useCallback(
    (value: string) => {
      setVendorName(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  const handleLocationName = useCallback(
    (value: string) => {
      setLocation(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  const resetFilters = useCallback(() => {
    setSearch('');
    setVendorName('');
    setLocation('');
    setTableState((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [setTableState]);

  // ── Columns with Config-Driven Actions ───────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (DRIVER_CONFIG.canUpdate && onEdit) actions.push(action.edit(onEdit));
    if (DRIVER_CONFIG.canView && onView) actions.push(action.view(onView));

    return buildColumns<Driver>([
      col.text('driverName', 'Driver Name', { width: 160, sortable: true }),
      col.text('mobileNo', 'Mobile No.', { width: 130 }),
      col.text('licenseNo', 'License No.', { width: 140 }),
      // col.text('driverType', 'Driver Type', { width: 120 }),
      // col.text('currentStatus', 'Current Status', { width: 130 }),

      col.status('active', 'Status', {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
        // renderAs: 'toggle',
      }),

      // Actions column — only rendered if there are actions
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit, onView]);

  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search, vendorName, location: location });

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    handleLocationName,
    handleVendorName,
    resetFilters,
    queryArgs,
  };
};

// ── Stage Driver Table ──────────────────────────────────────────────────────
export const useDriverStageTable = ({ onEdit, onView }: UseDriverTableOptions) => {
  const { DRIVER_CONFIG } = usePermittedHook();
  const [tableStageState, setTableStageState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [searchStage, setSearchStage] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [location, setLocation] = useState('');

  const handleStageSearch = useCallback(
    (value: string) => {
      setSearchStage(value);
      setTableStageState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableStageState],
  );
  const handleStageVendorName = useCallback(
    (value: string) => {
      setVendorName(value);
      setTableStageState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableStageState],
  );
  const handleStageLocationName = useCallback(
    (value: string) => {
      setLocation(value);
      setTableStageState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableStageState],
  );
  const resetStageFilters = useCallback(() => {
    setSearchStage('');
    setVendorName('');
    setLocation('');
    setTableStageState((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [setTableStageState]);


  // ── Columns with Config-Driven Actions ───────────────────────────────────
  const columnsStage = useMemo(() => {
    const actions: any[] = [];

    if (DRIVER_CONFIG.canStageUpdate && onEdit) actions.push(action.edit(onEdit));
    if (DRIVER_CONFIG.canStageView && onView) actions.push(action.view(onView));

    return buildColumns<Driver>([
      col.text('driverName', 'Driver Name', { width: 160, sortable: true }),
      col.text('mobileNo', 'Mobile No.', { width: 130 }),
      col.text('licenseNo', 'License No.', { width: 140 }),
      // col.text('driverType', 'Driver Type', { width: 120 }),
      // col.text('currentStatus', 'Current Status', { width: 130 }),

      col.status('active', 'Status', {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
        // renderAs: 'toggle',
      }),

      // Actions column — only rendered if there are actions
      ...(actions.length > 0 ? [col.actions(actions, { width: 100 })] : []),
    ]);
  }, [onEdit, onView]);

  const queryStageArgs = tableStateToQueryArgs(tableStageState, { searchTerm: searchStage, vendorName: vendorName, location: location });

  return {
    columnsStage,
    tableStageState,
    setTableStageState,
    searchStage,
    handleStageSearch,
    handleStageVendorName,
    handleStageLocationName,
    resetStageFilters,
    queryStageArgs,
  };
};
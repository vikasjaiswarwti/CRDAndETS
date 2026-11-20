import { useState, useCallback, useMemo } from "react";
import type { VehicleCheckSheet } from "../types/checkList.types";
import { tableStateToQueryArgs, useTableState } from "../../../../shared/hooks/useTableState";
import { action, buildColumns, col } from "../../../../shared/components/AppTable/AppTable";

interface UseCheckListTableOptions {
  onEdit: (record: VehicleCheckSheet) => void;
}

export const useCheckListTable = ({ onEdit }: UseCheckListTableOptions) => {
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

    actions.push(action.edit(onEdit));

    return buildColumns<VehicleCheckSheet>([
      col.text('vehicleNumber', 'Vehicle Number', { width: 140 }),
      col.dateTime('checkDate', 'Check Date', { width: 160 }),
      col.text('fuel', 'Fuel', { width: 120 }),
      col.text('vehicleMake', 'Make', { width: 120 },),
      col.text('vehicleModel', 'Model', { width: 120 }),
      col.text('drivers', 'Drivers', {
        width: 180,
        render: (_value, record) =>
          record.drivers?.map((driver) => driver.driverName).filter(Boolean).join(", ") || "-",
      }),
      col.text('siteRegion', 'SiteRegion', { width: 100 }),
      col.dateTime('lastServiceDate', 'Last Service Date', { width: 170 }),
      col.text('lastServiceKm', 'Last Service KM', { width: 140 }),
      // Actions column — only rendered if there are actions
      ...(actions.length > 0 ? [col.actions(actions, {
        width: 120
      })] : []),
    ]);
  }, [onEdit]);

  const tableQueryArgs = tableStateToQueryArgs(tableState);
  const queryArgs = {
    page: tableQueryArgs.page,
    pageSize: tableQueryArgs.pageSize,
    ...(search.trim() ? { search: search.trim() } : {}),
  };

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
};

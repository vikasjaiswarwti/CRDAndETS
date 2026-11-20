import { useMemo, useState, useCallback } from 'react';
import { col, buildColumns } from '../../../shared/components/AppTable/AppTable';
import { useTableState, tableStateToQueryArgs } from '../../../shared/hooks/useTableState';
import type { VendorSupervisor } from '../types/vendorSupervisor.types';

interface UseVendorSupervisorTableOptions {
  onEdit?: (record: VendorSupervisor) => void;
}

export const useVendorSupervisorTable = ({ onEdit }: UseVendorSupervisorTableOptions = {}) => {
  const[ tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });
 
   // ── Search state ─────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
   
  
    // ── Handle search with page reset ────────────────────────────────────────
    const handleSearch = useCallback(
      (value: string) => {
        setSearch(value);
        setTableState((prev) => ({ ...prev, page: 1 }));
      },
      [setTableState],
    );

  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search});

  const columns = useMemo(
    () =>
      buildColumns<VendorSupervisor>([
        col.text('firstName', 'First Name', { width: 140 }),
        col.text('lastName',  'Last Name',  { width: 140 }),
        col.text('emailId',   'Email',      { width: 200 }),
        col.text('mobileNo',  'Mobile',     { width: 140 }),
        // col.text('locCode',   'Loc Code',   { width: 100 }),
        // col.text('transporterId', 'Transporter ID', { width: 130 }),
        // Edit only — no delete in API
        // ...(onEdit
        //   ? [col.actions({ onEdit })]
        //   : []),
      ]),
    [onEdit]
  );

  return {
    columns,
    tableState,
    setTableState,
    // search,
    handleSearch,
    queryArgs,
  };
};
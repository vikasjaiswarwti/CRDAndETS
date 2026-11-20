import React, { useMemo, useState, useCallback } from 'react';
import { col, buildColumns, action } from '../../../shared/components/AppTable/AppTable';
import { useTableState } from '../../../shared/hooks/useTableState';
// import { DEFAULT_STATUS_FILTER } from '../constants/penaltyConstants';
import type { Penalty, PenaltyListParams } from '../types/penalty.types';

interface UsePenaltyTableOptions {
  onEdit: (record: Penalty) => void;
}

export const usePenaltyTable = ({ onEdit }: UsePenaltyTableOptions) => {
  const [search, setSearch] = useState('');
  const [locCode, setLocCode] = useState<number>(0);
  const [statusCode, setStatusCode] = useState<number | string>("0");
  const [billingCode, setBillingCode] = useState<number>(0);

  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const handleLocCode = useCallback((value: number) => {
    setLocCode(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);
  const handleBillingCode = useCallback((value: number) => {
    setBillingCode(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);
  const handleStatusCode = useCallback((value: number) => {
    setStatusCode(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  // Build query args for the POST body
  const queryArgs: PenaltyListParams = useMemo(() => ({
    LocCode: locCode,
    BillingID: billingCode,
    Status: Number(statusCode),
    SearchText: search,
    Page: tableState.page ?? 1,
    PageSize: tableState.pageSize ?? 10,
  }), [locCode, billingCode, statusCode, search, tableState.page, tableState.pageSize]);

  const columns = useMemo(() => {
    const actions: any[] = [];
    if (onEdit) {
      actions.push(action.edit(onEdit));
    }
    return buildColumns<Penalty>([
      col.text('sno', 'S.No', { width: 70 }),
      col.text('applicableName', 'Penalty On', { width: 100 }),
      col.text('applicableOnName', 'Applied On', { width: 180 }),
      col.text('tripId', 'Trip ID', {
        width: 80,
        render: (val): React.ReactNode => {
          const isEmpty = val == null || val === 0 || val === '0' || val === '';
          if (isEmpty) {
            return React.createElement('span', { style: { color: '#aaa' } }, '-');
          }
          return React.createElement("span", {}, String(val));
        },
      }),
      col.text('amount', 'Amount', { width: 100 }),
      col.text('remarks', 'Remarks', { width: 200, ellipsis: true }),
      ...(actions.length > 0 ? [col.actions(actions, { width: 200 })] : []),
    ]);
  },
    [onEdit]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    locCode,
    statusCode,
    billingCode,
    handleSearch,
    handleLocCode,
    handleBillingCode,
    handleStatusCode,
    queryArgs,
  };
};

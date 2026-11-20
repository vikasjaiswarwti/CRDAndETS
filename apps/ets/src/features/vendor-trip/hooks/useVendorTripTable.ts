import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { action, col } from '../../../shared/components/AppTable/AppTable';
import { useTableState, tableStateToQueryArgs } from '../../../shared/hooks/useTableState';
import { STATUS_MAP } from '../constants/vendorTripConstants';
import type { Trip } from '../types/vendorTrip.types';
import dayjs from 'dayjs';
import { EnvironmentOutlined } from '@ant-design/icons';
interface UseVendorTripTableOptions {
  onEdit: (record: Trip) => void;
  locationOptions: { label: string; value: number }[];
}

export const useVendorTripTable = ({ onEdit, locationOptions }: UseVendorTripTableOptions) => {
  const today = dayjs().format("YYYY-MM-DD");

  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [tripType, setTripType] = useState<number>(1);
  const [locCode, setLocCode] = useState<number | null>(null);

  // ✅ Auto-select first location once options load
  useEffect(() => {
    if (locationOptions.length > 0 && locCode === null) {
      setLocCode(locationOptions[0].value);
    }
  }, [locationOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFromDateChange = useCallback((value: string) => {
    setFromDate(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  const handleToDateChange = useCallback((value: string) => {
    setToDate(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);
  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  const handleShiftIdChange = useCallback((value: number) => {
    setShiftId(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  const handleTripTypeChange = useCallback((value: number) => {
    setTripType(value);
    setShiftId(null); // ✅ reset so handleShiftOptionsReady fires again
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  const handleLocCodeChange = useCallback((value: number) => {
    setLocCode(value);
    setShiftId(null); // ✅ reset so handleShiftOptionsReady fires again
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [setTableState]);

  // ✅ Called from page after shift options load — auto-selects first shift
  const handleShiftOptionsReady = useCallback((options: { label: string; value: number }[]) => {
    if (options.length > 0 && shiftId === null) {
      setShiftId(options[0].value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    }
  }, [shiftId, setTableState]);
  const navigateToTracking = (dsId: number) => {
    window.open(`/routing/route-tracking?dsId=${dsId}`, "_blank");
  }

  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, {
      fromDate,
      toDate,
      shiftId,
      tripType,
      locCode,
    }),
    [tableState, fromDate, toDate, shiftId, tripType, locCode]
  );

  const columns = useMemo(() => {
    const actions = [
      action.edit<Trip>(onEdit, {
        hidden: (row: Trip) => row.tripStatusCode !== 1,
      }),
      {
        ...action.custom({
          label: "Track",
          icon: React.createElement(EnvironmentOutlined),
          onClick: (record: Trip) => navigateToTracking(record.dsId),
          // hidden: (record: ApprovedUser) => !record.isActive,
        }),
      }
    ];

    return [
      col.text('dsId', 'Trip ID', { width: 30 }),
      col.text('totalPax', 'Total Pax', { width: 30 }),
      {
        title: 'Duration (min)',
        dataIndex: 'totalDuration',
        width: 50,
        render: (val: string) => val ? `${parseFloat(val).toFixed(1)} min` : '-',
      },
      col.text('vehicleRegNo', 'Assign Vehicle', { width: 60 }),
      col.text('driverName', 'Assign Driver', {
        width: 60,
        render: (_val, record: Trip) => `${record.driverName}-${record.driverMobile}`,
      }),

      col.text('routeDistanceKm', 'Route (km)', { width: 30 }),
      col.status('isGuard', 'Guard', {
        map: { true: STATUS_MAP.active, false: STATUS_MAP.inactive },
        width: 30,
      }),
      col.actions(actions, { width: 30 }),
    ];
  }, [onEdit]);

  return {
    columns,
    tableState,
    setTableState,
    handleFromDateChange,
    handleLocCodeChange,
    handleShiftIdChange,
    handleToDateChange,
    handleDateRangeChange,
    handleTripTypeChange,
    handleShiftOptionsReady, // ✅
    queryArgs,
  };
};
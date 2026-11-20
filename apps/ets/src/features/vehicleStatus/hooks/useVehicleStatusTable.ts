import { useMemo } from 'react';
import {
  col,
  buildColumns,
  action,
} from '../../../shared/components/AppTable/AppTable';
import type { VehicleStatus } from '../types/vehicleStatus.types';
import { VEHICLE_STATUS_CONFIG } from '../config';

interface Options {
  onEdit: (record: VehicleStatus) => void;
}

export const useVehicleStatusTable = ({ onEdit }: Options) => {
  // No pagination — API returns a plain array.
  // No useTableState needed. Filtering is client-side if desired.

  // ── Columns with Config-Driven Actions ─────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (VEHICLE_STATUS_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
      // No delete endpoint in API doc — omitted intentionally
    }

    return buildColumns<VehicleStatus>([
      col.text('vehicleStatusName', 'Status Name'),

      // Actions column — only rendered if there are actions
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  return { columns };
};
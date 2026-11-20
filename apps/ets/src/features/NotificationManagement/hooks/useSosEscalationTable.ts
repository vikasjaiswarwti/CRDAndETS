import { useMemo } from "react";
import {
  action,
  buildColumns,
  col,
  type RowAction,
} from "../../../shared/components/AppTable/AppTable";
import { STATUS_MAP } from "../constants/notificationManagementConstants";
import { NOTIFICATION_MANAGEMENT_CONFIG as CONFIG } from "../config";
import type { SosEscalation } from "../types/notificationManagement.types";

interface UseSosEscalationTableOptions {
  onEdit: (record: SosEscalation) => void;
  onDeactivate: (id: string) => void;
  locNameMap: Map<number, string>;
}

export const useSosEscalationTable = ({
  onEdit,
  onDeactivate,
  locNameMap,
}: UseSosEscalationTableOptions) => {
  const columns = useMemo(() => {
    const actions: RowAction<SosEscalation>[] = [];
    if (CONFIG.canUpdate) actions.push(action.edit(onEdit));
    if (CONFIG.canDeactivate) {
      actions.push(
        action.cancel<SosEscalation>((row) => onDeactivate(row.id), {
          label: "Deactivate",
          confirm: true,
          confirmTitle: "Deactivate this escalation recipient?",
          hidden: (row) => !row.isActive,
        }),
      );
    }

    return buildColumns<SosEscalation>([
      col.text("locCode", "Office", {
        render: (val) => locNameMap.get(val as number) ?? String(val ?? "—"),
      }),
      col.text("orderNo", "Call Order", { width: 110, align: "center" }),
      col.text("recipientName", "Recipient Name"),
      col.text("recipientMobile", "Mobile", { width: 150 }),
      col.status("isActive", "Status", {
        map: { true: STATUS_MAP.active, false: STATUS_MAP.inactive },
        width: 120,
      }),
      ...(actions.length ? [col.actions(actions)] : []),
    ]);
  }, [onEdit, onDeactivate, locNameMap]);

  return { columns };
};

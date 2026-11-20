import { useMemo } from "react";
import {
  action,
  buildColumns,
  col,
  type RowAction,
} from "../../../shared/components/AppTable/AppTable";
import {
  EVENT_KEY_LABEL_MAP,
  STATUS_MAP,
} from "../constants/notificationManagementConstants";
import { NOTIFICATION_MANAGEMENT_CONFIG as CONFIG } from "../config";
import type { EventNotification } from "../types/notificationManagement.types";

interface UseEventNotificationTableOptions {
  onEdit: (record: EventNotification) => void;
  onDeactivate: (id: string) => void;
}

export const useEventNotificationTable = ({
  onEdit,
  onDeactivate,
}: UseEventNotificationTableOptions) => {
  const columns = useMemo(() => {
    const actions: RowAction<EventNotification>[] = [];
    if (CONFIG.canUpdate) actions.push(action.edit(onEdit));
    if (CONFIG.canDeactivate) {
      actions.push(
        action.cancel<EventNotification>((row) => onDeactivate(row.id), {
          label: "Deactivate",
          confirm: true,
          confirmTitle: "Deactivate this notification recipient?",
          hidden: (row) => !row.active,
        }),
      );
    }

    return buildColumns<EventNotification>([
      col.text("eventKey", "Event", {
        // Unknown keys are shown raw: saved, but no backend handler reads them.
        render: (val) =>
          EVENT_KEY_LABEL_MAP[val as string] ?? String(val ?? "—"),
      }),
      col.text("email", "Email"),
      col.text("mobile", "Mobile", { width: 150 }),
      col.status("active", "Status", {
        map: { true: STATUS_MAP.active, false: STATUS_MAP.inactive },
        width: 120,
      }),
      ...(actions.length ? [col.actions(actions)] : []),
    ]);
  }, [onEdit, onDeactivate]);

  return { columns };
};

import { useMemo, useState } from "react";
import {
  action,
  buildColumns,
  col,
} from "../../../shared/components/AppTable/AppTable";
import {
  tableStateToQueryArgs,
  useTableState,
} from "../../../shared/hooks/useTableState";
import type { MasterWeeklyScheduleItem } from "../types/masterWeeklySchedule.types";

const renderLockDays = (val: unknown) => {
  const days = val ? String(val).split(",").filter(Boolean) : [];
  if (!days.length) return "—";
  return days.join(", ");
};

interface UseMasterWeeklyScheduleTableOptions {
  locCode: number | null;
  onEdit: (record: MasterWeeklyScheduleItem) => void;
}

export const useMasterWeeklyScheduleTable = ({
  locCode,
  onEdit,
}: UseMasterWeeklyScheduleTableOptions) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setTableState((prev) => ({ ...prev, page: 1 }));
  };

  const columns = useMemo(
    () =>
      buildColumns<MasterWeeklyScheduleItem>([
        col.text("empname", "Employee Name"),
        col.text("mobileno", "Mobile No", { width: 140 }),
        col.text("pickShift", "Login Shift", { width: 120 }),
        col.text("dropShift", "Logout Shift", { width: 120 }),
        col.text("lock_Days", "Locked Days", {
          width: 240,
          render: renderLockDays,
        }),
        col.actions<MasterWeeklyScheduleItem>([action.edit(onEdit)]),
      ]),
    [onEdit],
  );

  const queryArgs = useMemo(() => {
    const { page, pageSize } = tableStateToQueryArgs(tableState);
    return {
      locCode: locCode ?? 0,
      searchString: search.trim() ? search.trim() : null,
      page: page,
      pageSize,
    };
  }, [locCode, search, tableState]);

  return { columns, tableState, setTableState, search, handleSearch, queryArgs };
};

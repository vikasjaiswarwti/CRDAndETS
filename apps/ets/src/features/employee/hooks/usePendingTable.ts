import { useMemo, useCallback } from "react";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import type { UserStage } from "../types/Employee.types";
import { EMPLOYEE_CONFIG } from "../config"

export const usePendingTable = ({
  onEdit,
}: {
  onEdit: (record: UserStage) => void;
}) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: false,
    defaultPageSize: 10,
  });

  const handleSearch = useCallback(
    (value: string) => {
      setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }));
    },
    [setTableState],
  );

  const columns = useMemo(
    () => {
      // ✅ Build actions based on config flags
      const rowActions: any[] = [
        EMPLOYEE_CONFIG.canStageEdit && { ...action.edit(onEdit), label: "Edit" },
      ].filter(Boolean); // removes false entries

      return [
        // col.text("firstName", "First Name"),
        // col.text("lastName", "Last Name"),
        col.text("firstName", "Full Name", {
          render: (_val, record: UserStage) => (
            `${record.firstName} ${record?.middleName ?? ""} ${record.lastName}`
          ),
        }),
        col.text("mobileNo", "Mobile"),
        col.text("emailId", "Email"),
        // col.actions([{ ...action.edit(onEdit), label: "Edit" }]),
        ...(rowActions.length > 0 ? [col.actions(rowActions)] : []), // ✅ skip actions col if none
      ]
    },
    [onEdit],
  );

  return { columns, tableState, setTableState, handleSearch };
};

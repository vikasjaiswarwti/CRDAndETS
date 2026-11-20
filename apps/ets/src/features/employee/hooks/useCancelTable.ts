
import { useMemo, useCallback } from "react";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import type { ApprovedUser } from "../types/Employee.types";
import { ACTIVE_MAP } from "../constants/Employeeconstants";
import { EMPLOYEE_CONFIG } from "../config"

export const useCancelTable = ({
    onEdit,
    onCancel
}: {
    onEdit: (record: ApprovedUser) => void;
    onCancel: (record: ApprovedUser) => void;
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
                EMPLOYEE_CONFIG.canEditCancel && { ...action.edit(onEdit), label: "Edit" },
                EMPLOYEE_CONFIG.canApproveCancel && onCancel && { ...action.approve(onCancel), label: "Activate", hidden: (record: ApprovedUser) => record.isActive, },
            ].filter(Boolean); // removes false entries

            return [
                // col.text("firstName", "First Name"),
                // col.text("lastName", "Last Name"),
                col.text("firstName", "Full Name", {
                    render: (_val, record: ApprovedUser) => (
                        `${record.firstName} ${record.lastName}`
                    ),
                }),
                col.text("mobileNo", "Mobile"),
                col.text("emailId", "Email"),
                col.text("locationName", "Location"),
                col.status("isActive", "Status", { map: ACTIVE_MAP }),
                col.dateTime("createdOn", "Registered On"),
                // col.actions([{ ...action.edit(onEdit), label: "Update Profile" },
                // { ...action.cancel(onCancel), label: "Deactivate", hidden: (record: ApprovedUser) => !record.isActive, }
                // ]),
                ...(rowActions.length > 0 ? [col.actions(rowActions)] : []), // ✅ skip actions col if none
            ]
        },
        [onEdit],
    );

    return { columns, tableState, setTableState, handleSearch };
};

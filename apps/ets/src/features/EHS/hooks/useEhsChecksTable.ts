import { useMemo } from 'react';
import { col } from '../../../shared/components/AppTable/AppTable';
import {
    useTableState,
} from '../../../shared/hooks/useTableState';
// import { EHS_CHECK_CONFIG } from "../config";

export const useEhsChecksTable = () => {
    // ── URL-synced table state ──────────────────────────────────────────────
    const [tableState, setTableState] = useTableState({
        syncUrl: true,
        defaultPageSize: 10,
    });

    // ── Column definitions ─────────────────────────────────────────────────
    const columns = useMemo(
        () => {
            // const actions: any[] = [];

            // View Action
            // if (EHS_CHECK_CONFIG.canView && onView) {
            //     actions.push(action.view(onView));
            // }

            // // Edit Action
            // if (EHS_CHECK_CONFIG.canUpdate && onEdit) {
            //     actions.push(action.edit(onEdit));
            // }
            return [
                col.text('ehsType', 'EHS Type', { width: 220 }),
                col.dateTime('createdOn', 'Created On', { width: 180 }),
            ]
        },
        []
    );

    return {
        columns,
        tableState,
        setTableState,
        // search,
        // handleSearch,
        // queryArgs,
    };
};
import { useState, useMemo, useCallback } from 'react';
import {
    col,
    buildColumns,
    action,
} from '../../../shared/components/AppTable/AppTable';
import { useTableState, tableStateToQueryArgs } from '../../../shared/hooks/useTableState';
import { STATUS_MAP } from '../constants/specialCaseConstants';
import type { SpecialCase } from '../types/specialCase.types';
import { SPECIAL_CASE_CONFIG } from '../config';

interface UseSpecialCaseTableOptions {
    onEdit: (record: SpecialCase) => void;
}

export const useSpecialCaseTable = ({ onEdit }: UseSpecialCaseTableOptions) => {
    const [tableState, setTableState] = useTableState({ syncUrl: true, defaultPageSize: 10 });

    const [search, setSearch] = useState('');

    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            setTableState((prev) => ({ ...prev, page: 1 }));
        },
        [setTableState]
    );

    // ── Columns with Config-Driven Actions ──────────────────────────────────
    const columns = useMemo(() => {
        const actions: any[] = [];

        if (SPECIAL_CASE_CONFIG.canUpdate && onEdit) {
            actions.push(action.edit(onEdit));
        }

        return buildColumns<SpecialCase>([
            col.text('specialCaseDesc', 'Description', { sortable: true }),

            col.status('isActive', 'Status', {
                map: {
                    true: STATUS_MAP.active,
                    false: STATUS_MAP.inactive,
                },
                width: 160,
                // renderAs: 'toggle',
            }),

            // col.dateTime('createdOn', 'Created On', { width: 160 }),

            // Actions column — only rendered if there are actions
            ...(actions.length > 0 ? [col.actions(actions,{ width: 200 })] : []),
        ]);
    }, [onEdit]);

    const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

    return { columns, tableState, setTableState, search, handleSearch, queryArgs };
};
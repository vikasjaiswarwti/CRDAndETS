import { useState, useMemo, useCallback } from 'react';
import { buildColumns, col, action } from '../../../shared/components/AppTable/AppTable';
import { useTableState, tableStateToQueryArgs } from '../../../shared/hooks/useTableState';
// import { VEHICLE_STATUS_MAP, CURRENT_STATUS_MAP } from '../constants/vehicleConstants';
import type { Vehicle, VehicleListParams } from '../types/vehicle.types';
// import { VEHICLE_CONFIG } from '../config';
import { usePermittedHook } from "./usePermittedHook"

// type SelectOption = { label: string; value: any | string | number | boolean };

interface UseVehicleTableOptions {
    onEdit: (record: Vehicle) => void;
    onView: (record: Vehicle) => void;
    // VEHICLE_STATUS_MAP: SelectOption[], CURRENT_STATUS_MAP: SelectOption[]
}

export const useVehicleTable = ({ onEdit, onView }: UseVehicleTableOptions) => {
    const { VEHICLE_CONFIG } = usePermittedHook();
    const [search, setSearch] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [location, setLocation] = useState('');
    const [tableState, setTableState] = useTableState({ syncUrl: true, defaultPageSize: 10 });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setTableState((prev) => ({ ...prev, page: 1 }));
    }, [setTableState]);
    // ✅ Reset page to 1 when vendor filter changes
    const handleVendorName = useCallback(
        (value: string) => {
            setVendorName(value);
            setTableState((prev) => ({ ...prev, page: 1 }));
        },
        [setTableState],
    );
    const handleLocationName = useCallback(
        (value: string) => {
            setLocation(value);
            setTableState((prev) => ({ ...prev, page: 1 }));
        },
        [setTableState],
    );
     const resetFilters = useCallback(() => {
        setSearch('');
        setVendorName('');
        setLocation('');

        setTableState((prev) => ({
            ...prev,
            page: 1,
        }));
    }, [setTableState]);


    const queryArgs: VehicleListParams = tableStateToQueryArgs(tableState, { searchTerm: search, vendorName: vendorName, location: location });

    // ── Columns with Config-Driven Actions ───────────────────────────────────
    const columns = useMemo(() => {
        const actions: any[] = [];

        if (VEHICLE_CONFIG.canUpdate && onEdit) {
            actions.push(action.edit(onEdit));
        }

        if (VEHICLE_CONFIG.canView && onView) {
            actions.push(action.view(onView));
        }

        return buildColumns<Vehicle>([
            col.text('vehicle_Registration_No', 'Reg. No', {
                width: 150,
                sortable: true,
            }),

            col.text('make', 'Make', {
                width: 120,
            }),

            col.dateTime('createdOn', 'Created', {
                width: 180,
            }),

            ...(actions.length > 0
                ? [col.actions(actions)]
                : []),
        ]);
    }, [onEdit, onView]);

    return {
        columns, tableState, setTableState, search, handleSearch, handleLocationName,
        handleVendorName,resetFilters, queryArgs
    };
};
export const useVehicleStageTable = ({ onEdit, onView }: UseVehicleTableOptions) => {
    const { VEHICLE_CONFIG } = usePermittedHook();
    const [searchStage, setSearchStage] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [location, setLocation] = useState('');
    const [tableStageState, setTableStageState] = useTableState({ syncUrl: true, defaultPageSize: 10 });

    const handleStageSearch = useCallback((value: string) => {
        setSearchStage(value);
        setTableStageState((prev) => ({ ...prev, page: 1 }));
    }, [setTableStageState]);
    const handleStageVendorName = useCallback(
        (value: string) => {
            setVendorName(value);
            setTableStageState((prev) => ({ ...prev, page: 1 }));
        },
        [setTableStageState],
    );
    const handleStageLocationName = useCallback(
        (value: string) => {
            setLocation(value);
            setTableStageState((prev) => ({ ...prev, page: 1 }));
        },
        [setTableStageState],
    );
    const resetStageFilters = useCallback(() => {
        setSearchStage('');
        setVendorName('');
        setLocation('');

        setTableStageState((prev) => ({
            ...prev,
            page: 1,
        }));
    }, [setTableStageState]);

    const queryStageArgs: VehicleListParams = tableStateToQueryArgs(tableStageState, { searchTerm: searchStage, vendorName: vendorName, location: location });

    // ── Columns with Config-Driven Actions ───────────────────────────────────
    const columnsStage = useMemo(() => {
        const actions: any[] = [];

        if (VEHICLE_CONFIG.canStageUpdate && onEdit) {
            actions.push(action.edit(onEdit));
        }

        if (VEHICLE_CONFIG.canStageView && onView) {
            actions.push(action.view(onView));
        }

        return buildColumns<Vehicle>([
            col.text('vehicle_Registration_No', 'Reg. No', {
                width: 150,
                sortable: true,
            }),

            col.text('make', 'Make', {
                width: 120,
            }),

            // Example additional columns
            // col.text('model', 'Model', { width: 120 }),
            // col.text('vehicleType', 'Vehicle Type', { width: 140 }),

            col.dateTime('createdOn', 'Created', {
                width: 180,
            }),

            // Example status column
            // col.status('active', 'Status', {
            //   map: {
            //     true: VEHICLE_STATUS_MAP.active,
            //     false: VEHICLE_STATUS_MAP.inactive,
            //   },
            //   width: 120,
            // }),

            ...(actions.length > 0
                ? [col.actions(actions, { width: 100 })]
                : []),
        ]);
    }, [onEdit, onView]);

    return {
        columnsStage, tableStageState, setTableStageState, searchStage, handleStageSearch, handleStageVendorName,
        handleStageLocationName, resetStageFilters, queryStageArgs
    };
};
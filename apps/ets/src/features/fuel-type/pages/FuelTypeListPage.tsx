import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import PageContainer from '../../../shared/components/PageContainer/PageContainer';
import DataTableWrapper from '../../../shared/components/DataTableWrapper/DataTableWrapper';

import { useFuelTypeTable } from '../hooks/useFuelTypeTable';
import { useFuelTypeModal } from '../hooks/useFuelTypeModal';
import { useFuelTypeMutations } from '../hooks/useFuelTypeMutations';
import { useGetAllFuelTypesQuery } from '../services/FuelTypeApi';

import { FuelTypeFormModal } from '../components/FuelTypeFormModal';

import type { CreateFuelTypeDto, UpdateFuelTypeDto } from '../types/fuelType.types';
import { FUEL_TYPE_CONFIG } from '../config';

const FuelTypeListPage = () => {

    // Modal Hook
    const { isOpen, editingRecord, openCreate, openEdit, close } = useFuelTypeModal();

    // Mutations
    const {
        createFuelType,
        updateFuelType,
        isCreating,
        isUpdating,
        createError,
        updateError,
    } = useFuelTypeMutations({
        onCreateSuccess: close,
        onUpdateSuccess: close,
    });

    // Table Hook
    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useFuelTypeTable({ onEdit: openEdit });

    // API Query
    const { data, isLoading, error, refetch } = useGetAllFuelTypesQuery(queryArgs);

    // Derived values
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    // Handle Submit
    const handleSubmit = async (values: Record<string, unknown>) => {
        if (editingRecord) {
            const payload: UpdateFuelTypeDto = {
                id: editingRecord.id,
                fuelTypeDesc: String(values.fuelTypeDesc ?? ''),
                active: Boolean(values.active),
            };
            await updateFuelType(payload);
        } else {
            const payload: CreateFuelTypeDto = {
                fuelTypeDesc: String(values.fuelTypeDesc ?? ''),
                active: Boolean(values.active),
            };
            await createFuelType(payload);
        }
    };

    return (
        <PageContainer
            title="Fuel Type Management"
            subtitle="Manage fuel type classifications"
            createButtonLabel="Create Fuel Type"
            onCreateClick={FUEL_TYPE_CONFIG?.canCreate ? openCreate : undefined}
            canCreate={FUEL_TYPE_CONFIG?.canCreate}
            pagination={
                data?.totalCount
                    ? {
                        total: data.totalCount,
                        current: tableState.page,
                        pageSize: tableState.pageSize,
                        onChange: (page: number, pageSize: number) =>
                            setTableState((prev) => ({
                                ...prev,
                                page,
                                pageSize,
                            })),
                    }
                    : undefined
            }
        >
            <DataTableWrapper
                searchPlaceholder="Search by fuel type description"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No fuel types found. Create your first one."
                >
                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="id"
                        total={data?.totalCount ?? 0}
                        tableState={tableState}
                        onTableChange={setTableState}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <FuelTypeFormModal
                open={isOpen}
                onClose={close}
                editingRecord={editingRecord}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                serverErrors={serverErrors}
            />
        </PageContainer>
    );
};

export default FuelTypeListPage;
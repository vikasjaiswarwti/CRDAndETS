import React from 'react';
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';
import { useGetAllLkpPenaltyTypesQuery } from '../services/LkpPenaltytypeApi';
import { useLkpPenaltyTypeModal } from '../hooks/useLkpPenaltyTypeModal';
import { useLkpPenaltyTypeMutations } from '../hooks/useLkpPenaltyTypeMutations';
import { useLkpPenaltyTypeTable } from '../hooks/useLkPpenaltyTypeTable';
import LkpPenaltyTypeFormModal from '../components/Lkppenaltytypeformmodal';
import type { CreateLkpPenaltyTypeDto, UpdateLkpPenaltyTypeDto } from '../types/Lkppenaltytype.types';
import {LKP_PENALTY_TYPE_CONFIG} from "../config"

const LkpPenaltyTypeListPage: React.FC = () => {

    // 2. Modal state
    const { isOpen, editingRecord, openCreate, openEdit, close } = useLkpPenaltyTypeModal();

    // 3. Mutations
    const {
        createLkpPenaltyType,
        updateLkpPenaltyType,
        isCreating,
        isUpdating,
        createError,
        updateError,
    } = useLkpPenaltyTypeMutations({ onCreateSuccess: close, onUpdateSuccess: close });

    // 4. Table
    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useLkpPenaltyTypeTable({ onEdit: openEdit });



    // 5. Data fetch
    const { data, isLoading, error, refetch } = useGetAllLkpPenaltyTypesQuery(queryArgs);


    console.log('data.total', data, tableState);

    // 7. Derived values
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    // 8. Submit handler
    const handleSubmit = async (values: Record<string, unknown>) => {
        if (editingRecord) {
            await updateLkpPenaltyType({
                id: editingRecord.penaltyType_ID,
                penaltyType: values.penaltyType as string,
                applicableTo: values.applicableTo as string,
                isActive: values.isActive as boolean,
            } as UpdateLkpPenaltyTypeDto);
        } else {
            await createLkpPenaltyType({
                penaltyType: values.penaltyType as string,
                applicableTo: values.applicableTo as string,
                isActive: values.isActive as boolean,
            } as CreateLkpPenaltyTypeDto);
        }
    };

    return (
        <PageContainer
            title="Penalty Type Management"
            subtitle="Manage penalty categories applicable to drivers and passengers"
            createButtonLabel="Create Penalty Type"
            onCreateClick={openCreate}
            canCreate={LKP_PENALTY_TYPE_CONFIG.canCreate}
            // filterButtonLabel="Filter"
            // onFilterClick={() => dispatch(toggleFilterPanel())}
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
                searchPlaceholder="Search by penalty type"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No penalty types found. Create your first one."
                >
                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="penaltyType_ID"
                        total={data?.totalCount ?? 0}
                        tableState={tableState}
                        onTableChange={setTableState}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <LkpPenaltyTypeFormModal
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

export default LkpPenaltyTypeListPage;
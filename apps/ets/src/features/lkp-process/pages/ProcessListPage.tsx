import React from 'react';
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';
import { useProcessTable } from '../hooks/useProcessTable';
import { useProcessModal } from '../hooks/useProcessModal';
import { useProcessMutations } from '../hooks/useProcessMutations';
import { useGetAllProcessesQuery } from '../services/processApi';
import { ProcessFormModal } from '../components/ProcessFormModal';
import type { CreateProcessDto, UpdateProcessDto } from '../types/process.types';

import { PROCESS_CONFIG } from '../config';

const ProcessListPage: React.FC = () => {
    // console.log("🔄 ProcessListPage RENDERED");

    const { isOpen, editingRecord, openCreate, openEdit, close } = useProcessModal();
    // console.log("📱 Modal state:", { isOpen, editingRecord });

    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useProcessTable({ onEdit: openEdit });



    // Make sure queryArgs has correct shape
    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
        // status,
        // originalArgs
    } = useGetAllProcessesQuery(queryArgs, {
        // Add selectFromResult to see more details
        selectFromResult: (result) => {
            console.log("🔄 selectFromResult called:", {
                status: result.status,
                isUninitialized: result.isUninitialized,
                isLoading: result.isLoading,
                isFetching: result.isFetching,
                isSuccess: result.isSuccess,
                isError: result.isError,
                data: result.data,
                error: result.error
            });
            return result;
        }
    });


    const { createProcess, updateProcess, isCreating, isUpdating, createError, updateError } =
        useProcessMutations({ onCreateSuccess: close, onUpdateSuccess: close });

    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    const handleSubmit = async (values: Record<string, unknown>) => {
        // console.log("📝 Form submitted:", values);
        if (editingRecord) {
            await updateProcess({ id: editingRecord.id, procode: values.procode as string, proname: (values.proname as string) || null, active: values.active as boolean } as UpdateProcessDto);
        } else {
            await createProcess({ procode: values.procode as string, proname: (values.proname as string) || null, active: values.active as boolean } as CreateProcessDto);
        }
    };


    return (
        <PageContainer
            title="Process Management"
            subtitle="Manage operational processes and workflows"
            createButtonLabel="Create Process"
            // onCreateClick={openCreate}
            onCreateClick={PROCESS_CONFIG?.canCreate ? openCreate : undefined}
            canCreate={PROCESS_CONFIG.canCreate}
            // filterButtonLabel="Filter"
            // onFilterClick={() => {
            //     // console.log("🔘 Filter button clicked");
            //     dispatch(toggleFilterPanel());
            // }}

            pagination={
                data?.total
                    ? {
                        total: data.total,
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
                searchPlaceholder="Search by process name or code"
                onSearch={(value) => {
                    // console.log("🔍 Search triggered with value:", value);
                    handleSearch(value);
                }}
                showSearch={false}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={() => {
                        // console.log("🔄 Retry triggered");
                        refetch();
                    }}
                    emptyMessage="No processes found. Create your first one."
                >
                    <AppTable
                        loading={isLoading || isFetching}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="id"
                        total={data?.total ?? 0}
                        tableState={tableState}
                        onTableChange={(newState) => {
                            // console.log("📄 Table state changed:", newState);
                            setTableState(newState);
                        }}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <ProcessFormModal
                open={isOpen}
                onClose={() => {
                    // console.log("❌ Modal closed");
                    close();
                }}
                editingRecord={editingRecord}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                serverErrors={serverErrors}
            />
        </PageContainer>
    );
};

export default ProcessListPage;
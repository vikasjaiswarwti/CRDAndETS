import React, { useCallback } from 'react';
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';

import { useGetShiftIntervalsQuery } from '../services/shiftintervalApi';
import { useShiftIntervalModal } from '../hooks/useShiftintervalModal';
import { useShiftIntervalMutations } from '../hooks/useShiftintervalMutations';
import { useShiftIntervalTable } from '../hooks/useShiftIntervalTable';
import { ShiftIntervalFormModal } from '../components/ShiftintervalformModal';

import type { CreateShiftIntervalDto, UpdateShiftIntervalDto } from '../types/shiftinterval.types';

const ShiftIntervalListPage: React.FC = () => {
    // 4. Modal hoisted so openEdit can flow into table hook
    const { isOpen, editingRecord, openCreate, openEdit, close } = useShiftIntervalModal();

    // 2. Table
    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useShiftIntervalTable({ onEdit: openEdit });

    // 3. Data fetch
    const { data, isLoading, error, refetch } = useGetShiftIntervalsQuery(queryArgs);

    // 5. Mutations
    const {
        createShiftInterval,
        updateShiftInterval,
        isCreating,
        isUpdating,
        createError,
        updateError,
    } = useShiftIntervalMutations({ onCreateSuccess: close, onUpdateSuccess: close });

    // 6. Derived
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    // 7. Submit
    const handleSubmit = useCallback(
        async (values: Record<string, unknown>) => {
            const payload = {
                intervalMinute: Number(values.intervalMinute),
                intervalText: (values.intervalText as string) || null,
                active: Boolean(values.active),
            };

            if (editingRecord) {
                await updateShiftInterval({ ...payload, id: editingRecord.id } as UpdateShiftIntervalDto);
            } else {
                await createShiftInterval(payload as CreateShiftIntervalDto);
            }
        },
        [editingRecord, createShiftInterval, updateShiftInterval],
    );

    return (
        <PageContainer
            title="Shift Interval Management"
            subtitle="Define time intervals used in shift scheduling"
            createButtonLabel="Create Shift Interval"
            onCreateClick={openCreate}

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
                searchPlaceholder="Search by interval label"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No shift intervals found. Create your first one."
                >
                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="id"
                        total={data?.total ?? 0}
                        tableState={tableState}
                        onTableChange={setTableState}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <ShiftIntervalFormModal
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

export default ShiftIntervalListPage;
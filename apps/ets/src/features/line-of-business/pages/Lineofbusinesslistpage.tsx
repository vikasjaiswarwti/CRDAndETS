import React from 'react';

import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';

import { useGetAllLineOfBusinessQuery } from '../services/lineofbusinessapi';

import { useLineOfBusinessTable } from '../hooks/uselineofbusinesstable';
import { useLineOfBusinessModal } from '../hooks/uselineofbusinessmodal';
import { useLineOfBusinessMutations } from '../hooks/uselineofbusinessmutations';

import LineOfBusinessFormModal from '../components/Lineofbusinessformmodal';

import type { CreateLineOfBusinessDto, UpdateLineOfBusinessDto } from '../types/line-of-business.types';
import { LOB_CONFIG } from '../config';

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const LineOfBusinessListPage: React.FC = () => {

    // 2. Table state + columns ─────────────────────────────────────────────────
    //    onEdit wired after modal hook; passed as callback — no circular dep
    const { isOpen, editingRecord, openCreate, openEdit, close } = useLineOfBusinessModal();

    const {
        createLineOfBusiness,
        updateLineOfBusiness,
        isCreating,
        isUpdating,
        createError,
        updateError,
    } = useLineOfBusinessMutations({ onCreateSuccess: close, onUpdateSuccess: close });

    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useLineOfBusinessTable({ onEdit: openEdit });

    // 3. Real RTK Query — no mocks ─────────────────────────────────────────────
    const { data, isLoading, error, refetch } = useGetAllLineOfBusinessQuery(queryArgs);


    console.log('data from Line Of business', data);

    // 4–5 hooks declared above (modal + mutations) ─────────────────────────────

    // 6. Derived values ────────────────────────────────────────────────────────
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord
        ? updateError?.fieldErrors
        : createError?.fieldErrors;

    // 7. Submit handler ────────────────────────────────────────────────────────
    // AppForm merges initialValues (including lobCode_Id) back into submitted
    // values so the id is never stripped — see AppForm fix in architecture doc.
    const handleSubmit = async (values: Record<string, unknown>) => {
        if (editingRecord) {
            const payload: UpdateLineOfBusinessDto = {
                id: editingRecord.lobCode_Id,       // PUT /api/v1/LineOfBusiness/{id}
                lobName: (values.lobName as string) || null,
                active: values.active as boolean,
            };
            await updateLineOfBusiness(payload);
        } else {
            const payload: CreateLineOfBusinessDto = {
                lobName: (values.lobName as string) || null,
                active: values.active as boolean,
            };
            await createLineOfBusiness(payload);
        }
    };

    // 8. useMemo computations (none needed beyond table hook for this entity) ──

    // 9. JSX ───────────────────────────────────────────────────────────────────
    return (
        <PageContainer
            title="Line of Business Management"
            subtitle="Manage all lines of business used across the platform"
            createButtonLabel="Create Line of Business"
            onCreateClick={LOB_CONFIG?.canCreate ? openCreate : undefined}
            canCreate={LOB_CONFIG.canCreate}
            // filterButtonLabel="Filter"
            // onFilterClick={() => dispatch(toggleFilterPanel())}
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
                searchPlaceholder="Search by LOB name"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No lines of business found. Create your first one."
                >
                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="lobCode_Id"
                        total={data?.total ?? 0}
                        tableState={tableState}
                        onTableChange={setTableState}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <LineOfBusinessFormModal
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

export default LineOfBusinessListPage;
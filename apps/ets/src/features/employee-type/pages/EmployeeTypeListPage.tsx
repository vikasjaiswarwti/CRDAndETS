import React from 'react';
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';
import { useEmployeeTypeTable } from '../hooks/useEmployeeTypeTable';
import { useEmployeeTypeModal } from '../hooks/useEmployeeTypeModal';
import { useEmployeeTypeMutations } from '../hooks/useEmployeeTypeMutations';
import { useGetAllEmployeeTypesQuery } from '../services/EmployeeTypeApi';

import { EmployeeTypeFormModal } from '../components/EmployeeTypeFormModal';
import type { UpdateEmployeeTypeDto, CreateEmployeeTypeDto } from '../types/emplType.types';
import { EMPLOYEE_TYPE_CONFIG } from '../config';

const EmployeeTypeListPage: React.FC = () => {

    const { isOpen, editingRecord, openCreate, openEdit, close } = useEmployeeTypeModal();

    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useEmployeeTypeTable({ onEdit: openEdit });

    const { data, isLoading, error, refetch } = useGetAllEmployeeTypesQuery(queryArgs);

    console.log('data from Employee', data);

    const { createEmployeeType, updateEmployeeType, isCreating, isUpdating, createError, updateError } =
        useEmployeeTypeMutations({ onCreateSuccess: close, onUpdateSuccess: close });

    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    const handleSubmit = async (values: Record<string, unknown>) => {
        if (editingRecord) {
            await updateEmployeeType({
                id: editingRecord.empTypeCode_Id,
                empType: (values.empType as string) || null,
                description: (values.description as string) || null,
                isActive: values.isActive as boolean,
            } as UpdateEmployeeTypeDto);
        } else {
            await createEmployeeType({
                empType: (values.empType as string) || null,
                description: (values.description as string) || null,
                isActive: values.isActive as boolean,
            } as CreateEmployeeTypeDto);
        }
    };

    return (
        <PageContainer
            title="Employee Type Management"
            subtitle="Manage employee classifications and categories"
            createButtonLabel="Create Employee Type"
            onCreateClick={EMPLOYEE_TYPE_CONFIG?.canCreate ? openCreate : undefined}
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
                searchPlaceholder="Search by employee type"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}>

                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No employee types found. Create your first one.">

                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="empTypeCode_Id"
                        total={data?.totalCount ?? 0}
                        tableState={tableState}
                        onTableChange={setTableState} />

                </ApiStateWrapper>

            </DataTableWrapper>

            <EmployeeTypeFormModal
                open={isOpen}
                onClose={close}
                editingRecord={editingRecord}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                serverErrors={serverErrors} />
        </PageContainer>
    );
};

export default EmployeeTypeListPage;
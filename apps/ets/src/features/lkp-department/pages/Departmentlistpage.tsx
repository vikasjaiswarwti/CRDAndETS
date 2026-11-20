import React from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useDepartmentTable } from "../hooks/useDepartmentTable";
import { useDepartmentModal } from "../hooks/useDepartmentModal";
import { useDepartmentMutations } from "../hooks/useDepartmentMutations";
import { useGetAllDepartmentsQuery } from "../services/Departmentapi";

import { DepartmentFormModal } from "../components/Departmentformmodal";
import type {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../types/department.type";

import { DEPARTMENT_CONFIG } from "../config";

const DepartmentListPage: React.FC = () => {
  // 4. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useDepartmentModal();

  // 2. Table state + columns
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useDepartmentTable({ onEdit: openEdit });

  // 3. Data fetch
  const { data, isLoading, error, refetch } =
    useGetAllDepartmentsQuery(queryArgs);

  console.log("data from Document page list", data);

  // 5. Mutations
  const {
    createDepartment,
    updateDepartment,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useDepartmentMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      await updateDepartment({
        id: editingRecord.dept_Id,
        depCode: (values.depCode as string) || null,
        depName: (values.depName as string) || null,
        isActive: values.isActive as boolean,
      } as UpdateDepartmentDto);
    } else {
      await createDepartment({
        depCode: (values.depCode as string) || null,
        depName: (values.depName as string) || null,
        isActive: values.isActive as boolean,
      } as CreateDepartmentDto);
    }
  };

  return (
    <PageContainer
      title="Department Management"
      subtitle="Manage organisational departments and their active status"
      createButtonLabel="Create Department"
      onCreateClick={DEPARTMENT_CONFIG?.canCreate ? openCreate : undefined}
      // filterButtonLabel="Filter"
      // onFilterClick={() => dispatch(toggleFilterPanel())}
      canCreate={DEPARTMENT_CONFIG.canCreate}
      pagination={
        data?.totalCount
          ? {
              total: data.totalCount,
              current: tableState.page,
              pageSize: tableState.pageSize,
              onChange: (page, pageSize) =>
                setTableState({ ...tableState, page, pageSize }),
            }
          : undefined
      }
    >
      <DataTableWrapper
        searchPlaceholder="Search by department name or code"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No departments found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="dept_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <DepartmentFormModal
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

export default DepartmentListPage;

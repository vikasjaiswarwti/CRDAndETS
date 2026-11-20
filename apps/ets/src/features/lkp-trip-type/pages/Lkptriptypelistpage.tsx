import React from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllLkpTripTypesQuery } from "../services/LkpTripTypeApi";
import { useLkpTripTypeModal } from "../hooks/useLkpTripTypeModal";
import { useLkpTripTypeMutations } from "../hooks/useLkpTripTypeMutations";
import { useLkpTripTypeTable } from "../hooks/useLkpTripTypeTable";
import LkpTripTypeFormModal from "../components/Lkptriptypeformmodal";
import type {
  CreateLkpTripTypeDto,
  UpdateLkpTripTypeDto,
} from "../types/Lkptriptype";
import { LKP_TRIP_TYPE_CONFIG } from "../config";

const LkpTripTypeListPage: React.FC = () => {
  // 2. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useLkpTripTypeModal();

  // 3. Mutations
  const {
    createLkpTripType,
    updateLkpTripType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useLkpTripTypeMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useLkpTripTypeTable({ onEdit: openEdit });

  // 5. Data fetch
  const { data, isLoading, error, refetch } =
    useGetAllLkpTripTypesQuery(queryArgs);

  // 7. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 8. Submit handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      await updateLkpTripType({
        id: editingRecord.id,
        tripTypeName: values.tripTypeName as string,
        active: values.active as boolean,
      } as UpdateLkpTripTypeDto);
    } else {
      await createLkpTripType({
        tripTypeName: values.tripTypeName as string,
        active: values.active as boolean,
      } as CreateLkpTripTypeDto);
    }
  };

  return (
    <PageContainer
      title="Trip Type Management"
      subtitle="Manage trip categories used across the platform"
      createButtonLabel="Create Trip Type"
      onCreateClick={openCreate}
      canCreate={LKP_TRIP_TYPE_CONFIG.canCreate}
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
        searchPlaceholder="Search by trip type name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No trip types found. Create your first one."
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

      <LkpTripTypeFormModal
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

export default LkpTripTypeListPage;

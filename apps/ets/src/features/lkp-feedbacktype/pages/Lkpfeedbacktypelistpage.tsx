import React from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useGetAllLkpFeedbackTypesQuery } from "../services/LkpfeedbacktypeApi";
import { useLkpFeedbackTypeModal } from "../hooks/useLkpFeedbacktypeModal";
import { useLkpFeedbackTypeMutations } from "../hooks/useLkpFeedbacktypeMutations";
import { useLkpFeedbackTypeTable } from "../hooks/useLkpFeedbacktypeTable";
import LkpFeedbackTypeFormModal from "../components/Lkpfeedbacktypeformmodal";

import type {
  CreateLkpFeedbackTypeDto,
  UpdateLkpFeedbackTypeDto,
} from "../types/Lkpfeedbacktype.types";
import { LKP_FEEDBACKTYPE_CONFIG } from "../config";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchInput from "../../../shared/components/Search/SearchInput";

const LkpFeedbackTypeListPage: React.FC = () => {
  // 2. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useLkpFeedbackTypeModal();

  // 3. Mutations
  const {
    createLkpFeedbackType,
    updateLkpFeedbackType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useLkpFeedbackTypeMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useLkpFeedbackTypeTable({ onEdit: openEdit });

  // 5. Data fetch
  const { data, isLoading, error, refetch } =
    useGetAllLkpFeedbackTypesQuery(queryArgs);

  // 7. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 8. Submit handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      await updateLkpFeedbackType({
        id: editingRecord.feedbackType_ID,
        feedbackType: values.feedbackType as string,
        isActive: values.isActive as boolean,
      } as UpdateLkpFeedbackTypeDto);
    } else {
      await createLkpFeedbackType({
        feedbackType: values.feedbackType as string,
        isActive: values.isActive as boolean,
      } as CreateLkpFeedbackTypeDto);
    }
  };

  return (
    <PageContainer
      title="Feedback Type Management"
      subtitle="Manage feedback categories used across the platform"
      createButtonLabel="Create"
      onCreateClick={openCreate}
      canCreate={LKP_FEEDBACKTYPE_CONFIG.canCreate}
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
        searchPlaceholder="Search by feedback type"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by feedback Type"}
              handleSearch={handleSearch}
              isLettersOnly
            />
          </div>
        </SearchFilterWrapper>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No feedback types found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="feedbackType_ID"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <LkpFeedbackTypeFormModal
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

export default LkpFeedbackTypeListPage;

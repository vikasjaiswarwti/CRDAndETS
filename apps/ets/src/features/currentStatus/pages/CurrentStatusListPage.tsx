import React, { useMemo } from "react";
// import { useDispatch } from "react-redux";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllCurrentStatusesQuery } from "../services/currentStatusApi";
import { useCurrentStatusTable } from "../hooks/useCurrentStatusTable";
import { useCurrentStatusModal } from "../hooks/useCurrentStatusModal";
import { useCurrentStatusMutations } from "../hooks/useCurrentStatusMutations";
// import { toggleFilterPanel } from "../slice/currentStatusSlice";
import type {
  CreateCurrentStatusDto,
  UpdateCurrentStatusDto,
} from "../types/currentStatus.types";
import CurrentStatusFormModal from "../components/CurrentStatusFormModal";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

// ─── Page ─────────────────────────────────────────────────────────────────────
const CurrentStatusListPage: React.FC = () => {
  // const dispatch = useDispatch();

  // 2. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useCurrentStatusModal();

  // 3. Mutations
  const {
    createCurrentStatus,
    updateCurrentStatus,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useCurrentStatusMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table state + columns
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useCurrentStatusTable({ onEdit: openEdit });

  // 5. Real API call
  const { data, isLoading, error, refetch } =
    useGetAllCurrentStatusesQuery(queryArgs);

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler — preserves id for update path
  const handleSubmit = useMemo(
    () => async (values: Record<string, unknown>) => {
      console.log("Submitting form with values:", values);
      if (editingRecord) {
        await updateCurrentStatus({
          currentStatus_Id: editingRecord.currentStatus_Id,
          statusName: values.statusName as string | null,
          status: values.status as boolean,
        } satisfies UpdateCurrentStatusDto);
      } else {
        const payload = {
          statusName: values.statusName as string | null,
        };

        await createCurrentStatus(payload as CreateCurrentStatusDto);
      }
    },
    [editingRecord, createCurrentStatus, updateCurrentStatus],
  );

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <PageContainer
      title="Current Status Management"
      subtitle="Manage driver and vehicle current status labels"
      createButtonLabel="Add Status"
      onCreateClick={openCreate}
      // filterButtonLabel="Filter Statuses"
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
        searchPlaceholder="Search by status name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by status"}
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
          emptyMessage="No statuses found. Create your first one."
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

      <CurrentStatusFormModal
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

export default CurrentStatusListPage;

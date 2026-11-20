import React from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllLkpAdhocWeekDaysQuery } from "../services/LkpAdhocWeekDaysApi";
import { useLkpAdhocWeekDaysModal } from "../hooks/useLkpAdhocWeekdaysModal";
import { useLkpAdhocWeekDaysMutations } from "../hooks/useLkpAdhocWeekdaysMutations";
import { useLkpAdhocWeekDaysTable } from "../hooks/useLkpAdhocWeekdaysTable";
import LkpAdhocWeekDaysFormModal from "../components/LkpAdhocWeekdaysFormModal";
import type {
  CreateLkpAdhocWeekDayDto,
  UpdateLkpAdhocWeekDayDto,
} from "../types/Lkpadhocweekdays.types";
import { useLookups } from "../../lookups";

import { DAY_LABEL_MAP } from "../constants/LkpAdhocWeekDaysConstants";
import { ADHOC_CONFIG_CONFIG } from "../config";

const LkpAdhocWeekDaysListPage: React.FC = () => {
  // 2. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useLkpAdhocWeekDaysModal();

  // 3. Mutations
  const {
    createLkpAdhocWeekDay,
    updateLkpAdhocWeekDay,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useLkpAdhocWeekDaysMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useLkpAdhocWeekDaysTable({ onEdit: openEdit });

  // 5. Data fetch
  const { data, isLoading, error, refetch } =
    useGetAllLkpAdhocWeekDaysQuery(queryArgs);

  console.log("data from adhoc", data);

  // 7. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });

  // 8. Submit handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    const dayCode = values.dayCode as string;
    const daysName = DAY_LABEL_MAP[dayCode] ?? dayCode; // derive name from code

    if (editingRecord) {
      await updateLkpAdhocWeekDay({
        id: editingRecord.id,
        locCode: values.locCode as string,
        dayCode: values.dayCode as string,
        daysName: daysName as string,
        active: values.active as boolean,
      } as UpdateLkpAdhocWeekDayDto);
    } else {
      await createLkpAdhocWeekDay({
        locCode: values.locCode as string,
        dayCode: values.dayCode as string,
        daysName: daysName as string,
        active: values.active as boolean,
      } as CreateLkpAdhocWeekDayDto);
    }
  };

  return (
    <PageContainer
      title="Adhoc Week Days Management"
      subtitle="Manage adhoc working days per location"
      createButtonLabel="Create Adhoc Week Day"
      onCreateClick={openCreate}
      // filterButtonLabel="Filter"
      // onFilterClick={() => dispatch(toggleFilterPanel())}
      canCreate={ADHOC_CONFIG_CONFIG.canCreate}
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
        searchPlaceholder="Search by day name or location"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No adhoc week days found. Create your first one."
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

      <LkpAdhocWeekDaysFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        locationOptions={locationOptions}
      />
    </PageContainer>
  );
};

export default LkpAdhocWeekDaysListPage;

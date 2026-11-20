// FILE 10 — pages/CityZoneListPage.tsx

import React from "react";
// import { useDispatch } from 'react-redux';
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllCityZonesQuery } from "../services/cityZoneApi";
import { useCityZoneTable } from "../hooks/useCityZoneTable";
import { useCityZoneModal } from "../hooks/useCityZoneModal";
import { useCityZoneMutations } from "../hooks/useCityZoneMutations";
// import { toggleFilterPanel } from '../slice/cityZoneSlice';
import CityZoneFormModal from "../components/CityZoneFormModal";
import type {
  CreateCityZoneDto,
  UpdateCityZoneDto,
} from "../types/cityZone.types";
import { CITY_ZONE_CONFIG } from "../config";

const CityZoneListPage: React.FC = () => {
  // const dispatch = useDispatch();

  // 4. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useCityZoneModal();

  // 5. Mutations
  const {
    createCityZone,
    updateCityZone,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useCityZoneMutations({ onCreateSuccess: close, onUpdateSuccess: close });

  // 2. Table state + columns (onEdit wired, no delete endpoint)
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useCityZoneTable({ onEdit: openEdit });

  // 3. Real API call — no mock data
  const { data, isLoading, error, refetch } =
    useGetAllCityZonesQuery(queryArgs);

  const items = data?.items ?? [];
  const isEmpty = !isLoading && items.length === 0;

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler — merges id back in for update
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      await updateCityZone({
        id: editingRecord.id,
        cityZoneCode: values.cityZoneCode as string,
        cityZoneDescription: (values.cityZoneDescription as string) || null,
        active: values.active as boolean,
      } satisfies UpdateCityZoneDto);
    } else {
      await createCityZone({
        cityZoneCode: values.cityZoneCode as string,
        cityZoneDescription: (values.cityZoneDescription as string) || null,
        active: values.active as boolean,
      } satisfies CreateCityZoneDto);
    }
  };

  // 9. JSX
  return (
    <PageContainer
      title="City Zone Management"
      subtitle="Manage city zones and their active status"
      createButtonLabel="Create City Zone"
      onCreateClick={openCreate}
      canCreate={CITY_ZONE_CONFIG.canCreate}
      // filterButtonLabel="Filter Zones"
      // onFilterClick={() => dispatch(toggleFilterPanel())}
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
        searchPlaceholder="Search by zone code or description"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refetch}
          emptyMessage="No city zones found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={items}
            rowKey="id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <CityZoneFormModal
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

export default CityZoneListPage;

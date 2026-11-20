import React from "react";
// import { useDispatch } from 'react-redux';
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useGetAllLkpLocationsQuery } from "../services/lkplocationapi";
// import { toggleFilterPanel } from '../slice/lkplocationslice';
import { useLkpLocationTable } from "../hooks/uselkplocationtable";
import { useLkpLocationModal } from "../hooks/uselkplocationmodal";
import { useLkpLocationMutations } from "../hooks/uselkplocationmutations";

import LkpLocationFormModal from "../components/Lkplocationformmodal";

import { LOCATION_CONFIG } from "../config";

import type {
  CreateLkpLocationDto,
  UpdateLkpLocationDto,
} from "../types/lkpLocation.types";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

const LkpLocationListPage: React.FC = () => {
  // const dispatch = useDispatch();

  // 2. Modal state ───────────────────────────────────────────────────────────
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useLkpLocationModal();

  // 3. Mutations ─────────────────────────────────────────────────────────────
  const {
    createLkpLocation,
    updateLkpLocation,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useLkpLocationMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table state + columns ─────────────────────────────────────────────────
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useLkpLocationTable({ onEdit: openEdit });

  // 5. Real RTK Query — no mocks ─────────────────────────────────────────────
  const { data, isLoading, error, refetch } =
    useGetAllLkpLocationsQuery(queryArgs);

  // 6. Derived values ────────────────────────────────────────────────────────
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler ────────────────────────────────────────────────────────
  // lkpLocation_Id is read directly from editingRecord — never from form values
  // so it is never lost to Ant Design's field-stripping behaviour.
  //
  // IVR casing note:
  //   GET response  → driverAppIVRNumber / userAppIVRNumber  (uppercase IVR)
  //   POST/PUT body → driverAppIvrNumber / userAppIvrNumber  (lowercase vr)
  // Form fields use the POST/PUT casing; we send them as-is.

  const handleSubmit = async (values: Record<string, unknown>) => {
    // console.log('values from handle Submit', values);

    const sharedPayload = {
      locCode: Number(values.locCode) || 1,
      locName: (values.locName as string) || "",
      lat: values.lat !== "" ? Number(values.lat) : null,
      lng: values.lng !== "" ? Number(values.lng) : null,
      address: (values.address as string) || null,
      city: (values.city as string) || null,
      state: (values.state as string) || null,
      dispName: (values.dispName as string) || null,
      locGroup:  null,
      cityZone:  null,
      helpDeskContactNumber: (values.helpDeskContactNumber as string) || null,
      sosContactNumber: (values.sosContactNumber as string) || null,
      driverAppIvrNumber: (values.driverAppIvrNumber as string) || null,
      userAppIvrNumber: (values.userAppIvrNumber as string) || null,
      active: (values.active as boolean | null) ?? null,
      isAutoPenalty: (values.isAutoPenalty as boolean | null) ?? null,
    };

    if (editingRecord) {
      const payload: UpdateLkpLocationDto = {
        id: editingRecord.lkpLocation_Id,
        ...sharedPayload,
      };
      await updateLkpLocation(payload);
    } else {
      const payload: CreateLkpLocationDto = { ...sharedPayload };
      await createLkpLocation(payload);
    }
  };

  // 9. JSX ───────────────────────────────────────────────────────────────────
  return (
    <PageContainer
      title="Office"
      subtitle="Manage all offices and their configuration details"
      createButtonLabel="Create Office"
      onCreateClick={LOCATION_CONFIG?.canCreate ? openCreate : undefined}
      canCreate={LOCATION_CONFIG.canCreate}
      // filterButtonLabel="Filter"
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
        searchPlaceholder="Search by offices name or code"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by office name"}
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
          emptyMessage="No offices found. Create your first one."
        >
          <AppTable
            columns={columns}
            loading={isLoading}
            dataSource={data?.items ?? []}
            rowKey="lkpLocation_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <LkpLocationFormModal
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

export default LkpLocationListPage;

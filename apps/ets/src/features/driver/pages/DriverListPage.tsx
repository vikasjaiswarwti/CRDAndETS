import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import {
  useGetAllDriversQuery,
  useGetDriverStagesQuery,
} from "../services/driverApi";
import { useDriverTable, useDriverStageTable } from "../hooks/useDriverTable";
import { useDriverModal, useDriverStageModal } from "../hooks/useDriverModal";
import { useDriverMutations } from "../hooks/useDriverMutations";
// import { toggleFilterPanel } from "../slice/driverSlice";
import {
  mapDriverResponseToEntity,
  type CreateDriverDto,
  type UpdateDriverDto,
} from "../types/driver.types";
import { useLookups } from "../../lookups";
import { setActiveTab } from "../slice/driverSlice";

import BulkUploadModal from "../components/BulkUploadModal";
import DriverForm from "../components/DriverForm";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import ViewDriver from "./../components/ViewDriver";
// import { DRIVER_CONFIG } from "../config";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import { usePermittedHook } from "../hooks/usePermittedHook";
// ─── Page ─────────────────────────────────────────────────────────────────────

export interface PageTabItem {
  key: string;
  label: string;
  count?: number;
}

interface PageTabsProps {
  tabs: PageTabItem[];
  activeTab: string;
  onChange: (tab: "pending" | "approved") => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key as "pending" | "approved")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              paddingBottom: 6,
              paddingInline: 4,
              borderBottom: isActive
                ? "2px solid #1B4332"
                : "2px solid transparent",
              color: isActive ? "#1B4332" : "#8e9e96",
              fontWeight: isActive ? 700 : 400,
              fontSize: 13,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}

            {tab.count && tab.count > 0 ? `(${tab.count})` : null}
          </button>
        );
      })}
    </div>
  );
};

const DriverListPage: React.FC = () => {
  const dispatch = useDispatch();
  const { DRIVER_CONFIG } = usePermittedHook();
  const {
    currentStatusOptions,
    statesOptions,
    vendorOptions,
    locationOptions,
    documentTypesOptions,
  } = useLookups({
    only: [
      "currentStatusOptions",
      "statesOptions",
      "vendorOptions",
      "locationOptions",
      "documentTypesOptions",
    ],
  });
  const { uploadAndGetUrl } = useFileUpload();

  // 2. Modal state
  const {
    isOpen,
    editingRecord,
    openCreate,
    openEdit,
    close,
    isView,
    openView,
    closeView,
  } = useDriverModal();

  const {
    isOpenStage,
    editingStageRecord,
    openCreateStage,
    closeStage,
    openEditStage,
    isBulkUpload,
    openBulkUpload,
    closeBulkUpload,
  } = useDriverStageModal();

  // 3. Mutations — must be declared before table so deleteDriver can be passed
  const {
    createDriver,
    updateDriver,
    isCreating,
    isUpdating,
    createError,
    updateError,
    createStageDriver,
    updateStageDriver,

    isCreatingStage,
    isUpdatingStage,
    createStageError,
    updateStageError,

    approveStageDriver,
    isApprovingStage,
  } = useDriverMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
    onStageCreateSuccess: closeStage,
    onStageUpdateSuccess: closeStage,
    onStageApproveSuccess: closeStage,
    onBulkUploadSuccess: closeBulkUpload,
  });

  // 4. Table state + columns
  const {
    columns,
    tableState,
    setTableState,
    // search,
    handleSearch,
    handleVendorName,
    handleLocationName,
    resetFilters,
    queryArgs,
  } = useDriverTable({
    onEdit: openEdit,
    onView: openView,
  });
  const {
    columnsStage,
    tableStageState,
    setTableStageState,
    // searchStage,
    handleStageSearch,
    handleStageVendorName,
    handleStageLocationName,
    resetStageFilters,
    queryStageArgs,
  } = useDriverStageTable({
    onEdit: openEditStage,
    onView: openView,
  });
  const {
    data: stageDriver,
    isLoading: stageLoading,
    error: stageError,
    refetch: stageRefetch,
  } = useGetDriverStagesQuery(queryStageArgs);
  // 6. Derived values
  const stageDriverData = useMemo(
    () => stageDriver?.items?.map(mapDriverResponseToEntity) ?? [],
    [stageDriver?.items],
  );
  // 5. Real API call — no mock data
  const { data, isLoading, error, refetch } = useGetAllDriversQuery(queryArgs);

  // 6. Derived values
  const drivers = useMemo(
    () => data?.items?.map(mapDriverResponseToEntity) ?? [],
    [data?.items],
  );
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;
  const isSubmittingStage = isCreatingStage || isUpdatingStage;
  const serverStageErrors = editingStageRecord
    ? updateStageError?.fieldErrors
    : createStageError?.fieldErrors;

  const handleSubmit = useMemo(
    () => async (values: Record<string, unknown>) => {
      let payload = values;
      if (editingRecord) {
        payload = { ...payload, driver_Id: editingRecord.driver_Id };
        await updateDriver(payload as unknown as UpdateDriverDto);
      } else {
        payload = { ...payload, active: true };
        await createDriver(payload as unknown as CreateDriverDto);
      }
      refetch();
    },
    [editingRecord, createDriver, updateDriver],
  );
  const handleSubmitStage = useMemo(
    () => async (values: Record<string, unknown>) => {
      let payload = values;
      if (editingStageRecord) {
        payload = { ...payload, driver_Id: editingStageRecord.driver_Id };
        await updateStageDriver(payload as unknown as UpdateDriverDto);
      } else {
        payload = { ...payload, active: true };
        await createStageDriver(payload as unknown as CreateDriverDto);
      }
      stageRefetch();
    },
    [editingStageRecord, createStageDriver, updateStageDriver], // ← STALE CLOSURE
  );
  const handleApprove = async (driverStageId: string | undefined) => {
    if (!driverStageId) return;
    await approveStageDriver(driverStageId);
  };
  const tabs: {
    key: string;
    label: string;
    visible: boolean;
    count: number;
  }[] = useMemo(
    () =>
      [
        {
          key: "pending",
          label: "Pending Driver",
          visible: DRIVER_CONFIG.canTabPendingView,
          count: stageDriver?.totalCount ?? 0,
        },
        {
          key: "approved",
          label: "Approved Driver",
          visible: DRIVER_CONFIG.canTabApproveView,
          count: data?.totalCount ?? 0,
        },
      ].filter((tab) => tab.visible),
    [],
  );
  const [activeTab, setLocalTab] = useState<"pending" | "approved">(
    (tabs[0]?.key as "pending" | "approved") || "pending",
  );
  const switchTab = useCallback((tab: "pending" | "approved") => {
    setLocalTab(tab);
    dispatch(setActiveTab(tab));
    resetFilters();
    resetStageFilters();
  }, []);
  useEffect(() => {
    const tabExists = tabs.some((t) => t.key === activeTab);

    if (!tabExists && tabs.length > 0) {
      setActiveTab(tabs[0].key as "pending" | "approved");
    }
  }, [tabs, activeTab]);
  return (
    <>
      {isView && (
        <ViewDriver
          title={"View Driver"}
          onClose={closeView}
          editingRecord={editingRecord != null ? editingRecord : null}
        />
      )}
      {!isView && (
        <>
          {isOpenStage && (
            <DriverForm
              title={editingStageRecord ? "Edit" : "Create"}
              onClose={closeStage}
              uploadAndGetUrl={uploadAndGetUrl}
              onSubmit={handleSubmitStage}
              editingRecord={editingStageRecord}
              vendorOptions={vendorOptions}
              locationOptions={locationOptions}
              isApproving={isApprovingStage}
              documentTypesOptions={documentTypesOptions}
              isSubmitting={isSubmittingStage}
              serverErrors={serverStageErrors}
              currentStatusOptions={currentStatusOptions}
              statesOptions={statesOptions}
              isApproved={
                editingStageRecord ? DRIVER_CONFIG.canStageApprove : false
              }
              approveDriver={handleApprove}
            />
          )}
          {isOpen && (
            <DriverForm
              title={editingRecord ? "Edit" : "Create"}
              onClose={close}
              uploadAndGetUrl={uploadAndGetUrl}
              onSubmit={handleSubmit}
              editingRecord={editingRecord}
              isApproving={false}
              vendorOptions={vendorOptions}
              locationOptions={locationOptions}
              documentTypesOptions={documentTypesOptions}
              isSubmitting={isSubmitting}
              serverErrors={serverErrors}
              currentStatusOptions={currentStatusOptions}
              statesOptions={statesOptions}
            />
          )}
          {activeTab === "pending" && isOpenStage == false && (
            <PageContainer
              title="Driver Management"
              subtitle="Manage all registered drivers and their details"
              createButtonLabel={"Add Driver"}
              onCreateClick={() => openCreateStage()}
              // filterButtonLabel="Filter"
              // onFilterClick={() => dispatch(toggleFilterPanel())}
              bulkButtonLabel={`Upload`}
              onBulkClick={openBulkUpload}
              canBulk={DRIVER_CONFIG.canStageBulk}
              canCreate={DRIVER_CONFIG.canStageCreate}
              pagination={
                stageDriver?.totalCount
                  ? {
                      total: stageDriver.totalCount,
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
                searchPlaceholder=" by driver name or license"
                onSearch={handleStageSearch}
                showSearch={false}
                pagination={null}
              >
                <SearchFilterWrapper>
                  {tabs.length > 1 && (
                    <PageTabs
                      tabs={tabs}
                      activeTab={activeTab}
                      onChange={switchTab}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <SearchSelect
                      placeholder={"Select office"}
                      options={locationOptions}
                      handleChange={handleStageLocationName}
                      // labelHide
                      // labelContent="Select Office"
                    />
                    <SearchInput
                      placeholder={"Search by vendor name"}
                      handleSearch={handleStageVendorName}
                      isLettersOnly
                      // labelHide
                      // labelContent="Enter Vendor Name"
                    />
                    <SearchInput
                      placeholder={"Search by driver name or no."}
                      handleSearch={handleStageSearch}
                      isAlphaNumeric
                      // labelHide
                      // labelContent="Enter Driver Name or No."
                    />
                  </div>
                </SearchFilterWrapper>

                <ApiStateWrapper
                  isLoading={stageLoading}
                  error={stageError}
                  isEmpty={!stageDriverData.length}
                  onRetry={stageRefetch}
                  emptyMessage="No drivers found. Add your first driver."
                >
                  <AppTable
                    loading={isLoading}
                    columns={columnsStage}
                    dataSource={stageDriverData || []}
                    rowKey="driver_Id"
                    total={stageDriver?.totalCount ?? 0}
                    tableState={tableStageState}
                    onTableChange={setTableStageState}
                  />
                </ApiStateWrapper>
              </DataTableWrapper>
            </PageContainer>
          )}
          {activeTab === "approved" && isOpen == false && (
            <PageContainer
              title="Driver Management"
              subtitle="Manage all registered drivers and their details"
              createButtonLabel={"Add Driver"}
              onCreateClick={() => openCreate()}
              canBulk={DRIVER_CONFIG.canBulk}
              canCreate={DRIVER_CONFIG.canCreate}
              // filterButtonLabel="Filter Drivers"
              // onFilterClick={() => dispatch(toggleFilterPanel())}
              bulkButtonLabel={""}
              onBulkClick={() => {}}
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
                searchPlaceholder="Search by driver name"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                    marginInline: 24,
                  }}
                >
                  {tabs.length > 1 && (
                    <PageTabs
                      tabs={tabs}
                      activeTab={activeTab}
                      onChange={switchTab}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <SearchSelect
                      placeholder={"Select office"}
                      options={locationOptions}
                      handleChange={handleLocationName}
                    />{" "}
                    <SearchInput
                      placeholder={"Search by vendor name"}
                      handleSearch={handleVendorName}
                    />
                    <SearchInput
                      placeholder={"Search by driver name or no."}
                      handleSearch={handleSearch}
                    />
                  </div>
                </div>

                <ApiStateWrapper
                  isLoading={isLoading}
                  error={error}
                  isEmpty={!drivers?.length}
                  onRetry={refetch}
                  emptyMessage="No drivers found. Add your first driver."
                >
                  <AppTable
                    loading={isLoading}
                    columns={columns}
                    dataSource={drivers}
                    rowKey="driver_Id"
                    total={data?.totalCount ?? 0}
                    tableState={tableState}
                    onTableChange={setTableState}
                  />
                </ApiStateWrapper>
              </DataTableWrapper>
            </PageContainer>
          )}
        </>
      )}
      {isBulkUpload && (
        <BulkUploadModal
          open={isBulkUpload}
          onClose={closeBulkUpload}
          // statesOptions={statesOptions}
          vendorOptions={vendorOptions}
          locationOptions={locationOptions}
        />
      )}
    </>
  );
};

export default DriverListPage;

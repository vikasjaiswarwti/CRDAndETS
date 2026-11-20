import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetAllVehiclesQuery,
  useGetAllStageVehicleQuery,
} from "../services/vehicleApi";
import {
  useVehicleStageTable,
  useVehicleTable,
} from "../hooks/useVehicleTable";
import {
  useVehicleModal,
  useVehicleStageModal,
} from "../hooks/useVehicleModal";
import { useVehicleMutations } from "../hooks/useVehicleMutations";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
} from "../types/vehicle.types";
import { useLookups } from "../../lookups";
import VehicleForm from "../components/VehicleForm";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useDispatch } from "react-redux";
import { setActiveTab } from "../slice/vehicleSlice";
import BulkUploadModal from "../components/BulkUploadModal";
import ViewVehicle from "../components/ViewVehicle";
// import { VEHICLE_CONFIG } from "../config";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import { usePermittedHook } from "../hooks/usePermittedHook";

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
              paddingBottom: 8,
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
const VehicleListPage: React.FC = () => {
  const dispatch = useDispatch();
  const { VEHICLE_CONFIG } = usePermittedHook();

  const {
    fuelTypeOptions,
    driverOptions,
    vehicleTypeOptions,
    locationOptions,
    vehicleStatusOptions,
    vendorOptions,
    currentStatusOptions,
  } = useLookups({
    only: [
      "fuelTypeOptions",
      "driverOptions",
      "vehicleTypeOptions",
      "locationOptions",
      "vehicleStatusOptions",
      "vendorOptions",
      "currentStatusOptions",
    ],
  });
  const { uploadAndGetUrl } = useFileUpload();

  const {
    isOpen,
    editingRecord,
    openCreate,
    openEdit,
    close,
    isView,
    openView,
    closeView,
  } = useVehicleModal();

  const {
    columns,
    tableState,
    setTableState,
    // search,
    handleSearch,
    handleLocationName,
    handleVendorName,
    resetFilters,
    queryArgs,
  } = useVehicleTable({
    onEdit: openEdit,
    onView: openView,
  });
  const { data, isLoading, error, refetch } = useGetAllVehiclesQuery(queryArgs);
  const {
    isOpenStage,
    editingStageRecord,
    openCreateStage,
    openEditStage,
    closeStage,
    isBulkUpload,
    openBulkUpload,
    closeBulkUpload,
  } = useVehicleStageModal();
  const {
    columnsStage,
    tableStageState,
    setTableStageState,
    // search,
    handleStageSearch,
    handleStageLocationName,
    handleStageVendorName,
    resetStageFilters,
    queryStageArgs,
  } = useVehicleStageTable({
    onEdit: openEditStage,
    onView: openView,
  });
  const {
    data: stageVehicle,
    isLoading: stageLoading,
    error: stageError,
    refetch: stageRefetch,
  } = useGetAllStageVehicleQuery(queryStageArgs);

  // 5. Mutations
  const {
    createVehicle,
    updateVehicle,
    isCreating,
    isUpdating,
    createError,
    updateError,
    // ---- stage
    createStageVehicle,
    isStageCreating,
    createStageError,
    updateStageVehicle,
    isStageUpdating,
    updateStageError,
    // -----------
    approveVehicleUpload,
    isApproveVehicleUpload,
    // approveVehicleUploadError,
  } = useVehicleMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
    onCreateStageSuccess: closeStage,
    onUpdateStageSuccess: closeStage,
    onApproveVehicleSuccess: closeStage,
  });

  // 7. Submit handler — merges vehicle_Id for updates, preserves id from initialValues
  const handleSubmit = async (values: Record<string, unknown>) => {
    let payload = {
      ...values,
      vehicle_Registration_No: String(
        values.vehicle_Registration_No,
      ).toUpperCase(),
      chassis_No: String(values.chassis_No).toUpperCase(),
    } as UpdateVehicleDto;
    if (editingRecord) {
      await updateVehicle({
        ...payload,
        vehicle_Id: editingRecord.vehicle_Id,
      });
    } else {
      // gaurav sir said to me to do this null
      await createVehicle(payload as unknown as CreateVehicleDto);
    }
  };
  const handleStageSubmit = async (values: Record<string, unknown>) => {
    let payload = {
      ...values,
      vehicle_Registration_No: String(
        values.vehicle_Registration_No,
      ).toUpperCase(),
      chassis_No: String(values.chassis_No).toUpperCase(),
    } as UpdateVehicleDto;
    if (editingStageRecord) {
      await updateStageVehicle({
        ...payload,
        vehicle_Id: editingStageRecord.vehicle_Id,
      });
    } else {
      await createStageVehicle(payload as CreateVehicleDto);
    }
    stageRefetch();
  };
  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;
  // 6. Derived values
  const isStageSubmitting =
    isStageCreating || isStageUpdating || isApproveVehicleUpload;
  const serverStageErrors = editingStageRecord
    ? updateStageError?.fieldErrors
    : createStageError?.fieldErrors;

  const handleApprove = async (vehicleStageId: string | undefined) => {
    if (!vehicleStageId) return;

    // if (!window.confirm("Are you sure you want to approve this Vehicle?"))
    //   return;
    // console.log(vehicleStageId, approveVehicleUpload);
    await approveVehicleUpload(vehicleStageId);
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
          label: "Pending Vehicle",
          visible: VEHICLE_CONFIG.canTabPendingView,
          count: stageVehicle?.totalCount ?? 0,
        },
        {
          key: "approved",
          label: "Approved Vehicle",
          visible: VEHICLE_CONFIG.canTabApproveView,
          count: data?.totalCount ?? 0,
        },
      ].filter((tab) => tab.visible),
    [],
  );
  const [activeTab, setLocalTab] = useState<"pending" | "approved">(
    (tabs[0]?.key as "pending") || "pending",
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
        <ViewVehicle
          title={"View Driver"}
          onClose={closeView}
          editingRecord={editingRecord != null ? editingRecord : null}
        />
      )}
      {!isView && (
        <>
          {/* pending */}
          {isOpenStage && (
            <VehicleForm
              title={editingStageRecord ? "Edit" : "Add"}
              onClose={closeStage}
              editingRecord={editingStageRecord}
              onSubmit={handleStageSubmit}
              serverErrors={serverStageErrors}
              fuelTypeOptions={fuelTypeOptions}
              driverOptions={driverOptions}
              vehicleTypeOptions={vehicleTypeOptions}
              locationOptions={locationOptions}
              isSubmitting={isStageSubmitting}
              vehicleStatusOptions={vehicleStatusOptions}
              vendorOptions={vendorOptions}
              currentStatusOptions={currentStatusOptions}
              uploadAndGetUrl={uploadAndGetUrl}
              isApproved={
                editingStageRecord ? VEHICLE_CONFIG.canStageApprove : null
              }
              approveVehicle={handleApprove}
              isStageCreate={!editingStageRecord}
            />
          )}
          {activeTab === "pending" && isOpenStage == false && (
            <PageContainer
              title="Vehicle Management"
              subtitle="Manage your fleet "
              createButtonLabel="Add Vehicle"
              onCreateClick={openCreateStage}
              bulkButtonLabel={"Upload"}
              onBulkClick={() => openBulkUpload()}
              canBulk={VEHICLE_CONFIG.canStageBulk}
              canCreate={VEHICLE_CONFIG.canStageCreate}
              pagination={
                stageVehicle?.totalCount
                  ? {
                      total: stageVehicle.totalCount,
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
                searchPlaceholder="Search by registration no, make, model..."
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
                    />
                    <SearchInput
                      placeholder={"Search by vendor name"}
                      handleSearch={handleStageVendorName}
                      isLettersOnly
                    />
                    <SearchInput
                      placeholder={"Search by vehicle no."}
                      handleSearch={handleStageSearch}
                      isAlphaNumeric
                      maxLength={10}
                    />
                  </div>
                </SearchFilterWrapper>

                <ApiStateWrapper
                  isLoading={stageLoading}
                  error={stageError}
                  isEmpty={!stageVehicle?.items?.length}
                  onRetry={refetch}
                  emptyMessage="No vehicles found. Add your first vehicle."
                >
                  <AppTable
                    loading={stageLoading}
                    columns={columnsStage}
                    dataSource={stageVehicle?.items ?? []}
                    rowKey="vehicle_Id"
                    total={stageVehicle?.totalCount ?? 0}
                    tableState={tableStageState}
                    onTableChange={setTableStageState}
                  />
                </ApiStateWrapper>
              </DataTableWrapper>
            </PageContainer>
          )}
          {/* approve */}
          {isOpen && (
            <VehicleForm
              title={editingRecord ? "Edit" : "Add"}
              onClose={close}
              editingRecord={editingRecord}
              onSubmit={handleSubmit}
              serverErrors={serverErrors}
              fuelTypeOptions={fuelTypeOptions}
              driverOptions={driverOptions}
              vehicleTypeOptions={vehicleTypeOptions}
              locationOptions={locationOptions}
              isSubmitting={isSubmitting}
              vehicleStatusOptions={vehicleStatusOptions}
              vendorOptions={vendorOptions}
              currentStatusOptions={currentStatusOptions}
              uploadAndGetUrl={uploadAndGetUrl}
            />
          )}
          {activeTab === "approved" && isOpen == false && (
            <PageContainer
              title="Vehicle Management"
              subtitle="Manage your fleet"
              createButtonLabel="Add Vehicle"
              onCreateClick={openCreate}
              canBulk={VEHICLE_CONFIG.canBulk}
              canCreate={VEHICLE_CONFIG.canCreate}
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
                searchPlaceholder="Search by registration no, make, model..."
                onSearch={handleSearch}
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
                      handleChange={handleLocationName}
                    />
                    <SearchInput
                      placeholder={"Search by vendor name"}
                      handleSearch={handleVendorName}
                    />
                    <SearchInput
                      placeholder={"Search by vehicle no."}
                      handleSearch={handleSearch}
                    />
                  </div>
                </SearchFilterWrapper>
                <ApiStateWrapper
                  isLoading={isLoading}
                  error={error}
                  isEmpty={!data?.items?.length}
                  onRetry={refetch}
                  emptyMessage="No vehicles found. Add your first vehicle."
                >
                  <AppTable
                    loading={isLoading}
                    columns={columns}
                    dataSource={data?.items ?? []}
                    rowKey="vehicle_Id"
                    total={data?.totalCount ?? 0}
                    tableState={tableState}
                    onTableChange={setTableState}
                  />
                </ApiStateWrapper>
              </DataTableWrapper>
            </PageContainer>
          )}
          <BulkUploadModal
            open={isBulkUpload}
            onClose={closeBulkUpload}
            vendorOptions={vendorOptions}
            locationOptions={locationOptions}
            // onSubmit={bulkVehicleUpload}
            // isSubmitting={isBulkVehicleUpload}
            // serverErrors={bulkVehicleUploadError}
          />
        </>
      )}
    </>
  );
};

export default VehicleListPage;

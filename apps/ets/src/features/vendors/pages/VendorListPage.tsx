import React from "react";

import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";

import { useGetAllVendorsQuery } from "../services/vendorApi";
import { useVendorTable } from "../hooks/useVendorTable";
import { useVendorModal } from "../hooks/useVendorModal";
import { useVendorMutations } from "../hooks/useVendorMutations";

import VendorFormModal from "../components/VendorFormModal";
import type {
  CreateVendorDto,
  UpdateVendorDto,
  Vendor,
} from "../types/vendor.types";
import { useLookups } from "../../lookups";

import { VENDOR_CONFIG } from "../config";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import MapLocationsModal from "../components/MapLocationsModal";

const VendorListPage: React.FC = () => {
  // 1. Modal Hook FIRST (provides openEdit)
  const {
    isOpen,
    editingRecord,
    openCreate,
    openEdit,
    close,
    isMapLocationsOpen,
    openMapLocations,
    closeMapLocations,
  } = useVendorModal();

  // 2. Table Hook (now safe to pass openEdit)
  const {
    columns,
    tableState,
    setTableState,
    handleSearch,
    handleLocationName,
    handleVendorName,
    queryArgs,
  } = useVendorTable({
    onEdit: openEdit,
    onMapLocations: (record) => openMapLocations(record),
  });

  // 3. Data Fetch
  const { data, isLoading, error, refetch } = useGetAllVendorsQuery(queryArgs);

  // 4. Mutations
  const {
    createVendor,
    updateVendor,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useVendorMutations({ onCreateSuccess: close, onUpdateSuccess: close });

  // ← Lift lookups here so handleSubmit can use them
  const {
    locationOptions,
    billPlanTypeOptions,
    isLoading: isLookupsLoading,
  } = useLookups({
    only: ["locationOptions", "billPlanTypeOptions"],
  });

  // 5. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 6. Submit Handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload = {
      locCode: values.locCode ? Number(values.locCode) : null,
      vendorName: (values.vendorName as string) || "",
      bpId: Number(values.bpId) || 1,
      singlePlan: Boolean(values.singlePlan),
      prefixTag: (values.prefixTag as string) || null,
      address: (values.address as string) || null,
      mobile: (values.mobile as string) || null,
      emailId: (values.emailId as string) || null,
      remarks: (values.remarks as string) || null,
      active: (values.active as boolean) ?? true,
      contactFrom: (values.contactFrom as string) || null,
      contactTo: (values.contactTo as string) || null,
    };

    if (editingRecord) {
      const updatePayload: UpdateVendorDto = {
        mstVendor_Id: editingRecord.mstVendor_Id,
        ...payload,
      };
      await updateVendor(updatePayload);
    } else {
      await createVendor(payload as CreateVendorDto);
    }
  };

  return (
    <PageContainer
      title="Vendors"
      subtitle="Manage all vendors and their configuration"
      createButtonLabel="Create Vendor"
      onCreateClick={VENDOR_CONFIG?.canCreate ? openCreate : undefined}
      canCreate={VENDOR_CONFIG.canCreate}
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
        searchPlaceholder="Search by vendor name, mobile or email"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchSelect
              placeholder={"Select office"}
              options={locationOptions}
              handleChange={handleLocationName}
            />
            <SearchInput
              placeholder={"Search by vendor name or no."}
              handleSearch={handleVendorName}
              isAlphaNumeric
              // maxLength={10}
            />
          </div>
        </SearchFilterWrapper>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No vendors found. Create your first vendor."
        >
          <AppTable
            columns={columns}
            loading={isLoading}
            dataSource={data?.items ?? []}
            rowKey="mstVendor_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <VendorFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        locationOptions={locationOptions}
        billPlanTypeOptions={billPlanTypeOptions}
        isLookupsLoading={isLookupsLoading}
      />
      <MapLocationsModal
        open={isMapLocationsOpen}
        onClose={closeMapLocations}
        editingRecord={(editingRecord as Vendor) ?? null}
      />
    </PageContainer>
  );
};

export default VendorListPage;

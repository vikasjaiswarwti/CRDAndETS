import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useEscortTable } from "../hooks/useEscortTable";
import { useEscortModal } from "../hooks/useEscortModal";
import { useEscortMutations } from "../hooks/useEscortMutations";
import { useGetAllEscortsQuery } from "../services/EscortApi";

import { EscortFormModal } from "../components/Escortformmodal";

import type { CreateEscortDto, UpdateEscortDto } from "../types/Escort.types";
import { ESCORT_CONFIG } from "../config";
import { useLookups } from "../../lookups";
import BulkUploadModal from "../components/BulkUploadModal";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

const EscortListPage = () => {
  // Modal Hook
  const {
    isOpen,
    editingRecord,
    openCreate,
    openEdit,
    close,
    isBulkUpload,
    openBulkUpload,
    closeBulkUpload,
  } = useEscortModal();

  // Mutations
  const {
    createEscort,
    updateEscort,
    isCreating,
    isUpdating,
    createError,
    updateError,
    // bulkUploadEscorts,
    // isBulkUploading,
    // bulkUploadError,
  } = useEscortMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
    // onBulkUploadSuccess: closeBulkUpload,
  });

  // Table Hook (pass vendorNameMap for rendering vendor names)
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useEscortTable({ onEdit: openEdit });

  // Main API Query
  const { data, isLoading, error, refetch } = useGetAllEscortsQuery(queryArgs);

  const {
    locationOptions,
    escortVendorOptions,
    isLoading: isLookupsLoading,
  } = useLookups({
    only: ["locationOptions", "escortVendorOptions"],
  });
  // console.log(escortVendorOptions, "escortVendorOptions")

  // Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // Handle Submit
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateEscortDto = {
        id: editingRecord.mstEscort_Id,
        locCode: Number(values.locCode),
        escortVendorId: Number(values.escortVendorId),
        name: String(values.name ?? ""),
        address: String(values.address ?? ""),
        mobileNo: String(values.mobileNo ?? ""),
        emailId: String(values.emailId ?? ""),
        remarks: values.remarks ? String(values.remarks) : null,
        active: Boolean(values.active),
      };
      await updateEscort(payload);
    } else {
      const payload: CreateEscortDto = {
        locCode: Number(values.locCode),
        escortVendorId: Number(values.escortVendorId),
        name: String(values.name ?? ""),
        address: String(values.address ?? ""),
        mobileNo: String(values.mobileNo ?? ""),
        emailId: String(values.emailId ?? ""),
        remarks: values.remarks ? String(values.remarks) : null,
        active: Boolean(values.active),
      };
      await createEscort(payload);
    }
  };
  // const handleBulkUpload = async (values: any) => {
  //   const res= await bulkUploadEscorts(values.upload);
  //   return res;
  // };

  return (
    <PageContainer
      title="Escort Management"
      subtitle="Manage escort registrations and assignments"
      createButtonLabel="Create Escort"
      onCreateClick={ESCORT_CONFIG?.canCreate ? openCreate : undefined}
      bulkButtonLabel={"Bulk Upload"}
      onBulkClick={openBulkUpload}
      canBulk={ESCORT_CONFIG.canBulk}
      canCreate={ESCORT_CONFIG.canCreate}
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
        searchPlaceholder="Search by escort name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by escort name"}
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
          emptyMessage="No escorts found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="mstEscort_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <EscortFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        escortVendorOptions={escortVendorOptions}
        locationOptions={locationOptions}
        isLookupsLoading={isLookupsLoading}
      />
      <BulkUploadModal
        open={isBulkUpload}
        onClose={closeBulkUpload}
        // onSubmit={handleBulkUpload}
        // isSubmitting={isBulkUploading}
        // serverErrors?: any;
        // infoButton={true}
      />
    </PageContainer>
  );
};

export default EscortListPage;

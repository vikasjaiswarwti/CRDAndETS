import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useEscortVendorTable } from "../hooks/useEscortVendorTable";
import { useEscortVendorModal } from "../hooks/useEscortVendorModal";
import { useEscortVendorMutations } from "../hooks/useEscortVendorMutations";
import { useGetAllEscortVendorsQuery } from "../services/EscortVendorApi";

import { EscortVendorFormModal } from "../components/EscortVendorFormModal";

import type {
  CreateEscortVendorDto,
  UpdateEscortVendorDto,
} from "../types/Escortvendor.types";
import { ESCORT_VENDOR_CONFIG } from "../config";
import { useLookups } from "../../lookups";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

const EscortVendorListPage = () => {
  // Modal Hook
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useEscortVendorModal();

  // Mutations
  const {
    createEscortVendor,
    updateEscortVendor,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useEscortVendorMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // Table Hook
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useEscortVendorTable({ onEdit: openEdit });

  // API Query
  const { data, isLoading, error, refetch } =
    useGetAllEscortVendorsQuery(queryArgs);

  const { locationOptions, isLoading: isLookupsLoading } = useLookups({
    only: ["locationOptions"],
  });

  // Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // Handle Submit
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateEscortVendorDto = {
        id: editingRecord.mstEscortVendor_Id,
        locCode: Number(values.locCode),
        vendorName: String(values.vendorName ?? ""),
        address: String(values.address ?? ""),
        mobile: String(values.mobile ?? ""),
        emailId: String(values.emailId ?? ""),
        remarks: values.remarks ? String(values.remarks) : null,
        active: Boolean(values.active),
      };
      await updateEscortVendor(payload);
    } else {
      // console.log('payload before creatioin escort vendor', values);

      const payload: CreateEscortVendorDto = {
        locCode: Number(values.locCode),
        vendorName: String(values.vendorName ?? ""),
        address: String(values.address ?? ""),
        mobile: String(values.mobile ?? ""),
        emailId: String(values.emailId ?? ""),
        remarks: values.remarks ? String(values.remarks) : null,
        active: Boolean(values.active),
      };

      // console.log('payload before creatioin escort vendor', payload);

      await createEscortVendor(payload);
    }
  };

  return (
    <PageContainer
      title="Escort Vendor Management"
      subtitle="Manage escort vendor registrations"
      createButtonLabel="Create Escort Vendor"
      onCreateClick={ESCORT_VENDOR_CONFIG?.canCreate ? openCreate : undefined}
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
        searchPlaceholder="Search by vendor name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by Escort vendor name"}
              handleSearch={handleSearch}
              isAlphaNumeric
              width={250}
            />
          </div>
        </SearchFilterWrapper>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No escort vendors found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="mstEscortVendor_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <EscortVendorFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        locationOptions={locationOptions}
        isLookupsLoading={isLookupsLoading}
      />
    </PageContainer>
  );
};

export default EscortVendorListPage;

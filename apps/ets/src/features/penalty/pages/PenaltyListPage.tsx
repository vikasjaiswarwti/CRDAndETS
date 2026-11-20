import React, { useEffect } from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { usePenaltyTable } from "../hooks/usePenaltyTable";
import { usePenaltyModal } from "../hooks/usePenaltyModal";
import { usePenaltyMutations } from "../hooks/usePenaltyMutations";
import { useGetTransPenaltiesListQuery } from "../services/penaltyApi";
import { PenaltyFormModal } from "../components/PenaltyFormModal";
import type { PenaltyCreateDto } from "../types/penalty.types";
import { useLookups } from "../../lookups";
import { useGetBillingCycleQuery } from "../../billing/services/billingApi";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import SearchInput from "../../../shared/components/Search/SearchInput";
import { STATUS_OPTIONS } from "../constants/penaltyConstants";

const PenaltyListPage: React.FC = () => {
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });

  const { isOpen, editingRecord, openCreate, openEdit, close } =
    usePenaltyModal();

  const {
    columns,
    tableState,
    setTableState,
    locCode,
    statusCode,
    handleSearch,
    handleLocCode,
    handleBillingCode,
    handleStatusCode,
    queryArgs,
  } = usePenaltyTable({
    onEdit: openEdit, // hoisted — see note below
  });
  useEffect(() => {
    if (locationOptions.length > 0) {
      handleLocCode(locationOptions[0].value);
    }
  }, [locationOptions.length]);

  const { data: billingCycleOptions, isLoading: isBillingLoading } =
    useGetBillingCycleQuery(locCode!, {
      skip: !locCode,
      refetchOnMountOrArgChange: true,
    });

  const { data, isLoading, error, refetch } = useGetTransPenaltiesListQuery(
    queryArgs,
    { skip: !locCode },
  );

  const {
    createPenalty,
    updatePenalty,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = usePenaltyMutations({ onCreateSuccess: close, onUpdateSuccess: close });

  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload: PenaltyCreateDto = {
      SNO: editingRecord ? editingRecord.sno : 0,
      LocCode: Number(values?.LocCode),
      BillingID: Number(values?.BillingID),
      DSID: Number(values.DSID ?? 0),
      ApplicableOnId: Number(values.ApplicableOnId),
      PenaltyType_id: Number(values.PenaltyType_id),
      Amount: Number(values.Amount),
      Remarks: String(values.Remarks ?? ""),
      Status: Number(values.Status),
    };

    if (editingRecord) {
      return await updatePenalty(payload);
    } else {
      return await createPenalty(payload);
    }
  };

  return (
    <PageContainer
      title="Penalty Management"
      subtitle="Create and manage transport penalties by trip, driver, vehicle, or vendor"
      createButtonLabel="Add Penalty"
      onCreateClick={openCreate}
    >
      <SearchFilterWrapper>
        <div className="flex items-center gap-2">
          <SearchSelect
            placeholder="Select Office"
            options={locationOptions}
            handleChange={handleLocCode}
            labelContent=""
            value={locCode}
          />
          <SearchSelect
            placeholder="Select Status"
            options={STATUS_OPTIONS}
            handleChange={handleStatusCode}
            labelContent=""
            value={statusCode}
          />
          <SearchSelect
            placeholder="Select Billing Cycle"
            options={billingCycleOptions ?? []}
            isLoading={isBillingLoading}
            handleChange={handleBillingCode}
          />
          <SearchInput
            placeholder={"Search... "}
            handleSearch={handleSearch}
            isLettersOnly
          />
        </div>
      </SearchFilterWrapper>
      <DataTableWrapper
        searchPlaceholder="Search by driver, vehicle or remarks"
        onSearch={handleSearch}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No penalties found. Create the first one."
        >
          <AppTable
            columns={columns}
            loading={isLoading}
            dataSource={data?.items ?? []}
            rowKey="sno"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <PenaltyFormModal
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

export default PenaltyListPage;

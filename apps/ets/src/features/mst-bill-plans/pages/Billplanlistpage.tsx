import { useDispatch } from "react-redux";

import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllBillPlansQuery } from "../services/bill-plan-api";
import { useBillPlanModal } from "../hooks/usebillplanmodal";
import { useBillPlanMutations } from "../hooks/usebillplanmutations";
import { useBillPlanTable } from "../hooks/usebillplantable";
import { toggleFilterPanel } from "../slice/bill-plan-slice";
import BillPlanFormModal from "../components/Billplanformmodal";
import type {
  CreateBillPlanDto,
  UpdateBillPlanDto,
} from "../types/bill-plan.types";
import { BILL_PLAN_CONFIG } from "../config";
import { useLookups } from "../../lookups";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchSelect from "../../../shared/components/Search/SearchSelect";

const BillPlanListPage = () => {
  const dispatch = useDispatch();

  // 2. Table columns + state (never inline columns in the page)
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useBillPlanModal();

  const {
    createBillPlan,
    updateBillPlan,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useBillPlanMutations({ onCreateSuccess: close, onUpdateSuccess: close });

  const {
    columns,
    tableState,
    setTableState,
    handleSearch,
    handleLocationName,
    queryArgs,
  } = useBillPlanTable({ onEdit: openEdit });

  // 3. Real API call — no mock data
  const { data, isLoading, error, refetch } =
    useGetAllBillPlansQuery(queryArgs);

  console.log("data from bill plan", data);

  // ← Lift lookups here so handleSubmit can use them
  const {
    locationOptions,
    billPlanTypeOptions,
    isLoading: isLookupsLoading,
  } = useLookups({
    only: ["locationOptions", "billPlanTypeOptions"],
  });

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. handleSubmit — cast values, pick create vs update
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateBillPlanDto = {
        id: editingRecord.id,
        locCode: Number(values.locCode),
        bptCode: String(values.bptCode ?? ""),
        bpName: String(values.bpName ?? ""),
        active: Boolean(values.active),
      };
      await updateBillPlan(payload);
    } else {
      const payload: CreateBillPlanDto = {
        locCode: Number(values.locCode),
        bptCode: String(values.bptCode ?? ""),
        bpName: String(values.bpName ?? ""),
        active: Boolean(values.active),
      };
      await createBillPlan(payload);
    }
  };

  // 9. JSX
  return (
    <PageContainer
      title="Bill Plan Management"
      subtitle="Manage billing plan configurations and type assignments"
      createButtonLabel="Create Bill Plan"
      onCreateClick={BILL_PLAN_CONFIG?.canCreate ? openCreate : undefined}
      filterButtonLabel=""
      canCreate={BILL_PLAN_CONFIG.canCreate}
      onFilterClick={() => dispatch(toggleFilterPanel())}
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
        searchPlaceholder="Search by bill plan name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchSelect
              placeholder={"Search by Office"}
              options={locationOptions}
              handleChange={handleLocationName}
            />
            <SearchInput
              placeholder={"Search by bill plan name"}
              handleSearch={handleSearch}
              isAlphaNumeric
            />
          </div>
        </SearchFilterWrapper>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No bill plans found. Create your first one."
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

      <BillPlanFormModal
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
    </PageContainer>
  );
};

export default BillPlanListPage;

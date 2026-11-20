// import { useDispatch } from 'react-redux';
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllBillPlanTypesQuery } from "../services/bill-plan-typeapi";
import { useBillPlanTypeModal } from "../hooks/usebillplantypemodal";
import { useBillPlanTypeMutations } from "../hooks/useBillplantypemutations";
import { useBillPlanTypeTable } from "../hooks/usebillplantypetable";
// import { toggleFilterPanel } from '../slice/billplantypeslice';
import BillPlanTypeFormModal from "../component/Billplantypeformmodal";
import type {
  CreateBillPlanTypeDto,
  UpdateBillPlanTypeDto,
} from "../types/bill-plan-type";
import { BILL_PLAN_TYPE_CONFIG } from "../config";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

const BillPlanTypeListPage = () => {
  // const dispatch = useDispatch();

  // 4. Modal state

  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useBillPlanTypeModal();

  // 5. Mutations
  const {
    createBillPlanType,
    updateBillPlanType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useBillPlanTypeMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 2. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useBillPlanTypeTable({ onEdit: openEdit });

  // 3. Real API call
  const { data, isLoading, error, refetch } =
    useGetAllBillPlanTypesQuery(queryArgs);

  // console.log('data for Billplan type', data);

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler — id preserved via editingRecord, never from form values
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateBillPlanTypeDto = {
        id: editingRecord.id,
        bptCode: String(values.bptCode ?? ""),
        bptName: String(values.bptName ?? ""),
        active: Boolean(values.active),
      };
      await updateBillPlanType(payload);
    } else {
      const payload: CreateBillPlanTypeDto = {
        bptCode: String(values.bptCode ?? ""),
        bptName: String(values.bptName ?? ""),
        active: Boolean(values.active),
      };
      await createBillPlanType(payload);
    }
  };

  return (
    <PageContainer
      title="Bill Plan Type Management"
      subtitle="Configure and manage billing plan type classifications"
      createButtonLabel="Create Bill Plan Type"
      onCreateClick={BILL_PLAN_TYPE_CONFIG?.canCreate ? openCreate : undefined}
      // filterButtonLabel="Filter Types"
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
        searchPlaceholder="Search by plan type name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
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
          emptyMessage="No bill plan types found. Create your first one."
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

      <BillPlanTypeFormModal
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

export default BillPlanTypeListPage;

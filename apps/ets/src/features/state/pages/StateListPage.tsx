// FILE 10 — pages/StateListPage.tsx

// import { useDispatch } from "react-redux";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllStatesQuery } from "../services/stateApi";
import { useStateModal } from "../hooks/useStateModal";
import { useStateMutations } from "../hooks/useStateMutations";
import { useStateTable } from "../hooks/useStateTable";
// import { toggleFilterPanel } from "../slice/stateSlice";
import StateFormModal from "../components/StateFormModal";
import type { CreateStateDto, UpdateStateDto } from "../types/state.types";
import { STATE_CONFIG } from "../config";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

const StateListPage: React.FC = () => {
  // 1. UI library — destructure only what is used
  //const {} = useUILibrary(); // no direct antd usage needed in page

  // const dispatch = useDispatch();

  // 2. Table hook (columns, state, search, queryArgs) — no inline columns
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useStateModal();

  const {
    createState,
    updateState,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useStateMutations({ onCreateSuccess: close, onUpdateSuccess: close });

  const {
    columns,
    tableState,
    setTableState,
    // search,
    handleSearch,
    queryArgs,
  } = useStateTable({ onEdit: openEdit });

  // 3. Real RTK Query — no mock
  const { data, isLoading, error, refetch } = useGetAllStatesQuery(queryArgs);
  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. handleSubmit — cast and dispatch correct mutation
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      await updateState({
        id: editingRecord.id,
        ...(values as Omit<UpdateStateDto, "id">),
      });
    } else {
      const payload: CreateStateDto = {
        stateName: String(values.stateName ?? ""),
      };
      await createState(payload);
    }
  };

  return (
    <PageContainer
      title="State Management"
      subtitle="Manage geographical states used across the platform"
      createButtonLabel="Create State"
      onCreateClick={openCreate}
      canCreate={STATE_CONFIG.canCreate}
      // filterButtonLabel="Filter States"
      // onFilterClick={() => dispatch(toggleFilterPanel())}
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
        searchPlaceholder="Search by state name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by state name"}
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
          emptyMessage="No states found. Create your first one."
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

      <StateFormModal
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

export default StateListPage;

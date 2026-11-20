import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllQuery } from "../services/specialCaseApi";
import { useSpecialCaseTable } from "../hooks/useSpecialCaseTable";
import { useSpecialCaseModal } from "../hooks/useSpecialCaseModal";
import { useSpecialCaseMutations } from "../hooks/useSpecialCaseMutations";
import SpecialCaseFormModal from "../components/SpecialCaseFormModal";
import type { CreateSpecialCaseDto } from "../types/specialCase.types";
import { SPECIAL_CASE_CONFIG } from "../config";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

const SpecialCaseListPage = () => {
  // 2. Table hook
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useSpecialCaseModal();

  // 3. Mutations (need deleteX ref before table hook)
  const {
    createSpecialCase,
    updateSpecialCase,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useSpecialCaseMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useSpecialCaseTable({ onEdit: openEdit });

  // 5. Data fetch
  const { data, isLoading, error, refetch } = useGetAllQuery(queryArgs);

  // 6. Derived
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload: CreateSpecialCaseDto = {
      specialCaseDesc: values.specialCaseDesc as string,
      isActive: values.isActive as boolean,
    };

    if (editingRecord) {
      await updateSpecialCase({
        id: editingRecord.specialCase_Id,
        body: payload,
      });
    } else {
      await createSpecialCase(payload);
    }
  };

  return (
    <PageContainer
      title="Special Case Management"
      subtitle="Manage special case records and their availability"
      createButtonLabel="Create Special Case"
      onCreateClick={openCreate}
      canCreate={SPECIAL_CASE_CONFIG.canCreate}
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
        searchPlaceholder="Search by description"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by description"}
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
          emptyMessage="No special cases found. Create your first one."
        >
          <AppTable
            columns={columns}
            loading={isLoading}
            dataSource={data?.items ?? []}
            rowKey="specialCase_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <SpecialCaseFormModal
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

export default SpecialCaseListPage;

import React, { useMemo } from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useGetAllQuery } from "../services/ehsChecksApi";
import { useEhsChecksTable } from "../hooks/useEhsChecksTable";
import { useEhsChecksModal } from "../hooks/useEhsChecksModal";
import { useEhsChecksMutations } from "../hooks/useEhsChecksMutations";
import EhsChecksFormModal from "../components/EhsChecksFormModal";
import type { CreateEhsCheckDto } from "../types/ehsChecks.types";
 import { EHS_CHECK_CONFIG } from "../config";

// ─── Page ─────────────────────────────────────────────────────────────────────

const EhsChecksListPage: React.FC = () => {
  const { columns, tableState, setTableState } = useEhsChecksTable();

  const { data, isLoading, error, refetch } = useGetAllQuery({
    page: tableState.page,
    pageSize: tableState.pageSize,
    // sortColumn: tableState.sortColumn,
    // sortOrder: tableState.sortOrder,
    // searchTerm: tableState.searchTerm,
  });

  const { isOpen, openCreate, close } = useEhsChecksModal();

  // 5. Mutations
  const { createEhsCheck, isCreating, createError } = useEhsChecksMutations({
    onCreateSuccess: close,
  });

  // 6. Derived values
  const isSubmitting = isCreating;
  const serverErrors = createError?.fieldErrors;

  // 7. Submit handler — casts to typed payload, delegates to mutation hook
  const handleSubmit = async (values: Record<string, unknown>) => {
    await createEhsCheck({
      ehsType: values["ehsType"] as string,
      active: values["active"] as boolean,
    } satisfies CreateEhsCheckDto);
  };

  // 8. Memos (none required for this feature — no derived dropdown options)
  const isEmpty = useMemo(() => !data?.items?.length, [data]);

  // 9. JSX
  return (
    <PageContainer
      title="EHS Management"
      subtitle="Manage Environmental, Health & Safety check types and their statuses"
      createButtonLabel="Create EHS Check"
      onCreateClick={openCreate}
      canCreate={EHS_CHECK_CONFIG.canCreate}
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
        searchPlaceholder="Search by EHS type…"
        onSearch={() => {}}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refetch}
          emptyMessage="No EHS Checks found. Create your first one."
          // skeletonVariant="table"
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="ehs_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <EhsChecksFormModal
        open={isOpen}
        onClose={close}
        // editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
};

export default EhsChecksListPage;

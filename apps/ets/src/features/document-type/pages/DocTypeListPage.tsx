import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useDocumentTypeTable } from "../hooks/useDocTypeTable";
import { useDocumentTypeModal } from "../hooks/useDocTypeModal";
import { useDocumentTypeMutations } from "../hooks/useDocTypeMutations";
import { useGetAllDocumentTypesQuery } from "../services/DocTypeApi";

import { DocumentTypeFormModal } from "../components/Documenttypeformmodal";

import type {
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
} from "../types/docType.types";
import { useLookups } from "../../lookups";
import { DOC_TYPE_CONFIG } from "../config";
import SearchInput from "../../../shared/components/Search/SearchInput";

const DocumentTypeListPage = () => {
  // Modal Hook
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useDocumentTypeModal();

  // Mutations
  const {
    createDocumentType,
    updateDocumentType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useDocumentTypeMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // Table Hook
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useDocumentTypeTable({ onEdit: openEdit });

  // Main Data Query
  const { data, isLoading, error, refetch } =
    useGetAllDocumentTypesQuery(queryArgs);

  // Lookups (includes Document Owner Types)
  const { documentOwnerTypeOptions, isLoading: isLookupsLoading } = useLookups({
    only: ["documentOwnerTypeOptions"],
  });

  // Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // Handle Submit
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateDocumentTypeDto = {
        id: editingRecord.docType_Id,
        docOwnerTypeId: Number(values.docOwnerTypeId),
        docTypeName: String(values.docTypeName ?? ""),
        active: Boolean(values.active),
      };
      await updateDocumentType(payload);
    } else {
      const payload: CreateDocumentTypeDto = {
        docOwnerTypeId: Number(values.docOwnerTypeId),
        docTypeName: String(values.docTypeName ?? ""),
        active: Boolean(values.active),
      };
      await createDocumentType(payload);
    }
  };

  return (
    <PageContainer
      title="Document Type Management"
      subtitle="Manage document type classifications"
      createButtonLabel="Create Document Type"
      onCreateClick={DOC_TYPE_CONFIG?.canCreate ? openCreate : undefined}
      canCreate={DOC_TYPE_CONFIG?.canCreate}
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
        searchPlaceholder="Search by document type name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            marginInline: 24,
          }}
        >
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder={"Search by doc type"}
              handleSearch={handleSearch}
              isLettersOnly
            />
          </div>
        </div>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No document types found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="docType_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <DocumentTypeFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        docOwnerTypeOptions={documentOwnerTypeOptions}
        isLookupsLoading={isLookupsLoading}
      />
    </PageContainer>
  );
};

export default DocumentTypeListPage;

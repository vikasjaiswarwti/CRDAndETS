
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import PageContainer from '../../../shared/components/PageContainer/PageContainer';
import DataTableWrapper from '../../../shared/components/DataTableWrapper/DataTableWrapper';

import { useDocumentOwnerTypeTable } from '../hooks/useDocOwnerTypeTable';
import { useDocumentOwnerTypeModal } from '../hooks/useDocOwnerTypeModal';
import { useDocumentOwnerTypeMutations } from '../hooks/useDocOwnerTypeMutations';
import { useGetAllDocumentOwnerTypesQuery } from '../services/DocOwnerTypeApi';

import { DocumentOwnerTypeFormModal } from '../components/Documentownertypeformmodal';

import type { CreateDocumentOwnerTypeDto, UpdateDocumentOwnerTypeDto } from '../types/documentOwnerType.types';


import { DOC_OWNER_TYPE_CONFIG } from '../config';

const DocumentOwnerTypeListPage = () => {


    // 2. Modal Hook
    const { isOpen, editingRecord, openCreate, openEdit, close } = useDocumentOwnerTypeModal();

    // 3. Mutations
    const {
        createDocumentOwnerType,
        updateDocumentOwnerType,
        isCreating,
        isUpdating,
        createError,
        updateError,
    } = useDocumentOwnerTypeMutations({
        onCreateSuccess: close,
        onUpdateSuccess: close,
    });

    // 4. Table Hook
    const { columns, tableState, setTableState, handleSearch, queryArgs } =
        useDocumentOwnerTypeTable({ onEdit: openEdit });

    // 5. API Query
    const { data, isLoading, error, refetch } = useGetAllDocumentOwnerTypesQuery(queryArgs);

    // 6. Derived values
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    // 7. Handle Submit
    const handleSubmit = async (values: Record<string, unknown>) => {
        if (editingRecord) {
            const payload: UpdateDocumentOwnerTypeDto = {
                id: editingRecord.docOwnerType_Id,   // Use correct GUID field
                docOwnerTypeName: String(values.docOwnerTypeName ?? ''),
                active: Boolean(values.active),
            };
            await updateDocumentOwnerType(payload);
        } else {
            const payload: CreateDocumentOwnerTypeDto = {
                docOwnerTypeName: String(values.docOwnerTypeName ?? ''),
                active: Boolean(values.active),
            };
            await createDocumentOwnerType(payload);
        }
    };

    return (
        <PageContainer
            title="Document Owner Type Management"
            subtitle="Manage document owner type classifications"
            createButtonLabel="Create Owner Type"
            onCreateClick={DOC_OWNER_TYPE_CONFIG?.canCreate ? openCreate : undefined}
            // You can add filter button later if needed:
            // filterButtonLabel="Filter"
            // onFilterClick={() => dispatch(toggleFilterPanel())}
            canCreate={DOC_OWNER_TYPE_CONFIG.canCreate}
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
                searchPlaceholder="Search by owner type name"
                onSearch={handleSearch}
                showSearch={false}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No document owner types found. Create your first one."
                >
                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="docOwnerType_Id"
                        total={data?.totalCount ?? 0}
                        tableState={tableState}
                        onTableChange={setTableState}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <DocumentOwnerTypeFormModal
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

export default DocumentOwnerTypeListPage;
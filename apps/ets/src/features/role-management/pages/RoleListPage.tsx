// src/features/role-management/pages/RoleListPage.tsx
import { useGetAllRolesQuery } from '../services/roleApi';
import { useRoleTable } from '../hooks/useRoleTable';
import { useRoleModal } from '../hooks/useRoleModal';
import { useRoleMutations } from '../hooks/useRoleMutations';
import { RoleFormModal } from '../components/RoleFormModal';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';
import type { CreateRoleDto, UpdateRoleDto } from '../types/role.types';
import { ROLE_CONFIG } from '../config';



const RoleListPage = () => {

    // ── 2. Table state + columns ───────────────────────────────────────────────
    const { columns, tableState, setTableState, search, handleSearch, queryArgs } =
        useRoleTable({ onEdit: (record) => openEdit(record) });

    // ── 3. Real API call ───────────────────────────────────────────────────────
    const { data, isLoading, error, refetch } = useGetAllRolesQuery(queryArgs);

    console.log('data from role', data);

    // ── 4. Modal state ─────────────────────────────────────────────────────────
    const { isOpen, editingRecord, openCreate, openEdit, close } = useRoleModal();

    // ── 5. Mutations ───────────────────────────────────────────────────────────
    const { createX, updateX, isCreating, isUpdating, createError, updateError } =
        useRoleMutations({ onCreateSuccess: close, onUpdateSuccess: close });

    // ── 6. Derived values ──────────────────────────────────────────────────────
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord ? updateError?.fieldErrors : createError?.fieldErrors;

    const totalCount = data?.totalCount ?? 0;

    // ── 7. Submit handler ──────────────────────────────────────────────────────
    const handleSubmit = async (values: Record<string, unknown>) => {
        if (editingRecord) {
            // Explicit payload construction - Safer and consistent with BillPlanType
            const payload: UpdateRoleDto = {
                id: editingRecord.id,
                // Add all fields from your form here. Adjust field names as per your Role DTO
                roleName: String(values.roleName ?? ''),
                isActive: Boolean(values.isActive ?? false),   // uncomment if you have this field
                // permissions: values.permissions as string[] ?? [], // if applicable
            };
            await updateX(payload);
        } else {
            const payload: CreateRoleDto = {
                roleName: String(values.roleName ?? ''),
                isActive: Boolean(values.isActive ?? false),
                // permissions: values.permissions as string[] ?? [],
            };

            console.log('payload', payload);

            await createX(payload);
        }
    };

    // ── 8. JSX ─────────────────────────────────────────────────────────────────
    return (
        <PageContainer
            title="Role Management"
            subtitle="Manage user roles and access levels"
            createButtonLabel="Create Role"
            onCreateClick={ROLE_CONFIG?.canCreate ? openCreate : undefined}
            filterButtonLabel="Filter Roles"
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
                showSearch={false}
                searchPlaceholder="Search by role name"
                onSearch={handleSearch}
                searchValue={search}
                pagination={null}
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No roles found. Create your first role to get started."
                >
                    <AppTable
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="id"
                        total={totalCount}
                        tableState={tableState}
                        onTableChange={setTableState}
                        loading={isLoading}
                    />
                </ApiStateWrapper>
            </DataTableWrapper>

            <RoleFormModal
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

export default RoleListPage;
// src/features/menu/pages/MenuListPage.tsx
import { useMemo } from 'react';
import { useGetAllAdminMenusQuery } from '../services/adminMenuApi';
import { useMenuTable } from '../hooks/useMenuTable';
import { useMenuModal } from '../hooks/useMenuModal';
import { useMenuMutations } from '../hooks/useMenuMutations';
import { MenuFormModal } from '../components/MenuFormModal';
import { ApiStateWrapper } from '../../../shared/components/ApiState/ApiStateWrapper';
import { AppTable } from '../../../shared/components/AppTable/AppTable';
import { PageContainer } from '../../../shared/components/PageContainer/PageContainer';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper/DataTableWrapper';
import type { CreateMenuDto, UpdateMenuDto } from '../types/menu.types';

const MenuListPage = () => {
    // ── 1. Table state + columns ───────────────────────────────────────────────
    const { columns, tableState, setTableState, search, handleSearch, queryArgs } =
        useMenuTable({
            onEdit: (record) => openEdit(record),
            // onDelete: (record) => deleteX(record.id),   // uncomment when delete endpoint exists
        });

    // ── 2. Real API call ───────────────────────────────────────────────────────
    const { data, isLoading, error, refetch } = useGetAllAdminMenusQuery(queryArgs);

    console.log('total data from backedn', data);

    // ── 3. Modal state ─────────────────────────────────────────────────────────
    const { isOpen, editingRecord, openCreate, openEdit, close } = useMenuModal();

    // ── 4. Mutations ───────────────────────────────────────────────────────────
    const { createX, updateX, isCreating, isUpdating, createError, updateError } =
        useMenuMutations({
            onCreateSuccess: close,
            onUpdateSuccess: close,
        });

    // ── 5. Derived values ──────────────────────────────────────────────────────
    const isSubmitting = isCreating || isUpdating;
    const serverErrors = editingRecord
        ? updateError?.fieldErrors
        : createError?.fieldErrors;

    // ── 6. Submit handler - FIX: Accept the correct type ──────────────────────
    const handleSubmit = async (values: CreateMenuDto | UpdateMenuDto) => {
        if (editingRecord) {
            // Update case - values is UpdateMenuDto
            await updateX(values as UpdateMenuDto);
        } else {
            // Create case - values is CreateMenuDto

            console.log('values', values);
            await createX(values as CreateMenuDto);
        }
    };

    // ── 7. Dynamic parent menu options for the form dropdown ──────────────────
    const parentMenuOptions = useMemo(() => {
        if (!data?.items) return [{ label: 'None (Root Menu)', value: '' }];
        const options = data.items
            .filter((menu) => menu.id !== editingRecord?.id)
            .map((menu) => ({ label: menu.menuName, value: menu.id }));
        return [{ label: 'None (Root Menu)', value: '' }, ...options];
    }, [data?.items, editingRecord?.id]);


    // ── 8. JSX ─────────────────────────────────────────────────────────────────
    return (
        <PageContainer
            title="Menu Management"
            subtitle="Manage user access levels and granular permissions"
            createButtonLabel="Create Menu"
            onCreateClick={openCreate}
            filterButtonLabel="Filter Roles"
            // onFilterClick={() => dispatch(toggleFilterPanel())}  // wire redux slice if needed
            // pagination={
            //     totalCount > 0 ? (
            //         <div className="menu-pagination-bar">
            //             <div className="showing-text">
            //                 Showing {startItem}–{endItem} of {totalCount} menu items
            //             </div>

            //             <div className="pagination-right">
            //                 <Pagination
            //                     current={currentPage}
            //                     pageSize={pageSize}
            //                     total={totalCount}
            //                     showSizeChanger
            //                     pageSizeOptions={["5", "10", "20", "50", "100"]}
            //                     onChange={(page, size) => {
            //                         setTableState({
            //                             ...tableState,
            //                             page,
            //                             pageSize: size,
            //                         });
            //                     }}
            //                     size="small"
            //                 />
            //             </div>
            //         </div>
            //     ) : null
            // }

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
                showSearch={false}           // flip to true + wire handleSearch when needed
                searchPlaceholder="Search by menu name"
                onSearch={handleSearch}
                searchValue={search}
                pagination={null}            // AppTable handles its own pagination
            >
                <ApiStateWrapper
                    isLoading={isLoading}
                    error={error}
                    isEmpty={!data?.items?.length}
                    onRetry={refetch}
                    emptyMessage="No menus found. Create your first menu to get started."
                >
                    <AppTable
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.items ?? []}
                        rowKey="id"
                        tableState={tableState}
                        onTableChange={setTableState}

                    />
                </ApiStateWrapper>
            </DataTableWrapper>


            {/* Modal — always rendered at bottom of tree */}
            <MenuFormModal
                open={isOpen}
                onClose={close}
                editingRecord={editingRecord}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                serverErrors={serverErrors}
                parentMenuOptions={parentMenuOptions}
            />
        </PageContainer>
    );
};

export default MenuListPage;
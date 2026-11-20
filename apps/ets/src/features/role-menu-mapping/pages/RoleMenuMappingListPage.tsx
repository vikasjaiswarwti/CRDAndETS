// src/features/role-menu-mapping/pages/RoleMenuMappingListPage.tsx

import { useGetAllRoleMenuMappingsQuery } from "../services/roleMenuMappingApi";
import { useRoleMenuMappingTable } from "../hooks/useRoleMenuMappingTable";
import { useRoleMenuMappingModal } from "../hooks/useRoleMenuMappingModal";
import { useRoleMenuMappingMutations } from "../hooks/useRoleMenuMappingMutations";
import { RoleMenuMappingFormModal } from "../components/RoleMenuMappingFormModal";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
// Cross-feature data fetched here to build dropdown options — read-only, no internal imports
import type {
  CreateRoleMenuMappingDto,
  UpdateRoleMenuMappingDto,
} from "../types/roleMenuMapping.types";
import { useLookups } from "../../lookups";
import { useEffect } from "react";

const RoleMenuMappingListPage = () => {
  console.log("🔄 RoleMenuMappingListPage rendered");

  // ── 2. Table state + columns — pass name maps after data is fetched ────────
  //       (maps default to {} so table renders IDs gracefully before data loads)
  const {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  } = useRoleMenuMappingTable({
    onEdit: (record) => openEdit(record),
    roleNameMap: {}, // filled in step 8 via useMemo — passed via re-render
    menuNameMap: {},
  });

  console.log("📋 queryArgs:", queryArgs);

  // ── Main API Call with extra options for debugging ─────────────────────
  const result = useGetAllRoleMenuMappingsQuery(queryArgs, {
    // Force refetch on mount to see if skip is the issue
    refetchOnMountOrArgChange: true,
  });

  // ── 3. Real API calls ──────────────────────────────────────────────────────
  // const { data, isLoading, error, refetch } = useGetAllRoleMenuMappingsQuery(queryArgs);

  const { data, isLoading, isFetching, isUninitialized, error, refetch } =
    result;

  console.log("📡 RTK Query Status:", {
    isUninitialized,
    isLoading,
    isFetching,
    hasData: !!data,
    error: error ? "YES" : "no",
    data: data ? "received" : "undefined",
  });

  useEffect(() => {
    console.log("✅ Query hook mounted with args:", queryArgs);
    if (isUninitialized) {
      console.warn("⚠️ Query is UNINITIALIZED — it should be fetching!");
    }
  }, [queryArgs, isUninitialized]);

  // ── Lookups (Centralized) ──────────────────────────────────────────────────
  const { roleOptions, menuOptions } = useLookups({
    only: ["roleOptions", "menuOptions"],
  });
  // ── 4. Modal state ─────────────────────────────────────────────────────────
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useRoleMenuMappingModal();

  // ── 5. Mutations ───────────────────────────────────────────────────────────
  const { createX, updateX, isCreating, isUpdating, createError, updateError } =
    useRoleMenuMappingMutations({
      onCreateSuccess: close,
      onUpdateSuccess: close,
    });

  // ── 6. Derived values ──────────────────────────────────────────────────────
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  const totalCount = data?.totalCount ?? 0;

  // // ── 7. Submit handler ──────────────────────────────────────────────────────
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateRoleMenuMappingDto = {
        id: editingRecord.id,
        roleId: String(values.roleId ?? ""),
        menuId: String(values.menuId ?? ""),
        isActive: Boolean(values.isActive ?? false),
      };
      await updateX(payload);
    } else {
      const payload: CreateRoleMenuMappingDto = {
        roleId: String(values.roleId ?? ""),
        menuId: String(values.menuId ?? ""),
        isActive: Boolean(values.isActive ?? false),
      };
      await createX(payload);
    }
  };

  // ── 9. JSX ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer
      title="Role-Menu Mapping"
      subtitle="Assign menus to roles to control access permissions"
      createButtonLabel="Create Mapping"
      onCreateClick={openCreate}
      filterButtonLabel="Filter Mappings"
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
        searchPlaceholder="Search mappings"
        onSearch={handleSearch}
        searchValue={search}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No role-menu mappings found. Create your first mapping."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="id"
            total={totalCount}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <RoleMenuMappingFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        roleOptions={roleOptions}
        menuOptions={menuOptions}
      />
    </PageContainer>
  );
};

export default RoleMenuMappingListPage;

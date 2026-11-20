import React, { useCallback, useState } from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

import {
  useGetNodalPointsQuery,
  useCreateNodalPointMutation,
  useUpdateNodalPointMutation,
  useDeleteNodalPointMutation,
} from "../services/nodalPointApi";

import { useNodalPointTable } from "../hooks/useNodalPointTable";
import { NodalPointFormModal } from "../components/NodalPointFormModal";
import { EmployeeMappingPanel } from "../components/EmployeeMappingPanel";

import type {
  NodalPoint,
  NodalPointCreateDto,
} from "../types/nodalPoint.types";

import { useLookups } from "../../lookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} from "../services/routeTableApi";
import { useRouteTable } from "../hooks/useRouteTable";
import { RouteFormModal } from "../components/RouteFormModal";
import type { RouteTableItem } from "../types/routeTable.types";

type ViewMode = "nodalPoints" | "routes";

const NodalPointListPage: React.FC = () => {
  const { Select, Segmented, Space } = useUILibrary();

  const [viewMode, setViewMode] = useState<ViewMode>("nodalPoints");

  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });

  // Selected location from parent/list page
  const [selectedLocationCode, setSelectedLocationCode] = useState<
    number | undefined
  >(1);

  const {
    data: nodalPoints,
    isLoading,
    error,
    refetch,
  } = useGetNodalPointsQuery(
    selectedLocationCode
      ? {
          locationCode: selectedLocationCode,
        }
      : undefined,{skip:viewMode !== "nodalPoints"}
  );

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NodalPoint | null>(null);
  const [mappingTarget, setMappingTarget] = useState<NodalPoint | null>(null);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingRecord(null);
  }, []);

  const openCreate = useCallback(() => {
    // Don't allow create without selecting a location
    if (!selectedLocationCode) {
      return;
    }

    setEditingRecord(null);
    setFormOpen(true);
  }, [selectedLocationCode]);

  const openEdit = useCallback((record: NodalPoint) => {
    setEditingRecord(record);
    setFormOpen(true);
  }, []);

  // ── Routes (toggle view) ─────────────────────────────────────────────────

  const {
    data: routes,
    isLoading: isRoutesLoading,
    error: routesError,
    refetch: refetchRoutes,
  } = useGetRoutesQuery(
    selectedLocationCode
      ? {
          locCode: selectedLocationCode,
        }
      : undefined,{
        skip: viewMode !== "routes"
      }
  );

  const [isRouteFormOpen, setRouteFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteTableItem | null>(null);

  const closeRouteForm = useCallback(() => {
    setRouteFormOpen(false);
    setEditingRoute(null);
  }, []);

  const openCreateRoute = useCallback(() => {
    setEditingRoute(null);
    setRouteFormOpen(true);
  }, []);

  const openEditRoute = useCallback((record: RouteTableItem) => {
    setEditingRoute(record);
    setRouteFormOpen(true);
  }, []);

  const {
    mutate: createRoute,
    isLoading: isCreatingRoute,
    error: createRouteError,
  } = useApiMutation(useCreateRouteMutation, {
    successMessage: "Route created",
    onSuccess: closeRouteForm,
  });

  const {
    mutate: updateRoute,
    isLoading: isUpdatingRoute,
    error: updateRouteError,
  } = useApiMutation(useUpdateRouteMutation, {
    successMessage: "Route updated",
    onSuccess: closeRouteForm,
  });

  const { mutate: deleteRoute } = useApiMutation(useDeleteRouteMutation, {
    successMessage: "Route deactivated",
  });

  const handleDeactivateRoute = useCallback(
    (record: RouteTableItem) => {
      void deleteRoute(record.routeId);
    },
    [deleteRoute],
  );

  const {
    columns: routeColumns,
    rows: routeRows,
    total: routeTotal,
    tableState: routeTableState,
    setTableState: setRouteTableState,
    handleSearch: handleRouteSearch,
  } = useRouteTable({
    data: routes,
    onEdit: openEditRoute,
    onDeactivate: handleDeactivateRoute,
  });

  const handleRouteSubmit = async (values: Record<string, unknown>) => {
    const body = {
      routeName: String(values.routeName ?? "").trim(),
      isActive: Boolean(values.isActive),
      locCode:
        values.locCode !== undefined && values.locCode !== null
          ? Number(values.locCode)
          : null,
      routeNo:
        values.routeNo !== undefined && values.routeNo !== null
          ? Number(values.routeNo)
          : null,
    };

    if (editingRoute) {
      await updateRoute({
        routeId: editingRoute.routeId,
        ...body,
      });
    } else {
      await createRoute(body);
    }
  };

  // ── Mutations ─────────────────────────────────────────────────────────────

  const {
    mutate: createNodalPoint,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateNodalPointMutation, {
    successMessage: "Nodal point created",
    onSuccess: closeForm,
  });

  const {
    mutate: updateNodalPoint,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateNodalPointMutation, {
    successMessage: "Nodal point updated",
    onSuccess: closeForm,
  });

  const { mutate: deleteNodalPoint } = useApiMutation(
    useDeleteNodalPointMutation,
    {
      successMessage: "Nodal point deactivated",
    },
  );

  const handleDeactivate = useCallback(
    (record: NodalPoint) => {
      void deleteNodalPoint(record.id);
    },
    [deleteNodalPoint],
  );

  const { columns, rows, total, tableState, setTableState, handleSearch } =
    useNodalPointTable({
      data: nodalPoints,
      onEdit: openEdit,
      onManageEmployees: setMappingTarget,
      onDeactivate: handleDeactivate,
    });

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!selectedLocationCode) {
      return;
    }

    const body: NodalPointCreateDto = {
      ...(values as unknown as NodalPointCreateDto),

      // Always take location from parent
      locationCode: selectedLocationCode,
    };

    if (editingRecord) {
      await updateNodalPoint({
        id: editingRecord.id,
        body,
      });
    } else {
      await createNodalPoint(body);
    }
  };

  const isRoutesView = viewMode === "routes";

  const locationFilter = (
    <Select
      options={locationOptions}
      value={selectedLocationCode}
      placeholder="Select Location"
      onChange={(value) => {
        setSelectedLocationCode(
          value !== undefined && value !== null ? Number(value) : undefined,
        );
      }}
      style={{ width: 200 }}
    />
  );

  const viewToggle = (
    <>
      <style>{`
        .npp-view-toggle.ant-segmented {
          background: #EDF4F0;
          border-radius: 999px;
          padding: 4px;
        }
        .npp-view-toggle .ant-segmented-item {
          border-radius: 999px;
          color: #52796F;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .npp-view-toggle .ant-segmented-item:hover:not(.ant-segmented-item-selected) {
          color: #1B4332;
        }
        .npp-view-toggle .ant-segmented-item-selected {
          background: #1B4332;
          color: #fff;
          box-shadow: 0 2px 6px rgba(27,67,50,0.3);
        }
        .npp-view-toggle .ant-segmented-thumb {
          background: #1B4332;
          border-radius: 999px;
        }
      `}</style>
      <Segmented
        className="npp-view-toggle"
        value={viewMode}
        options={[
          { label: "Nodal Points", value: "nodalPoints" },
          { label: "Routes", value: "routes" },
        ]}
        onChange={(value) => setViewMode(value as ViewMode)}
      />
    </>
  );

  // Rendered in the page body (not PageContainer's headerActions) so it
  // stays visible on mobile too — PageContainer collapses headerActions
  // into the "⋯" menu below 640px.
  const viewControls = (
    <Space
      size={12}
      wrap
      style={{ padding: "0 28px", marginBottom: 16, width: "100%" }}
    >
      {viewToggle}
      {locationFilter}
    </Space>
  );

  return (
    <PageContainer
      title={isRoutesView ? "Routes" : "Nodal Points"}
      subtitle={
        isRoutesView
          ? "Manage routes used across nodal points"
          : "Manage boarding points and their employee mappings"
      }
      createButtonLabel={isRoutesView ? "Add Route" : "Add Nodal Point"}
      onCreateClick={isRoutesView ? openCreateRoute : openCreate}
      pagination={
        isRoutesView
          ? routeTotal
            ? {
                total: routeTotal,
                current: routeTableState.page,
                pageSize: routeTableState.pageSize,
                onChange: (page: number, pageSize: number) =>
                  setRouteTableState((prev) => ({
                    ...prev,
                    page,
                    pageSize,
                  })),
              }
            : undefined
          : total
            ? {
                total,
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
      {viewControls}

      {isRoutesView ? (
        <DataTableWrapper
          searchPlaceholder="Search by route name"
          onSearch={handleRouteSearch}
          pagination={null}
        >
          <ApiStateWrapper
            isLoading={isRoutesLoading}
            error={routesError}
            isEmpty={!routeRows.length}
            onRetry={refetchRoutes}
            emptyMessage="No routes found. Create your first one."
          >
            <AppTable
              loading={isRoutesLoading}
              columns={routeColumns}
              dataSource={routeRows}
              rowKey="routeId"
              total={routeTotal}
              scroll={{ x: 400 }}
              tableState={routeTableState}
              onTableChange={setRouteTableState}
            />
          </ApiStateWrapper>
        </DataTableWrapper>
      ) : (
        <DataTableWrapper
          searchPlaceholder="Search by name, location code or address"
          onSearch={handleSearch}
          pagination={null}
        >
          <ApiStateWrapper
            isLoading={isLoading}
            error={error}
            isEmpty={!rows.length}
            onRetry={refetch}
            emptyMessage="No nodal points found. Create your first one."
          >
            <AppTable
              loading={isLoading}
              columns={columns}
              dataSource={rows}
              rowKey="id"
              total={total}
              scroll={{ x: 400 }}
              tableState={tableState}
              onTableChange={setTableState}
            />
          </ApiStateWrapper>
        </DataTableWrapper>
      )}

      <NodalPointFormModal
        open={isFormOpen}
        onClose={closeForm}
        editingRecord={editingRecord}
        locationCode={selectedLocationCode}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        serverErrors={
          editingRecord ? updateError?.fieldErrors : createError?.fieldErrors
        }
      />

      <EmployeeMappingPanel
        nodalPoint={mappingTarget}
        open={!!mappingTarget}
        onClose={() => setMappingTarget(null)}
      />

      <RouteFormModal
        open={isRouteFormOpen}
        onClose={closeRouteForm}
        editingRecord={editingRoute}
        locationOptions={locationOptions}
        onSubmit={handleRouteSubmit}
        isSubmitting={isCreatingRoute || isUpdatingRoute}
        serverErrors={
          editingRoute
            ? updateRouteError?.fieldErrors
            : createRouteError?.fieldErrors
        }
      />
    </PageContainer>
  );
};

export default NodalPointListPage;

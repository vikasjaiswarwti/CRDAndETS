// EmployeeListPage.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";

import {
  useGetUserStagesQuery,
  useGetApprovedUsersQuery,
  useGetDeactivateUserQuery,
  useGetUsersLiveCountQuery,
  useGetUserAreaZoneQuery,
} from "../services/Employeeapi";
import { useEmployeeModal } from "../hooks/useEmployeeModal";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations";
import { usePendingTable } from "../hooks/usePendingTable";
import { useApprovedTable } from "../hooks/useApprovedTable";

import { EmployeeRegisterModal } from "../components/Employeeregistermodal";
// import BulkUploadEmployeeModal from "../components/BulkEmployeeUpload";

import { setActiveTab } from "../slice/Employeeslice";
import type {
  ApprovedUser,
  EmployeeFormDto,
  UpdateUserStageDto,
} from "../types/Employee.types";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useLookups } from "../../lookups";
import BulkUploadEmployeeModal from "../components/BulkUploadModalSection";
import UserStatusModal from "../components/UserStatusModal";
import { EMPLOYEE_CONFIG } from "../config";
import { useCancelTable } from "../hooks/useCancelTable";
import TransportModal from "../components/TransportModal";
import type { TableState } from "../../../shared/components/AppTable/AppTable";

import { ChangeRoleModal } from "../components/Changerolemodal";
import { MapLocationsModal } from "../components/Maplocationsmodal";
import CreateAdminRoleModal from "../components/CreateAdminRoleModal";
import { ScrollableTabs } from "../../../shared/components/ScrollableTabs/ScrollableTabs";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

import { Select } from "../../../shared/components/ui/Select";

import { Modal } from "antd";
import { ResetPasswordModal } from "../components/ResetPasswordModal";

const GEO_OPTIONS: { label: string; value: string }[] = [];

const EmployeeListPage: React.FC = () => {
  const dispatch = useDispatch();
  const { Input, Radio } = useUILibrary();

  // inside component:
  const isMobile = useIsMobile();

  // const { Button } = useUILibrary();

  // ── Active Tab ───────────────────────────────────────────────────────────────
  // Tab State
  const [activeTab, setLocalTab] = useState<
    "pending" | "approved" | "deactivated" | "manager"
  >("pending");
  const switchTab = (
    tab: "pending" | "approved" | "deactivated" | "manager",
  ) => {
    setLocalTab(tab);
    dispatch(setActiveTab(tab));
  };

  // Add manager table state alongside the others
  const [managerState, setManagerState] = useState({
    page: 1,
    pageSize: 10,
    sortField: undefined as string | undefined,
    sortOrder: undefined as "ascend" | "descend" | undefined,
  });

  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<ApprovedUser | null>(null);

  // Office/location filter — approved tab only
  const [approvedLocCode, setApprovedLocCode] = useState<string | undefined>(
    undefined,
  );

  // Wrapper that matches (state: TableState) => void
  const handleManagerTableChange = (state: typeof managerState) => {
    setManagerState((p) => ({ ...p, ...state }));
  };

  // Modal & Mutations
  const {
    isRegisterOpen,
    editingRecord,
    isBulkOpen,
    openCreate,
    openEdit,
    closeRegister,
    openBulk,
    closeBulk,
    isCancelOpen,
    openCancel,
    closeCancel,
    // -------
    transportModalOpen,
    // openTransport,
    closeTransport,

    isChangeRoleOpen,
    openChangeRole,
    closeChangeRole,
    isMapLocationsOpen,
    openMapLocations,
    closeMapLocations,
  } = useEmployeeModal();

  console.log("editingRecord from employee list", editingRecord);

  const {
    createEmployee,
    updateEmployee,
    approveEmployee,
    rejectEmployee,
    isCreating,
    isUpdating,
    createError,
    updateError,
    // --------
    updateUserStatus,
    isDeactiving,
    // deactiveError,
    updateTransportStatus,
    isTransporting,

    // ...everything you already have
    updateApprovedUser, // ← add
    isUpdatingApproved, // ← add
    // transportError,

    sendCredentials,
    resetNoShow,
    resetAdhocCount,
    resetUserPassword,
    isResettingPassword,
  } = useEmployeeMutations({
    onCreateSuccess: closeRegister,
    onUpdateSuccess: closeRegister,
    onApproveSuccess: closeRegister,
    onUpdateApprovedSuccess: closeRegister, // ← add
    onDeactivateSuccess: closeCancel,
    onTransportSuccess: closeTransport,
  });

  const handleResetPassword = async (newPassword: string) => {
    if (!resetPasswordUser) return;
    const result = await resetUserPassword({
      userId: resetPasswordUser.user_Id,
      newPassword,
    });
    if (result !== null) setResetPasswordUser(null);
  };

  const handleSendCredentials = (record: ApprovedUser) => {
    Modal.confirm({
      title: "Send Credential Email",
      content: `Send login credentials to ${record.firstName} ${record.lastName} (${record.emailId})?`,
      okText: "Send",
      okButtonProps: {
        style: { background: "#1B4332", borderColor: "#1B4332" },
      },
      cancelText: "Cancel",
      onOk: async () => {
        await sendCredentials({ user_Id: record.user_Id });
        // useApiMutation handles success/error toasts automatically
      },
    });
  };

  // const handleTransportToggle = (record: ApprovedUser) => {
  //   const isBlocked = !record.transport; // currently blocked = transport false
  //   Modal.confirm({
  //     title: isBlocked
  //       ? "Unblock Commutr Services"
  //       : "Block from Commutr Services",
  //     content: isBlocked
  //       ? `Restore Commutr cab services for ${record.firstName} ${record.lastName}?`
  //       : `Block ${record.firstName} ${record.lastName} from all Commutr services?`,
  //     okText: isBlocked ? "Unblock" : "Block",
  //     okButtonProps: {
  //       danger: !isBlocked,
  //       style: {
  //         background: isBlocked ? "#1B4332" : "#dc2626",
  //         borderColor: isBlocked ? "#1B4332" : "#dc2626",
  //       },
  //     },
  //     cancelText: "Cancel",
  //     onOk: async () => {
  //       await updateTransportStatus({
  //         userId: record.user_Id,
  //         transport: !record.transport,
  //         ownTransport: record.ownTransport ?? false,
  //       });
  //     },
  //   });
  // };

  const handleTransportToggle = (record: ApprovedUser) => {
    const isBlocked = !record.transport;

    if (isBlocked) {
      Modal.confirm({
        title: "Unblock Commutr Services",
        content: `Restore Commutr services for ${record.firstName} ${record.lastName}?`,
        okText: "Unblock",
        okButtonProps: {
          style: { background: "#1B4332", borderColor: "#1B4332" },
        },
        cancelText: "Cancel",
        onOk: async () => {
          await updateTransportStatus({
            userId: record.user_Id,
            transport: true,
            ownTransport: record.ownTransport ?? false,
            deleted: false,
          });
        },
      });
      return;
    }

    // Mutable ref shared between content component and onOk
    const selected: { mode: "blockOnly" | "blockAndCancel" } = {
      mode: "blockOnly",
    };

    const BlockContent = () => {
      const [mode, setMode] = React.useState<"blockOnly" | "blockAndCancel">(
        "blockOnly",
      );

      React.useEffect(() => {
        selected.mode = mode;
      }, [mode]);

      return (
        <div style={{ paddingTop: 8 }}>
          <p style={{ marginBottom: 12, color: "#555", fontSize: 13 }}>
            Select an action for{" "}
            <strong>
              {record.firstName} {record.lastName}
            </strong>
            :
          </p>
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Radio value="blockOnly">
                Block ETS transportation service only
              </Radio>
              <Radio value="blockAndCancel">
                Block all Commutr services and cancel all future rosters
              </Radio>
            </div>
          </Radio.Group>
        </div>
      );
    };

    Modal.confirm({
      title: "Block from Commutr Services",
      content: <BlockContent />,
      okText: "Confirm Block",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        await updateTransportStatus({
          userId: record.user_Id,
          transport: false,
          ownTransport: record.ownTransport ?? false,
          deleted: selected.mode === "blockAndCancel",
        });
      },
    });
  };

  const handleResetNoShow = (record: ApprovedUser) => {
    Modal.confirm({
      title: "Reset No-Show Count",
      content: `Are you sure you want to reset the no-show count for ${record.firstName} ${record.lastName}?`,
      okText: "Yes, Reset",
      okButtonProps: {
        style: { background: "#1B4332", borderColor: "#1B4332" },
      },
      cancelText: "Cancel",
      onOk: async () => {
        await resetNoShow({ empID: Number(record.empId) }); // ← check field name below
      },
    });
  };
  const handleResetAdhocCount = (record: ApprovedUser) => {
    Modal.confirm({
      title: "Reset Adhoc Count",
      content: `Are you sure you want to reset the adhoc count for ${record.firstName} ${record.lastName}?`,
      okText: "Yes, Reset",
      okButtonProps: {
        style: { background: "#1B4332", borderColor: "#1B4332" },
      },
      cancelText: "Cancel",
      onOk: async () => {
        await resetAdhocCount({ empID: Number(record.empId) }); // ← check field name below
      },
    });
  };

  // Area / Zone lookup — used for the office assignment form and the approved table columns
  const { data: areaZoneData } = useGetUserAreaZoneQuery();
  const areaOptions = (areaZoneData?.areas ?? []).map((a) => ({
    value: String(a.areaId),
    label: a.areaName,
  }));
  const zoneOptions = (areaZoneData?.zones ?? []).map((z) => ({
    value: String(z.zoneId),
    label: z.zoneName,
  }));

  // Tables
  const {
    columns: pendingColumns,
    tableState: pendingState,
    setTableState: setPendingState,
    handleSearch: handlePendingSearch,
  } = usePendingTable({ onEdit: openEdit });

  const {
    columns: approvedColumns,
    tableState: approvedState,
    setTableState: setApprovedState,
    handleSearch: handleApprovedSearch,
  } = useApprovedTable({
    onEdit: openEdit,
    onCancel: openCancel,
    onTransport: handleTransportToggle, //openTransport,
    onChangeRole: (record) => openChangeRole(record),
    onMapLocations: (record) => openMapLocations(record),
    onSendCredentials: handleSendCredentials,
    onResetNoShow: handleResetNoShow,
    onResetAdhocCount: handleResetAdhocCount,
    onResetPassword: (record) => setResetPasswordUser(record),
  });
  const {
    columns: deactivatedColumns,
    tableState: deactivatedState,
    setTableState: setDeactivatedState,
    // handleSearch: handleDeactivatedSearch,
  } = useCancelTable({ onEdit: openEdit, onCancel: openCancel });

  const {
    locationOptions,
    projectOptions,
    lobOptions,
    departmentOptions,
    isLoading: officeLookupLoading,
  } = useLookups({
    only: [
      "locationOptions",
      "projectOptions",
      "lobOptions",
      "departmentOptions",
    ],
  });

  const officeOptions = locationOptions.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));

  // Office filter is mandatory for the Approved tab — the Users list API
  // must never be called without a locCode. As soon as the location lookup
  // resolves, default to the first office so the table can load; until then
  // the approved-users query stays skipped (see skip condition below).
  React.useEffect(() => {
    if (!approvedLocCode && officeOptions.length > 0) {
      setApprovedLocCode(officeOptions[0].value);
    }
  }, [officeOptions, approvedLocCode]);

  const pendingArgs = {
    page: pendingState.page,
    pageSize: pendingState.pageSize,
    searchTerm: (pendingState as any).searchTerm ?? "",
    sortColumn: pendingState.sortField ?? "",
    sortOrder:
      pendingState.sortOrder === "ascend"
        ? "asc"
        : pendingState.sortOrder === "descend"
          ? "desc"
          : "",
  };

  const approvedArgs = {
    page: approvedState.page,
    pageSize: approvedState.pageSize,
    searchTerm: (approvedState as any).searchTerm ?? "",
    sortColumn: approvedState.sortField ?? "",
    sortOrder:
      approvedState.sortOrder === "ascend"
        ? "asc"
        : approvedState.sortOrder === "descend"
          ? "desc"
          : "",
    ...(approvedLocCode ? { locCode: Number(approvedLocCode) } : {}),
  };
  const deactivatedArgs = {
    page: deactivatedState.page,
    pageSize: deactivatedState.pageSize,
    searchTerm: (deactivatedState as any).searchTerm ?? "",
  };

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
    error: pendingError,
    refetch: pendingRefetch,
  } = useGetUserStagesQuery(pendingArgs, {
    skip: activeTab !== "pending", // ← add
    refetchOnMountOrArgChange: true,
  });

  const {
    data: approvedData,
    isLoading: approvedLoading,
    isFetching: approvedFetching,
    error: approvedError,
    refetch: approvedRefetch,
  } = useGetApprovedUsersQuery(approvedArgs, {
    // Mandatory office filter — never call the Users API on the Approved
    // tab until a locCode has resolved (either the auto-selected default
    // or the user's own pick).
    skip: activeTab !== "approved" || !approvedLocCode,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: deactivatedData,
    isLoading: deactivatedLoading,
    isFetching: deactivatedFetching,
    error: deactivatedError,
    refetch: deactivatedRefetch,
  } = useGetDeactivateUserQuery(deactivatedArgs, {
    skip: activeTab !== "deactivated",
    refetchOnMountOrArgChange: true,
  });

  // ── NEW: manager query (isSystem = true) ──────────────────────────────────
  const managerArgs = {
    page: managerState.page,
    pageSize: managerState.pageSize,
    searchTerm: managerSearchTerm, // ← separate state
    sortColumn: managerState.sortField ?? "",
    sortOrder:
      managerState.sortOrder === "ascend"
        ? "asc"
        : managerState.sortOrder === "descend"
          ? "desc"
          : "",
    isSystem: true,
  };

  const {
    data: managerData,
    isLoading: managerLoading,
    isFetching: managerFetching,
    error: managerError,
    refetch: managerRefetch,
  } = useGetApprovedUsersQuery(managerArgs, {
    skip: activeTab !== "manager",
    refetchOnMountOrArgChange: true,
  });

  // Refetch every time the Employee page is mounted so badge counts don't
  // go stale after navigating away and back.
  const { data: liveCount } = useGetUsersLiveCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const isSubmitting = isCreating || isUpdating || isUpdatingApproved;

  const employeeTabs = [
    {
      key: "pending",
      label: "Pending",
      count: liveCount?.pending,
      badgeColor: "#e53e3e",
    },
    {
      key: "approved",
      label: "Approved",
      count: liveCount?.approved,
      badgeColor: "#005c3d",
    },
    {
      key: "manager",
      label: "Admin Users",
      count: liveCount?.admin,
      badgeColor: "#1a5276",
    },
    {
      key: "deactivated",
      label: "Deactivated Users",
      count: liveCount?.deactive,
      badgeColor: "#524f4f",
    },
  ];

  const handleRegisterSubmit = async (values: EmployeeFormDto) => {
    // areaId/zoneId only apply to editing an approved user — never to creation
    // or to the pending (UserStage) edit path.
    const { areaId, zoneId, ...baseValues } = values;

    if (!editingRecord) {
      await createEmployee(baseValues);
      return;
    }

    console.log("editingRecord from handleSubmit", editingRecord);

    const isApprovedUser =
      "user_Id" in editingRecord && !("userStage_Id" in editingRecord);

    console.log("isApprovedUser from handle submit", isApprovedUser);

    if (isApprovedUser) {
      await updateApprovedUser({
        ...(baseValues as any),
        areaId,
        zoneId,
        emp_Lat: values.empLat, //most important
        emp_Lng: values.empLng, //most important
        id: (editingRecord as ApprovedUser).user_Id,
      });
    } else {
      await updateEmployee({
        ...baseValues,
        id: editingRecord.userStage_Id,
      } as UpdateUserStageDto);
    }
  };

  // const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  const activePagination =
    activeTab === "pending"
      ? {
          total: pendingData?.total ?? 0,
          current: pendingState.page,
          pageSize: pendingState.pageSize,
          onChange: (page: number, pageSize: number) =>
            setPendingState((p) => ({ ...p, page, pageSize })),
        }
      : activeTab === "approved"
        ? {
            total: approvedData?.total ?? 0,
            current: approvedState.page,
            pageSize: approvedState.pageSize,
            onChange: (page: number, pageSize: number) =>
              setApprovedState((p) => ({ ...p, page, pageSize })),
          }
        : activeTab === "manager"
          ? {
              total: managerData?.total ?? 0,
              current: managerState.page,
              pageSize: managerState.pageSize,
              onChange: (page: number, pageSize: number) =>
                setManagerState((p) => ({ ...p, page, pageSize })),
            }
          : {
              total: deactivatedData?.total ?? 0,
              current: deactivatedState.page,
              pageSize: deactivatedState.pageSize,
              onChange: (page: number, pageSize: number) =>
                setDeactivatedState((p) => ({ ...p, page, pageSize })),
            };
  // ---------------

  const handleStatusChange = async (
    userId?: string,
    isActive: boolean = false,
  ) => {
    if (!userId) return;

    try {
      const response = await updateUserStatus({
        userId,
        isActive,
      }); //.unwrap();

      console.log("Status Updated:", response);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <PageContainer
      title="Employee Management"
      subtitle="Register, review, and manage all employees"
      bulkButtonLabel="Bulk Upload"
      onBulkClick={openBulk}
      createButtonLabel="Add New Employee"
      onCreateClick={openCreate}
      canCreate={EMPLOYEE_CONFIG.canStageCreate}
      canBulk={EMPLOYEE_CONFIG.canStageBulk}
      pagination={activePagination}
      headerActions={
        // ← desktop: renders as button
        <button
          onClick={() => setIsCreateRoleOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            borderRadius: 50,
            border: "1.5px solid #064E3B",
            background: "#ecfdf5",
            color: "#064E3B",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(6,78,59,0.15)",
          }}
        >
          + Create Admin Role
        </button>
      }
      mobileMenuItems={[
        // ← mobile: appears in ⋯ dropdown
        {
          label: "Create Admin Role",
          onClick: () => setIsCreateRoleOpen(true),
        },
      ]}
    >
      <DataTableWrapper showSearch={false} pagination={null}>
        {/* Tabs + Search */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            marginBottom: 20,
            padding: isMobile ? "5px 12px" : "5px 28px",
            gap: isMobile ? 10 : 0,
          }}
        >
          <ScrollableTabs
            items={employeeTabs}
            activeKey={activeTab}
            onChange={(key) =>
              switchTab(
                key as "pending" | "approved" | "deactivated" | "manager",
              )
            }
          />

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 10,
              width: isMobile ? "100%" : undefined,
            }}
          >
            {activeTab === "approved" && (
              <div style={{ width: isMobile ? "100%" : 180, flexShrink: 0 }}>
                <Select
                  placeholder="Filter by office"
                  showSearch
                  loading={officeLookupLoading}
                  value={approvedLocCode}
                  onChange={(v: string | number | undefined) => {
                    setApprovedLocCode(v ? String(v) : undefined);
                    setApprovedState((p) => ({ ...p, page: 1 }));
                  }}
                  options={officeOptions}
                  filterOption={(input: string, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                />
              </div>
            )}

            <div style={{ width: isMobile ? "100%" : 320, flexShrink: 0 }}>
              <Input
                placeholder="Search by name, mobile, email..."
                allowClear
                onChange={(e) => {
                  const value = e.target.value;
                  if (activeTab === "pending") handlePendingSearch(value);
                  else if (activeTab === "approved")
                    handleApprovedSearch(value);
                  else if (activeTab === "manager") {
                    setManagerSearchTerm(value);
                    setManagerState((p) => ({ ...p, page: 1 }));
                  }
                }}
                style={{
                  borderRadius: 30,
                  padding: "8px 16px",
                  fontSize: 14,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #d1d5db",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <ApiStateWrapper
            isLoading={pendingLoading}
            error={pendingError}
            isEmpty={!pendingData?.items?.length}
            onRetry={pendingRefetch}
            emptyMessage="No pending registrations found."
          >
            <AppTable
              loading={pendingLoading || pendingFetching}
              columns={pendingColumns}
              dataSource={pendingData?.items ?? []}
              rowKey="userStage_Id"
              tableState={pendingState}
              onTableChange={setPendingState}
            />
          </ApiStateWrapper>
        )}

        {/* Approved Tab */}
        {activeTab === "approved" && (
          <ApiStateWrapper
            isLoading={approvedLocCode ? approvedLoading : officeLookupLoading}
            error={approvedLocCode ? approvedError : undefined}
            isEmpty={approvedLocCode ? !approvedData?.items?.length : true}
            onRetry={approvedRefetch}
            emptyMessage={
              approvedLocCode
                ? "No registered employees found."
                : "Select an office to view employees."
            }
          >
            <AppTable
              loading={approvedLoading || approvedFetching}
              columns={approvedColumns}
              dataSource={approvedData?.items ?? []}
              rowKey="id"
              tableState={approvedState}
              onTableChange={setApprovedState}
               scroll={{ x: 600 }}
            />
          </ApiStateWrapper>
        )}

        {activeTab === "manager" && (
          <ApiStateWrapper
            isLoading={managerLoading}
            error={managerError}
            isEmpty={!managerData?.items?.length}
            onRetry={managerRefetch}
            emptyMessage="No system managers found."
          >
            <AppTable
              loading={managerLoading || managerFetching}
              columns={approvedColumns}
              dataSource={managerData?.items ?? []}
              rowKey="id"
              tableState={managerState}
              onTableChange={
                handleManagerTableChange as (state: TableState) => void
              }
            />
          </ApiStateWrapper>
        )}

        {activeTab === "deactivated" && (
          <ApiStateWrapper
            isLoading={deactivatedLoading}
            error={deactivatedError}
            isEmpty={!deactivatedData?.items?.length}
            onRetry={deactivatedRefetch}
            emptyMessage="No de-activated employees found."
          >
            <AppTable
              loading={deactivatedLoading || deactivatedFetching}
              columns={deactivatedColumns}
              dataSource={deactivatedData?.items ?? []}
              rowKey="id"
              tableState={deactivatedState}
              onTableChange={setDeactivatedState}
            />
          </ApiStateWrapper>
        )}
      </DataTableWrapper>
      {/* Modals */}
      <EmployeeRegisterModal
        open={isRegisterOpen}
        onClose={closeRegister}
        editingRecord={editingRecord}
        onSubmit={handleRegisterSubmit}
        isSubmitting={isSubmitting}
        isInternal={true}
        serverErrors={serverErrors}
        officeOptions={locationOptions}
        departmentOptions={departmentOptions}
        lobOptions={lobOptions}
        projectOptions={projectOptions}
        geocodeOptions={GEO_OPTIONS}
        areaOptions={areaOptions}
        zoneOptions={zoneOptions}
        showArea={activeTab === "approved" && !!approvedData?.isAreaDDLEnabled}
        showZone={activeTab === "approved" && !!approvedData?.isZoneDDlEnabled}
        approveEmployee={approveEmployee}
        rejectEmployee={rejectEmployee}
      />
      <BulkUploadEmployeeModal open={isBulkOpen} onClose={closeBulk} />
      {/* ------------------- */}
      <UserStatusModal
        open={isCancelOpen}
        onClose={closeCancel}
        onConfirm={handleStatusChange}
        loading={isDeactiving}
        editingRecord={(editingRecord as ApprovedUser) ?? null}
        status={editingRecord?.isActive}
        actionType={editingRecord?.isActive ? "deactivate" : "activate"}
      />
      <TransportModal
        open={transportModalOpen}
        onClose={closeTransport}
        loading={isTransporting}
        onConfirm={() => {}}
        editingRecord={(editingRecord as ApprovedUser) ?? null}
      />

      {/* Approved-tab modals */}
      <ChangeRoleModal
        open={isChangeRoleOpen}
        onClose={closeChangeRole}
        editingRecord={(editingRecord as ApprovedUser) ?? null}
      />
      <MapLocationsModal
        open={isMapLocationsOpen}
        onClose={closeMapLocations}
        editingRecord={(editingRecord as ApprovedUser) ?? null}
      />

      <CreateAdminRoleModal
        open={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
      />
      <ResetPasswordModal
        open={!!resetPasswordUser}
        userName={resetPasswordUser?.emailId ?? "employee"}
        isSubmitting={isResettingPassword}
        onClose={() => setResetPasswordUser(null)}
        onSubmit={handleResetPassword}
      />
    </PageContainer>
  );
};

export default EmployeeListPage;

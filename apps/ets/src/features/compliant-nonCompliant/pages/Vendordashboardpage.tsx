import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button as AntButton, message, Modal } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useVehicleComplianceTable } from "../hooks/useVehicleComplianceTable";
import { useVehicleComplianceModal } from "../hooks/useVehicleComplianceModal";
import { useVehicleComplianceMutations } from "../hooks/useVehicleComplianceMutations";
import {
  useGetVehicleDashboardQuery,
  useGetVehicleComplianceQuery,
  useGetVehiclesByStatusQuery,
  useGetPendingVehiclesQuery,
  useGetVehicleListQuery,
  useUpdateVehicleStatusMutation,
} from "../services/VehicleComplianceApi";
import {
  useGetDriverListQuery,
  useUpdateDriverStatusMutation,
} from "../services/DrivercomplianceApi";
import { useGetAllDriverApprovalsQuery } from "../services/VehicleApprovalApi";
import { ComplianceStatCards } from "../components/ComplianceStatCards";
import { DateFilterBar } from "../components/Datefilterbar";
import { UploadDocumentsModal } from "../components/UploadDocumentsModal";
import { ComplianceAddVehicleModal } from "../components/ComplianceAddVehicleModal";
import { ComplianceAddDriverModal } from "../components/ComplianceAddDriverModal";
import { ComplianceBulkVehicleModal } from "../components/ComplianceBulkVehicleModal";
import { ComplianceBulkDriverModal } from "../components/ComplianceBulkDriverModal";
import { useComplianceTransporter } from "../hooks/useComplianceTransporter";
import { useLookups } from "../../lookups/hooks/useLookups";
import {
  COMPLIANCE_TABS,
  DRIVER_TABS,
  // TAB_COUNT_KEY,
} from "../constants/VehicleComplianceConstants";
import { useTokens } from "../constants/tokens";
import type {
  ComplianceTab,
  DriverTab,
  DashboardView,
  DateFilter,
  VehicleCompliance,
} from "../types/Vehiclecompliance.types";
import type { DriverComplianceRow } from "../services/DrivercomplianceApi";

import { UploadDriverDocumentsModal } from "../components/Uploaddriverdocumentsmodal";
import { EditApprovedVehicleModal } from "../components/EditApprovedVehicleModal";
import { EditApprovedDriverModal } from "../components/EditApprovedDriverModal";
import { VehicleQrModal } from "../components/VehicleQrModal";

import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// Extend to cover pending drivers from DriverStages
type ExtendedDriverTab = DriverTab | "pending";

type StatusChangeTarget = {
  entity: DashboardView;
  id: string;
  currentStatus?: number | null;
  currentStatusName?: string | null;
  status?: string | number | null;
  displayName?: string;
};

const STATUS_LABELS: Record<number, string> = {
  1: "Active",
  2: "Inactive",
  3: "Blacklisted",
};

export const VendorDashboardPage: React.FC = () => {
  const {
    Row,
    Col,
    Tabs,
    Input,
    Button,
    Space,
    Badge,
    Typography,
    Select,
    Pagination,
  } = useUILibrary();
  const { Title } = Typography;
  const { color, spacing, radius, shadow, font } = useTokens();
  const [updateVehicleStatus, { isLoading: isVehicleStatusSaving }] =
    useUpdateVehicleStatusMutation();
  const [updateDriverStatus, { isLoading: isDriverStatusSaving }] =
    useUpdateDriverStatusMutation();

  const isMobile = useIsMobile();

  const [view, setView] = useState<DashboardView>("Vehicle");
  const [activeTab, setActiveTab] = useState<ComplianceTab>("active");
  const [driverTab, setDriverTab] = useState<ExtendedDriverTab>("active");
  const [dateFilter, setDateFilter] = useState<DateFilter>(7);
  const [customDays, setCustomDays] = useState(30);

  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [bulkVehicleOpen, setBulkVehicleOpen] = useState(false);
  const [bulkDriverOpen, setBulkDriverOpen] = useState(false);

  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [qrVehicle, setQrVehicle] = useState<any>(null);

  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [editingActiveDriver, setEditingActiveDriver] = useState<any>(null);
  const [statusChangeTarget, setStatusChangeTarget] =
    useState<StatusChangeTarget | null>(null);

  const currentTab = view === "Vehicle" ? activeTab : driverTab;

  const { vendorOptions } = useLookups({
    only: ["vendorOptions"],
  });
  const {
    isAdmin,
    isTransportManager,
    isVendor,
    transporterId,
    selectedVendorId,
    setSelectedVendorId,
    canFetch,
    vendorTransporterOptions,
    isVendorMultiTransporter,
    vendorLabel,
    locCode,
  } = useComplianceTransporter({
    vendorOptionsReady: (vendorOptions?.length ?? 0) > 0,
    vendorOptions: vendorOptions as any,
  });

  // Auto-select first vendor for admin / transport manager when list loads
  useEffect(() => {
    if (
      (isAdmin || isTransportManager) &&
      !selectedVendorId &&
      vendorOptions &&
      vendorOptions.length > 0
    )
      setSelectedVendorId(vendorOptions[0].value as any);
  }, [
    isAdmin,
    isTransportManager,
    vendorOptions,
    selectedVendorId,
    setSelectedVendorId,
  ]);

  const { isOpen, editingRecord, openEdit, close } =
    useVehicleComplianceModal();

  const openDriverEdit = useCallback(
    (record: any) => setEditingDriver(record),
    [],
  );

  const openVehicleEdit = useCallback(
    (record: any) => setEditingVehicle(record),
    [],
  );
  const openVehicleQr = useCallback((record: any) => setQrVehicle(record), []);
  const openActiveDriverEdit = useCallback(
    (record: any) => setEditingActiveDriver(record),
    [],
  );

  const openStatusChange = useCallback(
    (record: VehicleCompliance | DriverComplianceRow) => {
      setStatusChangeTarget({
        entity: view,
        id: record.id,
        currentStatus: record.currentStatus,
        currentStatusName: record.currentStatusName,
        status: "status" in record ? record.status : undefined,
        displayName:
          "vehicleNo" in record ? record.vehicleNo : record.driverName,
      });
    },
    [view],
  );

  const handleChangeStatus = useCallback(async () => {
      if (!statusChangeTarget) return;
      const nextStatus =
        statusChangeTarget.currentStatus === 1 ? 2 : 1;
      const nextStatusName = STATUS_LABELS[nextStatus];
      try {
        if (statusChangeTarget.entity === "Vehicle") {
          await updateVehicleStatus({
            id: statusChangeTarget.id,
            currentStatus: nextStatus,
            transporterId,
          }).unwrap();
        } else {
          await updateDriverStatus({
            id: statusChangeTarget.id,
            currentStatus: nextStatus,
          }).unwrap();
        }
        message.success(
          `${statusChangeTarget.entity} status changed to ${nextStatusName} successfully.`,
        );
        setStatusChangeTarget(null);
      } catch {
        message.error(
          `Unable to change ${statusChangeTarget.entity.toLowerCase()} status.`,
        );
      }
    },
    [statusChangeTarget, transporterId, updateVehicleStatus, updateDriverStatus],
  );

  // const { columns, tableState, setTableState, search, handleSearch } =
  //   useVehicleComplianceTable({
  //     activeTab: currentTab,
  //     view,
  //     onEdit: openEdit,
  //     onDriverEdit: openDriverEdit,
  //   });

  // const { columns, tableState, setTableState, search, handleSearch } =
  //   useVehicleComplianceTable({
  //     activeTab: currentTab,
  //     view,
  //     onEdit:
  //       view === "Vehicle" && activeTab === "pending" ? openEdit : undefined,
  //     onDriverEdit:
  //       view === "Driver" && driverTab === "pending"
  //         ? openDriverEdit
  //         : undefined,

  //   });

  // console.log("view", view);
  // console.log("activeTab", activeTab);

  const { columns, tableState, setTableState, search, handleSearch } =
    useVehicleComplianceTable({
      activeTab: currentTab,
      view,
      onViewQr:
        view === "Vehicle" && activeTab === "active" ? openVehicleQr : undefined,
      onEdit:
        view === "Vehicle" && activeTab === "pending"
          ? openEdit // → UploadDocumentsModal
          : view === "Vehicle" &&
              (activeTab === "active" ||
                activeTab === "inactive" ||
                activeTab === "blacklisted")
            ? openVehicleEdit // → EditApprovedVehicleModal
            : undefined,
      onDriverEdit:
        view === "Driver" && driverTab === "pending"
          ? openDriverEdit // → UploadDriverDocumentsModal
          : view === "Driver" &&
              (driverTab === "active" ||
                driverTab === "inactive" ||
                driverTab == "blacklisted")
            ? openActiveDriverEdit // → EditApprovedDriverModal
            : undefined,
      onChangeStatus:
        view === "Vehicle" &&
        (activeTab === "active" ||
          activeTab === "inactive" ||
          activeTab === "blacklisted")
          ? openStatusChange
          : view === "Driver" &&
              (driverTab === "active" ||
                driverTab === "inactive" ||
                driverTab === "blacklisted")
            ? openStatusChange
            : undefined,
    });

  const expiryDays =
    dateFilter === "custom" ? customDays : (dateFilter as number);

  // ── Stat cards + tab counts ───────────────────────────────────────────────
  const vehicleBaseBody = useMemo(
    () =>
      canFetch && transporterId !== undefined
        ? { transporterId: transporterId!, expiryDays }
        : undefined,
    [canFetch, transporterId, expiryDays],
  );

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetVehicleDashboardQuery(vehicleBaseBody!, {
    skip: !vehicleBaseBody || view !== "Vehicle",
  });

  const { data: tabCounts } = useGetVehicleComplianceQuery(vehicleBaseBody!, {
    skip: !vehicleBaseBody || view !== "Vehicle",
  });

  // ── Shared vehicle query base ─────────────────────────────────────────────
  const vehicleQueryBase = useMemo(
    () => ({
      transporterId: transporterId!,
      searchTerm: search,
      page: tableState.page,
      pageSize: tableState.pageSize,
    }),
    [transporterId, search, tableState.page, tableState.pageSize],
  );

  const isVehicleView =
    view === "Vehicle" && canFetch && transporterId !== undefined;

  // ── Vehicle queries ───────────────────────────────────────────────────────
  const {
    data: activeData,
    isLoading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useGetVehiclesByStatusQuery(
    { ...vehicleQueryBase, isActive: true },
    {
      skip: !isVehicleView || activeTab !== "active",
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: inactiveData,
    isLoading: inactiveLoading,
    error: inactiveError,
    refetch: refetchInactive,
  } = useGetVehiclesByStatusQuery(
    { ...vehicleQueryBase, isActive: false },
    {
      skip: !isVehicleView || activeTab !== "inactive",
      refetchOnMountOrArgChange: true,
    },
  );
  const {
    data: blackListData,
    isLoading: isBlackListLoading,
    error: isBlackListError,
    refetch: refetchIsBlackList,
  } = useGetVehiclesByStatusQuery(
    { ...vehicleQueryBase, currentStatus: 3 },
    {
      skip: !isVehicleView || activeTab !== "blacklisted",
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useGetPendingVehiclesQuery(vehicleQueryBase, {
    skip: !isVehicleView || activeTab !== "pending",
    refetchOnMountOrArgChange: true,
  });

  const reachingBody = useMemo(
    () =>
      isVehicleView && activeTab === "reachingNonCompliance"
        ? {
            transporterId: transporterId!,
            expiryDays,
            filter: "ReachingNonCompliance" as const,
            page: tableState.page,
            pageSize: tableState.pageSize,
          }
        : undefined,
    [
      isVehicleView,
      activeTab,
      transporterId,
      expiryDays,
      tableState.page,
      tableState.pageSize,
    ],
  );

  const {
    data: reachingData,
    isLoading: reachingLoading,
    error: reachingError,
    refetch: refetchReaching,
  } = useGetVehicleListQuery(reachingBody!, {
    skip: !reachingBody,
    refetchOnMountOrArgChange: true,
  });

  // ── Driver: Active / Inactive (GET /api/v1/Drivers) ──────────────────────
  const driverListBody = useMemo(
    () =>
      canFetch &&
      transporterId !== undefined &&
      view === "Driver" &&
      driverTab == "blacklisted"
        ? {
            transporterId: transporterId!,
            page: tableState.page,
            currentStatus: 3,
            pageSize: tableState.pageSize,
            ...(search ? { searchTerm: search } : {}),
          }
        : driverTab !== "pending"
          ? {
              transporterId: transporterId!,
              isActive: driverTab === "active",
              page: tableState.page,
              pageSize: tableState.pageSize,
              ...(search ? { searchTerm: search } : {}),
            }
          : undefined,
    [canFetch, transporterId, view, driverTab, tableState, search],
  );

  const {
    data: driverData,
    isLoading: driverLoading,
    isFetching: driverFetching,
    error: driverError,
    refetch: refetchDriver,
  } = useGetDriverListQuery(driverListBody!, {
    skip: !driverListBody,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: driverBlackListedData,
    isLoading: driverBlackListedLoading,
    error: driverBlackListedError,
    refetch: refetchBlackListedDriver,
  } = useGetDriverListQuery(driverListBody!, {
    skip: !driverListBody,
    refetchOnMountOrArgChange: true,
  });
  // console.log(driverBlackListedData, "driverBlackListedData");
  // ── Driver tab counts ─────────────────────────────────────────────────────

  const [driverActiveCount, setDriverActiveCount] = useState<
    number | undefined
  >();
  const [driverInactiveCount, setDriverInactiveCount] = useState<
    number | undefined
  >();
  const [driverBlackListedCount, setDriverBlackListedCount] = useState<
    number | undefined
  >();

  useEffect(() => {
    if (!driverData || driverFetching) return; // ← isFetching, not isLoading
    const total =
      (driverData as any)?.totalCount ??
      (driverData as any)?.total ??
      driverBlackListedData?.totalCount;
    if (driverTab === "active") setDriverActiveCount(total);
    else if (driverTab === "inactive") setDriverInactiveCount(total);
    else if (driverTab === "blacklisted") setDriverBlackListedCount(total);
  }, [driverTab, driverData, driverFetching]);

  // ── Driver: Pending (GET /api/v1/DriverStages) ────────────────────────────
  const {
    data: pendingDriverData,
    isLoading: pendingDriverLoading,
    error: pendingDriverError,
    refetch: refetchPendingDriver,
  } = useGetAllDriverApprovalsQuery(
    {
      transporterId: transporterId!,
      searchTerm: search,
      page: tableState.page,
      pageSize: tableState.pageSize,
    },
    {
      skip: !canFetch || transporterId === undefined || view !== "Driver",
      // driverTab !== "pending"
      refetchOnMountOrArgChange: true,
    },
  );

  // ── Active data source ────────────────────────────────────────────────────
  const { vehicleData, isLoading, error, refetchFn } = useMemo(() => {
    if (view === "Driver") {
      if (driverTab === "pending") {
        return {
          vehicleData: pendingDriverData,
          isLoading: pendingDriverLoading,
          error: pendingDriverError,
          refetchFn: refetchPendingDriver,
        };
      } else if (driverTab == "blacklisted") {
        return {
          vehicleData: driverBlackListedData,
          isLoading: driverBlackListedLoading,
          error: driverBlackListedError,
          refetchFn: refetchBlackListedDriver,
        };
      }
      return {
        vehicleData: driverData,
        isLoading: driverLoading,
        error: driverError,
        refetchFn: refetchDriver,
      };
    }
    switch (activeTab) {
      case "active":
        return {
          vehicleData: activeData,
          isLoading: activeLoading,
          error: activeError,
          refetchFn: refetchActive,
        };
      case "inactive":
        return {
          vehicleData: inactiveData,
          isLoading: inactiveLoading,
          error: inactiveError,
          refetchFn: refetchInactive,
        };
      case "pending":
        return {
          vehicleData: pendingData,
          isLoading: pendingLoading,
          error: pendingError,
          refetchFn: refetchPending,
        };
      case "reachingNonCompliance":
        return {
          vehicleData: reachingData,
          isLoading: reachingLoading,
          error: reachingError,
          refetchFn: refetchReaching,
        };
      case "blacklisted":
        return {
          vehicleData: blackListData,
          isLoading: isBlackListLoading,
          error: isBlackListError,
          refetchFn: refetchIsBlackList,
        };
      default:
        return {
          vehicleData: undefined,
          isLoading: false,
          error: undefined,
          refetchFn: refetchActive,
        };
    }
  }, [
    view,
    activeTab,
    driverTab,
    activeData,
    activeLoading,
    activeError,
    refetchActive,
    inactiveData,
    inactiveLoading,
    inactiveError,
    refetchInactive,
    pendingData,
    pendingLoading,
    pendingError,
    refetchPending,
    reachingData,
    reachingLoading,
    reachingError,
    refetchReaching,
    driverData,
    driverLoading,
    driverError,
    refetchDriver,
    pendingDriverData,
    pendingDriverLoading,
    pendingDriverError,
    refetchPendingDriver,
    blackListData,
    isBlackListLoading,
    isBlackListError,
    refetchIsBlackList,
  ]);

  const dataTotal =
    (vehicleData as any)?.total ?? (vehicleData as any)?.totalCount ?? 0;
  const dataSource: any[] = (vehicleData as any)?.items ?? [];
  // console.log(dataSource);
  const isEmpty = !dataSource.length;

  const { uploadCompliance, isUploading } = useVehicleComplianceMutations({
    onUploadSuccess: close,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabChange = useCallback(
    (key: string) => {
      if (view === "Vehicle") setActiveTab(key as ComplianceTab);
      else setDriverTab(key as ExtendedDriverTab);
      setTableState({ ...tableState, page: 1 });
    },
    [view, tableState, setTableState],
  );

  const handleDateChange = useCallback(
    (f: DateFilter, days?: number) => {
      const isSameFilter = f === dateFilter && f !== "custom";
      setDateFilter(f);
      if (days !== undefined) setCustomDays(days);
      if (isSameFilter) setTimeout(() => refetchFn?.(), 0);
    },
    [dateFilter, refetchFn],
  );

  const handleViewChange = useCallback(
    (v: string) => {
      setView(v as DashboardView);
      setActiveTab("active");
      setDriverTab("active");
      setTableState({ ...tableState, page: 1 });
    },
    [tableState, setTableState],
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!editingRecord) return;
      await uploadCompliance({ id: editingRecord.id, ...values } as any);
    },
    [editingRecord, uploadCompliance],
  );

  const vehicleTabItems = useMemo(() => {
    // Map each tab key → its actual query totalCount
    const actualCounts: Record<string, number | undefined> = {
      active: activeData?.totalCount,
      inactive: inactiveData?.totalCount,
      pending: pendingData?.totalCount,
      reachingNonCompliance: reachingData?.totalCount,
    };

    return COMPLIANCE_TABS.map((t) => {
      // Use real query count if loaded, fall back to summary endpoint
      // const count =
      //   actualCounts[t.key] ??
      //   (tabCounts
      //     ? (tabCounts as unknown as Record<string, number>)[
      //         TAB_COUNT_KEY[t.key]
      //       ]
      //     : undefined);

      const count = actualCounts[t.key];

      return {
        key: t.key,
        label: (
          <Space size={4}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: `2px solid ${t.dotColor}`,
              }}
            />
            <span style={{ fontSize: font.sizeSm }}>{t.label}</span>
            {count != null && (
              <Badge
                count={count}
                style={{
                  backgroundColor:
                    activeTab === t.key ? t.dotColor : `${t.dotColor}22`,
                  color: activeTab === t.key ? "#fff" : t.dotColor,
                  fontWeight: font.weightSemibold,
                  boxShadow: "none",
                  fontSize: 11,
                }}
                overflowCount={9999}
              />
            )}
          </Space>
        ),
      };
    });
  }, [
    tabCounts,
    activeTab,
    font,
    activeData?.totalCount,
    inactiveData?.totalCount,
    pendingData?.totalCount,
    reachingData?.totalCount,
  ]);

  // Add this line just before the driverTabItems useMemo
  const pendingDriverTotal =
    (pendingDriverData as any)?.total ??
    (pendingDriverData as any)?.totalCount ??
    0;

  const driverTabItems = useMemo(
    () => [
      ...DRIVER_TABS.map((t) => {
        const count =
          t.key === "active"
            ? driverActiveCount
            : t.key === "inactive"
              ? driverInactiveCount
              : t.key === "blacklisted"
                ? driverBlackListedCount
                : t.key === "pending"
                  ? pendingDriverTotal
                  : undefined;

        return {
          key: t.key,
          label: (
            <Space size={4}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: `2px solid ${t.dotColor}`,
                }}
              />
              <span style={{ fontSize: font.sizeSm }}>{t.label}</span>
              {count != null && (
                <Badge
                  count={count}
                  style={{
                    backgroundColor:
                      driverTab === t.key ? t.dotColor : `${t.dotColor}22`,
                    color: driverTab === t.key ? "#fff" : t.dotColor,
                    fontWeight: font.weightSemibold,
                    boxShadow: "none",
                    fontSize: 11,
                  }}
                  overflowCount={9999}
                />
              )}
            </Space>
          ),
        };
      }),
    ],
    [
      font,
      driverTab,
      pendingDriverTotal,
      driverActiveCount,
      driverInactiveCount,
      pendingDriverTotal,
    ],
  );

  return (
    <div
      style={{
        // padding: `${spacing.lg}px ${spacing.xl}px`,
        padding: isMobile
          ? `${spacing.md}px ${spacing.sm}px`
          : `${spacing.lg}px ${spacing.xl}px`,
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Row
        justify="space-between"
        // align="middle"
        align={isMobile ? "start" : "middle"}
        style={{
          marginBottom: spacing.md,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? spacing.sm : 0,
          width: isMobile ? "100%" : "auto",
          flexWrap: isMobile ? undefined : "wrap",
        }}
      >
        <Col
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.md,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Compliance Dashboard
          </Title>
          <div
            style={{
              display: "flex",
              background: "#f3f4f6",
              borderRadius: 16,
              padding: 5,
              gap: 2,
              width: isMobile ? "100%" : "auto",
            }}
          >
            {(["Vehicle", "Driver"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleViewChange(opt)}
                style={{
                  flex: isMobile ? 1 : undefined,
                  padding: "4px 14px",
                  borderRadius: 16,
                  border: "none",
                  background: view === opt ? "#3E9B73" : "transparent",
                  color: view === opt ? "#fff" : "#6b7280",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: view === opt ? 600 : 400,
                  boxShadow:
                    view === opt ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          {/* Admin / Transport Manager: full vendor lookup */}
          {(isAdmin || isTransportManager) && (
            <Select
              value={selectedVendorId}
              onChange={(v: any) => setSelectedVendorId(v ?? undefined)}
              options={vendorOptions ?? []}
              allowClear
              placeholder={
                !vendorOptions
                  ? "Loading vendors…"
                  : vendorOptions.length === 0
                    ? "No vendors available"
                    : "Select Vendor"
              }
              disabled={!vendorOptions || vendorOptions.length === 0}
              loading={!vendorOptions}
              style={{ width: isMobile ? "100%" : 220, fontSize: font.sizeSm }}
            />
          )}
          {/* Vendor with 2+ transporters: show their own transporter selector */}
          {isVendorMultiTransporter && (
            <Select
              value={selectedVendorId}
              onChange={(v: any) => setSelectedVendorId(v ?? undefined)}
              options={vendorTransporterOptions}
              placeholder="Select transporter"
              style={{ width: isMobile ? "100%" : 220, fontSize: font.sizeSm }}
            />
          )}
          {/* Vendor with single transporter: show name as read-only tag */}
          {isVendor && !isVendorMultiTransporter && vendorLabel && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: "#f0faf4",
                border: "1px solid #b7e4c7",
                fontSize: font.sizeSm,
                color: "#1B4332",
                fontWeight: 500,
                maxWidth: isMobile ? "100%" : 260,
                width: isMobile ? "100%" : undefined,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#3E9B73",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {vendorLabel}
              </span>
            </div>
          )}
        </Col>
        <Col style={{ width: isMobile ? "100%" : "auto", marginTop: 8 }}>
          <Space
            size={spacing.sm}
            wrap={isMobile}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            {view === "Vehicle" && (
              <>
                <Button
                  size="small"
                  type="primary"
                  style={{
                    fontSize: font.sizeSm,
                    background: color.primary,
                    borderColor: color.primary,
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={() => setAddVehicleOpen(true)}
                >
                  + Add Vehicle
                </Button>
                <Button
                  size="small"
                  style={{
                    fontSize: font.sizeSm,
                    borderColor: color.primary,
                    color: color.primary,
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={() => setBulkVehicleOpen(true)}
                >
                  ⬆ Bulk Vehicle
                </Button>
              </>
            )}
            {view === "Driver" && (
              <>
                <Button
                  size="small"
                  type="primary"
                  style={{
                    fontSize: font.sizeSm,
                    background: color.primary,
                    borderColor: color.primary,
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={() => setAddDriverOpen(true)}
                >
                  + Add Driver
                </Button>
                <Button
                  size="small"
                  style={{
                    fontSize: font.sizeSm,
                    borderColor: color.primary,
                    color: color.primary,
                    width: isMobile ? "100%" : "auto",
                  }}
                  onClick={() => setBulkDriverOpen(true)}
                >
                  ⬆ Bulk Driver
                </Button>
              </>
            )}

            {isMobile && (
              <Button
                size="small"
                style={{
                  fontSize: font.sizeSm,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={() =>
                  window.open("/compliance/approval-dashboard", "_blank")
                }
              >
                Approval Dashboard.
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      {view === "Vehicle" && (
        <ApiStateWrapper
          isLoading={statsLoading}
          error={statsError}
          isEmpty={!stats}
          onRetry={refetchStats}
          emptyMessage=""
        >
          {stats && (
            <div style={{ overflowX: isMobile ? "auto" : "visible" }}>
              <ComplianceStatCards stats={stats} />
            </div>
          )}
        </ApiStateWrapper>
      )}

      {/* ── Date filter bar ─────────────────────────────────────────────── */}
      {view === "Vehicle" && (
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.md,
            background: color.surface,
            borderRadius: radius.lg,
            padding: `${spacing.sm}px ${spacing.md}px`,
            border: `1px solid ${color.border}`,
          }}
        >
          <DateFilterBar
            value={dateFilter}
            customDays={customDays}
            onChange={handleDateChange}
            loading={isLoading}
          />

          {!isMobile && (
            <Space
              size={spacing.sm}
              style={{ width: isMobile ? "100%" : "auto" }}
            >
              <Button
                size="small"
                style={{
                  fontSize: font.sizeSm,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={() =>
                  window.open("/compliance/approval-dashboard", "_blank")
                }
              >
                <span style={{ marginRight: 4 }}>📋</span>Approval Dashboard
              </Button>
              {/* <Button size="small" style={{ fontSize: font.sizeSm }}>
              <span style={{ marginRight: 4 }}>🚗</span>Vehicle Audit
            </Button> */}
            </Space>
          )}
        </div>
      )}

      {/* ── Admin / Transport Manager guard ─────────────────────────────── */}
      {(isAdmin || isTransportManager) && !canFetch && (
        <div
          style={{
            padding: spacing.xl,
            textAlign: "center",
            color: color.textSecondary,
            fontSize: font.sizeSm,
            background: color.surface,
            borderRadius: radius.lg,
            border: `1px solid ${color.border}`,
            marginBottom: spacing.md,
          }}
        >
          Please select a vendor to load data.
        </div>
      )}

      {/* ── Main card ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: color.surface,
          borderRadius: radius.xl,
          border: `1px solid ${color.border}`,
          boxShadow: shadow.card,
          overflow: "hidden",
        }}
      >
        <Tabs
          activeKey={view === "Vehicle" ? activeTab : driverTab}
          onChange={handleTabChange}
          items={view === "Vehicle" ? vehicleTabItems : driverTabItems}
          style={{
            padding: isMobile ? `0 ${spacing.sm}px` : `0 ${spacing.lg}px`,
          }}
          tabBarStyle={{ marginBottom: 0 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.sm,
            padding: `${spacing.sm}px ${spacing.lg}px`,
          }}
        >
          <Input
            allowClear
            placeholder={
              view === "Vehicle"
                ? "Search by Vehicle, Reg. No."
                : "Search by Driver Name, License No."
            }
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearch(e.target.value)
            }
            style={{
              maxWidth: isMobile ? "100%" : 300,
              width: isMobile ? "100%" : undefined,
              fontSize: font.sizeSm,
            }}
          />

          {view === "Driver" && !isMobile && (
            <Space
              size={spacing.sm}
              style={{ width: isMobile ? "100%" : "auto" }}
            >
              <Button
                size="small"
                style={{
                  fontSize: font.sizeSm,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={() =>
                  window.open("/compliance/approval-dashboard", "_blank")
                }
              >
                <span style={{ marginRight: 4 }}>📋</span>Approval Dashboard
              </Button>
              {/* <Button size="small" style={{ fontSize: font.sizeSm }}>
              <span style={{ marginRight: 4 }}>🚗</span>Vehicle Audit
            </Button> */}
            </Space>
          )}

          {/* <Space size={spacing.sm}>
            <Button
              size="small"
              style={{
                borderColor: "#b7eb8f",
                color: color.primaryDark,
                fontSize: font.sizeSm,
              }}
            >
              Export XLS
            </Button>
            <Button
              size="small"
              style={{
                borderColor: "#b7eb8f",
                color: color.primaryDark,
                fontSize: font.sizeSm,
              }}
            >
              Export CSV
            </Button>
          </Space> */}
        </div>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refetchFn}
          emptyMessage={
            view === "Vehicle" ? "No vehicles found" : "No drivers found"
          }
        >
          <AppTable<any>
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            tableState={tableState}
            onTableChange={setTableState}
            loading={isLoading}
            scroll={{ x: 860 }}
            style={{ borderTop: `1px solid ${color.border}` }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: `${spacing.sm}px ${spacing.lg}px`,
              borderTop: `1px solid ${color.border}`,
            }}
          >
            <Pagination
              current={tableState.page}
              pageSize={tableState.pageSize}
              total={dataTotal}
              showSizeChanger
              showTotal={(total: number) => `Total ${total} items`}
              onChange={(page: number, pageSize: number) =>
                setTableState({ ...tableState, page, pageSize })
              }
            />
          </div>
        </ApiStateWrapper>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <UploadDocumentsModal
        open={isOpen}
        onClose={close}
        record={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isUploading}
        isPending={activeTab === "pending"}
      />
      <ComplianceAddVehicleModal
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setAddVehicleOpen(false);
          refetchPendingDriver();
        }}
      />
      <ComplianceAddDriverModal
        open={addDriverOpen}
        onClose={() => setAddDriverOpen(false)}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setAddDriverOpen(false);
          refetchPendingDriver();
        }}
      />
      <ComplianceBulkVehicleModal
        open={bulkVehicleOpen}
        onClose={() => setBulkVehicleOpen(false)}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setBulkVehicleOpen(false);
          refetchActive();
        }}
      />
      <ComplianceBulkDriverModal
        open={bulkDriverOpen}
        onClose={() => setBulkDriverOpen(false)}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setBulkDriverOpen(false);
          setDriverTab("pending");
          refetchDriver();
        }}
      />

      <UploadDriverDocumentsModal
        open={!!editingDriver}
        onClose={() => setEditingDriver(null)}
        record={editingDriver}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setEditingDriver(null);
          setDriverTab("pending");
          // refetchDriver();
          refetchPendingDriver();
        }}
      />

      <EditApprovedVehicleModal
        open={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        record={editingVehicle}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setEditingVehicle(null);
          activeTab === "active"
            ? refetchActive()
            : activeTab === "blacklisted"
              ? refetchFn()
              : refetchInactive();
        }}
      />

      <EditApprovedDriverModal
        open={!!editingActiveDriver}
        onClose={() => setEditingActiveDriver(null)}
        record={editingActiveDriver}
        transporterId={transporterId}
        locCode={locCode}
        vendorLabel={vendorLabel ?? undefined}
        onSuccess={() => {
          setEditingActiveDriver(null);
          refetchDriver();
        }}
      />

      <VehicleQrModal
        open={!!qrVehicle}
        record={qrVehicle}
        onClose={() => setQrVehicle(null)}
      />

      <Modal
        title="Confirm status change"
        open={!!statusChangeTarget}
        onCancel={() => setStatusChangeTarget(null)}
        footer={[
          <AntButton
            key="cancel"
            onClick={() => setStatusChangeTarget(null)}
            disabled={isVehicleStatusSaving || isDriverStatusSaving}
          >
            Cancel
          </AntButton>,
          <AntButton
            key="save"
            type="primary"
            loading={isVehicleStatusSaving || isDriverStatusSaving}
            onClick={handleChangeStatus}
          >
            Save
          </AntButton>,
        ]}
      >
        {statusChangeTarget && (
          <p>
            Change {statusChangeTarget.entity.toLowerCase()}{" "}
            <strong>{statusChangeTarget.displayName}</strong> from{" "}
            <strong>
              {statusChangeTarget.currentStatusName ||
                (statusChangeTarget.status != null
                  ? String(statusChangeTarget.status)
                  : undefined) ||
                STATUS_LABELS[statusChangeTarget.currentStatus ?? -1] ||
                "Unknown"}
            </strong>{" "}
            to{" "}
            <strong>
              {
                STATUS_LABELS[
                  statusChangeTarget.currentStatus === 1 ? 2 : 1
                ]
              }
            </strong>
            ?
          </p>
        )}
      </Modal>
    </div>
  );
};

export default VendorDashboardPage;

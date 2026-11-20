import React, { useState, useCallback, useEffect, useRef } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useApprovalDashboardTable } from "../hooks/useApprovalDashboardTable";
import {
  useApprovalMutations,
  useDriverApprovalMutations,
} from "../hooks/useVehicleComplianceMutations";
import {
  useGetAllApprovalsQuery,
  useGetAllDriverApprovalsQuery,
  useGetApprovedVehiclesQuery,
  useGetApprovedDriversQuery,
} from "../services/VehicleApprovalApi";
import { ApprovalReviewPanel } from "../components/Approvalreviewpanel";
import { useComplianceTransporter } from "../hooks/useComplianceTransporter";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useTokens } from "../constants/tokens";
import type {
  VehicleApproval,
  ApprovalFilterStatus,
  DashboardView,
} from "../types/Vehiclecompliance.types";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// import { useComplianceValidation } from "../hooks/useComplianceValidation";

// ─── Error boundary ───────────────────────────────────────────────────────────
interface BoundaryState {
  hasError: boolean;
}
class PanelBoundary extends React.Component<
  { children: React.ReactNode; onDismiss: () => void },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };
  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[PanelBoundary]", err);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#ef4444",
          fontSize: 13,
        }}
      >
        Failed to load review panel.{" "}
        <button
          onClick={() => {
            this.setState({ hasError: false });
            this.props.onDismiss();
          }}
          style={{
            marginLeft: 8,
            cursor: "pointer",
            textDecoration: "underline",
            background: "none",
            border: "none",
            color: "#ef4444",
            fontSize: 13,
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }
}

// ─── Status pills ─────────────────────────────────────────────────────────────
// "Approved" → GET /api/v1/Vehicles
// All others  → GET /api/v1/VehicleStages?status=...
// No "All" pill — Pending is the default active state on load.
type ExtendedFilter = ApprovalFilterStatus | "Approved";

// Pill → actionType sent to API  (Approved uses a separate endpoint, no actionType)
const PILL_ACTION_TYPE: Partial<Record<ExtendedFilter, string>> = {
  Pending: "P",
  Reject: "R",
  // "System Reject": "SR",  // commented out for now
};

const STATUS_PILLS: {
  key: ExtendedFilter;
  label: string;
  activeColor: string;
  activeBg: string;
}[] = [
  {
    key: "Approved",
    label: "Approved",
    activeColor: "#fff",
    activeBg: "#22c55e",
  },
  {
    key: "Pending",
    label: "Pending",
    activeColor: "#fff",
    activeBg: "#f59e0b",
  },
  { key: "Reject", label: "Reject", activeColor: "#fff", activeBg: "#ef4444" },
  // { key: "System Reject", label: "System Reject", activeColor: "#fff", activeBg: "#6b7280" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export const ApprovalDashboardPage: React.FC = () => {
  const { Row, Col, Input, Select, Space, Typography, Pagination, Badge } =
    useUILibrary();
  const { Title } = Typography;
  const { color, spacing, radius, shadow, font } = useTokens();

  const isMobile = useIsMobile();

  // const { validateAndNotify } = useComplianceValidation();

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
  } = useComplianceTransporter({
    vendorOptionsReady: (vendorOptions?.length ?? 0) > 0,
    vendorOptions: vendorOptions as any,
  });

  useEffect(() => {
    if (
      (isAdmin || isTransportManager) &&
      !selectedVendorId &&
      vendorOptions &&
      vendorOptions.length > 0
    ) {
      setSelectedVendorId(vendorOptions[0].value as any);
    }
  }, [
    isAdmin,
    isTransportManager,
    vendorOptions,
    selectedVendorId,
    setSelectedVendorId,
  ]);

  const [view, setView] = useState<DashboardView>("Vehicle");
  const [selectedRecord, setSelectedRecord] = useState<VehicleApproval | null>(
    null,
  );

  const [reviewLoading, setReviewLoading] = useState(false);

  // Default to "Pending" — no "All" pill, Pending is the initial active state
  const [statusFilter, setStatusFilterRaw] =
    useState<ExtendedFilter>("Pending");

  const isApprovedView = statusFilter === "Approved";

  const selectRecord = useCallback((r: VehicleApproval) => {
    const resolvedId =
      (r as any).id ??
      (r as any).driver_Id ??
      (r as any).vehicle_Id ??
      (r as any).vehicleId ??
      null;
    if (!resolvedId) {
      console.warn("[Dashboard] No id on record:", Object.keys(r as any));
      return;
    }
    setReviewLoading(true); // ← flash on immediately at click time
    setSelectedRecord({ ...(r as any), id: resolvedId } as VehicleApproval);
  }, []);

  const clearSelection = useCallback(() => setSelectedRecord(null), []);

  const {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  } = useApprovalDashboardTable({ onReview: selectRecord, view });

  // Map the active pill to the actionType the API expects (only for stages endpoints)
  const actionType = isApprovedView
    ? undefined
    : PILL_ACTION_TYPE[statusFilter];

  const baseQueryArgs = {
    ...queryArgs,
    ...(actionType && { actionType }),
    ...(transporterId != null && { transporterId }),
  };

  // ── VehicleStages — Pending / Reject / System Reject ─────────────────────────
  const {
    data: vehicleStagesData,
    isLoading: vehicleStagesLoading,
    error: vehicleStagesError,
    refetch: refetchStages,
  } = useGetAllApprovalsQuery(baseQueryArgs, {
    skip: !canFetch || view !== "Vehicle" || isApprovedView,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: driverData,
    isLoading: driverLoading,
    error: driverError,
    refetch: refetchDriver,
  } = useGetAllDriverApprovalsQuery(baseQueryArgs, {
    skip: !canFetch || view !== "Driver" || isApprovedView,
    refetchOnMountOrArgChange: true,
  });

  // ── GET /api/v1/Vehicles — Approved vehicles ──────────────────────────────────
  const {
    data: approvedVehicleData,
    isLoading: approvedVehicleLoading,
    error: approvedVehicleError,
    refetch: refetchApprovedVehicles,
  } = useGetApprovedVehiclesQuery(
    {
      searchTerm: search,
      page: tableState.page,
      pageSize: tableState.pageSize,
    },
    {
      skip: !canFetch || view !== "Vehicle" || !isApprovedView,
      refetchOnMountOrArgChange: true,
    },
  );

  // ── GET /api/v1/Drivers — Approved drivers ────────────────────────────────────
  const {
    data: approvedDriverData,
    isLoading: approvedDriverLoading,
    error: approvedDriverError,
    refetch: refetchApprovedDrivers,
  } = useGetApprovedDriversQuery(
    {
      transporterId: transporterId ?? undefined,
      searchTerm: search,
      page: tableState.page,
      pageSize: tableState.pageSize,
    },
    {
      skip: !canFetch || view !== "Driver" || !isApprovedView,
      refetchOnMountOrArgChange: true,
    },
  );

  // ── Pill counts — lightweight queries (pageSize=1) to get totals for all pills ─
  const countBase = {
    page: 1,
    pageSize: 1,
    ...(transporterId != null && { transporterId }),
  };

  const { data: vPendingCount } = useGetAllApprovalsQuery(
    { ...countBase, actionType: "P" },
    { skip: !canFetch || view !== "Vehicle" },
  );
  const { data: vRejectCount } = useGetAllApprovalsQuery(
    { ...countBase, actionType: "R" },
    { skip: !canFetch || view !== "Vehicle" },
  );
  const { data: vApprovedCount } = useGetApprovedVehiclesQuery(
    { page: 1, pageSize: 1 },
    { skip: !canFetch || view !== "Vehicle" },
  );
  const { data: dPendingCount } = useGetAllDriverApprovalsQuery(
    { ...countBase, actionType: "P" },
    { skip: !canFetch || view !== "Driver" },
  );
  const { data: dRejectCount } = useGetAllDriverApprovalsQuery(
    { ...countBase, actionType: "R" },
    { skip: !canFetch || view !== "Driver" },
  );
  const { data: dApprovedCount } = useGetApprovedDriversQuery(
    { transporterId: transporterId ?? undefined, page: 1, pageSize: 1 },
    { skip: !canFetch || view !== "Driver" },
  );

  const pillCounts: Partial<Record<ExtendedFilter, number>> =
    view === "Vehicle"
      ? {
          Pending: vPendingCount?.totalCount,
          Reject: vRejectCount?.totalCount,
          Approved: vApprovedCount?.totalCount,
        }
      : {
          Pending: dPendingCount?.totalCount,
          Reject: dRejectCount?.totalCount,
          Approved: dApprovedCount?.totalCount,
        };

  // ── Active data source — 4 combinations: View × (Approved | Stages) ──────────
  let data: any, isLoading: boolean, error: any, refetch: () => void;
  if (view === "Driver") {
    if (isApprovedView) {
      data = approvedDriverData;
      isLoading = approvedDriverLoading;
      error = approvedDriverError;
      refetch = refetchApprovedDrivers;
    } else {
      data = driverData;
      isLoading = driverLoading;
      error = driverError;
      refetch = refetchDriver;
    }
  } else {
    // Vehicle
    if (isApprovedView) {
      data = approvedVehicleData;
      isLoading = approvedVehicleLoading;
      error = approvedVehicleError;
      refetch = refetchApprovedVehicles;
    } else {
      data = vehicleStagesData;
      isLoading = vehicleStagesLoading;
      error = vehicleStagesError;
      refetch = refetchStages;
    }
  }

  const handleViewChange = useCallback(
    (v: string) => {
      setView(v as DashboardView);
      setStatusFilterRaw("Pending"); // reset to default pill on view switch
      setTableState({ ...tableState, page: 1 });
      clearSelection();
    },
    [setTableState, tableState, clearSelection],
  );

  const handlePillClick = useCallback(
    (key: ExtendedFilter) => {
      setStatusFilterRaw(key); // clicking an already-active pill keeps it active (no toggle-off)
      setTableState({ ...tableState, page: 1 });
      clearSelection();
    },
    [setTableState, tableState, clearSelection],
  );

  // Vehicle approve/reject — existing hook, untouched
  const {
    approve,
    reject,
    isSubmitting: isVehicleSubmitting,
  } = useApprovalMutations({
    onApproveSuccess: clearSelection,
    onRejectSuccess: clearSelection,
  });

  // Driver approve/reject — separate hook with toaster messages, vehicle flow never touched
  const {
    approve: approveDriver,
    reject: rejectDriver,
    isSubmitting: isDriverSubmitting,
  } = useDriverApprovalMutations({
    onApproveSuccess: clearSelection,
    onRejectSuccess: clearSelection,
  });

  // Combined loading state passed to the panel
  const isSubmitting = isVehicleSubmitting || isDriverSubmitting;

  const handleApprove = useCallback(
    (remarks: string) => {
      if (!selectedRecord?.id) return;

      // if (!validateAndNotify(selectedRecord, view)) return; // ← add this

      if (view === "Driver") {
        approveDriver({ id: selectedRecord.id, action: "approve", remarks });
      } else {
        approve({ id: selectedRecord.id, action: "approve", remarks });
      }
    },
    [selectedRecord, view, approve, approveDriver],
  );

  const handleReject = useCallback(
    (remarks: string) => {
      if (!selectedRecord?.id) return;
      if (view === "Driver") {
        rejectDriver({ id: selectedRecord.id, action: "reject", remarks });
      } else {
        reject({ id: selectedRecord.id, action: "reject", remarks });
      }
    },
    [selectedRecord, view, reject, rejectDriver],
  );

  const showPanel = Boolean(selectedRecord);

  // inside component, near other state
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile && showPanel && panelRef.current) {
      // wait a tick so the panel has actually rendered before scrolling
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [showPanel, isMobile, selectedRecord?.id]);

  useEffect(() => {
    if (!reviewLoading) return;
    const t = setTimeout(() => setReviewLoading(false), 150);
    return () => clearTimeout(t);
  }, [reviewLoading, selectedRecord?.id]);

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
      {/* ── Header ── */}
      <Row
        justify="space-between"
        align={isMobile ? "start" : "middle"}
        style={{
          marginBottom: spacing.lg,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? spacing.sm : 0,
        }}
        // style={{ marginBottom: spacing.lg }}
      >
        <Col
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.md,
            flexWrap: isMobile ? undefined : "wrap",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Approval Dashboard
          </Title>

          <div
            style={{
              display: "flex",
              background: "#f3f4f6",
              borderRadius: 16,
              padding: "5px",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.xs,
                width: isMobile ? "100%" : "auto",
              }}
            >
              {/* <p style={{ margin: 0, fontSize: font.sizeMd, color: "#6b7280" }}>
                Vendor
              </p> */}
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
                style={{
                  width: isMobile ? "100%" : 220,
                  fontSize: font.sizeSm,
                }}
              />
            </div>
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
        <Col />
      </Row>

      {(isAdmin || isTransportManager) && !canFetch && (
        <div
          style={{
            padding: `${spacing.xl}px`,
            textAlign: "center",
            color: color.textSecondary,
            fontSize: font.sizeSm,
            background: color.surface,
            borderRadius: radius.lg,
            border: `1px solid ${color.border}`,
            marginBottom: spacing.md,
          }}
        >
          Please select a vendor to load approval data.
        </div>
      )}

      <Row gutter={spacing.lg} align="top">
        <Col xs={24} lg={showPanel ? 15 : 24}>
          <div
            style={{
              background: color.surface,
              borderRadius: radius.xl,
              border: `1px solid ${color.border}`,
              boxShadow: shadow.card,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center",
                justifyContent: "space-between",
                gap: spacing.sm,
                padding: `${spacing.md}px ${spacing.lg}px`,
              }}
            >
              <Input
                allowClear
                placeholder={`Search by ${view === "Vehicle" ? "Vehicle No., Reg. No." : "Driver Name, License No."}`}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearch(e.target.value)
                }
                style={{
                  maxWidth: isMobile ? "100%" : 280,
                  width: isMobile ? "100%" : undefined,
                  fontSize: font.sizeSm,
                }}
              />
              <Space
                size={spacing.xs}
                style={{
                  width: isMobile ? "100%" : "auto",
                  overflowX: isMobile ? "auto" : "visible",
                  paddingBottom: isMobile ? 2 : 0,
                }}
              >
                {STATUS_PILLS.map((pill) => {
                  const isActive = statusFilter === pill.key;
                  const count = pillCounts[pill.key];
                  return (
                    <button
                      key={pill.key}
                      onClick={() => handlePillClick(pill.key)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: `4px ${spacing.md}px`,
                        borderRadius: radius.pill,
                        border: `1.5px solid ${isActive ? pill.activeBg : color.borderMid}`,
                        background: isActive ? pill.activeBg : "#fff",
                        color: isActive
                          ? pill.activeColor
                          : color.textSecondary,
                        cursor: "pointer",
                        fontSize: font.sizeSm,
                        fontWeight: font.weightMedium,
                        fontFamily: "inherit",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {pill.label}
                      {count != null && count > 0 && (
                        <Badge
                          count={count}
                          overflowCount={9999}
                          style={{
                            backgroundColor: isActive
                              ? "rgba(255,255,255,0.25)"
                              : `${pill.activeBg}22`,
                            color: isActive ? "#fff" : pill.activeBg,
                            boxShadow: "none",
                            fontSize: 10,
                            fontWeight: 700,
                            lineHeight: "16px",
                            minWidth: 18,
                            height: 16,
                            padding: "0 4px",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </Space>
            </div>

            <ApiStateWrapper
              isLoading={isLoading}
              error={error}
              isEmpty={!data?.items?.length}
              onRetry={refetch}
              emptyMessage={
                canFetch
                  ? isApprovedView
                    ? `No approved ${view.toLowerCase()}s found`
                    : `No ${statusFilter} approvals found for ${view.toLowerCase()}s`
                  : "Select a vendor to view approvals"
              }
            >
              <AppTable<any>
                columns={columns as any}
                dataSource={data?.items ?? []}
                rowKey={(r: any) =>
                  r.id ?? r.vehicle_Id ?? r.vehicleId ?? JSON.stringify(r)
                }
                tableState={tableState}
                onTableChange={setTableState}
                loading={isLoading}
                scroll={{ x: 900 }}
                onRowClick={selectRecord}
                activeRowKey={selectedRecord?.id ?? undefined}
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
                  total={(data as any)?.total ?? (data as any)?.totalCount ?? 0}
                  showSizeChanger
                  showTotal={(total: number) => `Total ${total} items`}
                  onChange={(page: number, pageSize: number) =>
                    setTableState({ ...tableState, page, pageSize })
                  }
                />
              </div>
            </ApiStateWrapper>
          </div>
        </Col>

        {showPanel && selectedRecord && (
          <Col xs={24} lg={9}>
            <div
              ref={panelRef}
              style={{ scrollMarginTop: isMobile ? spacing.md : 0 }}
            >
              <PanelBoundary onDismiss={clearSelection}>
                <ApprovalReviewPanel
                  record={selectedRecord}
                  view={view}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isSubmitting={isSubmitting}
                  onClose={clearSelection}
                  isLoading={reviewLoading}
                />
              </PanelBoundary>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ApprovalDashboardPage;

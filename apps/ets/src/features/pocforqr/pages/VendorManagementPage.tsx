import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useTokens } from "../../../shared/constants/tokens";
import { useVendorTable } from "../hooks/useVendortable";
import { useFleetDriverTable } from "../hooks/useFleetDriverTable";
import { useGetVendorsQuery, type Vendor } from "../services/VendorApi";
import {
  useGetFleetDriversQuery,
  type FleetDriver,
} from "../services/FleetDriverApi";
import { AddEditVendorModal } from "../components/Addeditvendormodal";
import { AddEditFleetDriverModal } from "../components/AddeditFleetDriverModal";
import {
  VehicleQrDashboardPage,
  type VehicleQrDashboardHandle,
} from "./VehicleQRDashboardPage";

type SectionTab = "Vendor" | "Vehicle" | "Driver";

const TABS: SectionTab[] = ["Vendor", "Driver", "Vehicle"];

export const VendorManagementPage: React.FC = () => {
  const { Row, Col, Button, Typography, Pagination } = useUILibrary();
  const { Title } = Typography;
  const { color, spacing, radius, shadow } = useTokens();
  const isMobile = useIsMobile();

  // Default active tab = Vehicle
  const [activeTab, setActiveTab] = useState<SectionTab>("Vehicle");

  // Lets the unified header button trigger the Vehicle tab's own Add Vehicle modal
  const vehiclePageRef = useRef<VehicleQrDashboardHandle>(null);

  // Vendor/Driver list endpoints return the full list (no server pagination),
  // so this is just local table state for AppTable's sorting/selection needs.
  // const [vendorTableState, setVendorTableState] = useState({
  //   page: 1,
  //   pageSize: 50,
  // });
  // const [driverTableState, setDriverTableState] = useState({
  //   page: 1,
  //   pageSize: 50,
  // });

  // ── Vendor tab state ──────────────────────────────────────────────────────
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const handleEditVendor = useCallback((record: Vendor) => {
    setEditingVendor(record);
    setVendorModalOpen(true);
  }, []);

  const {
    columns: vendorColumns,
    tableState: vendorTableState,
    setTableState: setVendorTableState,
  } = useVendorTable({
    onEdit: handleEditVendor,
  });

  const {
    data: vendorData,
    isLoading: vendorLoading,
    error: vendorError,
    refetch: refetchVendors,
  } = useGetVendorsQuery(undefined, {
    skip: activeTab !== "Vendor",
    refetchOnMountOrArgChange: true,
  });

  // ── Driver tab state ──────────────────────────────────────────────────────
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<FleetDriver | null>(null);

  const handleEditDriver = useCallback((record: FleetDriver) => {
    setEditingDriver(record);
    setDriverModalOpen(true);
  }, []);

  // Vendor list is also needed here to render a vendor name against each driver row
  const { data: vendorsForDriverTab, refetch: refetchVendorsForDriverTab } =
    useGetVendorsQuery(undefined, {
      skip: activeTab !== "Driver",
      refetchOnMountOrArgChange: true,
    });

  const {
    columns: driverColumns,
    tableState: driverTableState,
    setTableState: setDriverTableState,
  } = useFleetDriverTable({
    onEdit: handleEditDriver,
    vendors: vendorsForDriverTab?.items,
  });

  const {
    data: driverData,
    isLoading: driverLoading,
    error: driverError,
    refetch: refetchDrivers,
  } = useGetFleetDriversQuery(undefined, {
    skip: activeTab !== "Driver",
    refetchOnMountOrArgChange: true,
  });

  const pagedVendors = useMemo(() => {
    const items = vendorData?.items ?? [];
    const start = (vendorTableState.page - 1) * vendorTableState.pageSize;
    return items.slice(start, start + vendorTableState.pageSize);
  }, [vendorData, vendorTableState]);

  const pagedDrivers = useMemo(() => {
    const items = driverData?.items ?? [];
    const start = (driverTableState.page - 1) * driverTableState.pageSize;
    return items.slice(start, start + driverTableState.pageSize);
  }, [driverData, driverTableState]);

  useEffect(() => {
    if (activeTab === "Vendor") refetchVendors();
    if (activeTab === "Driver") {
      refetchDrivers();
      refetchVendorsForDriverTab();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Single "+ Add ..." button, shared across all three tabs ────────────────
  const addLabel =
    activeTab === "Vendor"
      ? "+ Add Vendor"
      : activeTab === "Driver"
        ? "+ Add Driver"
        : "+ Add Vehicle";

  const handleAddClick = () => {
    if (activeTab === "Vendor") {
      setEditingVendor(null);
      setVendorModalOpen(true);
    } else if (activeTab === "Driver") {
      setEditingDriver(null);
      setDriverModalOpen(true);
    } else {
      vehiclePageRef.current?.openAdd();
    }
  };

  return (
    <div
      style={{
        padding: isMobile
          ? `${spacing.md}px ${spacing.sm}px`
          : `${spacing.lg}px ${spacing.xl}px`,
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      {/* ── Header: title + tabs (left) and the one shared Add button (right) — all in a single row ── */}
      <Row
        justify="space-between"
        align={isMobile ? "start" : "middle"}
        style={{
          marginBottom: spacing.lg,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? spacing.sm : 0,
        }}
      >
        <Col
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.md,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            QR Dashboard
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
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: isMobile ? 1 : undefined,
                  padding: "6px 20px",
                  borderRadius: 16,
                  border: "none",
                  background: activeTab === tab ? color.primary : "transparent",
                  color: activeTab === tab ? "#fff" : "#6b7280",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  boxShadow:
                    activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap" as const,
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </Col>

        <Col style={{ width: isMobile ? "100%" : "auto" }}>
          <Button
            type="primary"
            style={{
              background: color.primary,
              borderColor: color.primary,
              width: isMobile ? "100%" : "auto",
            }}
            onClick={handleAddClick}
          >
            {addLabel}
          </Button>
        </Col>
      </Row>

      {/* ── Vendor tab ── */}
      {activeTab === "Vendor" && (
        <>
          <div
            style={{
              background: color.surface,
              borderRadius: radius.xl,
              border: `1px solid ${color.border}`,
              boxShadow: shadow.card,
              overflow: "hidden",
            }}
          >
            <ApiStateWrapper
              isLoading={vendorLoading}
              error={vendorError}
              isEmpty={!vendorData?.items?.length}
              onRetry={refetchVendors}
              emptyMessage="No vendors found"
            >
              <AppTable<Vendor>
                columns={vendorColumns as any}
                // dataSource={vendorData?.items ?? []}
                dataSource={pagedVendors}
                rowKey="id"
                tableState={vendorTableState}
                onTableChange={setVendorTableState}
                loading={vendorLoading}
                scroll={{ x: 700 }}
                style={{ borderTop: `1px solid ${color.border}` }}
              />
            </ApiStateWrapper>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: `${spacing.sm}px ${spacing.lg}px`,
                borderTop: `1px solid ${color.border}`,
              }}
            >
              <Pagination
                current={vendorTableState.page}
                pageSize={vendorTableState.pageSize}
                total={vendorData?.items?.length ?? 0}
                showSizeChanger
                showTotal={(t: number) => `Total ${t} items`}
                onChange={(page: number, pageSize: number) =>
                  setVendorTableState({ ...vendorTableState, page, pageSize })
                }
              />
            </div>
          </div>

          <AddEditVendorModal
            open={vendorModalOpen}
            record={editingVendor}
            onClose={() => {
              setVendorModalOpen(false);
              setEditingVendor(null);
            }}
            onSuccess={() => {
              setVendorModalOpen(false);
              setEditingVendor(null);
              refetchVendors();
            }}
          />
        </>
      )}

      {/* ── Vehicle tab — reuses the full Vehicle QR list/add/QR/driver/history flow;
           its own header is fully suppressed since the button above drives it via ref ── */}
      {activeTab === "Vehicle" && (
        <VehicleQrDashboardPage ref={vehiclePageRef} embedded hideAddButton />
      )}

      {/* ── Driver tab ── */}
      {activeTab === "Driver" && (
        <>
          <div
            style={{
              background: color.surface,
              borderRadius: radius.xl,
              border: `1px solid ${color.border}`,
              boxShadow: shadow.card,
              overflow: "hidden",
            }}
          >
            <ApiStateWrapper
              isLoading={driverLoading}
              error={driverError}
              isEmpty={!driverData?.items?.length}
              onRetry={refetchDrivers}
              emptyMessage="No drivers found"
            >
              <AppTable<FleetDriver>
                columns={driverColumns as any}
                // dataSource={driverData?.items ?? []}
                dataSource={pagedDrivers}
                rowKey="id"
                tableState={driverTableState}
                onTableChange={setDriverTableState}
                loading={driverLoading}
                scroll={{ x: 700 }}
                style={{ borderTop: `1px solid ${color.border}` }}
              />
            </ApiStateWrapper>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: `${spacing.sm}px ${spacing.lg}px`,
                borderTop: `1px solid ${color.border}`,
              }}
            >
              <Pagination
                current={driverTableState.page}
                pageSize={driverTableState.pageSize}
                total={driverData?.items?.length ?? 0}
                showSizeChanger
                showTotal={(t: number) => `Total ${t} items`}
                onChange={(page: number, pageSize: number) =>
                  setDriverTableState({ ...driverTableState, page, pageSize })
                }
              />
            </div>
          </div>

          <AddEditFleetDriverModal
            open={driverModalOpen}
            record={editingDriver}
            onClose={() => {
              setDriverModalOpen(false);
              setEditingDriver(null);
            }}
            onSuccess={() => {
              setDriverModalOpen(false);
              setEditingDriver(null);
              refetchDrivers();
            }}
          />
        </>
      )}
    </div>
  );
};

export default VendorManagementPage;

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useTokens } from "../../../shared/constants/tokens";
import { useVehicleQrTable } from "../hooks/useVehicleQrTable";
import { useGetVehiclesQuery, type VehicleQr } from "../services/VehicleQrApi";
import { AddEditVehicleQrModal } from "../components/Addeditvehicleqrmodal";
import { VehicleQrImageModal } from "../components/Vehicleqrimagemodal";
import { AssignDriverModal } from "../components/Assigndrivermodal";
import { DriverHistoryModal } from "../components/Driverhistorymodal";

interface Props {
  /** When rendered inside a parent tab (e.g. VendorManagementPage), hides the
   *  outer page padding/background and the "Vehicle QR Management" title,
   *  since the parent page already provides those. */
  embedded?: boolean;
  /** Hide this page's own "+ Add Vehicle" button — used when a parent page
   *  renders one unified header button for all its tabs instead, and drives
   *  this page's add-flow via the imperative handle (see openAdd below). */
  hideAddButton?: boolean;
}

export interface VehicleQrDashboardHandle {
  openAdd: () => void;
}

export const VehicleQrDashboardPage = forwardRef<
  VehicleQrDashboardHandle,
  Props
>(({ embedded = false, hideAddButton = false }, ref) => {
  const { Row, Col, Button, Typography, Pagination } = useUILibrary();
  const { Title } = Typography;
  const { color, spacing, radius, shadow } = useTokens();
  const isMobile = useIsMobile();

  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleQr | null>(null);
  const [qrRecord, setQrRecord] = useState<VehicleQr | null>(null);
  const [driverRecord, setDriverRecord] = useState<VehicleQr | null>(null);
  const [historyRecord, setHistoryRecord] = useState<VehicleQr | null>(null);

  const handleEdit = useCallback((record: VehicleQr) => {
    setEditingRecord(record);
    setAddEditOpen(true);
  }, []);

  // Lets a parent (VendorManagementPage) trigger the Add Vehicle modal from
  // its own unified header button.
  useImperativeHandle(ref, () => ({
    openAdd: () => {
      setEditingRecord(null);
      setAddEditOpen(true);
    },
  }));

  // handleSearch

  const { columns, tableState, setTableState, search } = useVehicleQrTable({
    onViewQr: setQrRecord,
    onAssignDriver: setDriverRecord,
    onDriverHistory: setHistoryRecord,
    onEdit: handleEdit,
  });

  const { data, isLoading, error, refetch } = useGetVehiclesQuery({
    searchTerm: search,
    page: tableState.page,
    pageSize: tableState.pageSize,
  });

  const dataSource = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div
      style={{
        padding: embedded
          ? 0
          : isMobile
            ? `${spacing.md}px ${spacing.sm}px`
            : `${spacing.lg}px ${spacing.xl}px`,
        minHeight: embedded ? undefined : "100vh",
        background: "#fff",
      }}
    >
      {/* ── Header — skipped entirely when a parent already renders both the
           title/tabs and the Add button (embedded + hideAddButton together) ── */}
      {!(embedded && hideAddButton) && (
        <Row
          justify={embedded ? "end" : "space-between"}
          align={isMobile ? "start" : "middle"}
          style={{
            marginBottom: spacing.lg,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? spacing.sm : 0,
          }}
        >
          {!embedded && (
            <Col style={{ width: isMobile ? "100%" : "auto" }}>
              <Title level={5} style={{ margin: 0 }}>
                Vehicle QR Management
              </Title>
            </Col>
          )}
          {!hideAddButton && (
            <Col style={{ width: isMobile ? "100%" : "auto" }}>
              <Button
                type="primary"
                style={{
                  background: color.primary,
                  borderColor: color.primary,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={() => {
                  setEditingRecord(null);
                  setAddEditOpen(true);
                }}
              >
                + Add Vehicle
              </Button>
            </Col>
          )}
        </Row>
      )}

      {/* ── Main card ── */}
      <div
        style={{
          background: color.surface,
          borderRadius: radius.xl,
          border: `1px solid ${color.border}`,
          boxShadow: shadow.card,
          overflow: "hidden",
        }}
      >
        {/* <div
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
            placeholder="Search by Vehicle No., Company"
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
        </div> */}

        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!dataSource.length}
          onRetry={refetch}
          emptyMessage="No vehicles found"
        >
          <AppTable<VehicleQr>
            columns={columns as any}
            dataSource={dataSource}
            rowKey="id"
            tableState={tableState}
            onTableChange={setTableState}
            loading={isLoading}
            scroll={{ x: 900 }}
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
              total={total}
              showSizeChanger
              showTotal={(t: number) => `Total ${t} items`}
              onChange={(page: number, pageSize: number) =>
                setTableState({ ...tableState, page, pageSize })
              }
            />
          </div>
        </ApiStateWrapper>
      </div>

      {/* ── Modals ── */}
      <AddEditVehicleQrModal
        open={addEditOpen}
        record={editingRecord}
        onClose={() => {
          setAddEditOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={() => {
          setAddEditOpen(false);
          setEditingRecord(null);
          refetch();
        }}
      />

      <VehicleQrImageModal
        open={!!qrRecord}
        record={qrRecord}
        onClose={() => setQrRecord(null)}
      />

      <AssignDriverModal
        open={!!driverRecord}
        record={driverRecord}
        onClose={() => setDriverRecord(null)}
        onSuccess={() => {
          setDriverRecord(null);
          refetch();
        }}
      />

      <DriverHistoryModal
        open={!!historyRecord}
        record={historyRecord}
        onClose={() => setHistoryRecord(null)}
      />
    </div>
  );
});

VehicleQrDashboardPage.displayName = "VehicleQrDashboardPage";

export default VehicleQrDashboardPage;

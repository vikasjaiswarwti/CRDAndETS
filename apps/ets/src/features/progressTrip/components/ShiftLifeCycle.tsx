import React, { useEffect, useState } from "react";
import {
  ScheduleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Route, ChevronRight } from "lucide-react";
import { Empty, Modal, Spin, Table } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { selectStyle } from "../../../shared/components/Search/searchCSS";
import { tripFilterOption } from "../constants/TripOption";
import { ManIcons, WomenIcons } from "../constants/TripOption";
import type {
  OngoingTrip,
  TripPassenger,
  TripLifeCycle,
  TripSummary,
} from "../types/progressTrip.types";
import {
  useGetOngoingTripsQuery,
  useGetPassengerDetailsQuery,
} from "../services/progressTripApi";
import TripEmployeeModal from "./TripEmployeeModal";
import AssignVendorModal from "../../route-optimization/Modals/AssignVendorModal";
import AssignDriverVehicleModal from "../../route-optimization/Modals/AssignDriverVehicleModal";
import type { VehicleRoute } from "../../route-optimization/types/Routemaker.types";
type StatItem = {
  type: "total" | "male" | "female";
  value: number | string;
};

type StageSummary = TripSummary["summary"];
type StagePanel = TripSummary["Panel"][number];

const lifecycleTripColumns = (
  onVehicleAssign: (trip: OngoingTrip) => void,
  onVendorAssign: (trip: OngoingTrip) => void,
  onEmployeeClick: (trip: OngoingTrip) => void,
) => [
  { title: "Trip ID", dataIndex: "dsId", key: "dsId" },
  { title: "Status", dataIndex: "statusName", key: "statusName" },
  { title: "Shift", dataIndex: "shiftTime", key: "shiftTime" },
  {
    title: "Vendor",
    dataIndex: "vendorName",
    key: "vendorName",
    render: (_value: string | null, trip: OngoingTrip) =>
      trip.isVendorUnassigned || !trip.vendorName ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onVendorAssign(trip);
          }}
          style={assignmentButtonStyle}
        >
          Assign vendor
        </button>
      ) : (
        trip.vendorName
      ),
  },
  {
    title: "Vehicle",
    dataIndex: "vehicleNo",
    key: "vehicleNo",
    render: (_value: string | null, trip: OngoingTrip) =>
      trip.isVehicleUnassigned || !trip.vehicleNo ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onVehicleAssign(trip);
          }}
          style={assignmentButtonStyle}
        >
          Assign
        </button>
      ) : (
        trip.vehicleNo
      ),
  },
  {
    title: "Driver Name",
    dataIndex: "driverName",
    key: "driverName",
  },
  {
    title: "driver No.",
    dataIndex: "driverNumber",
    key: "driverNumber",
  },

  {
    title: "Employees",
    dataIndex: "paxCount",
    key: "paxCount",
    render: (value: number, trip: OngoingTrip) => (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onEmployeeClick(trip);
        }}
        style={employeeButtonStyle}
      >
        <TeamOutlined style={{ fontSize: 11 }} />
        <span>{value ?? 0}</span>
      </button>
    ),
  },
];

const assignmentButtonStyle: React.CSSProperties = {
  border: "1px solid #bbf7d0",
  borderRadius: 6,
  background: "#f0fdf4",
  color: "#15803d",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 500,
  padding: "2px 4px",
};

const employeeButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  border: "1px solid #dbeafe",
  borderRadius: 6,
  background: "#eff6ff",
  color: "#2563eb",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
  padding: "3px 8px",
};

function toAssignmentPassenger(
  passenger: TripPassenger,
): VehicleRoute["Passengers"][number] {
  return {
    Id: passenger.empId,
    EmployeeID: passenger.employeeID,
    Firstname: passenger.firstname,
    Address: passenger.address,
    Gender: passenger.gender === "F" ? "F" : "M",
    Lat: passenger.plannedLat,
    Lng: passenger.plannedLng,
    PickupSequence: passenger.paxOrder,
    EstimatedPickupTime: passenger.plannedScheduleTime,
    RideTimeMinutes: 0,
    EstimatedArrivalAtOffice: passenger.plannedScheduleTime,
    IsLate: passenger.etaDeviationMinutes > 0,
    MinutesFromDeadline: passenger.etaDeviationMinutes,
    EfficiencyPercentage: 0,
    routedDistanceKm: passenger.empDistance,
    extraDistanceKm: 0,
    locality: "",
    displayName: `${passenger.firstname} ${passenger.lastName}`.trim(),
    empId: passenger.empId,
    mobileNo: Number(passenger.mobileno) || 0,
    noShow: passenger.noShow,
    noShowType: "",
  };
}

function toVendorAssignmentRoute(
  trip: OngoingTrip,
  passengers: TripPassenger[] = [],
): VehicleRoute {
  return {
    VehicleId: trip.dsId,
    isVenddorAssign: !trip.isVendorUnassigned && !!trip.vendorName,
    vendorName: trip.vendorName ?? "",
    Passengers: passengers.map(toAssignmentPassenger),
    PickupOrder: passengers.map((passenger) => passenger.empId),
    IsGuardAllocated: false,
    GuardSeatCount: 0,
    TotalSeatUsed: trip.totalPax,
    AvailablePassengerSeats: 0,
    RoutePolyline: "",
    RouteDistanceKm: 0,
    RouteDurationMinutes: 0,
    Waypoints: [],
    EfficiencyPercentage: 0,
    AverageDetourKm: 0,
    TotalDirectDistanceKm: 0,
    TotalActualDistanceKm: 0,
    CabDepartureTime: "",
    EstimatedOfficeArrival: "",
    AnyCabMemberIsLate: false,
    LatePassengerCount: 0,
    ExtraDistanceKm: 0,
    Eta: "",
    IsFlagged: false,
    IsApproved: false,
    IsFemaleTrip: false,
    IsSpecialNeedTrip: false,
    hasVehicleAssigned: !trip.isVehicleUnassigned && !!trip.vehicleNo,
    hasDriverAssigned: !!trip.driverId,
    tripStatusCode: trip.statusCode,
    flapNo: 0,
    hasEscortAssigned: false,
    vehicleRegNo: trip.vehicleNo ?? "",
    driverName: trip.driverName ?? "",
    driverMobile: trip.driverNumber ? String(trip.driverNumber) : "",
    vendorPrefixTag: null,
    escortName: null,
    escortMobile: null,
    occupancy: trip.totalPax,
    capacity: 0,
    copied: false,
    copiedFrom: "",
  };
}

// ---------- Color tokens ----------
const panelColorMap: Record<
  string,
  { bg: string; border: string; name: string; count: string }
> = {
  // Stage 1 – Routing
  "A1B1C1D1-0000-0000-0000-000000000001": {
    bg: "#eafaf0",
    border: "#24B973",
    name: "#1c7a45",
    count: "#1c7a45",
  },
  // Stage 2 – Generation
  "e469b573-38a4-420e-9109-94c9574018ca": {
    bg: "#eef2ff",
    border: "#4d6bfe",
    name: "#2d4bd8",
    count: "#2d4bd8",
  },
  // Stage 3 – Pre-Trip
  "A1B1C1D1-0000-0000-0000-000000000002": {
    bg: "#fff3e6",
    border: "#fa8c16",
    name: "#8c5a1b",
    count: "#8c5a1b",
  }, // Yet to start → orange
  "A1B1C1D1-0000-0000-0000-000000000006": {
    bg: "#fdeceb",
    border: "#f5222d",
    name: "#c9302c",
    count: "#c9302c",
  }, // Vehicle unassigned → red
  "A1B1C1D1-0000-0000-0000-000000000007": {
    bg: "#fcf0ff",
    border: "#9B76FF",
    name: "#6b21a8",
    count: "#6b21a8",
  }, // Vendor unassigned → purple
  // Stage 4 – In Progress
  "A1B1C1D1-0000-0000-0000-000000000003": {
    bg: "#eafaf0",
    border: "#24B973",
    name: "#1c7a45",
    count: "#1c7a45",
  }, // On time → green
  "A1B1C1D1-0000-0000-0000-000000000003-delayed": {
    bg: "#fdeceb",
    border: "#f5222d",
    name: "#c9302c",
    count: "#c9302c",
  }, // Delayed → red
  // Stage 5 – Completed
  "A1B1C1D1-0000-0000-0000-000000000004": {
    bg: "#eafaf0",
    border: "#24B973",
    name: "#1c7a45",
    count: "#1c7a45",
  }, // On time → green
  "A1B1C1D1-0000-0000-0000-000000000004-delayed": {
    bg: "#fdeceb",
    border: "#f5222d",
    name: "#c9302c",
    count: "#c9302c",
  }, // Delayed → red
};

const statIconConfig: Record<
  StatItem["type"],
  { render: React.ReactNode; color: string }
> = {
  total: {
    render: <TeamOutlined style={{ fontSize: 11 }} />,
    color: "#1C1B1F",
  },
  male: {
    render: <span dangerouslySetInnerHTML={{ __html: ManIcons() }} />,
    color: "#1677ff",
  },
  female: {
    render: <span dangerouslySetInnerHTML={{ __html: WomenIcons() }} />,
    color: "#f5222d",
  },
};

const StatRow: React.FC<{ stats?: StatItem[] }> = ({ stats }) => {
  const visibleStats = stats?.filter((stat) => Number(stat.value) !== 0);

  if (!visibleStats || visibleStats.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {visibleStats.map((s, i) => {
        const cfg = statIconConfig[s.type];

        return (
          <span
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontWeight: 500,
              color: cfg.color,
              background: "#fff",
              border: `0.5px solid ${cfg.color}`,
              paddingInline: "4px",
              borderRadius: "12px",
            }}
          >
            {cfg.render}
            {s.value}
          </span>
        );
      })}
    </div>
  );
};

const SummaryCard: React.FC<{ summary: StageSummary }> = ({ summary }) => (
  <div
    style={{
      flex: "0 0 180px",
      minHeight: 52,
      width: 120,
      background: "#f5f5f5",
      borderRadius: 10,
      padding: "4px 6px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      border: "1px solid #E0E0E0",
    }}
    className="bg-white/50"
  >
    <div style={{ fontSize: 10, fontWeight: 500 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#141414" }}>
        {summary.value}
      </span>{" "}
      {summary.label}
    </div>
    <div style={{ marginTop: 6 }}>
      <StatRow stats={[{ type: "total", value: summary.total }]} />
    </div>
  </div>
);

const StatPanel: React.FC<{
  panel: StagePanel;
  stageNo: number;
  onTripCountClick: (panel: StagePanel) => void;
}> = ({ panel, stageNo, onTripCountClick }) => {
  const panelId = panel?.title?.toLowerCase().includes("delayed")
    ? `${panel.Id}-delayed`
    : panel.Id;
  const c = panelColorMap[panelId] ?? {
    bg: "#000",
    border: "#d9d9d9",
    name: "#262626",
    count: "#262626",
  };
  const tripEmpTitle =
    stageNo === 1
      ? `${panel.EmployeeCount} employees in ${panel.TripCount} routes`
      : panel.TripCount;
  return (
    <div
      style={{
        flex: "1 1 160px",
        minWidth: 150,
        minHeight: 52,
        background: c.bg,
        borderLeft: `1.5px solid ${c.border}`,
        borderRadius: 6,
        padding: "4px 6px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            // color: c.name,
            letterSpacing: 0.2,
          }}
        >
          {panel.title}
        </span>
        {stageNo == 1 || tripEmpTitle == "0" ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 11,
              fontWeight: 500,
              color: c.count,
              whiteSpace: "nowrap",
            }}
          >
            {tripEmpTitle}
          </span>
        ) : (
          <button
            onClick={() => onTripCountClick(panel)}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 10,
              fontWeight: 500,
              color: c.count,
              padding: "2px 8px",
              borderRadius: 8,
              background: "white",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {tripEmpTitle} <ChevronRight size={11} />
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 6,
          cursor: stageNo == 1 ? "default" : "pointer",
        }}
        onClick={stageNo == 1 ? undefined : () => onTripCountClick(panel)}
      >
        <StatRow
          stats={[
            { type: "total", value: panel.EmployeeCount },
            { type: "male", value: panel.Male },
            { type: "female", value: panel.Female },
          ]}
        />
      </div>
    </div>
  );
};

const stageIcons: Record<number, React.ReactNode> = {
  2: <Route size={14} />,
  1: <ScheduleOutlined />,
  3: <ClockCircleOutlined />,
  4: <CarOutlined />,
  5: <CheckCircleOutlined />,
};

// ---------- Stage badge ----------
const StageBadge: React.FC<{ stage: TripSummary; isLast?: boolean }> = ({
  stage,
  isLast,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: 110,
      flexShrink: 0,
      position: "relative",
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8c8c8c",
        fontSize: 14,
        flexShrink: 0,
        zIndex: 1,
      }}
    >
      {stageIcons[stage.Stage]}
    </div>

    <span
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: "#8c8c8c",
        whiteSpace: "nowrap",
      }}
    >
      {stage.title}
    </span>

    {!isLast && (
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 16,
          transform: "translateX(-50%)",
          width: 0,
          height: 52,
          borderLeft: "1.5px dashed #d9d9d9",
          zIndex: 0,
        }}
      />
    )}
  </div>
);

const LifecycleFilterField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const LifecycleTripsModal: React.FC<{
  panel: TripLifeCycle | null;
  onClose: () => void;
}> = ({ panel, onClose }) => {
  const navigate = useNavigate();
  const { Select } = useUILibrary();
  const [filterType, setFilterType] = useState<string>();
  const [selectedTrip, setSelectedTrip] = useState<OngoingTrip | null>(null);
  const [assignmentTrip, setAssignmentTrip] = useState<OngoingTrip | null>(
    null,
  );
  const [vehicleAssignmentTrip, setVehicleAssignmentTrip] =
    useState<OngoingTrip | null>(null);
  const assignmentTripId = assignmentTrip?.dsId ?? vehicleAssignmentTrip?.dsId;
  const { data: passengerDetails = [] } = useGetPassengerDetailsQuery(
    assignmentTripId ?? 0,
    { skip: !assignmentTripId },
  );
  useEffect(() => {
    setFilterType(panel?.Id);
  }, [panel?.Id]);

  const { data, isFetching, refetch } = useGetOngoingTripsQuery(
    {
      filterId: filterType,
      fromDate: dayjs().format("YYYY-MM-DD"),
      toDate: dayjs().format("YYYY-MM-DD"),
    },
    { skip: !filterType },
  );

  return (
    <>
      <Modal
        open={!!panel}
        onCancel={onClose}
        title={panel ? `${panel.title}` : "Trips"}
        width={900}
        footer={null}
        style={{ top: 10 }}
        destroyOnClose
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <LifecycleFilterField label="Select Filter">
            <Select
              value={filterType}
              options={tripFilterOption}
              onChange={setFilterType}
              style={{ ...selectStyle, width: 190 }}
            />
          </LifecycleFilterField>
        </div>
        <Spin spinning={isFetching}>
          <Table<OngoingTrip>
            columns={[
              {
                title: "Trip ID",
                dataIndex: "dsId",
                key: "dsId",
                render: (dsId: number, trip: OngoingTrip) => (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/routing/route-tracking?dsId=${dsId}`);
                    }}
                    style={{
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: "#2563eb",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {trip.dsId}
                  </button>
                ),
              },
              ...lifecycleTripColumns(
                setVehicleAssignmentTrip,
                setAssignmentTrip,
                setSelectedTrip,
              ).slice(1),
            ]}
            dataSource={data?.trips ?? []}
            rowKey="dsId"
            pagination={false}
            scroll={{ x: 700, y: 420 }}
            locale={{ emptyText: <Empty description="No trips found" /> }}
            size="small"
            onRow={() => ({
              style: { cursor: "pointer", fontSize: 11 },
            })}
          />
        </Spin>
      </Modal>
      <TripEmployeeModal
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
      />
      {assignmentTrip && (
        <AssignVendorModal
          routes={[toVendorAssignmentRoute(assignmentTrip, passengerDetails)]}
          locCode={assignmentTrip.locCode}
          onSuccess={() => {
            setAssignmentTrip(null);
            refetch();
          }}
          onClose={() => setAssignmentTrip(null)}
        />
      )}
      {vehicleAssignmentTrip && (
        <AssignDriverVehicleModal
          route={toVendorAssignmentRoute(
            vehicleAssignmentTrip,
            passengerDetails,
          )}
          vendorId={vehicleAssignmentTrip.transporterId}
          onSuccess={() => {
            setVehicleAssignmentTrip(null);
            refetch();
          }}
          onClose={() => setVehicleAssignmentTrip(null)}
        />
      )}
    </>
  );
};

// ---------- Main component ----------
const ShiftLifecycle: React.FC<{
  stages: TripSummary[];
  isLoading?: boolean;
}> = ({ stages, isLoading }) => {
  const [selectedPanel, setSelectedPanel] = useState<TripLifeCycle | null>(
    null,
  );
  if (isLoading) {
    return (
      <div>
        <style>{`@keyframes shimmer { 0% { background-position:-600px 0 } 100% { background-position:600px 0 } }`}</style>
        {[1, 1, 3, 2].map((n, i) => (
          <SkeletonStageCard key={i} panelCount={n} />
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderRadius: "12px",
        marginTop: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          scrollbarWidth: "thin",
        }}
      >
        {stages.map((stage, idx) => (
          <div
            key={stage.Stage}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <StageBadge stage={stage} isLast={idx === stages.length - 1} />

            <div
              style={{
                flex: 1,
                display: "flex",
                gap: 8,
                alignItems: "center",
                borderRadius: 12,
              }}
              className="flex-wrap"
            >
              <div>
                <SummaryCard summary={stage.summary} />
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {stage.Panel
                  // .filter((panel) => panel.TripCount !== 0)
                  .map((panel, i) => (
                    <StatPanel
                      key={panel.Id ?? i}
                      panel={panel}
                      stageNo={stage.Stage}
                      onTripCountClick={setSelectedPanel}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <LifecycleTripsModal
        panel={selectedPanel}
        onClose={() => setSelectedPanel(null)}
      />
    </div>
  );
};

export default ShiftLifecycle;

const SkeletonPanel = () => (
  <div
    style={{
      flex: "1 1 140px",
      minWidth: 130,
      borderRadius: 6,
      padding: "8px 10px",
      borderLeft: "3px solid #e5e7eb",
      background: "#f9fafb",
    }}
  >
    <div
      style={{
        height: 12,
        width: "70%",
        borderRadius: 4,
        background:
          "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        marginBottom: 8,
      }}
    />
    <div
      style={{
        height: 10,
        width: "50%",
        borderRadius: 4,
        background:
          "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        marginBottom: 8,
      }}
    />
    <div style={{ display: "flex", gap: 4 }}>
      <div
        style={{
          width: 36,
          height: 16,
          borderRadius: 12,
          background:
            "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
          backgroundSize: "600px 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: 30,
          height: 16,
          borderRadius: 12,
          background:
            "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
          backgroundSize: "600px 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }}
      />
    </div>
  </div>
);
const skelStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
  backgroundSize: "600px 100%",
  animation: "shimmer 1.4s ease-in-out infinite",
};

const SkeletonStageCard = ({ panelCount = 2 }: { panelCount?: number }) => (
  <div
    style={{
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      padding: "10px 12px",
      background: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      marginBottom: 10,
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <div style={{ width: 60, height: 18, borderRadius: 20, ...skelStyle }} />
      <div style={{ width: 100, height: 14, borderRadius: 4, ...skelStyle }} />
    </div>
    <div style={{ display: "flex", gap: 10 }}>
      <div
        style={{
          flex: "0 0 140px",
          border: "1px solid #f1f5f9",
          borderRadius: 10,
          padding: 10,
        }}
      >
        <div
          style={{
            width: 50,
            height: 24,
            borderRadius: 4,
            ...skelStyle,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: 80,
            height: 10,
            borderRadius: 4,
            ...skelStyle,
            marginBottom: 8,
          }}
        />
        <div
          style={{ width: 40, height: 16, borderRadius: 12, ...skelStyle }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: panelCount }).map((_, i) => (
          <SkeletonPanel key={i} />
        ))}
      </div>
    </div>
  </div>
);

import React from "react";
import { Tag, Table, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type {
  OngoingTrip,
  TripPassenger,
  TripTrackingPacket,
} from "../types/progressTrip.types";
import { useGetPassengerDetailsQuery } from "../services/progressTripApi";
import {
  // formatDateTime,
  formatTime,
} from "../../route-tracking/utils/commonFunction";
import dayjs from "dayjs";

interface TripEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  trip: OngoingTrip | TripTrackingPacket | null;
}

// ---------- Shared render helpers (null-safe, reusable) ----------

const renderText = (value: unknown): string =>
  value === null || value === undefined || value === "" ? "—" : String(value);

// const renderNumber = (value: number | null | undefined, suffix = ""): string =>
//   value === null || value === undefined ? "—" : `${value}${suffix}`;

// const renderCoordinate = (value: number | null | undefined): string =>
//   value === null || value === undefined ? "—" : value.toFixed(6);

// const renderDistance = (value: number | null | undefined): string =>
//   value === null || value === undefined
//     ? "—"
//     : `${Number(value).toFixed(2)} km`;

const renderDateTime = (value: string | null | undefined): string =>
  value ? formatTime(value) : "—";

// const renderBoolTag = (value: boolean | null | undefined) => (
//   <Tag color={value ? "green" : "default"}>{value ? "Yes" : "No"}</Tag>
// );

const getStatusColor = (
  status: string,
): "red" | "green" | "orange" | "blue" => {
  const statusMap: Record<string, "red" | "green" | "orange" | "blue"> = {
    "Trip-Completed": "green",
    Dropped: "green",
    Pending: "blue",
    "No-Show": "red",
    NoShow: "red",
    Cancelled: "orange",
  };
  return statusMap[status] || "blue";
};

const getStatusLabel = (passenger: TripPassenger): string => {
  if (passenger.noShow) return "No Show";
  return passenger.paxTrackingStatus || "Pending";
};
// const Dot = () => <span style={styles.dot}>•</span>;
const VDivider = () => <span style={styles.vDivider} />;
const columns: ColumnsType<TripPassenger> = [
  {
    title: "Status",
    key: "status",
    width: 160,
    // fixed: "left",
    // sorter: (a, b) => getStatusLabel(a).localeCompare(getStatusLabel(b)),
    render: (_, record: TripPassenger) => {
      const status = getStatusLabel(record);
      return <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>;
    },
  },

  {
    title: "Name",
    dataIndex: "firstname",
    key: "firstname",
    width: 200,
    ellipsis: true,
    render: (_, record: TripPassenger) => {
      return (
        <>
          {record.firstname + " " + record.lastName}{" "}
          {record.gender == "M" ? "♂" : "♀"}
        </>
      );
    },
  },
  {
    title: "Mobile No",
    dataIndex: "mobileno",
    key: "mobileno",
    width: 120,
    render: renderText,
  },
  {
    title: "Email",
    dataIndex: "emailID",
    key: "emailID",
    width: 180,
    render: renderText,
  },
  {
    title: "Emp Office",
    dataIndex: "empOffice",
    key: "empOffice",
    width: 200,
    ellipsis: true,
    render: renderText,
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    width: 220,
    ellipsis: true,
    render: renderText,
  },
  {
    title: "No Show",
    dataIndex: "noShow",
    key: "noShow",
    width: 180,
    render: (_, record: TripPassenger) => {
      return <>{record.noShow ? "Yes" : "No"}</>;
    },
  },
  {
    title: "Planned Schedule Time",
    dataIndex: "plannedScheduleTime",
    key: "plannedScheduleTime",
    width: 200,
    ellipsis: true,
    render: renderDateTime,
  },
  {
    title: "Signin Time",
    dataIndex: "empSigninTime",
    key: "empSigninTime",
    width: 160,
    ellipsis: true,
    render: renderDateTime,
  },
  {
    title: "Sign Out Time",
    dataIndex: "empSignOutTime",
    key: "empSignOutTime",
    width: 160,
    ellipsis: true,
    render: renderDateTime,
  },
  {
    title: "Cab Reached Time",
    dataIndex: "cabReachedTime",
    key: "cabReachedTime",
    width: 160,
    ellipsis: true,
    render: renderDateTime,
  },
  {
    title: "Reached Home Time",
    dataIndex: "reachedHomeTime",
    key: "reachedHomeTime",
    width: 160,
    ellipsis: true,
    render: renderDateTime,
  },
];

const TripEmployeeModal: React.FC<TripEmployeeModalProps> = ({
  open,
  onClose,
  trip,
}) => {
  // console.log(trip, "trip-104");
  if (!trip) return null;

  const {
    data = [],
    isLoading,
    isFetching,
    // isError,
    // error,
  } = useGetPassengerDetailsQuery(trip?.dsId, {
    skip: !trip.dsId,
  });
  // console.log(data, "trip-104");
  const { Modal } = useUILibrary();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Employee / Vehicle Details"
      width={1100}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16, top: 10 }}
    >
      <Spin spinning={isLoading || isFetching}>
        {trip && (
          <>
            <p style={styles.subHeader}>Trip ID: {trip.dsId},</p>
            <div style={styles.infoRow}>
              <p>
                <span style={styles.shiftLabel}>Vehicle No:</span>
                <span style={styles.vehicleNo}>{trip.vehicleNo}</span>
              </p>
              <VDivider />
              <p>
                <span style={styles.shiftLabel}> Driver Name:</span>
                <span style={styles.driverName}>{trip.driverName}</span>
              </p>

              <VDivider />

              <span style={styles.shiftLabel}>Shift:</span>
              <span style={styles.shiftValue}>
                {trip.dsDate ? dayjs(trip.dsDate).format("ddd D MMM") : "--"},{" "}
                {trip.shiftTime}
              </span>
            </div>

            {/* <div style={styles.statsRow}>
            {[
              { label: "Planned Sign in", value: trip.plannedCount },
              { label: "No Show", value: trip.noShowCount },
              { label: "Adhoc", value: trip.adhocCount },
              { label: "Yet to Board", value: trip.yetToBoardCount },
            ].map((stat) => (
              <span key={stat.label} style={styles.statPill}>
                {stat.label}:{" "}
                <strong style={styles.statValue}>{stat.value}</strong>
              </span>
            ))}
          </div> */}
          </>
        )}
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.empId}
          pagination={false}
          scroll={{ x: 1600, y: 400 }}
          locale={{ emptyText: <Empty description="No passengers found" /> }}
          size="small"
          bordered
        />
      </Spin>
    </Modal>
  );
};

export default TripEmployeeModal;

const styles: Record<string, React.CSSProperties> = {
  subHeader: {
    fontSize: 13,
    color: "#9ca3af",
    margin: "0 0 16px 0",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 8,
    marginBottom: 20,
  },
  carIcon: {
    fontSize: 22,
    lineHeight: 1,
    marginRight: 2,
  },
  dot: {
    color: "#d1d5db",
    fontSize: 14,
    margin: "0 8px",
  },
  vehicleNo: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
  },
  vDivider: {
    display: "inline-block",
    width: 1,
    height: 20,
    background: "#e5e7eb",
    margin: "0 16px",
  },
  driverName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginRight: 12,
  },
  phoneWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  phoneIcon: {
    fontSize: 13,
    color: "#6b7280",
  },
  shiftLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginRight: 6,
  },
  shiftValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  statsRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  statPill: {
    padding: "8px 18px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    fontSize: 13,
    color: "#6b7280",
    background: "#fff",
  },
  statValue: {
    color: "#111827",
    fontWeight: 600,
  },
};

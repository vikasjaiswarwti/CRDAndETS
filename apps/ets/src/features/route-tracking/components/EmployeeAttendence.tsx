import { Tag, Table, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { TripPassenger } from "../types/tracking.types";
import { formatDateTime } from "../utils/commonFunction";

interface EmployeeAttendenceModalProps {
  open: boolean;
  onClose: () => void;
  passengers: TripPassenger[];
}

const getStatusColor = (
  status: string,
): "red" | "green" | "orange" | "blue" => {
  const statusMap: Record<string, "red" | "green" | "orange" | "blue"> = {
    Dropped: "green",
    Pending: "blue",
    NoShow: "red",
    Cancelled: "orange",
  };
  return statusMap[status] || "blue";
};

const getStatusLabel = (passenger: TripPassenger): string => {
  if (passenger.noShow) return "No Show";
  return passenger.paxTrackingStatus || "Pending";
};

const columns: ColumnsType<TripPassenger> = [
  {
    title: "Employee ID",
    dataIndex: "employeeID",
    key: "empId",
    width: 100,
    render: (_, record) => {
      return record.empId || "—";
    },
  },
  {
    title: "Name",
    key: "name",
    width: 120,
    render: (_, record) => {
      const name = `${record.firstname || ""} ${record.lastName || ""}`.trim();
      return name || record.employeeID || "—";
    },
  },
  {
    title: "Planned Time",
    dataIndex: "plannedScheduleTime",
    key: "plannedScheduleTime",
    width: 120,
    render: (date) => (date ? formatDateTime(date) : "-"),
  },
  {
    title: "Signin Time",
    dataIndex: "empSigninTime",
    key: "empSigninTime",
    width: 120,
    render: (date) => (date ? formatDateTime(date) : "-"),
  },
  {
    title: "Dropped Time",
    dataIndex: "empSignOutTime",
    key: "empSignOutTime",
    width: 120,
    render: (date) => (date ? formatDateTime(date) : "-"),
  },
  {
    title: "Status",
    key: "status",
    width: 90,
    sorter: (a, b) => getStatusLabel(a).localeCompare(getStatusLabel(b)),
    render: (_, record) => {
      const status = getStatusLabel(record);
      const color = getStatusColor(status);
      return record.noShow ? (
        `${record.noShowReason}`
      ) : (
        <Tag color={color}>{status}</Tag>
      );
    },
  },
];

const EmployeeAttendence = ({
  open,
  onClose,
  passengers,
}: EmployeeAttendenceModalProps) => {
  const { Modal } = useUILibrary();

  // const isDataEmpty = !passengers || passengers.length === 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={"Employee Attendence"}
      width={980}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
      <Table
        columns={columns}
        dataSource={passengers}
        rowKey={(record) => record.empId}
        pagination={false}
        scroll={{ x: true }}
        locale={{ emptyText: <Empty description="No passengers found" /> }}
        size="small"
        bordered
      />
    </Modal>
  );
};

export default EmployeeAttendence;

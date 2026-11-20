import { message, Descriptions, Modal, Table, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { VehicleCheckSheet } from "../types/checkList.types";
import { useFileUpload } from "../../../../shared/customHooks/useFileUpload";

type VehicleCheckSheetDetailsModalProps = {
  record: VehicleCheckSheet | null;
  onClose: () => void;
};

/* ─── helpers ─────────────────────────────────────────────────────────── */

const displayValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const displayDate = (value: string | null | undefined) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY") : "—";

const displayStatus = (status: unknown) => {
  if (status === 1 || status === true || status === "1")
    return <Tag color="success">Yes</Tag>;
  if (status === 0 || status === false || status === "0")
    return <Tag color="error">No</Tag>;
  return displayValue(status as string | number | null | undefined);
};

/* ─── section heading ─────────────────────────────────────────────────── */

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-2 mt-5 text-base font-semibold text-gray-700 border-b pb-1">
    {children}
  </h3>
);

/* ─── file view button ────────────────────────────────────────────────── */

const FileViewButton = ({
  fileKey,
  getFileUrl,
}: {
  fileKey: string | null;
  getFileUrl: (key: string) => Promise<string>;
}) => {
  if (!fileKey) return <>—</>;

  const handleClick = async () => {
    try {
      const url = await getFileUrl(fileKey);
      if (url && url !== "URL Not Found") {
        window.open(url, "_blank");
      } else {
        message.error(`Invalid URL – ${fileKey}`);
      }
    } catch {
      message.error("Failed to retrieve file URL");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        color: "#1677ff",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <EyeOutlined style={{ fontSize: 12 }} />
      View
    </button>
  );
};

/* ─── modal ───────────────────────────────────────────────────────────── */

const VehicleCheckSheetDetailsModal: React.FC<
  VehicleCheckSheetDetailsModalProps
> = ({ record, onClose }) => {
  const { getFileUrl } = useFileUpload();
  const legacyRecord = record as (typeof record) & {
    driverName?: string;
    gatePassNo?: string;
    aadhaarNo?: string;
    driverPNo?: string;
    driverSNo?: string;
    dlNo?: string;
    dlIssueDate?: string | null;
    dlExpiryDate?: string | null;
    driverCompliance?: VehicleCheckSheet["inspection"];
  };
  const drivers = record?.drivers?.length
    ? record.drivers
    : record
      ? [{
          driverName: legacyRecord.driverName ?? "",
          gatePassNo: legacyRecord.gatePassNo ?? "",
          aadhaarNo: legacyRecord.aadhaarNo ?? "",
          driverPNo: legacyRecord.driverPNo ?? "",
          driverSNo: legacyRecord.driverSNo ?? "",
          dlNo: legacyRecord.dlNo ?? "",
          dlIssueDate: legacyRecord.dlIssueDate ?? null,
          dlExpiryDate: legacyRecord.dlExpiryDate ?? null,
          driverCompliance: legacyRecord.driverCompliance ?? [],
        }]
      : [];

  /* Build columns here so getFileUrl is in scope */
  const inspectionColumns = [
    // { title: "#", dataIndex: "id", width: 55 },
    { title: "Particular", dataIndex: "name" },
    {
      title: "Status",
      dataIndex: "status",
      width: 90,
      render: displayStatus,
    },
    {
      title: "Date / Remark",
      dataIndex: "value",
      render: (v: unknown) => displayValue(v as string | number | null),
    },
    {
      title: "File",
      dataIndex: "uploadedFileKey",
      width: 90,
      render: (key: string | null) => (
        <FileViewButton fileKey={key} getFileUrl={getFileUrl} />
      ),
    },
  ];

  return (
    <Modal
      title={`Vehicle Check Sheet${record?.vehicleNumber ? ` – ${record.vehicleNumber}` : ""}`}
      open={Boolean(record)}
      onCancel={onClose}
      footer={null}
      style={{ top: 10 }}
      width={1100}
      destroyOnHidden
    >
      {record && (
        <div className="max-h-[80vh] overflow-y-auto pr-2 space-y-1">
          {/* ── Vehicle Details ──────────────────────────────────────────── */}
          <SectionTitle>Vehicle Details</SectionTitle>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Check Date">
              {displayDate(record.checkDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Number">
              {displayValue(record.vehicleNumber)}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Make">
              {displayValue(record.vehicleMake)}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Model">
              {displayValue(record.vehicleModel)}
            </Descriptions.Item>
            <Descriptions.Item label="Manufacturing Date">
              {displayDate(record.manufacturingDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Commercial Passing">
              {displayValue(record.commercialPassing)}
            </Descriptions.Item>
            <Descriptions.Item label="Fuel">
              {displayValue(record.fuel)}
            </Descriptions.Item>
            <Descriptions.Item label="BU">
              {displayValue(record.bu)}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {displayValue(record.department)}
            </Descriptions.Item>
            <Descriptions.Item label="Site / Region">
              {displayValue(record.siteRegion)}
            </Descriptions.Item>
            <Descriptions.Item label="Ownership">
              {displayValue(record.ownership)}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Duty Hours">
              {displayValue(record.vehicleDutyHours)}
            </Descriptions.Item>
          </Descriptions>

          {/* ── Service / Odometer ──────────────────────────────────────── */}
          <SectionTitle>Service &amp; Odometer</SectionTitle>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Last Service Date">
              {displayDate(record.lastServiceDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Last Service KM">
              {displayValue(record.lastServiceKm)}
            </Descriptions.Item>
            <Descriptions.Item label="Odometer Date">
              {displayDate(record.odometerDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Odometer KM">
              {displayValue(record.odometerKm)}
            </Descriptions.Item>
          </Descriptions>

          {/* ── Vendor Details ──────────────────────────────────────────── */}
          <SectionTitle>Vendor Details</SectionTitle>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Vendor Name">
              {displayValue(record.vendorName)}
            </Descriptions.Item>
            <Descriptions.Item label="Vendor Phone">
              {displayValue(record.vendorPhone)}
            </Descriptions.Item>
            <Descriptions.Item label="Vendor Email">
              {displayValue(record.vendorEmail)}
            </Descriptions.Item>
            <Descriptions.Item label="Vendor Address">
              {displayValue(record.vendorAddress)}
            </Descriptions.Item>
          </Descriptions>

          {/* ── Driver Details ──────────────────────────────────────────── */}
          <SectionTitle>Driver Details</SectionTitle>
          {drivers.map((driver, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <h4 className="mb-2 text-sm font-semibold text-gray-600">
                Driver {index + 1}
              </h4>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Driver Name">{displayValue(driver.driverName)}</Descriptions.Item>
                <Descriptions.Item label="Gate Pass No">{displayValue(driver.gatePassNo)}</Descriptions.Item>
                <Descriptions.Item label="Aadhaar No">{displayValue(driver.aadhaarNo)}</Descriptions.Item>
                <Descriptions.Item label="Driver P. No">{displayValue(driver.driverPNo)}</Descriptions.Item>
                <Descriptions.Item label="Driver S. No">{displayValue(driver.driverSNo)}</Descriptions.Item>
                <Descriptions.Item label="DL No">{displayValue(driver.dlNo)}</Descriptions.Item>
                <Descriptions.Item label="DL Issue Date">{displayDate(driver.dlIssueDate)}</Descriptions.Item>
                <Descriptions.Item label="DL Expiry Date">{displayDate(driver.dlExpiryDate)}</Descriptions.Item>
              </Descriptions>
            </div>
          ))}

          {/* ── Driver Compliance ───────────────────────────────────────── */}
          <SectionTitle>Driver Compliance</SectionTitle>
          {drivers.map((driver, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <h4 className="mb-2 text-sm font-semibold text-gray-600">
                Driver {index + 1} Checklist
              </h4>
              <Table
                size="small"
                pagination={false}
                rowKey="id"
                dataSource={driver.driverCompliance ?? []}
                columns={inspectionColumns}
              />
            </div>
          ))}

          {/* ── Vehicle Inspection ──────────────────────────────────────── */}
          <SectionTitle>Vehicle Inspection</SectionTitle>
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={record.inspection ?? []}
            columns={inspectionColumns}
          />

          {/* ── Suggestions ─────────────────────────────────────────────── */}
          <SectionTitle>Suggestions / Remarks</SectionTitle>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Suggestions">
              {displayValue(record.suggestions)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
};

export default VehicleCheckSheetDetailsModal;

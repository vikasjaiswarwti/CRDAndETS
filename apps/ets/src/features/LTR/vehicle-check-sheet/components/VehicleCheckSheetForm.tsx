import React, { useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Table,
  Upload,
  message,
} from "antd";
import {
  CarOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { T } from "../../../../styles/tokens";
import {
  useAddVehicleCheckSheetMutation,
  useEditVehicleCheckSheetMutation,
} from "../services/ltrApi";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";
import {
  DRIVER_COMPLIANCE_ITEMS,
  INSPECTION_ITEMS,
  STATUS_OPTIONS,
} from "../constants/inspectionConfig";
import {
  extractApiError,
  formatDateValue,
  normalizeStatus,
} from "../utils/utils";
import type {
  InspectionItem,
  InspectionFieldValue,
  InspectionPayloadItem,
  VehicleCheckSheetFormValues,
  VehicleCheckSheetPayload,
  VehicleCheckSheet,
  DriverDetails,
} from "../types/checkList.types";
import { beforeUpload } from "../../../../shared/utils/uploadValidation.utils";
import { useFileUpload } from "../../../../shared/customHooks/useFileUpload";

const { TextArea } = Input;
interface ImageUploadProps {
  name: string;
  value?: string | null;
  onChange: (name: string, url: string | null) => void;
  uploadAndGetUrl: (file: File, name: string) => Promise<string | null>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  value,
  onChange,
  uploadAndGetUrl,
}) => {
  const { getFileUrl } = useFileUpload();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>("");

  const handleChange: UploadProps["onChange"] = async ({
    fileList: newList,
  }) => {
    const latest = newList.slice(-1);
    setFileList(latest);
    const originFile = latest[0]?.originFileObj;
    if (!originFile) return;
    setUploading(true);
    try {
      const remoteUrl = await uploadAndGetUrl(originFile as File, name);
      setPreview(remoteUrl);
      onChange(name, remoteUrl);
    } finally {
      setUploading(false);
    }
  };

  const fileName = fileList[0]?.name;

  const handleView = async () => {
    if (!getFileUrl) return;
    let imageUrl = value || preview || "";
    if (!imageUrl) {
      message.error("No file URL available");
      return;
    }
    const url = await getFileUrl(imageUrl);
    if (url && url !== "URL Not Found") {
      window.open(url, "_blank");
    } else {
      message.error(`Invalid URL - ${imageUrl}`);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setPreview(null);
    onChange(name, "");
  };

  const hasFile = !!(value || preview) && !uploading;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // gap: 6,
        // width: "100%",
        minHeight: 28,
      }}
    >
      <style>
        {`
      .full-upload,
      .full-upload .ant-upload {
        width: 100%;
        display: block;
      }
    `}
      </style>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
      >
        {!hasFile && (
          <Upload
            fileList={fileList}
            onChange={handleChange}
            rootClassName="full-upload"
            beforeUpload={beforeUpload}
            accept="image/*,.pdf"
            maxCount={1}
            showUploadList={false}
            style={{ width: "100%", display: "block" }}
          >
            <div
              style={{
                minHeight: 28,
                paddingInline: 12,
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 7,
                border: `1.2px dashed ${T.formcss.greyBorder}`,
                background: T.formcss.inputBg,
                cursor: "pointer",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
            >
              {uploading ? (
                <LoadingOutlined
                  style={{ color: T.formcss.iconColor, fontSize: 13 }}
                />
              ) : (
                <UploadOutlined
                  style={{ color: T.formcss.iconColor, fontSize: 13 }}
                />
              )}
              <span
                style={{
                  fontSize: 11,
                  color: T.formcss.iconColor,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {uploading ? "Uploading..." : fileName || "Upload file"}
              </span>
            </div>
          </Upload>
        )}
      </div>

      {hasFile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 28,
            gap: 8,
            borderRadius: 7,
            border: `1px solid ${T.formcss.greyBorder}`,
            background: T.formcss.inputBg,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: T.formcss.greenPale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircleFilled
              style={{ color: T.formcss.greenAccent, fontSize: 12 }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: T.formcss.greenMid,
              background: T.formcss.greenPale,
              border: `1px solid ${T.formcss.greyBorder}`,
              borderRadius: 99,
              padding: "1px 7px",
            }}
          >
            Uploaded
          </span>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            <button
              onClick={handleView}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
                border: `1px solid ${T.formcss.greyBorder}`,
                background: T.formcss.inputBg,
                cursor: "pointer",
                color: T.formcss.greenMid,
                transition: "background 0.15s",
              }}
            >
              <EyeOutlined style={{ fontSize: 11 }} />
            </button>
            <button
              onClick={handleRemove}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
                border: `1px solid ${T.formcss.greyBorder}`,
                background: T.formcss.inputBg,
                cursor: "pointer",
                color: T.formcss.error,
                transition: "background 0.15s",
              }}
            >
              <DeleteOutlined style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    title: "Vehicle & Inspection",
    description: "Details & Vendor",
    icon: <CarOutlined />,
  },
  {
    title: "Driver",
    description: "Details & Compliance",
    icon: <TeamOutlined />,
  },
] as const;

// Fields validated per step before advancing to next
const STEP_FIELDS: Record<number, (keyof VehicleCheckSheetFormValues)[]> = {
  0: [
    // "vehicleNumber",
    // "vehicleMake",
    // "vehicleModel",
    // "siteRegion",
    // "manufacturingDate",
    // "fuel",
    // "bu",
    // "department",
    // "ownership",
  ],
  1: [
    // "driverName",
    // "gatePassNo",
    // "aadhaarNo",
    // "driverPNo",
    // "dlNo",
    // "dlIssueDate",
  ],
};

// ─── Shared style constants ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
};

const formItemStyle: React.CSSProperties = { marginBottom: "0.75rem" };

// ─── SectionHeading ───────────────────────────────────────────────────────────

const SectionHeading: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#6b7280",
        marginBottom: description ? 2 : 0,
      }}
    >
      {title}
    </div>
    {description && (
      <div style={{ fontSize: 12, color: "#9ca3af" }}>{description}</div>
    )}
  </div>
);

// ─── FormSection ──────────────────────────────────────────────────────────────

const FormSection: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: "20px 24px",
      marginBottom: 16,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── InspectionRowCell ────────────────────────────────────────────────────────
// Named component — Form.useWatch requires a real component, not an inline callback.
// expiryDate items: Yes → DatePicker + Upload, No → Remark input
// remark items: always show remark input

const InspectionRowCell: React.FC<{ item: InspectionItem }> = ({ item }) => {
  const { uploadAndGetUrl } = useFileUpload();
  const form = Form.useFormInstance();
  const fieldKey = String(item.id);
  const options = STATUS_OPTIONS[item.type];
  const status: number =
    Form.useWatch(["inspection", fieldKey, "status"], form) ?? 1;
  const isPositive = status === 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Form.Item
        name={["inspection", fieldKey, "name"]}
        initialValue={item.label}
        hidden
        noStyle
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={["inspection", fieldKey, "uploadedFileKey"]}
        hidden
        noStyle
      >
        <Input />
      </Form.Item>

      <Form.Item name={["inspection", fieldKey, "status"]} noStyle>
        <Radio.Group>
          <div style={{ display: "flex", gap: 4 }}>
            {options.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                <span style={{ fontSize: 13 }}>{opt.label}</span>
              </Radio>
            ))}
          </div>
        </Radio.Group>
      </Form.Item>

      {item.captureType === "expiryDate" ? (
        isPositive ? (
          <>
            <Form.Item name={["inspection", fieldKey, "value"]} noStyle>
              <DatePicker
                size="small"
                format="DD, MMMM YYYY"
                placeholder="Expiry date"
                style={{ width: 150, ...inputStyle }}
              />
            </Form.Item>
            {item.allowUpload && (
              <Form.Item
                name={["inspection", fieldKey, "uploadedFileKey"]}
                noStyle
              >
                <ImageUpload
                  name={`inspection_${fieldKey}`}
                  onChange={(_name, url) =>
                    form.setFieldValue(
                      ["inspection", fieldKey, "uploadedFileKey"],
                      url,
                    )
                  }
                  uploadAndGetUrl={uploadAndGetUrl}
                />
              </Form.Item>
            )}
          </>
        ) : (
          <Form.Item name={["inspection", fieldKey, "remark"]} noStyle>
            <Input
              size="small"
              placeholder="Remarks..."
              style={{ width: 200, ...inputStyle }}
            />
          </Form.Item>
        )
      ) : (
        <Form.Item name={["inspection", fieldKey, "value"]} noStyle>
          <Input
            size="small"
            placeholder="Remarks..."
            style={{ width: 180, ...inputStyle }}
          />
        </Form.Item>
      )}
    </div>
  );
};

// ─── ServiceRowCell ───────────────────────────────────────────────────────────

const ServiceRowCell: React.FC<{
  dateFieldName?: string;
  kmFieldName: string;
  disabled?: boolean;
}> = ({ dateFieldName, kmFieldName, disabled = false }) => (
  <div
    style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}
  >
    {dateFieldName && (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>
          Date:
        </span>
        <Form.Item
          name={dateFieldName}
          noStyle
          rules={[{ required: true, message: "Date is required" }]}
        >
          <DatePicker
            size="small"
            format="DD, MMMM YYYY"
            disabled={disabled}
            style={{ width: 160, ...inputStyle }}
          />
        </Form.Item>
      </div>
    )}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>
        KM:
      </span>
      <Form.Item
        name={kmFieldName}
        noStyle
        rules={[
          { required: true, message: "KM is required" },
          { type: "number", min: 0, message: "KM cannot be negative" },
        ]}
      >
        <InputNumber
          size="small"
          min={0}
          precision={0}
          style={{ width: 140, ...inputStyle }}
        />
      </Form.Item>
    </div>
  </div>
);

// ─── DriverComplianceRowCell ──────────────────────────────────────────────────
// Now uses InspectionItem type and the same rendering logic as InspectionRowCell.
// status: 1 (Yes) → expiryDate: date+upload, remark: upload only
// status: 0 (No)  → remark input

const DriverComplianceRowCell: React.FC<{ item: InspectionItem; driverIndex: number }> = ({
  item,
  driverIndex,
}) => {
  const { uploadAndGetUrl } = useFileUpload();
  const form = Form.useFormInstance();
  const fieldKey = String(item.id);
  const fieldPath = ["drivers", driverIndex, "driverCompliance", fieldKey];
  const status: number =
    Form.useWatch([...fieldPath, "status"], form) ?? 1;
  const isPositive = status === 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {/* Hidden fields — same as InspectionRowCell */}
      <Form.Item
        name={[...fieldPath, "name"]}
        initialValue={item.label}
        hidden
        noStyle
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={[...fieldPath, "uploadedFileKey"]}
        hidden
        noStyle
      >
        <Input />
      </Form.Item>

      <Form.Item name={[...fieldPath, "status"]} noStyle>
        <Radio.Group>
          <div style={{ display: "flex", gap: 4 }}>
            <Radio value={1}>
              <span style={{ fontSize: 13 }}>Yes</span>
            </Radio>
            <Radio value={0}>
              <span style={{ fontSize: 13 }}>No</span>
            </Radio>
          </div>
        </Radio.Group>
      </Form.Item>

      {item.captureType === "expiryDate" ? (
        isPositive ? (
          <>
            <Form.Item name={[...fieldPath, "value"]} noStyle>
              <DatePicker
                size="small"
                format="DD, MMMM YYYY"
                placeholder="Select date"
                style={{ width: 150, ...inputStyle }}
              />
            </Form.Item>
            {item.allowUpload && (
              <Form.Item
                name={[...fieldPath, "uploadedFileKey"]}
                noStyle
              >
                <ImageUpload
                  name={`compliance_${fieldKey}`}
                  onChange={(_name, url) =>
                    form.setFieldValue(
                      [...fieldPath, "uploadedFileKey"],
                      url,
                    )
                  }
                  uploadAndGetUrl={uploadAndGetUrl}
                />
              </Form.Item>
            )}
          </>
        ) : (
          <Form.Item name={[...fieldPath, "remark"]} noStyle>
            <Input
              size="small"
              placeholder="Remarks..."
              style={{ width: 200, ...inputStyle }}
            />
          </Form.Item>
        )
      ) : isPositive ? (
        <>
          {item.allowUpload && (
            <Form.Item
              name={[...fieldPath, "uploadedFileKey"]}
              noStyle
            >
              <ImageUpload
                name={`compliance_${fieldKey}`}
                onChange={(_name, url) =>
                  form.setFieldValue(
                    [...fieldPath, "uploadedFileKey"],
                    url,
                  )
                }
                uploadAndGetUrl={uploadAndGetUrl}
              />
            </Form.Item>
          )}
        </>
      ) : (
        <Form.Item name={[...fieldPath, "remark"]} noStyle>
          <Input
            size="small"
            placeholder="Remarks..."
            style={{ width: 200, ...inputStyle }}
          />
        </Form.Item>
      )}
    </div>
  );
};

// ─── Table row types ──────────────────────────────────────────────────────────

type InspectionDataRow =
  | {
      key: string;
      srNo: number;
      particulars: string;
      type: "inspection";
      inspectionItem: InspectionItem;
      section: InspectionItem["section"];
    }
  | {
      key: string;
      srNo: number;
      particulars: string;
      type: "lastService" | "odometer";
      section: "service";
    };

type SectionHeaderRow = {
  key: string;
  isSectionHeader: true;
  sectionLabel: string;
  section: string;
};
type InspectionTableRow = InspectionDataRow | SectionHeaderRow;
type DriverComplianceTableRow = {
  key: string;
  srNo: number;
  label: string;
  item: InspectionItem;
};

// ─── Table data builders (module-level) ───────────────────────────────────────

// const INSPECTION_SECTION_LABELS: Record<string, string> = {
//   documents: "Documents", components: "Vehicle Components", glass: "Glass", other: "Other Checks", service: "Service Records",
// };

function buildInspectionTableData(): InspectionTableRow[] {
  const dataRows: InspectionDataRow[] = INSPECTION_ITEMS.map((item, idx) => ({
    key: `item-${item.id}`,
    srNo: idx + 1,
    particulars: item.label,
    type: "inspection" as const,
    inspectionItem: item,
    section: item.section,
  }));
  const nextSrNo = INSPECTION_ITEMS.length + 1;
  const serviceRows: InspectionDataRow[] = [
    {
      key: "lastService",
      srNo: nextSrNo,
      particulars: "Last Service",
      type: "lastService",
      section: "service",
    },
    {
      key: "odometer",
      srNo: nextSrNo + 1,
      particulars: "Odometer Reading",
      type: "odometer",
      section: "service",
    },
  ];
  const enriched: InspectionTableRow[] = [];
  for (const row of [...dataRows, ...serviceRows]) {
    enriched.push(row);
  }
  return enriched;
}

function buildDriverComplianceTableData(): DriverComplianceTableRow[] {
  return DRIVER_COMPLIANCE_ITEMS.map((item, idx) => ({
    key: String(item.id),
    srNo: idx + 1,
    label: item.label,
    item,
  }));
}

function buildDriverChecklistDefaults(): Record<string, InspectionFieldDefault> {
  return DRIVER_COMPLIANCE_ITEMS.reduce(
    (acc, item) => {
      acc[String(item.id)] = {
        name: item.label,
        status: 1,
        value: null,
        remark: null,
        uploadedFileKey: null,
      };
      return acc;
    },
    {} as Record<string, InspectionFieldDefault>,
  );
}

function buildDriverDefaults(): DriverDetails {
  return {
    driverName: "",
    gatePassNo: "",
    aadhaarNo: "",
    driverPNo: "",
    driverSNo: "",
    dlNo: "",
    dlIssueDate: null,
    dlExpiryDate: null,
    driverCompliance: buildDriverChecklistDefaults(),
  };
}

// ─── Default values ───────────────────────────────────────────────────────────

type InspectionFieldDefault = {
  name: string;
  status: number;
  value: null;
  remark: null;
  uploadedFileKey: null;
};

function buildDefaultValues(): Partial<VehicleCheckSheetFormValues> {
  return {
    checkDate: dayjs(),
    odometerDate: dayjs(),
    lastServiceDate: dayjs(),
    commercialPassing: "yes",
    vehicleDutyHours: "12",
    inspection: INSPECTION_ITEMS.reduce(
      (acc, item) => {
        acc[String(item.id)] = {
          name: item.label,
          status: 1,
          value: null,
          remark: null,
          uploadedFileKey: null,
        };
        return acc;
      },
      {} as Record<string, InspectionFieldDefault>,
    ),
    drivers: [buildDriverDefaults(), buildDriverDefaults()],
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface VehicleCheckSheetFormProps {
  onBack: () => void;
  record?: VehicleCheckSheet | null;
}

const VehicleCheckSheetForm: React.FC<VehicleCheckSheetFormProps> = ({
  onBack,
  record,
}) => {
  const isMobile = useIsMobile();
  const [form] = Form.useForm<VehicleCheckSheetFormValues>();
  const [addVehicleCheckSheet, { isLoading: isAdding }] =
    useAddVehicleCheckSheetMutation();
  const [editVehicleCheckSheet, { isLoading: isUpdating }] =
    useEditVehicleCheckSheetMutation();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const recordId = record?.id ?? record?._id;
  const isEditMode = recordId !== undefined && recordId !== null;
  const isLoading = isAdding || isUpdating;
  const vehicleDutyHours = Form.useWatch("vehicleDutyHours", form) ?? "12";
  const driverCount = vehicleDutyHours === "24" ? 2 : 1;

  React.useEffect(() => {
    if (!record) {
      form.resetFields();
      return;
    }

    const toFormChecklist = (
      items: InspectionPayloadItem[] | undefined,
      config: readonly InspectionItem[],
    ) =>
      config.reduce(
        (acc, item) => {
          const saved = items?.find(
            (entry) => String(entry.id) === String(item.id),
          );
          const status = Number(normalizeStatus(saved?.status) ?? 1);
          const isPositive = status === 1;
          acc[String(item.id)] = {
            name: saved?.name ?? item.label,
            status,
            value:
              item.captureType === "expiryDate" && isPositive && saved?.value
                ? dayjs(saved.value)
                : item.captureType === "remark"
                  ? (saved?.value ?? null)
                  : null,
            remark:
              item.captureType === "expiryDate" && !isPositive
                ? (saved?.value ?? null)
                : null,
            uploadedFileKey: saved?.uploadedFileKey ?? null,
          };
          return acc;
        },
        {} as Record<string, InspectionFieldValue>,
      );

    const savedDrivers = (record as VehicleCheckSheet & {
      drivers?: VehicleCheckSheet["drivers"];
    }).drivers;
    const legacyRecord = record as VehicleCheckSheet & {
      driverName?: string;
      gatePassNo?: string;
      aadhaarNo?: string;
      driverPNo?: string;
      driverSNo?: string;
      dlNo?: string;
      dlIssueDate?: string | null;
      driverCompliance?: InspectionPayloadItem[];
    };
    const driverRecords = savedDrivers?.length
      ? savedDrivers
      : [{
          driverName: legacyRecord.driverName ?? "",
          gatePassNo: legacyRecord.gatePassNo ?? "",
          aadhaarNo: legacyRecord.aadhaarNo ?? "",
          driverPNo: legacyRecord.driverPNo ?? "",
          driverSNo: legacyRecord.driverSNo ?? "",
          dlNo: legacyRecord.dlNo ?? "",
          dlIssueDate: legacyRecord.dlIssueDate ?? null,
          dlExpiryDate: null,
          driverCompliance: legacyRecord.driverCompliance ?? [],
        }];

    const editDrivers = [0, 1].map((index) => {
      const driver = driverRecords[index] ?? {};
      return {
        driverName: driver.driverName ?? "",
        gatePassNo: driver.gatePassNo ?? "",
        aadhaarNo: driver.aadhaarNo ?? "",
        driverPNo: driver.driverPNo ?? "",
        driverSNo: driver.driverSNo ?? "",
        dlNo: driver.dlNo ?? "",
        dlIssueDate: driver.dlIssueDate ? dayjs(driver.dlIssueDate) : null,
        dlExpiryDate: driver.dlExpiryDate ?? null,
        driverCompliance: toFormChecklist(
          driver.driverCompliance,
          DRIVER_COMPLIANCE_ITEMS,
        ),
      };
    });

    const editValues: Partial<VehicleCheckSheetFormValues> = {
      checkDate: record.checkDate ? dayjs(record.checkDate) : null,
      siteRegion: record.siteRegion ?? "",
      vehicleNumber: record.vehicleNumber ?? "",
      vehicleMake: record.vehicleMake ?? "",
      vehicleModel: record.vehicleModel ?? "",
      manufacturingDate: record.manufacturingDate
        ? dayjs(record.manufacturingDate)
        : null,
      commercialPassing: record.commercialPassing === "no" ? "no" : "yes",
      fuel: record.fuel as VehicleCheckSheetFormValues["fuel"],
      bu: record.bu ?? "",
      bodyColor: record.bodyColor ?? "",
      department: record.department ?? "",
      ownership: record.ownership as VehicleCheckSheetFormValues["ownership"],
      vehicleDutyHours:
        record.vehicleDutyHours as VehicleCheckSheetFormValues["vehicleDutyHours"],
      vendorName: record.vendorName ?? "",
      vendorPhone: record.vendorPhone ?? "",
      vendorAddress: record.vendorAddress ?? "",
      vendorEmail: record.vendorEmail ?? "",
      lastServiceDate: record.lastServiceDate
        ? dayjs(record.lastServiceDate)
        : dayjs(),
      lastServiceKm: record.lastServiceKm ?? "",
      odometerDate: record.odometerDate ? dayjs(record.odometerDate) : dayjs(),
      odometerKm: record.odometerKm ?? "",
      drivers: editDrivers,
      inspection: toFormChecklist(record.inspection, INSPECTION_ITEMS),
      suggestions: record.suggestions ?? "",
    };

    form.setFieldsValue(editValues);
    setCurrentStep(0);
  }, [form, record]);

  const inspectionTableData = React.useMemo(buildInspectionTableData, []);
  const driverComplianceData = React.useMemo(
    buildDriverComplianceTableData,
    [],
  );

  const col4 = isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))";
  const col3 = isMobile ? "1fr" : "repeat(3, 1fr)";
  // const col2 = isMobile ? "1fr" : "repeat(2, 1fr)";

  // ─── Step navigation ────────────────────────────────────────────────────────

  const goNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    try {
      await form.validateFields(fieldsToValidate);
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // validateFields already highlights errors — nothing else needed
    }
  };

  const goPrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Payload builder ────────────────────────────────────────────────────────

  const buildPayload = (
    values: VehicleCheckSheetFormValues,
  ): VehicleCheckSheetPayload => {
    const inspectionArray: InspectionPayloadItem[] = INSPECTION_ITEMS.map(
      (item) => {
        const field = values.inspection?.[String(item.id)];
        const isPositiveStatus = normalizeStatus(field?.status) === 1;
        let serialisedValue: string | null = null;
        if (item.captureType === "expiryDate") {
          serialisedValue = isPositiveStatus
            ? field?.value
              ? formatDateValue(field.value)
              : null
            : field?.remark
              ? String(field.remark).trim()
              : null;
        } else {
          serialisedValue = field?.value ? String(field.value) : null;
        }
        return {
          id: item.id,
          name: item.label,
          status: normalizeStatus(field?.status) ?? 0,
          value: serialisedValue,
          // Always present — null when no file uploaded or item has no upload button.
          uploadedFileKey: field?.uploadedFileKey ?? null,
        };
      },
    );

    const drivers = (values.drivers ?? []).slice(0, driverCount).map((driver) => ({
      driverName: String(driver.driverName ?? "").trim(),
      gatePassNo: String(driver.gatePassNo ?? "").trim(),
      aadhaarNo: String(driver.aadhaarNo ?? "").trim(),
      driverPNo: String(driver.driverPNo ?? "").trim(),
      driverSNo: String(driver.driverSNo ?? "").trim(),
      dlNo: String(driver.dlNo ?? "").trim(),
      dlIssueDate: formatDateValue(driver.dlIssueDate),
      dlExpiryDate: driver.dlExpiryDate || null,
      driverCompliance: DRIVER_COMPLIANCE_ITEMS.map((item) => {
        const field = driver.driverCompliance?.[String(item.id)];
        const isPositiveStatus = normalizeStatus(field?.status) === 1;
        let complianceValue: string | null = null;
        if (item.captureType === "expiryDate") {
          complianceValue = isPositiveStatus
            ? field?.value
              ? formatDateValue(field.value)
              : null
            : field?.remark
              ? String(field.remark).trim()
              : null;
        } else {
          complianceValue =
            !isPositiveStatus && field?.remark
              ? String(field.remark).trim()
              : null;
        }
        return {
          id: item.id,
          name: item.label,
          status: normalizeStatus(field?.status) ?? 0,
          value: complianceValue,
          uploadedFileKey: field?.uploadedFileKey ?? null,
        };
      }),
    }));

    return {
      checkDate: formatDateValue(values.checkDate),
      siteRegion: String(values.siteRegion ?? "").trim(),
      vehicleNumber: String(values.vehicleNumber ?? "").trim(),
      vehicleMake: values.vehicleMake
        ? String(values.vehicleMake).trim()
        : null,
      vehicleModel: String(values.vehicleModel ?? "").trim(),
      manufacturingDate: formatDateValue(values.manufacturingDate),
      commercialPassing: String(values.commercialPassing ?? ""),
      fuel: String(values.fuel ?? ""),
      bu: String(values.bu ?? "").trim(),
      bodyColor: String(values.bodyColor ?? "").trim(),
      department: String(values.department ?? "").trim(),
      ownership: String(values.ownership ?? ""),
      vehicleDutyHours: String(values.vehicleDutyHours ?? ""),
      vendorName: String(values.vendorName ?? "").trim(),
      vendorPhone: String(values.vendorPhone ?? "").trim(),
      vendorAddress: String(values.vendorAddress ?? "").trim(),
      vendorEmail: String(values.vendorEmail ?? "").trim(),
      inspection: inspectionArray,
      lastServiceDate: formatDateValue(values.lastServiceDate),
      lastServiceKm: Number(values.lastServiceKm ?? 0),
      odometerDate: formatDateValue(values.odometerDate),
      odometerKm: Number(values.odometerKm ?? 0),
      drivers,
      suggestions: String(values.suggestions ?? "").trim(),
    };
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // getFieldsValue(true) collects all registered fields including those
    // on hidden steps — safe to call without validation for logging.
    const values = form.getFieldsValue(true) as VehicleCheckSheetFormValues;
    const payload = buildPayload(values);
    console.log("=== Form values ===");
    console.log(values);
    console.log("=== Serialised payload ===");
    try {
      if (recordId !== undefined && recordId !== null) {
        await editVehicleCheckSheet({ id: recordId, body: payload }).unwrap();
        message.success("Check sheet updated successfully");
      } else {
        await addVehicleCheckSheet(payload).unwrap();
        message.success("Check sheet created successfully");
      }
      onBack();
    } catch (error) {
      setSubmitError(extractApiError(error));
    }
  };

  const handleReset = () => {
    setSubmitError(null);
    form.resetFields();
    setCurrentStep(0);
  };

  // ─── Inspection table columns ────────────────────────────────────────────────

  const inspectionColumns: ColumnsType<InspectionTableRow> = [
    {
      title: "Sr.",
      key: "srNo",
      width: 48,
      align: "center" as const,
      responsive: ["md"] as const,
      render: (_, record) =>
        "isSectionHeader" in record ? null : (
          <span style={{ color: "#9ca3af", fontSize: 12 }}>{record.srNo}</span>
        ),
    },
    {
      title: "Particulars",
      key: "particulars",
      width: isMobile ? 130 : 220,
      render: (_, record) => {
        if ("isSectionHeader" in record) {
          return (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "#6366f1",
              }}
            >
              {record.sectionLabel}
            </span>
          );
        }
        return (
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
            {record.particulars}
          </span>
        );
      },
    },
    {
      title: "Status / Details",
      key: "options",
      render: (_, record) => {
        if ("isSectionHeader" in record) return null;
        if (record.type === "inspection")
          return <InspectionRowCell item={record.inspectionItem} />;
        if (record.type === "lastService")
          return (
            <ServiceRowCell
              dateFieldName="lastServiceDate"
              kmFieldName="lastServiceKm"
            />
          );
        if (record.type === "odometer")
          return (
            <ServiceRowCell
              disabled={true}
              dateFieldName="odometerDate"
              kmFieldName="odometerKm"
            />
          );
        return null;
      },
    },
  ];

  const getDriverComplianceColumns = (
    driverIndex: number,
  ): ColumnsType<DriverComplianceTableRow> => [
    {
      title: "Sr.",
      key: "srNo",
      width: 48,
      align: "center" as const,
      responsive: ["md"] as const,
      render: (_, record) => (
        <span style={{ color: "#9ca3af", fontSize: 12 }}>{record.srNo}</span>
      ),
    },
    {
      title: "Particulars",
      key: "label",
      width: isMobile ? 130 : 200,
      render: (_, record) => (
        <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
          {record.label}
        </span>
      ),
    },
    {
      title: "Status / Date / Remarks",
      key: "statusRemarks",
      render: (_, record) => (
        <DriverComplianceRowCell
          item={record.item}
          driverIndex={driverIndex}
        />
      ),
    },
  ];

  const onInspectionRow = (record: InspectionTableRow) => {
    if ("isSectionHeader" in record)
      return {
        style: { background: "#f5f3ff", pointerEvents: "none" as const },
      };
    return {};
  };

  // ─── Step content definitions ─────────────────────────────────────────────
  // All steps render into the DOM at all times (display:none when inactive)
  // so Ant Design Form keeps field values registered across step changes.

  const stepContent = [
    // ── Step 0: Vehicle + Vendor ────────────────────────────────────────────
    <React.Fragment key="step-0">
      <FormSection>
        <SectionHeading title="Vehicle Details" />
        <div
          style={{ display: "grid", gridTemplateColumns: col4, gap: "0 20px" }}
        >
          <Form.Item
            label="Site / Region"
            name="siteRegion"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Site/Region is required",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="e.g. Mundra, Khavda" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Vehicle Number"
            name="vehicleNumber"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Vehicle number is required",
                whitespace: true,
              },
              { max: 13, message: "Must be 13 characters or fewer" },
            ]}
          >
            <Input
              placeholder="e.g. GJ01AB1234"
              maxLength={13}
              style={inputStyle}
            />
          </Form.Item>
          <Form.Item
            label="Vehicle Make"
            name="vehicleMake"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Vehicle make is required",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="e.g. Maruti, Tata" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Vehicle Model"
            name="vehicleModel"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Vehicle model is required",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="e.g. Swift, Nexon" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Manufacturing Date"
            name="manufacturingDate"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Manufacturing Date is required",
              },
            ]}
          >
            <DatePicker
              format="MM-YYYY"
              picker="month"
              placeholder="Select month & year"
              style={{ width: "100%", ...inputStyle }}
            />
          </Form.Item>
          <Form.Item
            label="Commercial Passing(Yellow No.)"
            name="commercialPassing"
            style={formItemStyle}
          >
            <Radio.Group>
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Fuel Type"
            name="fuel"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Fuel Type is required",
                whitespace: true,
              },
            ]}
          >
            <Select
              style={inputStyle}
              placeholder="Select fuel type"
              options={[
                { label: "Petrol", value: "Petrol" },
                { label: "Diesel", value: "Diesel" },
                { label: "CNG", value: "CNG" },
                { label: "EV", value: "EV" },
                { label: "Hybrid", value: "Hybrid" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="BU"
            name="bu"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "BU is required",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="Business Unit" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Department / Vertical"
            name="department"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Department/Vertical is required",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="e.g. Operations" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Ownership"
            name="ownership"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Ownership is required",
                whitespace: true,
              },
            ]}
          >
            <Select
              style={inputStyle}
              placeholder="Select ownership type"
              options={[
                { label: "Own", value: "Own" },
                { label: "Sublet", value: "Sublet" },
                { label: "DCO", value: "DCO" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Vehicle Duty Hours"
            name="vehicleDutyHours"
            style={formItemStyle}
          >
            <Radio.Group>
              <Radio value="12">12 Hours</Radio>
              <Radio value="24">24 Hours</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Body Color"
            name="bodyColor"
            style={formItemStyle}
            rules={[
              {
                required: true,
                message: "Body Color is required",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="e.g. White" style={inputStyle} />
          </Form.Item>
        </div>
      </FormSection>
      <FormSection style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 4px" }}>
          <SectionHeading
            title="Vehicle Inspection Checklist"
            description="Mark status. For document rows: Yes → expiry date + upload, No → remark."
          />
        </div>
        <Table<InspectionTableRow>
          columns={inspectionColumns}
          dataSource={inspectionTableData}
          rowKey="key"
          pagination={false}
          bordered={false}
          size="small"
          scroll={{ x: 660 }}
          rowClassName={(record) =>
            "isSectionHeader" in record ? "inspection-section-header" : ""
          }
          onRow={onInspectionRow}
          style={{ borderRadius: 0 }}
        />
      </FormSection>

      <FormSection>
        <SectionHeading title="Vendor Details" />
        <div
          style={{ display: "grid", gridTemplateColumns: col4, gap: "0 20px" }}
        >
          <Form.Item
            label="Vendor Name"
            name="vendorName"
            style={formItemStyle}
          >
            <Input placeholder="Vendor / operator name" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Vendor Phone"
            name="vendorPhone"
            style={formItemStyle}
            rules={[
              {
                pattern: /^[0-9+\-\s()]{7,15}$/,
                message: "Enter a valid phone number",
              },
            ]}
          >
            <Input placeholder="+91 98765 43210" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Vendor Email"
            name="vendorEmail"
            style={formItemStyle}
            rules={[{ type: "email", message: "Enter a valid email address" }]}
          >
            <Input placeholder="vendor@example.com" style={inputStyle} />
          </Form.Item>
          <Form.Item
            label="Vendor Address"
            name="vendorAddress"
            style={formItemStyle}
          >
            <Input placeholder="Full address" style={inputStyle} />
          </Form.Item>
        </div>
      </FormSection>
    </React.Fragment>,

    // ── Step 1: Driver Details ──────────────────────────────────────────────
    <React.Fragment key="step-1">
      {Array.from({ length: driverCount }, (_, driverIndex) => (
      <FormSection key={driverIndex} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 4px" }}>
          <SectionHeading title={`Driver ${driverIndex + 1} Details`} />
        </div>

        <div style={{ padding: "0 24px 4px" }}>
          {/* Row 1: Name, Gate Pass, Aadhaar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: col3,
              gap: "0 24px",
            }}
          >
            <Form.Item
              label="Driver Name"
              name={["drivers", driverIndex, "driverName"]}
              style={formItemStyle}
              rules={[
                {
                  required: true,
                  message: "Driver name is required",
                  whitespace: true,
                },
              ]}
            >
              <Input placeholder="Full name" style={inputStyle} />
            </Form.Item>
            <Form.Item
              label="Gate Pass No."
              name={["drivers", driverIndex, "gatePassNo"]}
              style={formItemStyle}
              rules={[
                {
                  required: true,
                  message: "Gate Pass No is required",
                  whitespace: true,
                },
              ]}
            >
              <Input placeholder="Gate pass number" style={inputStyle} />
            </Form.Item>
            <Form.Item
              label="Aadhaar No."
              name={["drivers", driverIndex, "aadhaarNo"]}
              style={formItemStyle}
              rules={[
                {
                  required: true,
                  message: "Aadhaar no is required",
                },
                {
                  validator: (_, value) => {
                    if (!value || /^\d{12}$/.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Aadhaar must be exactly 12 digits"),
                    );
                  },
                },
              ]}
              // Store only raw digits in the form state
              getValueFromEvent={(e) =>
                e.target.value.replace(/\D/g, "").slice(0, 12)
              }
              // Display the formatted version to the user
              getValueProps={(value) => ({
                value: (value ?? "").replace(
                  /(\d{4})(\d{1,4})?(\d{1,4})?/,
                  (_: string, a: string, b: string, c: string) =>
                    [a, b, c].filter(Boolean).join("-"),
                ),
              })}
            >
              <Input
                placeholder="1234-5678-9012"
                maxLength={14}
                style={inputStyle}
              />
            </Form.Item>
          </div>

          {/* Row 2: Primary & Secondary phone */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: col3,
              gap: "0 24px",
            }}
          >
            <Form.Item
              label="Primary Number"
              name={["drivers", driverIndex, "driverPNo"]}
              style={formItemStyle}
              rules={[
                {
                  required: true,
                  message: "Primary No is required",
                  whitespace: true,
                },
                {
                  pattern: /^[0-9+\-\s()]{7,15}$/,
                  message: "Enter a valid phone number",
                },
              ]}
            >
              <Input placeholder="+91 98765 43210" style={inputStyle} />
            </Form.Item>
            <Form.Item
              label="Secondary Number"
              name={["drivers", driverIndex, "driverSNo"]}
              style={formItemStyle}
              rules={[
                {
                  pattern: /^[0-9+\-\s()]{7,15}$/,
                  message: "Enter a valid phone number",
                },
              ]}
            >
              <Input placeholder="+91 98765 43210" style={inputStyle} />
            </Form.Item>
          </div>

          {/* Row 3: DL No, Issue Date, Expiry Date */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: col3,
              gap: "0 24px",
            }}
          >
            <Form.Item
              label="DL No."
              name={["drivers", driverIndex, "dlNo"]}
              style={formItemStyle}
              rules={[
                {
                  required: true,
                  message: "DL No. is required",
                  whitespace: true,
                },
              ]}
            >
              <Input placeholder="Driving licence number" style={inputStyle} />
            </Form.Item>
            <Form.Item
              label="DL Issue Date"
              name={["drivers", driverIndex, "dlIssueDate"]}
              style={formItemStyle}
            >
              <DatePicker
                format="DD, MMMM YYYY"
                placeholder="Select issue date"
                style={{ width: "100%", ...inputStyle }}
              />
            </Form.Item>
            {/* <Form.Item
              label="DL Expiry Date"
              name="dlExpiryDate"
              style={formItemStyle}
              dependencies={["dlIssueDate"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, expiryVal) {
                    if (!expiryVal) return Promise.resolve();
                    const issueVal = getFieldValue("dlIssueDate");
                    if (!issueVal) return Promise.resolve();
                    if (dayjs(expiryVal).isBefore(dayjs(issueVal), "day"))
                      return Promise.reject(
                        new Error("DL expiry must be after issue date"),
                      );
                    if (dayjs(expiryVal).isSame(dayjs(issueVal), "day"))
                      return Promise.reject(
                        new Error("DL expiry cannot equal issue date"),
                      );
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                format="DD, MMMM YYYY"
                placeholder="Select expiry date"
                style={{ width: "100%", ...inputStyle }}
              />
            </Form.Item> */}
          </div>
        </div>

        <Divider style={{ margin: "0 0 0" }} />

        <div style={{ padding: "8px 24px 4px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Compliance Checks
          </div>
        </div>

        <Table<DriverComplianceTableRow>
            columns={getDriverComplianceColumns(driverIndex)}
          dataSource={driverComplianceData}
          rowKey="key"
          pagination={false}
          bordered={false}
          size="small"
          scroll={{ x: 520 }}
          style={{ borderRadius: 0 }}
        />
      </FormSection>
      ))}
      <FormSection>
        <SectionHeading title="Remarks & Suggestions" />
        <div style={{ display: "grid" }}>
          <Form.Item
            label="Suggestions for Improvement(Others Remarks)"
            name="suggestions"
            style={formItemStyle}
          >
            <TextArea
              rows={4}
              placeholder="Enter suggestions..."
              style={inputStyle}
            />
          </Form.Item>
        </div>
      </FormSection>
      {submitError && (
        <Alert
          type="error"
          showIcon
          message={submitError}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setSubmitError(null)}
        />
      )}
    </React.Fragment>,
  ];

  const isLastStep = currentStep === STEPS.length - 1;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: "#f9fafb",
        minHeight: "100vh",
        padding: isMobile ? "12px" : "24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* ── Single Form wrapping all steps ───────────────────────────────── */}
        <Form
          form={form}
          layout="vertical"
          initialValues={buildDefaultValues()}
          scrollToFirstError={{ behavior: "smooth", block: "center" }}
        >
          {/* Page header — always visible above the stepper */}
          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button onClick={onBack} style={{ flexShrink: 0 }}>
                ← Back
              </Button>
              <div>
                <div
                  style={{
                    fontSize: isMobile ? 16 : 20,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {isEditMode
                    ? "Edit Vehicle Check Sheet"
                    : "Vehicle Check Sheet"}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  Monthly Inspection Form
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: isMobile ? "100%" : "auto",
              }}
            >
              <span
                style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}
              >
                Check Date
              </span>
              <Form.Item name="checkDate" noStyle>
                <DatePicker
                  format="DD, MMMM YYYY"
                  disabled
                  style={{
                    flex: isMobile ? 1 : undefined,
                    width: isMobile ? "100%" : 180,
                    ...inputStyle,
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Stepper */}
          {/* ── Step indicator ─────────────────────────────────────────────── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "14px 24px",
              marginBottom: 20,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: isMobile ? 320 : "auto",
              }}
            >
              {STEPS.map((s, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                const isLast = idx === STEPS.length - 1;

                const circleColor = isCompleted
                  ? "#22c55e"
                  : isActive
                    ? "#6366f1"
                    : "#d1d5db";

                const textColor = isActive
                  ? "#111827"
                  : isCompleted
                    ? "#6b7280"
                    : "#9ca3af";

                return (
                  <React.Fragment key={idx}>
                    {/* Step node */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        minWidth: 72,
                      }}
                    >
                      {/* Circle with icon */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: isActive
                            ? "#ede9fe"
                            : isCompleted
                              ? "#dcfce7"
                              : "#f3f4f6",
                          border: `2px solid ${circleColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: circleColor,
                          fontSize: 18,
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        {isCompleted ? (
                          <span style={{ fontSize: 16, fontWeight: 700 }}>
                            ✓
                          </span>
                        ) : (
                          React.cloneElement(s.icon as React.ReactElement)
                        )}
                      </div>

                      {/* Title + description */}
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            color: textColor,
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.title}
                        </div>
                      </div>
                    </div>

                    {/* Connector line between steps */}
                    {!isLast && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: isCompleted ? "#22c55e" : "#e5e7eb",
                          margin: "0 4px",
                          marginBottom: isMobile ? 24 : 32,
                          transition: "background 0.2s",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step panels — all mounted, only one visible */}
          {stepContent.map((content, idx) => (
            <div
              key={idx}
              style={{ display: idx === currentStep ? "block" : "none" }}
            >
              {content}
            </div>
          ))}

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0 24px",
              gap: 12,
              flexDirection: isMobile ? "column-reverse" : "row",
            }}
          >
            {/* Left side: Back / Reset */}
            <div style={{ display: "flex", gap: 8 }}>
              {currentStep > 0 && (
                <Button
                  onClick={goPrev}
                  style={{ minWidth: 90 }}
                  block={isMobile}
                >
                  ← Back
                </Button>
              )}
              <Button
                onClick={handleReset}
                style={{ minWidth: 90 }}
                block={isMobile}
              >
                Reset
              </Button>
            </div>

            {/* Right side: Next / Submit */}
            <div style={{ display: "flex", gap: 8 }}>
              {!isLastStep ? (
                <Button
                  type="primary"
                  onClick={goNext}
                  style={{ minWidth: 120 }}
                  block={isMobile}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={isLoading}
                  style={{ minWidth: 160 }}
                  block={isMobile}
                >
                  {isEditMode ? "Update Check Sheet" : "Save Check Sheet"}
                </Button>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VehicleCheckSheetForm;

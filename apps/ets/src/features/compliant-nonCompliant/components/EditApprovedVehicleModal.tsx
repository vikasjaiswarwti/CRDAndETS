import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Upload,
  Button,
  Steps,
  Spin,
  Tooltip,
  message,
} from "antd";
import dayjs from "dayjs";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useUpdateVehicleMutation } from "../services/VehicleComplianceApi"; // add this mutation
import { v, normalize } from "../utils/Formvalidation";

const GPS_PROVIDER_OPTIONS = [
  { value: 1, label: "Dhanuka" },
  { value: 2, label: "TRAQR" },
];
const OWNER_TYPE_OPTIONS = ["Owned", "Attached"].map((x) => ({
  label: x,
  value: x,
}));

const S = {
  label: {
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 2,
    color: "#374151",
    display: "block",
  } as React.CSSProperties,
  input: { height: 32, fontSize: 12 } as React.CSSProperties,
  select: { width: "100%", fontSize: 12 } as React.CSSProperties,
  date: { width: "100%", height: 32, fontSize: 12 } as React.CSSProperties,
  item: { margin: 0 } as React.CSSProperties,
};
const DATE_PICKER_PROPS = {
  size: "small" as const,
  format: "DD/MM/YYYY",
  style: S.date,
  getPopupContainer: () => document.body,
};

const Field: React.FC<{
  label: string;
  name: string;
  required?: boolean;
  rules?: any[];
  span?: number;
  tooltip?: string;
  children: React.ReactNode;
  normalize?: (v: any) => any;
}> = ({
  label,
  name,
  required,
  rules = [],
  span = 1,
  tooltip,
  children,
  normalize: norm,
}) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={S.label}>
      {label}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
      {tooltip && (
        <Tooltip title={tooltip}>
          <span
            style={{
              marginLeft: 4,
              color: "#9ca3af",
              cursor: "help",
              fontSize: 10,
            }}
          >
            ⓘ
          </span>
        </Tooltip>
      )}
    </label>
    <Form.Item
      name={name}
      rules={rules}
      style={S.item}
      normalize={norm}
      validateTrigger={["onChange", "onBlur"]}
    >
      {children}
    </Form.Item>
  </div>
);

const InfoBanner: React.FC<{
  vendorLabel?: string;
  officeLabel?: string;
  locCode?: number;
}> = ({ vendorLabel, officeLabel, locCode }) => {
  const officeName = officeLabel ?? (locCode ? `Office ${locCode}` : null);
  if (!vendorLabel && !officeName) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        padding: "8px 24px",
        background: "#f0faf4",
        borderBottom: "1px solid #d1fae5",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>
        Editing for:
      </span>
      {vendorLabel && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#fff",
            border: "1px solid #b7e4c7",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 12,
            color: "#1B4332",
            fontWeight: 600,
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
          Vendor:- {vendorLabel}
        </span>
      )}
      {officeName && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#fff",
            border: "1px solid #b7e4c7",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 12,
            color: "#1B4332",
            fontWeight: 600,
          }}
        >
          📍Office:- {officeName}
        </span>
      )}
    </div>
  );
};

const EyeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const XIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DocUploadRow: React.FC<{
  label: string;
  docKey: string;
  value: string | null;
  onChange: (url: string | null) => void;
  required?: boolean;
}> = ({ label, docKey, value, onChange, required }) => {
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { uploadAndGetUrl, getFileUrl } = useFileUpload();
  const handleFile = async (file: File) => {
    setUploading(true);
    onChange(await uploadAndGetUrl(file, docKey));
    setUploading(false);
    return false;
  };
  const handleView = async () => {
    if (!value) return;
    setViewing(true);
    const url = await getFileUrl(value);
    setViewing(false);
    if (url && url !== "URL Not Found")
      window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "13px 16px",
        borderRadius: 10,
        border: `1px solid ${value ? "#86efac" : "#e5e7eb"}`,
        background: value ? "#f0fdf4" : "#fafafa",
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          flexShrink: 0,
          background: value ? "#22c55e" : "#d1d5db",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1f2937",
            display: "block",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
          )}
        </span>
        <span
          style={{
            fontSize: 11,
            color: value ? "#16a34a" : "#9ca3af",
            display: "block",
          }}
        >
          {value ? "Uploaded" : "No file"}
        </span>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        {value && (
          <>
            <button
              onClick={handleView}
              disabled={viewing}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 7,
                border: "1px solid #86efac",
                background: "#f0fdf4",
                color: viewing ? "#9ca3af" : "#16a34a",
                cursor: viewing ? "default" : "pointer",
              }}
            >
              {viewing ? <Spin size="small" /> : <EyeIcon />}
            </button>
            <button
              onClick={() => onChange(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 7,
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#ef4444",
                cursor: "pointer",
              }}
            >
              <XIcon />
            </button>
          </>
        )}
        <Upload
          beforeUpload={handleFile}
          showUploadList={false}
          accept=".jpg,.jpeg,.png,.pdf,.webp"
        >
          <Button
            size="small"
            loading={uploading}
            style={{
              fontSize: 12,
              height: 32,
              minWidth: 80,
              borderColor: value ? "#86efac" : "#d9d9d9",
              color: value ? "#15803d" : "#374151",
              fontWeight: value ? 600 : 400,
            }}
          >
            {uploading ? "" : value ? "Replace" : "Upload"}
          </Button>
        </Upload>
      </div>
    </div>
  );
};

type VehicleDocKey =
  | "registrationExpiryDate_Doc"
  | "fireExtinguisherExp_Doc"
  | "permitExpiryDate_Doc"
  | "firstAidKitDateExpiry_Doc"
  | "insuranceExpiryDate_Doc"
  | "fitnessExpiryDate_Doc"
  | "roadTaxExpiryDate_Doc"
  | "pucExpiryDate_Doc";
type DocState = Record<VehicleDocKey, string | null>;

const VEHICLE_DOC_FIELDS: { key: VehicleDocKey; label: string }[] = [
  { key: "registrationExpiryDate_Doc", label: "Registration Doc" },
  { key: "permitExpiryDate_Doc", label: "Permit Doc" },
  { key: "fitnessExpiryDate_Doc", label: "Fitness Doc" },
  { key: "pucExpiryDate_Doc", label: "PUC Doc" },
  { key: "fireExtinguisherExp_Doc", label: "Fire Extinguisher Doc" },
  { key: "firstAidKitDateExpiry_Doc", label: "First Aid Kit Doc" },
  { key: "roadTaxExpiryDate_Doc", label: "Road Tax Doc" },
  { key: "insuranceExpiryDate_Doc", label: "Insurance Doc" },
];

const INITIAL_DOCS: DocState = {
  registrationExpiryDate_Doc: null,
  fireExtinguisherExp_Doc: null,
  permitExpiryDate_Doc: null,
  firstAidKitDateExpiry_Doc: null,
  insuranceExpiryDate_Doc: null,
  fitnessExpiryDate_Doc: null,
  roadTaxExpiryDate_Doc: null,
  pucExpiryDate_Doc: null,
};

const DATE_FIELDS = [
  "vehicle_Registration_Date",
  "vehicle_Induction_Date",
  "registration_Exp_Date",
  "firstAid_Kid_Date",
  "fire_Extinguisher_Date",
  "permit_Expiry_Date",
  "insurance_Expiry_Date",
  "fitness_Expiry_Date",
  "road_Tax_Validity_Expiry",
  "puc_Expiry_Date",
  "gps_Installation_Date",
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  record: any | null;
  transporterId?: number;
  locCode?: number;
  vendorLabel?: string;
  onSuccess: () => void;
}

export const EditApprovedVehicleModal: React.FC<Props> = ({
  open,
  onClose,
  record,
  transporterId,
  locCode,
  vendorLabel,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const {
    fuelTypeOptions,
    driverOptions,
    vehicleTypeOptions,
    locationOptions,
    vehicleStatusOptions,
    currentStatusOptions,
  } = useLookups({
    only: [
      "fuelTypeOptions",
      "driverOptions",
      "vehicleTypeOptions",
      "locationOptions",
      "vehicleStatusOptions",
      "currentStatusOptions",
    ],
  });
  const officeLabel: string | undefined = (locationOptions as any)?.find(
    (o: any) => o.value === locCode,
  )?.label;

  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [docs, setDocsState] = useState<DocState>({ ...INITIAL_DOCS });
  const [submitting, setSubmitting] = useState(false);
  const [updateVehicle] = useUpdateVehicleMutation();

  const setDoc = (key: VehicleDocKey, url: string | null) =>
    setDocsState((p) => ({ ...p, [key]: url }));

  useEffect(() => {
    if (!open || !record) return;
    const r = record as any;
    form.resetFields();
    setStep(0);

    form.setFieldsValue({
      vehicle_Registration_No:
        r.vehicle_Registration_No ?? r.registrationNo ?? "",
      vehicleTypeCode: r.vehicleTypeCode ?? undefined,
      fuelTypeCode: r.fuelTypeCode ?? undefined,
      make: r.make ?? "",
      model: r.model ?? "",
      chassis_No: r.chassis_No ?? r.chassisNo ?? "",
      driverId: r.driverId ?? undefined,
      vehicle_Status: r.vehicle_Status ?? r.vehicleStatus ?? undefined,
      current_Status: r.current_Status ?? r.currentStatus ?? undefined,
      owner_Name: r.owner_Name ?? r.ownerName ?? "",
      owner_Address: r.owner_Address ?? r.ownerAddress ?? "",
      owner_Type: r.owner_Type ?? r.ownerType ?? undefined,
      isGpsInstalled: r.isGpsInstalled ?? false,
      gpsProviderCode: r.gpsProviderCode ?? undefined,
      remarks: r.remarks ?? "",
      makeYear: r.makeYear ? dayjs(r.makeYear.toString(), "YYYY") : undefined,
      ...Object.fromEntries(
        DATE_FIELDS.map((f) => [f, r[f] ? dayjs(r[f]) : undefined]),
      ),
    });

    setDocsState({
      registrationExpiryDate_Doc: r.registrationExpiryDate_Doc ?? null,
      fireExtinguisherExp_Doc: r.fireExtinguisherExp_Doc ?? null,
      permitExpiryDate_Doc: r.permitExpiryDate_Doc ?? null,
      firstAidKitDateExpiry_Doc: r.firstAidKitDateExpiry_Doc ?? null,
      insuranceExpiryDate_Doc: r.insuranceExpiryDate_Doc ?? null,
      fitnessExpiryDate_Doc: r.fitnessExpiryDate_Doc ?? null,
      roadTaxExpiryDate_Doc: r.roadTaxExpiryDate_Doc ?? null,
      pucExpiryDate_Doc: r.pucExpiryDate_Doc ?? null,
    });
  }, [open, record, form]);

  const goNext = async () => {
    const stepFields: string[][] = [
      [
        "vehicle_Registration_No",
        "vehicleTypeCode",
        "fuelTypeCode",
        "make",
        "model",
        "makeYear",
      ],
      [
        "vehicle_Registration_Date",
        "vehicle_Induction_Date",
        "permit_Expiry_Date",
        "insurance_Expiry_Date",
        "fitness_Expiry_Date",
        "road_Tax_Validity_Expiry",
        "puc_Expiry_Date",
        "owner_Type",
        "vehicle_Status",
        "current_Status",
        "remarks",
      ],
      [],
    ];
    try {
      await form.validateFields(stepFields[step]);
      setStep((s) => s + 1);
    } catch {}
  };

  const handleClose = () => {
    form.resetFields();
    setStep(0);
    setDocsState({ ...INITIAL_DOCS });
    onClose();
  };

  const handleSubmit = async () => {
    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    try {
      const r = record as any;
      DATE_FIELDS.forEach((f) => {
        if (values[f] && dayjs.isDayjs(values[f]))
          values[f] = (values[f] as any).format("YYYY-MM-DD");
      });

      //   if (values.makeYear && dayjs.isDayjs(values.makeYear))
      //     values.makeYear = (values.makeYear as any).format("YYYY");

      await updateVehicle({
        id: r.id ?? r.vehicle_Id ?? "",
        body: {
          ...values,
          transporterId: transporterId ?? r.transporterId,
          locCode: locCode ?? r.locCode,
          ...docs,
        },
      }).unwrap();

      message.success("Vehicle updated successfully");
      onSuccess();
    } catch (e: any) {
      message.error(
        e?.data?.title ?? e?.data?.message ?? "Failed to update vehicle",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const G4 = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px 10px",
  };
  const G2 = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px 16px",
  };

  if (!record) return null;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Edit Vehicle — Step {step + 1} of 3
        </span>
      }
      footer={null}
      centered
      width="min(1260px, 96vw)"
      destroyOnClose={false}
    >
      <div
        style={{
          padding: `${spacing.sm}px ${spacing.xl}px`,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Steps
          current={step}
          size="small"
          items={[
            { title: "Vehicle Identity" },
            { title: "Compliance Dates" },
            { title: "Documents" },
          ]}
        />
      </div>
      <InfoBanner
        vendorLabel={vendorLabel}
        officeLabel={officeLabel}
        locCode={locCode}
      />

      <Form
        form={form}
        layout="vertical"
        size="small"
        style={{ padding: `${spacing.sm}px ${spacing.xl}px` }}
      >
        {/* ── Step 0: Vehicle Identity ── */}
        <div style={{ display: step === 0 ? undefined : "none" }}>
          <div style={G4}>
            <Field
              label="Registration No."
              name="vehicle_Registration_No"
              required
              rules={[v.required(), v.vehicleRegNo(), v.maxLen(20)]}
              normalize={normalize.vehicleRegNo}
              tooltip="e.g. UP-58-P-6228"
            >
              <Input style={S.input} placeholder="UP-58-P-6228" />
            </Field>
            <Field
              label="Vehicle Type"
              name="vehicleTypeCode"
              required
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Select type"
                options={(vehicleTypeOptions as any) ?? []}
              />
            </Field>
            <Field label="Make" name="make" rules={[v.maxLen(50)]}>
              <Input style={S.input} placeholder="TATA" />
            </Field>
            <Field label="Model" name="model" rules={[v.maxLen(50)]}>
              <Input style={S.input} placeholder="Ace" />
            </Field>
            <Field
              label="Make Year"
              name="makeYear"
              required
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker
                {...DATE_PICKER_PROPS}
                picker="year"
                placeholder="Select year"
              />
            </Field>
            <Field
              label="Fuel Type"
              name="fuelTypeCode"
              required
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Select fuel"
                options={(fuelTypeOptions as any) ?? []}
              />
            </Field>
            <Field
              label="Chassis No."
              name="chassis_No"
              rules={[v.alphaNumDash("Chassis No."), v.maxLen(25)]}
              normalize={normalize.alphaNumUpper}
            >
              <Input style={S.input} placeholder="1ZVBP8JZ8H1234567" />
            </Field>
            <Field label="Assigned Driver" name="driverId">
              <Select
                style={S.select}
                size="small"
                placeholder="Select driver"
                options={(driverOptions as any) ?? []}
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </Field>
            <div>
              <label style={S.label}>GPS Installed</label>
              <Form.Item
                name="isGpsInstalled"
                valuePropName="checked"
                style={S.item}
              >
                <Switch
                  size="small"
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
              </Form.Item>
            </div>
            <Form.Item
              shouldUpdate={(p, c) => p.isGpsInstalled !== c.isGpsInstalled}
              style={{ ...S.item, gridColumn: "span 1" }}
            >
              {({ getFieldValue }) => (
                <Field
                  label="GPS Provider"
                  name="gpsProviderCode"
                  rules={
                    getFieldValue("isGpsInstalled")
                      ? [v.required("GPS provider required")]
                      : []
                  }
                >
                  <Select
                    style={S.select}
                    size="small"
                    placeholder="Select provider"
                    options={GPS_PROVIDER_OPTIONS}
                    allowClear
                  />
                </Field>
              )}
            </Form.Item>
            <Form.Item
              shouldUpdate={(p, c) => p.isGpsInstalled !== c.isGpsInstalled}
              style={{ ...S.item, gridColumn: "span 1" }}
            >
              {({ getFieldValue }) => (
                <Field
                  label="GPS Install Date"
                  name="gps_Installation_Date"
                  required={!!getFieldValue("isGpsInstalled")}
                  rules={
                    getFieldValue("isGpsInstalled")
                      ? [v.required("GPS install date required")]
                      : []
                  }
                >
                  <DatePicker {...DATE_PICKER_PROPS} />
                </Field>
              )}
            </Form.Item>
          </div>
        </div>

        {/* ── Step 1: Compliance Dates ── */}
        <div style={{ display: step === 1 ? undefined : "none" }}>
          <div style={G4}>
            <Field
              label="Registration Date"
              name="vehicle_Registration_Date"
              required
              rules={[v.requiredSelect(), v.pastDate("Registration date")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Induction Date"
              name="vehicle_Induction_Date"
              required
              rules={[v.requiredSelect()]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Registration Expiry"
              name="registration_Exp_Date"
              rules={[v.futureDate("Registration expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Permit Expiry"
              name="permit_Expiry_Date"
              required
              rules={[v.requiredSelect(), v.futureDate("Permit expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Insurance Expiry"
              name="insurance_Expiry_Date"
              required
              rules={[v.requiredSelect(), v.futureDate("Insurance expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Fitness Expiry"
              name="fitness_Expiry_Date"
              required
              rules={[v.requiredSelect(), v.futureDate("Fitness expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Road Tax Expiry"
              name="road_Tax_Validity_Expiry"
              required
              rules={[v.requiredSelect(), v.futureDate("Road tax expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="PUC Expiry"
              name="puc_Expiry_Date"
              required
              rules={[v.requiredSelect(), v.futureDate("PUC expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="First Aid Kit Expiry"
              name="firstAid_Kid_Date"
              rules={[v.futureDate("First aid kit date")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Fire Ext. Expiry"
              name="fire_Extinguisher_Date"
              rules={[v.futureDate("Fire extinguisher date")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field label="Owner Name" name="owner_Name" rules={[v.maxLen(100)]}>
              <Input style={S.input} placeholder="Owner full name" />
            </Field>
            <Field
              label="Owner Type"
              name="owner_Type"
              required
              rules={[v.requiredSelect()]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Own / Attached"
                options={OWNER_TYPE_OPTIONS}
              />
            </Field>
            <Field
              label="Owner Address"
              name="owner_Address"
              rules={[v.maxLen(300)]}
              span={2}
            >
              <Input style={S.input} placeholder="Full address" />
            </Field>
            <Field
              label="Vehicle Status"
              name="vehicle_Status"
              required
              rules={[v.requiredSelect()]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Status"
                options={(vehicleStatusOptions as any) ?? []}
              />
            </Field>
            <Field
              label="Current Status"
              name="current_Status"
              required
              rules={[v.requiredSelect()]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Current status"
                options={(currentStatusOptions as any) ?? []}
              />
            </Field>
            <Field
              label="Remarks"
              name="remarks"
              required
              rules={[v.required(), v.maxLen(500)]}
              span={2}
            >
              <Input style={S.input} placeholder="Remarks" />
            </Field>
          </div>
        </div>

        {/* ── Step 2: Documents ── */}
        <div style={{ display: step === 2 ? undefined : "none" }}>
          <div style={G2}>
            {VEHICLE_DOC_FIELDS.filter(
              (f) =>
                f.key !== "firstAidKitDateExpiry_Doc" &&
                f.key !== "fireExtinguisherExp_Doc",
            ).map(({ key, label }) => (
              <DocUploadRow
                key={key}
                label={label}
                docKey={key}
                value={docs[key]}
                onChange={(url) => setDoc(key, url)}
                required={true}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#6b7280",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: 4,
              marginTop: 14,
              marginBottom: 8,
            }}
          >
            Optional Documents
          </div>
          <div style={G2}>
            {VEHICLE_DOC_FIELDS.filter(
              (f) =>
                f.key === "firstAidKitDateExpiry_Doc" ||
                f.key === "fireExtinguisherExp_Doc",
            ).map(({ key, label }) => (
              <DocUploadRow
                key={key}
                label={`${label} (Optional)`}
                docKey={key}
                value={docs[key]}
                onChange={(url) => setDoc(key, url)}
              />
            ))}
          </div>
        </div>
      </Form>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: spacing.sm,
          padding: `${spacing.sm}px ${spacing.xl}px ${spacing.md}px`,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            padding: "7px 18px",
            borderRadius: radius.md,
            border: "1px solid #d9d9d9",
            background: "#fff",
            cursor: "pointer",
            fontSize: font.sizeSm,
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              padding: "7px 18px",
              borderRadius: radius.md,
              border: `1px solid ${color.primary}`,
              background: "#fff",
              color: color.primary,
              cursor: "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
            }}
          >
            ← Back
          </button>
        )}
        {step < 2 ? (
          <button
            onClick={goNext}
            style={{
              padding: "7px 22px",
              borderRadius: radius.md,
              border: "none",
              background: color.primary,
              color: "#fff",
              cursor: "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            {step === 0 ? "Next — Compliance Dates →" : "Next — Documents →"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "7px 22px",
              borderRadius: radius.md,
              border: "none",
              background: submitting ? "#9ca3af" : color.primary,
              color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {submitting && <Spin size="small" />}
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>
    </Modal>
  );
};

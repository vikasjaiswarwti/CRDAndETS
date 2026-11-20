import React from "react";
import {
  CarOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  ToolOutlined,
  FolderOutlined,
  EyeOutlined,
  CalendarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import type { Vehicle } from "../types/vehicle.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isExpiringSoon(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // within 30 days
}

function isExpired(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const BorderStyle: React.CSSProperties = { border: "1px solid #C4C6D4" };

interface FieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  colSpan2?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, mono, colSpan2 }) => (
  <div className={`${colSpan2 ? "col-span-2" : ""} flex flex-col gap-0.5`}>
    <p className="text-[12px] font-extrabold uppercase text-[#747783] mb-0.75 m-0">
      {label}
    </p>
    <p
      className={[
        "text-[14px] m-0",
        mono ? "font-mono tracking-wide" : "",
        "text-[#1a2e22]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value ?? "—"}
    </p>
  </div>
);

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl overflow-hidden" style={BorderStyle}>
    <div
      className="flex items-center gap-1 bg-[#eaf6ec] border-b border-[#dceee3]"
      style={{ padding: "10px 15px" }}
    >
      <div className="w-7 h-7 text-[#006C49] flex items-center justify-center text-sm leading-none">
        {icon}
      </div>
      <span className="text-md font-semibold text-[#006C49]">{title}</span>
    </div>
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);

interface StatusBadgeProps {
  label: string;
  active?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, active }) => (
  <span
    className={`text-[10px] font-bold tracking-[0.08em] uppercase rounded-md ${
      active ? "bg-[#DCFCE7] text-[#166534]" : "bg-gray-100 text-gray-500"
    }`}
    style={{ padding: "3px 8px" }}
  >
    {label}
  </span>
);

// ─── Compliance Table ─────────────────────────────────────────────────────────

interface ComplianceRowProps {
  label: string;
  date: string | null | undefined;
  docUrl: string | null | undefined;
  onView: (url: string | null | undefined) => void;
}

const ComplianceRow: React.FC<ComplianceRowProps> = ({
  label,
  date,
  docUrl,
  onView,
}) => {
  const expired = isExpired(date);
  const expiring = isExpiringSoon(date);

  return (
    <tr className="border-b border-[#f0f0f0] last:border-0">
      <td className="py-3 text-[13px] text-[#1a2e22]" style={{ width: "40%" }}>
        {label}
      </td>
      <td className="py-3" style={{ width: "30%" }}>
        <span
          className={`text-[13px] font-medium ${
            expired
              ? "text-red-500"
              : expiring
                ? "text-orange-500"
                : "text-[#1a2e22]"
          }`}
        >
          {formatDate(date)}
          {expired && (
            <span className="ml-1 text-[10px] bg-red-50 text-red-500 border border-red-200 rounded px-1">
              Expired
            </span>
          )}
          {expiring && !expired && (
            <span className="ml-1 text-[10px] bg-orange-50 text-orange-500 border border-orange-200 rounded px-1">
              Expiring
            </span>
          )}
        </span>
      </td>
      <td className="py-3 text-right" style={{ width: "30%" }}>
        <button
          onClick={() => onView(docUrl)}
          disabled={!docUrl}
          className={`inline-flex items-center gap-1 text-[12px] font-semibold border rounded-md transition-colors ${
            docUrl
              ? "border-[#d8f3dc] text-[#2d6a4f] bg-[#eaf6ec] hover:bg-[#d8f3dc] cursor-pointer"
              : "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
          }`}
          style={{ padding: "3px 10px", fontSize: 11 }}
        >
          <EyeOutlined style={{ fontSize: 11 }} />
          View
        </button>
      </td>
    </tr>
  );
};

// ─── Doc Chip ─────────────────────────────────────────────────────────────────

interface DocChipProps {
  icon: React.ReactNode;
  label: string;
  doc: string | null | undefined;
  onView: (url: string | null | undefined) => void;
  viewAll?: boolean;
}

const DocChip: React.FC<DocChipProps> = ({
  icon,
  label,
  doc,
  onView,
  viewAll,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[#747783]" style={{ fontSize: 14 }}>
      {icon}
    </span>
    <span className="text-[12px] text-[#1a2e22]">{label}</span>
    <button
      onClick={() => onView(doc)}
      disabled={!doc && !viewAll}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded-md transition-colors ${
        doc || viewAll
          ? "border-[#d8f3dc] text-[#2d6a4f] bg-[#eaf6ec] hover:bg-[#d8f3dc] cursor-pointer"
          : "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
      }`}
      style={{ padding: "2px 8px" }}
    >
      <EyeOutlined style={{ fontSize: 10 }} />
      {viewAll ? "View All" : "View"}
    </button>
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface ViewVehicleProps {
  onClose: () => void;
  title?: string;
  editingRecord: Vehicle | null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ViewVehicle: React.FC<ViewVehicleProps> = ({
  onClose = () => {},
  editingRecord,
  title = "View Vehicle",
}) => {
  const { getFileUrl } = useFileUpload();

  if (!editingRecord) return <div>No vehicle data found.</div>;

  const handleView = async (url: string | null | undefined) => {
    if (!url) {
      message.error("No document available");
      return;
    }
    const imgUrl = await getFileUrl(url);
    if (imgUrl && imgUrl !== "URL Not Found") {
      window.open(imgUrl, "_blank");
    } else {
      message.error(`Invalid URL - ${url}`);
    }
  };

  const v = editingRecord;

  const complianceDocs = [
    {
      label: "Registration Expiry Date",
      date: v.registration_Exp_Date,
      doc: v.registrationExpiryDate_Doc,
    },
    {
      label: "Permit Expiry Date",
      date: v.permit_Expiry_Date,
      doc: v.permitExpiryDate_Doc,
    },
    {
      label: "Insurance Expiry Date",
      date: v.insurance_Expiry_Date,
      doc: v.insuranceExpiryDate_Doc,
    },
    {
      label: "Fitness Expiry Date",
      date: v.fitness_Expiry_Date,
      doc: v.fitnessExpiryDate_Doc,
    },
    {
      label: "Fire Extinguisher",
      date: v.fire_Extinguisher_Date,
      doc: v.fireExtinguisherExp_Doc,
    },
    {
      label: "Road Tax Validity Expiry",
      date: v.road_Tax_Validity_Expiry,
      doc: v.roadTaxExpiryDate_Doc,
    },
    {
      label: "PUC Expiry Date",
      date: v.puc_Expiry_Date,
      doc: v.pucExpiryDate_Doc,
    },
    {
      label: "First Aid Kit",
      date: v.firstAid_Kid_Date,
      doc: v.firstAidKitDateExpiry_Doc,
    },
  ];

  return (
    <div
      style={{ padding: 24, background: "#fff" }}
      className=" px-4 py-10 text-[#1a2e22] flex flex-col gap-5"
    >
      {/* ── Back + Title ── */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl">
        <button
          className="w-5 h-5 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          <LeftOutlined style={{ fontSize: 16 }} />
        </button>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
      </div>

      <div
        style={{
          border: "1.5px solid #e6f7f0",
          padding: 16,
          borderRadius: 16,
        }}
      >
        <div className="grid grid-cols-12 gap-4">
          {/* ══════════════════════════════════════════════
              LEFT SIDEBAR — cols 1–3
          ══════════════════════════════════════════════ */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* 1. Vehicle Overview */}
            <SectionCard icon={<CarOutlined />} title="1. Vehicle Overview">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field
                  label="Registration No."
                  value={
                    <span className="font-bold text-[15px]">
                      {v.vehicle_Registration_No}
                    </span>
                  }
                />
                <Field
                  label="Make Year"
                  value={v.makeYear ? new Date(v.makeYear).getFullYear() : "—"}
                />
                <Field
                  label="Make"
                  value={<span className="font-bold">{v.make}</span>}
                />
                <Field label="Vehicle Type" value={v.vehicleTypeCode} />
                <Field label="Vehicle Model" value={v.model} />
                <Field label="Chassis No." value={v.chassis_No} mono />
                <Field label="Vehicle Type" value={v.vehicleTypeCode} />
                <Field label="Fuel Type" value={v.fuelTypeCode} />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-extrabold uppercase text-[#747783] m-0 mb-1">
                    Vehicle Status
                  </p>
                  <StatusBadge
                    label={String(v.vehicle_Status ?? "—")}
                    active={
                      String(v.vehicle_Status).toLowerCase() === "active" ||
                      v.vehicle_Status === 1
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-extrabold uppercase text-[#747783] m-0 mb-1">
                    Current Status
                  </p>
                  <StatusBadge
                    label={String(v.current_Status ?? "—")}
                    active={
                      String(v.current_Status).toLowerCase() === "active" ||
                      v.current_Status === 1
                    }
                  />
                </div>
              </div>
            </SectionCard>

            {/* 2. Assignment & Location */}
            <SectionCard
              icon={<EnvironmentOutlined />}
              title="2. Assignment & Location"
            >
              <div className="flex flex-col gap-4">
                <Field label="Driver" value={v?.driverName ?? "—"} />
                <Field label="Transporter" value={v.transporterName ?? "—"} />
                <Field label="Office Location" value={v.locationName ?? "—"} />
              </div>
            </SectionCard>

            {/* 3. Ownership Details */}
            <SectionCard icon={<ToolOutlined />} title="3. Ownership Details">
              <div className="flex flex-col gap-4">
                <Field label="Owner Name" value={v.owner_Name} />
                <Field label="Owner Address" value={v.owner_Address} />
                <Field label="Owner Type" value={v.owner_Type} />
              </div>
            </SectionCard>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT MAIN — cols 4–12
          ══════════════════════════════════════════════ */}
          <div className="col-span-9 flex flex-col gap-4">
            {/* 4. Compliance & Expiry Dates */}
            <SectionCard
              icon={<SafetyOutlined />}
              title="4. Compliance & Expiry Dates"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#e6f7f0]">
                    <th
                      className="text-left text-[11px] font-extrabold uppercase text-[#747783] pb-2"
                      style={{ width: "40%" }}
                    >
                      Document Type
                    </th>
                    <th
                      className="text-left text-[11px] font-extrabold uppercase text-[#747783] pb-2"
                      style={{ width: "30%" }}
                    >
                      Expiry Date
                    </th>
                    <th
                      className="text-right text-[11px] font-extrabold uppercase text-[#747783] pb-2"
                      style={{ width: "30%" }}
                    >
                      Document
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {complianceDocs.map((row) => (
                    <ComplianceRow
                      key={row.label}
                      label={row.label}
                      date={row.date}
                      docUrl={row.doc}
                      onView={handleView}
                    />
                  ))}
                </tbody>
              </table>
            </SectionCard>

            {/* Row: 5. Lifecycle + 6. GPS */}
            <div className="grid grid-cols-2 gap-4">
              {/* 5. Vehicle Lifecycle Dates */}
              <SectionCard
                icon={<CalendarOutlined />}
                title="5. Vehicle Lifecycle Dates"
              >
                <div className="flex flex-col gap-4">
                  <Field
                    label="Vehicle Registration Date"
                    value={
                      <span className="font-bold">
                        {formatDate(v.vehicle_Registration_Date)}
                      </span>
                    }
                  />
                  <Field
                    label="Vehicle Induction Date"
                    value={
                      <span className="font-bold">
                        {formatDate(v.vehicle_Induction_Date)}
                      </span>
                    }
                  />
                </div>
              </SectionCard>

              {/* 6. GPS & Tracking */}
              <SectionCard icon={<GlobalOutlined />} title="6. GPS & Tracking">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-extrabold uppercase text-[#747783] m-0">
                      Is GPS Installed
                    </p>
                    <StatusBadge
                      label={v.isGpsInstalled ? "Yes" : "No"}
                      active={!!v.isGpsInstalled}
                    />
                  </div>
                  <Field
                    label="GPS Provider"
                    value={v.gpsProviderCode ?? "—"}
                  />
                  <Field
                    label="GPS Installation Date"
                    value={formatDate(v.gps_Installation_Date)}
                  />
                </div>
              </SectionCard>
            </div>

            {/* 7. Documents */}
            <SectionCard icon={<FolderOutlined />} title="7. Documents">
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <DocChip
                  icon={<FileProtectOutlined />}
                  label="Registration Expiry Doc"
                  doc={v.registrationExpiryDate_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<SafetyOutlined />}
                  label="Fitness Expiry Doc"
                  doc={v.fitnessExpiryDate_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<FileProtectOutlined />}
                  label="Insurance Expiry Doc"
                  doc={v.insuranceExpiryDate_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<FileProtectOutlined />}
                  label="Permit Expiry Doc"
                  doc={v.permitExpiryDate_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<FileProtectOutlined />}
                  label="Road Tax Expiry Doc"
                  doc={v.roadTaxExpiryDate_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<FolderOutlined />}
                  label="All Documents"
                  doc={v.allDocuments_Doc}
                  onView={handleView}
                  viewAll
                />
                <DocChip
                  icon={<SafetyOutlined />}
                  label="PUC Expiry Doc"
                  doc={v.pucExpiryDate_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<SafetyOutlined />}
                  label="First Aid Kit Doc"
                  doc={v.firstAidKitDateExpiry_Doc}
                  onView={handleView}
                />
                <DocChip
                  icon={<SafetyOutlined />}
                  label="Fire Extinguisher Doc"
                  doc={v.fireExtinguisherExp_Doc}
                  onView={handleView}
                />
              </div>
            </SectionCard>

            {/* Remarks (conditional) */}
            {v.remarks && (
              <SectionCard icon="💬" title="Remarks">
                <p className="text-[13.5px] font-medium text-[#1a2e22] leading-relaxed m-0">
                  {v.remarks}
                </p>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVehicle;

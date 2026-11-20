import React from "react";
import type { Driver } from "../types/driver.types";
import {
  EyeOutlined,
  FileDoneOutlined,
  HomeOutlined,
  LeftOutlined,
  PhoneOutlined,
  SettingOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";

// ─── Helpers ──────────────────────────────────────────────────────
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAge(dob: string | null): string {
  if (!dob) return "";
  const diff = Date.now() - new Date(dob).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} Yrs`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

// ─── Sub-components ───────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  mono?: boolean;
  colSpan2?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  accent,
  mono,
  colSpan2,
}) => (
  <div className={`${colSpan2 ? "col-span-2" : ""}  flex flex-col gap-0.5`}>
    <p className="text-[12px] font-extrabold uppercase text-[#747783] mb-0.75">
      {label}
    </p>
    <p
      className={[
        "text-[14px]  ",
        accent ? "text-red-600 font-semibold" : "text-[#1a2e22]",
        mono ? "font-mono text-[14px] tracking-wide" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value ?? "—"}
    </p>
  </div>
);

const BorderStyle: React.CSSProperties = {
  border: "1px solid #C4C6D4",
};
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <div
    className="bg-white rounded-2xl  mt-5 overflow-hidden "
    style={BorderStyle}
  >
    <div
      className="flex items-center gap-1 px-5 py-3.25 bg-[#eaf6ec] border-b border-[#dceee3]"
      style={{ padding: "10px 15px " }}
    >
      <div className="w-7 h-7 text-[#006C49] flex items-center justify-center text-sm leading-none">
        {icon}
      </div>
      <span className="text-md font-semibold text-[#006C49]">{title}</span>
    </div>
    <div className="p-5" style={{ padding: 20 }}>
      {children}
    </div>
  </div>
);

interface DocLinkProps {
  icon: string;
  label: string;
  doc: string | null;
  onClick?: () => any;
}
// ─── Props ────────────────────────────────────────────────────────
interface DriverProfileViewProps {
  onClose: () => void;
  title: string;
  editingRecord: Driver | null;
  bgvDate?: string;
}

// ─── Main Component ───────────────────────────────────────────────
const ViewDriver: React.FC<DriverProfileViewProps> = ({
  onClose = () => {},
  editingRecord,
  title = "",
  bgvDate = "2023-01-05",
}) => {
  const { getFileUrl } = useFileUpload();
  if (!editingRecord) {
    return <div>error</div>;
  }
  const handleView = async (url: string | null) => {
    if (!url) {
      message.error(`Invalid URl - ${url}`);
      return;
    }
    try {
      const imgUrl = await getFileUrl(url);
      // console.log("generated file url:", imgUrl);
      if (!imgUrl) {
        message.error("Unable to generate file URL");
        return;
      }
      window.open(imgUrl, "_blank");
    } catch (error) {
      console.error(error);
      message.error("Failed to open document");
    }
  };
  return (
    <div
      className=" px-4 py-10 text-[#1a2e22] flex flex-col gap-5"
      style={{ padding: 24, background: "#fff" }}
    >
      <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl">
        <button
          className="w-5 h-5 rounded-lg flex items-center justify-center cursor-pointer "
          onClick={onClose}
        >
          <LeftOutlined style={{ fontSize: 16 }} />
        </button>
        <div>
          <div className="text-sm font-semibold text-gray-800">{title}</div>
        </div>
      </div>
      <div
        style={{
          border: "1.5px solid #e6f7f0",
          padding: 16,
          borderRadius: 16,
        }}
      >
        <div className=" mx-auto flex flex-col gap-4">
          {/* ── HERO TOP CARD ── */}
          <div
            style={{ padding: 20, ...BorderStyle }}
            className="bg-white rounded-2xl border border-[#dceee3] flex items-center justify-between flex-wrap gap-5 px-6 py-5"
          >
            {/* Profile Left */}
            <div className="flex items-center gap-4 flex-1 ">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-md bg-[#eaf6ec] border-2 border-[#dceee3] flex items-center justify-center text-[#2d6a4f] text-[22px] font-bold shrink-0 tracking-wide">
                {getInitials(editingRecord.driverName)}
              </div>

              <div className="flex flex-col gap-1">
                {/* Name + Status Badge */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className=" text-[#041B3C] tracking-[-0.3px] m-0 leading-tight"
                    style={{ fontWeight: 800, fontSize: 24 }}
                  >
                    {editingRecord.driverName}
                  </h1>
                  <span
                    className={`text-[10px] font-bold tracking-[0.08em] uppercase  rounded-md text-[#166534] ${
                      editingRecord.active ? "bg-[#DCFCE7]" : "bg-gray-400"
                    }`}
                    style={{ padding: 4 }}
                  >
                    {editingRecord.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Employee ID + Role +  Tag */}
                {/* <div className="flex items-center gap-1.5 text-[12.5px] text-[#4a6358] flex-wrap mt-0.5">
                <span>Employee ID: {editingRecord.driver_Id}</span>
                <span className="text-[#b0c8bb]">•</span>
                <span>{employeeRole}</span>
                <span className="bg-[#f9c74f] text-[#6b4e00] text-[11px] font-bold px-1.75 py-0.5 rounded">
                  Driver
                </span>
              </div> */}

                <div className="flex gap-6 flex-wrap" style={{ marginTop: 8 }}>
                  {[
                    { label: "Vendor", value: editingRecord.transporterName },
                    { label: "Base Office", value: editingRecord.locationName },
                    // { label: "Loc Code", value: String(editingRecord.locCode) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold tracking-[0.08em] uppercase text-[#747783]">
                        {label}
                      </span>
                      <span className="text-[13px] text-[#041B3C]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-7 flex flex-col gap-5">
              {/* personal Information */}
              <SectionCard icon={<UserOutlined />} title="Personal Information">
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <Field
                    label="Date of Birth"
                    value={`${formatDate(editingRecord.dob)} (${getAge(editingRecord.dob)})`}
                  />
                  <Field label="Gender" value={editingRecord.gender} />
                  <Field
                    label="Father's Name"
                    value={editingRecord.fatherName}
                  />
                  <Field
                    label="Blood Group"
                    value={editingRecord.bloodGroup}
                    accent
                  />
                  <Field label="Nationality" value={"Indian"} />
                </div>
              </SectionCard>
              {/* communication */}
              <SectionCard
                icon={<PhoneOutlined />}
                title="Communication Details"
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field
                    label="Primary Mobile"
                    value={editingRecord.mobileNo}
                  />
                  <Field
                    label="Alternate Mobile"
                    value={editingRecord.alternateMobileNo}
                  />
                  {/* <div className="col-span-2">
                  <p className="text-[9.5px] font-bold tracking-widest uppercase text-[#7a9688] mb-0.75">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${emailAddress}`}
                    className="text-[13px] font-medium text-[#2d6a4f] hover:underline"
                  >
                    {emailAddress}
                  </a>
                </div> */}
                </div>
              </SectionCard>
              {/* ── RESIDENTIAL ADDRESSES ── */}
              <SectionCard
                icon={<HomeOutlined />}
                title="Residential Addresses"
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field
                    label="Present Address"
                    value={editingRecord.presentAddress}
                  />
                  <Field
                    label="Permanent Address"
                    value={editingRecord.permanentAddress}
                  />
                </div>
              </SectionCard>
            </div>
            <div className="col-span-5  flex flex-col gap-5">
              {/* compliance */}
              <SectionCard icon={<SettingOutlined />} title="Compliance & BGV">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="BGV Date" value={formatDate(bgvDate)} />
                    <Field
                      label="Internal BGV Date"
                      value={formatDate(
                        editingRecord.lastInternalVerificationDate,
                      )}
                    />
                    <Field
                      label="External BGV Date"
                      value={formatDate(
                        editingRecord.externalVerificationExpDate,
                      )}
                    />
                  </div>

                  {/* Police Verification Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 border border-[#dceee3] rounded-lg">
                    <p className="flex justify-between gap-5 items-center  w-full">
                      <span className="text-[12px] font-semibold uppercase text-[#747783]">
                        Police Verification
                      </span>
                      {editingRecord.policeVerificationExpDoc && (
                        <button
                          // href="#"
                          onClick={() =>
                            handleView(editingRecord.policeVerificationExpDoc)
                          }
                          className=" text-[#2d6a4f] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          style={{ fontSize: 10 }}
                        >
                          <EyeOutlined style={{ color: "#2d6a4f" }} />
                          <span className="text-[#2d6a4f]">View License</span>
                        </button>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-[12.5px] text-[#1a2e22]">
                      <span className="text-[15px]">✅</span>
                      <span>
                        Status: Clear&nbsp;•&nbsp;Valid till{" "}
                        {formatDate(editingRecord.policeVerificationExpDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>
              {/* training */}
              <SectionCard icon={<SyncOutlined />} title="Training & Lifecycle">
                <div className="">
                  <p className="text-[12px] font-semibold  uppercase text-[#747783] mb-0.75">
                    Training Status
                  </p>
                  <p className="text-[14px] font-semibold text-[#3E9B73]">
                    {editingRecord.trainingStatus}
                  </p>
                </div>
                <div
                  className="grid grid-cols-2 gap-x-6 gap-y-4"
                  style={{ marginTop: 10 }}
                >
                  <Field
                    label="Induction Date"
                    value={formatDate(editingRecord.inductionDate)}
                  />
                  <Field
                    label="Last Refresh"
                    value={formatDate(editingRecord.lastTrainingDate)}
                  />
                  <div>
                    <p className="text-[12px] font-semibold  uppercase text-[#747783] mb-0.75">
                      Driver Type
                    </p>
                    <div className="flex items-center gap-1.75 mt-0.5">
                      <span className="text-[14px] font-medium text-[#1a2e22]">
                        {editingRecord.driverType}
                      </span>
                    </div>
                  </div>
                  {/* <div>
                    <p className="text-[12px] font-semibold uppercase text-[#747783] mb-0.75">
                      Current Status
                    </p>
                    <Chip
                      label={editingRecord.currentStatus ?? "Unknown"}
                      variant={
                        editingRecord.currentStatus === "Active"
                          ? "green"
                          : "gray"
                      }
                    />
                  </div> */}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ── LICENSE & DOCUMENTS ── */}
          <SectionCard icon={<FileDoneOutlined />} title="License & Documents">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <Field label="License No." value={editingRecord.licenseNo} mono />
              <Field
                label="Issue Date"
                value={formatDate(editingRecord.licenseIssueDate)}
              />
              <Field
                label="Expiry Date"
                value={formatDate(editingRecord.licenseExpDate)}
              />
              <Field
                label="License Authority"
                value={editingRecord.driverLicenceAuthority}
              />
              <Field
                label="Private BGV Exp. Date"
                value={formatDate(editingRecord.privateBGVExpDate)}
              />
              <Field
                label="Ext. Verification Agency"
                value={editingRecord.externalVerificationAgency}
              />
            </div>

            <div
              className="flex items-center flex-wrap gap-3"
              style={{ marginTop: 10 }}
            >
              <span className="text-[12px] font-extrabold uppercase text-[#747783] leading-6.5 mr-1">
                Documents:
              </span>

              <DocLink
                icon="📋"
                label="License Doc"
                doc={editingRecord.licenseExpDoc}
                onClick={() => handleView(editingRecord.licenseExpDoc)}
              />
              <DocLink
                icon="🚔"
                label="Police Verification"
                doc={editingRecord.policeVerificationExpDoc}
                onClick={() =>
                  handleView(editingRecord.policeVerificationExpDoc)
                }
              />
              <DocLink
                icon="🪪"
                label="Govt ID"
                doc={editingRecord.govtIdDoc}
                onClick={() => handleView(editingRecord.govtIdDoc)}
              />
              <DocLink
                icon="📚"
                label="Training Doc"
                doc={editingRecord.lastTrainingDoc}
                onClick={() => handleView(editingRecord.lastTrainingDoc)}
              />
              <DocLink
                icon="🖼️"
                label="Profile Image"
                doc={editingRecord.profileImageDoc}
                onClick={() => handleView(editingRecord.profileImageDoc)}
              />
            </div>
          </SectionCard>

          {/* ── REMARKS (conditional) ── */}
          {editingRecord.remarks && (
            <SectionCard icon="💬" title="Remarks">
              <p className="text-[13.5px] font-medium text-[#1a2e22] leading-relaxed">
                {editingRecord.remarks}
              </p>
            </SectionCard>
          )}
        </div>{" "}
      </div>
    </div>
  );
};
const DocLink: React.FC<DocLinkProps> = ({ icon, label, doc, onClick }) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex justify-center items-center gap-1 bg-[#eaf6ec] border border-[#d8f3dc] text-[#2d6a4f] font-semibold text-[12px]  rounded-md hover:bg-[#d8f3dc] transition-colors duration-150 ${
        !doc ? "opacity-40 pointer-events-none" : " cursor-pointer"
      }`}
      style={{ padding: 2 }}
    >
      {icon} {label}
    </span>
  );
};
export default ViewDriver;

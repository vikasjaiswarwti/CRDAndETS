import {
  Modal,
  Spin,
  Result,
  Tabs,
  Tag,
  Table,
  DatePicker,
  Button,
} from "antd";
import React, { useEffect, useState } from "react";
import type { EmployeeProfile, VehicleDetailResp } from "../types/admin.types";
import {
  useLazyGetUserByIdQuery,
  useLazyGetVehicleByIdQuery,
  useGetUserFilterDataQuery,
  useGetWeeklyOffDataQuery,
  useGetUserShiftDataQuery,
  useGetHelpDeskReportQuery,
} from "../services/adminDashboardApi";
import dayjs, { type Dayjs } from "dayjs";
import { downloadExcel } from "../../../../shared/hooks/useExcelExport";

const { RangePicker } = DatePicker;
import {
  CarOutlined,
  CarryOutOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  IdcardOutlined,
  // MailOutlined,
  PhoneOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { IndividualShift } from "../../../roaster/types/Individualroster.types";

interface Props {
  open: boolean;
  onClose: () => void;
  entityType: "Employee" | "Vehicle" | null;
  entityId: string | number | null;
}

const EntityDetailModal: React.FC<Props> = ({
  open,
  onClose,
  entityType,
  entityId,
}) => {
  const [fetchEmployee, empResult] = useLazyGetUserByIdQuery();
  const [fetchVehicle, vehResult] = useLazyGetVehicleByIdQuery();
  // console.log(entityType, entityId);
  useEffect(() => {
    if (!open || entityId == null || !entityType) return;
    if (entityType === "Employee") fetchEmployee(String(entityId));
    else fetchVehicle(entityId);
  }, [open, entityId, entityType, fetchVehicle, fetchEmployee]); //

  const active = entityType === "Employee" ? empResult : vehResult;

  const renderBody = () => {
    if (active.isFetching)
      return (
        <div style={{ textAlign: "center", padding: 32 }}>
          <Spin />
        </div>
      );

    if (active.isError)
      return <Result status="error" title="Failed to load details" />;

    if (entityType === "Employee" && empResult.data) {
      const emp = empResult.data;
      // console.log(emp);
      return <EmployeeProfileView employee={emp} />;
    }

    if (entityType === "Vehicle" && vehResult.data) {
      const v = vehResult.data;
      return <VehicleDetailsView vehicle={v} />;
    }

    return null;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      title={
        entityType === "Employee" ? (
          <>
            <UserOutlined /> Employee Details
          </>
        ) : (
          <>
            <CarOutlined /> Vehicle Details
          </>
        )
      }
      style={{ top: 30 }}
      destroyOnClose
    >
      {renderBody()}
    </Modal>
  );
};

export default EntityDetailModal;

interface VehicleDetailsViewProps {
  vehicle: VehicleDetailResp;
}

/* ─── shared row ─────────────────────────────────────────── */
const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #f3f4f6",
      gap: 12,
    }}
  >
    <span
      style={{
        color: "#6b7280",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 6,
        minWidth: 140,
      }}
    >
      {icon && <span style={{ color: "#9ca3af" }}>{icon}</span>}
      {label}
    </span>
    <span
      style={{
        fontWeight: 500,
        fontSize: 13,
        textAlign: "right",
        color: "#111827",
        wordBreak: "break-word",
      }}
    >
      {value || "-"}
    </span>
  </div>
);
/* ─── reusable export button ────────────────────────────── */
const ExportExcelButton = <T extends object>({
  data,
  fileName,
  sheetName,
  label = "Download",
}: {
  data: T[];
  fileName: string;
  sheetName: string;
  label?: string;
}) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
    <Button
      size="small"
      icon={<DownloadOutlined />}
      style={{ border: "1px solid" }}
      onClick={() => downloadExcel({ data, fileName, sheetName })}
    >
      {label}
    </Button>
  </div>
);

const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({ vehicle }) => {
  const docs = [
    {
      name: "Registration",
      date: vehicle.registration_Exp_Date,
      url: vehicle.registrationExpiryDate_Doc,
    },
    {
      name: "Insurance",
      date: vehicle.insurance_Expiry_Date,
      url: vehicle.insuranceExpiryDate_Doc,
    },
    {
      name: "Permit",
      date: vehicle.permit_Expiry_Date,
      url: vehicle.permitExpiryDate_Doc,
    },
    {
      name: "Fitness",
      date: vehicle.fitness_Expiry_Date,
      url: vehicle.fitnessExpiryDate_Doc,
    },
    {
      name: "PUC",
      date: vehicle.puc_Expiry_Date,
      url: vehicle.pucExpiryDate_Doc,
    },
  ];

  const isExpired = (date: string) => dayjs(date).isBefore(dayjs());

  const tabs = [
    {
      key: "info",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CarOutlined /> Vehicle Info
        </span>
      ),
      children: (
        <div>
          <DetailRow
            label="Registration No"
            value={vehicle.vehicle_Registration_No}
            icon={<IdcardOutlined />}
          />
          <DetailRow label="Make" value={vehicle.make} />
          <DetailRow label="Model" value={vehicle.model} />
          {/* <DetailRow label="Fuel Type" value={vehicle.fuelTypeName || "-"} /> */}
          <DetailRow label="Chassis No" value={vehicle.chassis_No} />
          <DetailRow
            label="Make Year"
            value={dayjs(vehicle.makeYear).format("YYYY")}
          />
        </div>
      ),
    },
    {
      key: "owner",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <UserOutlined /> Owner
        </span>
      ),
      children: (
        <div>
          <DetailRow
            label="Owner"
            value={vehicle.owner_Name}
            icon={<UserOutlined />}
          />
          <DetailRow label="Owner Type" value={vehicle.owner_Type} />
          <DetailRow
            label="Address"
            value={vehicle.owner_Address}
            icon={<EnvironmentOutlined />}
          />
          <DetailRow
            label="GPS Installed"
            value={
              <Tag color={vehicle.isGpsInstalled ? "green" : "default"}>
                {vehicle.isGpsInstalled ? "Yes" : "No"}
              </Tag>
            }
          />
        </div>
      ),
    },
    {
      key: "docs",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileTextOutlined /> Documents
        </span>
      ),
      children: (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            paddingTop: 4,
          }}
        >
          {docs.map((doc) => {
            const expired = isExpired(doc.date);
            return (
              <div
                key={doc.name}
                style={{
                  border: `1px solid ${expired ? "#fecaca" : "#e5e7eb"}`,
                  borderRadius: 10,
                  padding: 14,
                  background: expired ? "#fef2f2" : "#fff",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  {doc.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: expired ? "#ef4444" : "#6b7280",
                    marginBottom: 10,
                  }}
                >
                  Expiry: {dayjs(doc.date).format("DD MMM YYYY")}
                </div>
                <Tag
                  color={expired ? "red" : "green"}
                  style={{ marginBottom: 8, fontWeight: 600 }}
                >
                  Status : {expired ? "Expired" : "Valid"}
                </Tag>
                {/* <br /> */}
                {/* <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                  View Document ↗
                </a> */}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Avatar header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 0 20px",
          borderBottom: "1px solid #f3f4f6",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#EEEDFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CarOutlined style={{ fontSize: 24, color: "#534AB7" }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            {vehicle.vehicle_Registration_No}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {vehicle.make} · {vehicle.model}
          </div>
          <div style={{ marginTop: 6 }}>
            {/* <Tag color="purple">{vehicle.fuelTypeName || "Unknown Fuel"}</Tag> */}
            {vehicle.isGpsInstalled && <Tag color="green">GPS Installed</Tag>}
          </div>
        </div>
      </div>

      <Tabs items={tabs} size="small" />
    </div>
  );
};
const WEEK_ORDER: string[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const EmployeeProfileView: React.FC<{ employee: EmployeeProfile }> = ({
  employee,
}) => {
  const todayDate = dayjs().format("YYYY-MM-DD");
  const { data: schedule } = useGetUserFilterDataQuery({
    empId: employee.empId,
    dateFrom: todayDate,
    dateTo: todayDate,
  });
  const { data: weeklyOffData } = useGetWeeklyOffDataQuery(employee.empId);
  const { data: shiftData } = useGetUserShiftDataQuery({
    LocCode: employee.locCode,
    EmpId: employee.empId,
  });
  // console.log(shiftData, "shiftData 345");

  const [activeTab, setActiveTab] = useState("personal");
  const [helpDeskRange, setHelpDeskRange] = useState<[Dayjs, Dayjs]>([
    dayjs(),
    dayjs(),
  ]);
  const { data: helpDeskData, isFetching: isHelpDeskFetching } =
    useGetHelpDeskReportQuery({
      EmpID: employee.empId,
      DateFrom: helpDeskRange[0].format("YYYY-MM-DD"),
      DateTo: helpDeskRange[1].format("YYYY-MM-DD"),
    });

  const hasSchedule = schedule && schedule.length > 0;
  const hasWeeklyOff = !!weeklyOffData?.weekOff;

  const sortedWeekOff = weeklyOffData?.weekOff
    ?.split(",")
    .map((day) => day.trim())
    .sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  const fullName =
    `${employee.firstName} ${employee.middleName ?? ""} ${employee.lastName}`.trim();
  const initials =
    `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase();

  const weekOffRow = hasWeeklyOff ? (
    <div className="grid grid-cols-1 gap-6">
      <DetailRow
        label="Week Off"
        value={
          <div className="flex flex-wrap justify-end gap-2">
            {sortedWeekOff?.map((day) => (
              <Tag key={day} color="volcano">
                {day}
              </Tag>
            ))}
          </div>
        }
      />
    </div>
  ) : null;

  const tabs = [
    {
      key: "personal",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <UserOutlined /> Personal
        </span>
      ),
      children: (
        <div>
          <DetailRow
            label="Gender"
            value={
              employee.gender === "M"
                ? "Male"
                : employee.gender === "F"
                  ? "Female"
                  : employee.gender
            }
          />
          <DetailRow
            label="Mobile"
            value={employee.mobileNo}
            icon={<PhoneOutlined />}
          />
          <DetailRow
            label="Emergency Contact"
            value={employee.emercontactNo}
            icon={<PhoneOutlined />}
          />
          <DetailRow
            label="Location"
            value={employee.locationName}
            icon={<EnvironmentOutlined />}
          />
          <DetailRow
            label="Address"
            value={`${employee.address} ${employee.city} ${employee.pin}`}
            icon={<EnvironmentOutlined />}
          />
          <DetailRow
            label="Special Needs"
            value={
              <Tag color={employee.special_Needs ? "orange" : "default"}>
                {employee.special_Needs ? "Yes" : "No"}
              </Tag>
            }
          />
          <DetailRow
            label="Transport Enabled"
            value={
              <Tag color={employee.transport ? "green" : "default"}>
                {employee.transport ? "Yes" : "No"}
              </Tag>
            }
          />
          <DetailRow
            label="Cordinates"
            value={employee.emp_Lat + "," + employee.emp_Lng}
            icon={<EnvironmentOutlined />}
          />
        </div>
      ),
    },
  ];

  if (hasSchedule || hasWeeklyOff || shiftData) {
    tabs.push({
      key: "viewSchedules",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CarryOutOutlined /> Shifts
        </span>
      ),
      children: (
        <div>
          {hasSchedule &&
            schedule.map((entry, index) => (
              <div key={`schedule-entry-${entry.locCode}-${index}`}>
                {/* Office + Date row */}
                {weekOffRow}
              </div>
            ))}

          {/* ── Case 3: Open Shifts card ── */}
          {shiftData && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 14px",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                Open Shifts
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Login Shifts */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginBottom: 6,
                    }}
                  >
                    Login Shifts
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {shiftData.PickShifts?.length > 0 ? (
                      shiftData.PickShifts.map((shift: IndividualShift) => (
                        <Tag
                          key={shift.SHIFTID}
                          color="blue"
                          style={{
                            fontSize: 13,
                            padding: "2px 10px",
                            margin: 0,
                          }}
                        >
                          {shift.SHIFTTIME}
                        </Tag>
                      ))
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
                    )}
                  </div>
                </div>

                {/* Logout Shifts */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginBottom: 6,
                    }}
                  >
                    Logout Shifts
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {shiftData.DropShifts?.length > 0 ? (
                      shiftData.DropShifts.map((shift: IndividualShift) => (
                        <Tag
                          key={shift.SHIFTID}
                          color="volcano"
                          style={{
                            fontSize: 13,
                            padding: "2px 10px",
                            margin: 0,
                          }}
                        >
                          {shift.SHIFTTIME}
                          {shift.DropShift && (
                            <span
                              style={{
                                fontSize: 11,
                                marginLeft: 4,
                                opacity: 0.7,
                              }}
                            >
                              ({shift.DropShift})
                            </span>
                          )}
                        </Tag>
                      ))
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    });
  }

  {
    const scheduleColumns = [
      {
        title: "Schedule Date",
        dataIndex: "scheduleDate",
        key: "scheduleDate",
      },
      { title: "Day", dataIndex: "weekDays", key: "weekDays" },
      { title: "Login", dataIndex: "login", key: "login" },
      { title: "Logout", dataIndex: "logout", key: "logout" },
      {
        title: "Login Status",
        dataIndex: "loginStatus",
        key: "loginStatus",
        render: (val: string) => <Tag color="blue">{val || "-"}</Tag>,
      },
      {
        title: "Logout Status",
        dataIndex: "logoutStatus",
        key: "logoutStatus",
        render: (val: string) => <Tag color="volcano">{val || "-"}</Tag>,
      },
    ];

    tabs.push({
      key: "scheduleReport",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ScheduleOutlined /> Schedule info
        </span>
      ),
      children: (
        <div>
          <Table
            className="help-desk-report-table"
            size="small"
            rowKey={(_, index) => `schedule-${index}`}
            columns={scheduleColumns}
            dataSource={helpDeskData?.scheduledReport || []}
            loading={isHelpDeskFetching}
            pagination={false}
            scroll={{ x: true }}
          />
          {(helpDeskData?.scheduledReport || []).length > 0 && (
            <ExportExcelButton
              data={helpDeskData?.scheduledReport || []}
              fileName={`Schedule_Report_${employee.empId}.xlsx`}
              sheetName="Schedule Report"
            />
          )}
        </div>
      ),
    });
  }

  {
    const tripColumns = [
      { title: "Trip Id", dataIndex: "tripId", key: "tripId" },
      { title: "Vehicle", dataIndex: "vehicle", key: "vehicle" },
      { title: "Driver Name", dataIndex: "driverName", key: "driverName" },
      { title: "Trip Type", dataIndex: "tripType", key: "tripType" },
      { title: "Shift Time", dataIndex: "shiftTime", key: "shiftTime" },
      {
        title: "Trip Status",
        dataIndex: "tripStatus",
        key: "tripStatus",
        render: (val: string) => <Tag color="green">{val || "-"}</Tag>,
      },
      { title: "Trip Date", dataIndex: "tripDate", key: "tripDate" },
      {
        title: "Cancellation Status",
        dataIndex: "cancellationStatus",
        key: "cancellationStatus",
        render: (val: string) => <Tag color="red">{val || "-"}</Tag>,
      },
      {
        title: "Cancellation Date",
        dataIndex: "cancellationTime",
        key: "cancellationTime",
      },
      {
        title: "Reason",
        dataIndex: "cancellationReason",
        key: "cancellationReason",
      },
    ];

    tabs.push({
      key: "tripReport",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CarOutlined /> Route info
        </span>
      ),
      children: (
        <div>
          <Table
            className="help-desk-report-table"
            size="small"
            rowKey={(_, index) => `trip-${index}`}
            columns={tripColumns}
            dataSource={helpDeskData?.tripReport || []}
            loading={isHelpDeskFetching}
            pagination={false}
            scroll={{ x: 1200 }}
          />
          {(helpDeskData?.tripReport || []).length > 0 && (
            <ExportExcelButton
              data={helpDeskData?.tripReport || []}
              fileName={`Trip_Report_${employee.empId}.xlsx`}
              sheetName="Trip Report"
            />
          )}
        </div>
      ),
    });
  }

  {
    const adhocColumns = [
      { title: "Employee ID", dataIndex: "employeeID", key: "employeeID" },
      { title: "User Name", dataIndex: "userName", key: "userName" },
      // { title: "Address", dataIndex: "address", key: "address" },
      { title: "Trip Date", dataIndex: "tripDate", key: "tripDate" },
      { title: "Trip Type", dataIndex: "tripType", key: "tripType" },
      { title: "Shift", dataIndex: "shift", key: "shift" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (val: string) => (
          <Tag color={val === "Pending" ? "orange" : "green"}>{val || "-"}</Tag>
        ),
      },
      // { title: "Action By", dataIndex: "actionBy", key: "actionBy" },
      // { title: "Action On", dataIndex: "actionOn", key: "actionOn" },
      { title: "Requested By", dataIndex: "requestBy", key: "requestBy" },
      { title: "Requested On", dataIndex: "requestedOn", key: "requestedOn" },
    ];

    tabs.push({
      key: "adhocRequestReport",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileTextOutlined /> Adhoc Request
        </span>
      ),
      children: (
        <div>
          <Table
            className="help-desk-report-table"
            size="small"
            rowKey={(_, index) => `adhoc-${index}`}
            columns={adhocColumns}
            dataSource={helpDeskData?.adhocRequestReport || []}
            loading={isHelpDeskFetching}
            pagination={false}
            scroll={{ x: true }}
          />
          {(helpDeskData?.adhocRequestReport || []).length > 0 && (
            <ExportExcelButton
              data={helpDeskData?.adhocRequestReport || []}
              fileName={`Adhoc_Request_Report_${employee.empId}.xlsx`}
              sheetName="Adhoc Request Report"
            />
          )}
        </div>
      ),
    });
  }

  return (
    <div>
      <style>{`
        .help-desk-report-table .ant-table-thead > tr > th,
        .help-desk-report-table .ant-table-tbody > tr > td {
          font-size: 12px;
        }
      `}</style>
      {/* Avatar header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 0 20px",
          borderBottom: "1px solid #f3f4f6",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#E6F1FB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 600,
              color: "#185FA5",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
              {fullName}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {employee.emailId}
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 2 }}>
              <Tag color={employee.isActive ? "green" : "red"}>
                {employee.isActive ? "Active" : "Inactive"}
              </Tag>
              {employee.transport && <Tag color="blue">Transport</Tag>}
            </div>
          </div>
        </div>

        {(activeTab === "scheduleReport" ||
          activeTab === "tripReport" ||
          activeTab === "adhocRequestReport") && (
          <RangePicker
            size="small"
            format="DD MMM YYYY"
            value={helpDeskRange}
            allowClear={false}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setHelpDeskRange([dates[0], dates[1]]);
              }
            }}
          />
        )}
      </div>

      <Tabs
        items={tabs}
        size="small"
        activeKey={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
};

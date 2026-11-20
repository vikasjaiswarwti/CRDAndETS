// src/features/routeManagement/Modals/EmployeeDetailsModal.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { RoutePlanningRow } from "../types/RouteTypes";
import {
  useGetShiftwiseRosterEmployeesQuery,
  useCancelRosterScheduleMutation,
} from "../services/RouteManagementApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import TripTypeBadge from "../../../shared/components/ui/LoginBadge";

import {
  AppTable,
  col,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
const FILTER_STYLES = {
  all: {
    text: "rgb(5, 150, 105)", // emerald-600
    bg: "#D1FAE5", // light green tint
    border: "#6EE7B7",
  },
  adhoc: {
    text: "rgb(194, 65, 12)", // orange-700
    bg: "#FFEDD5", // light orange tint
    border: "#FED7AA",
  },
  male: {
    text: "rgb(59, 130, 246)", // blue-500
    bg: "#DBEAFE", // light blue tint
    border: "#93C5FD",
  },
  female: {
    text: "rgb(236, 72, 153)", // pink-500
    bg: "#FCE7F3", // light pink tint
    border: "#F9A8D4",
  },
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
  row: RoutePlanningRow | null;
}

const Divider = () => (
  <div style={{ width: 1, height: 18, background: "#B7E4C7" }} />
);

const InfoChip = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <span style={{ fontSize: 11, color: "#52796F", fontWeight: 500 }}>
      {label}:
    </span>
    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: accent ? "#166534" : "#1B4332",
        background: accent ? "#DCFCE7" : "transparent",
        padding: accent ? "1px 8px" : 0,
        borderRadius: accent ? 999 : 0,
        border: accent ? "1px solid #86EFAC" : "none",
      }}
    >
      {value}
    </span>
  </div>
);

export const EmployeeDetailsModal: React.FC<Props> = ({
  open,
  onClose,
  row,
}) => {
  // console.log("selectedEmployeeRow from employee detail modal", row);

  const { Modal, Popconfirm } = useUILibrary();
  const filters = useSelector((s: RootState) => s.routeManagementUi.filters);
  const locCode = Number(filters.officeId) || 0;

  const {
    data,
    isLoading,
    isError,
    refetch: refetchEmployees,
  } = useGetShiftwiseRosterEmployeesQuery(
    {
      locCode,
      shiftId: row?.shiftId ?? 0,
      tripType: row?.loginType === "Login" ? 1 : 2,
      tripDate: filters.date,
    },
    { skip: !open || !row },
  );

  // console.log("data from employee", row);

  const [cancelSchedule] = useCancelRosterScheduleMutation();

  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterMode, setFilterMode] = useState<
    "all" | "adhoc" | "male" | "female"
  >("all");

  const tripType = row?.loginType === "Login" ? 1 : 2;

  const handleCancelEmployee = async (empId: number) => {
    setCancellingId(empId);
    setStatusMsg(null);
    try {
      await cancelSchedule({
        LocCode: locCode,
        Empid: empId,
        ScheduleDate: filters.date,
        TripType: tripType,
        ScheduleCancelVersion: "WEB",
      }).unwrap();

      // Explicit refetch of employee list
      refetchEmployees();

      // Routing dashboard auto-refetches via invalidatesTags: ["RouteManagement"]
      // (both getShiftwiseRosterEmployees and getRouteManagementData provide that tag)

      setStatusMsg({
        type: "success",
        text: "Employee roster cancelled successfully.",
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.data?.message ?? "Cancellation failed. Please try again.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const counts = useMemo(() => {
    const list = data?.employees ?? [];
    return {
      all: list.length,
      adhoc: list.filter((e: any) => e.isAdhoc).length,
      male: list.filter((e: any) => e.gender === "M").length,
      female: list.filter((e: any) => e.gender === "F").length,
    };
  }, [data?.employees]);

  const filteredEmployees = useMemo(() => {
    const list = data?.employees ?? [];
    const query = searchText.trim().toLowerCase();

    return list.filter((emp: any) => {
      // Adhoc toggle
      if (filterMode === "adhoc" && !emp.isAdhoc) return false;
      if (filterMode === "male" && emp.gender !== "M") return false;
      if (filterMode === "female" && emp.gender !== "F") return false;

      // Search across multiple fields
      if (!query) return true;

      const haystack = [
        emp.employeeName,
        emp.employeeId,
        emp.pickupLocation,
        emp.dropLocation,
        emp.mobileNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data?.employees, searchText, filterMode]);

  // ← ADD THIS
  useEffect(() => {
    if (!statusMsg) return;
    const timer = setTimeout(() => setStatusMsg(null), 2500);
    return () => clearTimeout(timer);
  }, [statusMsg]);

  const empColumns = useMemo(
    () =>
      buildColumns<any>([
        {
          key: "sno",
          title: "S.No",
          dataIndex: "empId",
          width: 100,
          render: (_: any, __: any, index: number) => (
            <span style={{ color: "#6B7280", fontSize: 12 }}>{index + 1}</span>
          ),
        },
        col.text("employeeId" as any, "Employee Id", {
          width: 100,
          render: (val: any) =>
            val?.trim() ? (
              <span style={{ fontSize: 12 }}>{val}</span>
            ) : (
              <span
                style={{ color: "#9CA3AF", fontStyle: "italic", fontSize: 11 }}
              >
                Not Added
              </span>
            ),
        }),
        col.text("employeeName" as any, "Name", {
          width: 160,
          render: (val: any, emp: any) => (
            <span style={{ fontWeight: 600, fontSize: 12 }}>
              {val}
              {emp.isAdhoc && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#C2410C",
                    background: "#FFEDD5",
                    border: "1px solid #FED7AA",
                    borderRadius: 4,
                    padding: "1px 5px",
                    verticalAlign: "middle",
                  }}
                >
                  ADHOC
                </span>
              )}
            </span>
          ),
        }),
        col.text("mobileNumber" as any, "Phone", { width: 110 }),
        col.text("gender" as any, "Gender", { width: 70 }),
        col.text("actualOffice" as any, "Actual Office", { width: 130 }),
        col.text("pickupLocation" as any, "Pickup Location", {
          width: tripType === 1 ? 500 : 200,
        }),
        col.text("dropLocation" as any, "Drop Location", {
          width: tripType === 1 ? 200 : 500,
        }),
        {
          key: "action",
          title: "Action",
          dataIndex: "empId",
          width: 80,
          fixed: "right" as const,
          align: "center" as const,
          render: (_: any, emp: any, index: number) => {
            const empId = Number(emp.empId);
            const isBusy = cancellingId === empId;
            // const totalRows = data?.employees?.length ?? 0;
            const totalRows = filteredEmployees.length;
            const placement =
              index >= totalRows - 2 ? "topRight" : "bottomRight";

            const routesGenerated = row?.isRouteGenerated ?? false;

            // ── Routes already generated → cancel locked ──────────────────────────
            if (routesGenerated) {
              return (
                <button
                  disabled
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1.5px solid #E5E7EB",
                    background: "#F9FAFB",
                    color: "#9CA3AF",
                    cursor: "not-allowed",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  {/* lock icon */}
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </button>
              );
            }

            return (
              <Popconfirm
                title={
                  <span
                    style={{ fontWeight: 700, fontSize: 13, color: "#991B1B" }}
                  >
                    Cancel {emp.employeeName}'s roster?
                  </span>
                }
                description={
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      lineHeight: 1.55,
                      maxWidth: 240,
                    }}
                  >
                    Will remove them from{" "}
                    <strong style={{ color: "#374151" }}>
                      {row?.shiftTime} {row?.loginType}
                    </strong>{" "}
                    shift. They will{" "}
                    <strong style={{ color: "#374151" }}>
                      not be included in routing
                    </strong>
                    . Make sure you want to cancel.
                  </div>
                }
                onConfirm={() => handleCancelEmployee(empId)}
                okText="Yes, Cancel"
                cancelText="Keep"
                okButtonProps={{ danger: true, loading: isBusy }}
                placement={placement}
                icon={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginTop: 2 }}
                  >
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      fill="#FEE2E2"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="12"
                      y1="9"
                      x2="12"
                      y2="13"
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="17" r="1" fill="#DC2626" />
                  </svg>
                }
              >
                <button
                  disabled={isBusy}
                  title="Cancel this employee's roster"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1.5px solid #FECACA",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </Popconfirm>
            );
          },
        },
      ]),
    [
      cancellingId,
      // data?.employees?.length,
      filteredEmployees.length,
      row?.shiftTime,
      row?.loginType,
      handleCancelEmployee,
      tripType,
    ],
  );

  if (!row) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
      maskClosable={false} // ← ADD
      styles={{
        mask: { background: "rgba(0,60,30,0.35)" },
        header: { borderBottom: "none" },
        body: { padding: "12px 16px" }, // ← tighter padding
      }}
      style={{ borderRadius: 16, top: 20 }}
    >
      {/* ── Info bar ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 0 10px",
          borderBottom: "1px solid #E9F5EE",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1B4332",
            letterSpacing: "-0.01em",
          }}
        >
          Employee Details
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "60%",
          }}
        >
          {/* Search input */}
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="searchText"
              placeholder="Search name, id, phone, location..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px 6px 30px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #D1D5DB",
                outline: "none",
              }}
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter tabs with badges */}
          <div
            style={{
              display: "flex",
              border: "1px solid #D1D5DB",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {(
              [
                { key: "all", label: "All", count: counts.all, icon: null },
                {
                  key: "adhoc",
                  label: "Adhoc",
                  count: counts.adhoc,
                  icon: null,
                },
                { key: "male", label: "M", count: counts.male, icon: "male" },
                {
                  key: "female",
                  label: "F",
                  count: counts.female,
                  icon: "female",
                },
              ] as const
            ).map(({ key, label, count, icon }, i, arr) => {
              const styleSet = FILTER_STYLES[key];
              const isActive = filterMode === key;
              // male/female act as a toggle switch back to "all" when clicked again
              const isSwitchable = key === "male" || key === "female";

              return (
                <button
                  key={key}
                  onClick={() =>
                    setFilterMode(isSwitchable && isActive ? "all" : key)
                  }
                  title={
                    key === "male"
                      ? "Male"
                      : key === "female"
                        ? "Female"
                        : undefined
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                    borderRight:
                      i < arr.length - 1 ? "1px solid #D1D5DB" : "none",
                    cursor: "pointer",
                    background: isActive ? styleSet.bg : "#fff",
                    color: isActive ? styleSet.text : "#374151",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {icon === "male" && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isActive ? styleSet.text : "#9CA3AF"}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="10" cy="14" r="6" />
                      <path d="M14.5 9.5L20 4M20 4h-5M20 4v5" />
                    </svg>
                  )}
                  {icon === "female" && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isActive ? styleSet.text : "#9CA3AF"}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="9" r="6" />
                      <path d="M12 15v6M9 18h6" />
                    </svg>
                  )}
                  {label}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 16,
                      height: 16,
                      padding: "0 4px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive ? "#fff" : "#F3F4F6",
                      color: isActive ? styleSet.text : "#6B7280",
                      border: isActive
                        ? `1px solid ${styleSet.border}`
                        : "none",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",

            border: "1px solid #B7E4C7",
            borderRadius: 999,
          }}
        >
          <InfoChip label="Shift" value={row.shiftTime} />
          <Divider />
          <TripTypeBadge
            type={row.tripType === 2 ? "Logout" : "Login"}
            size={70}
          />
        </div>
      </div>

      <div style={{ height: 420, overflowY: "auto", overflowX: "auto" }}>
        {/* Status message */}
        {statusMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              marginBottom: 8,
              background: statusMsg.type === "success" ? "#F0FDF4" : "#FEF2F2",
              border: `1px solid ${statusMsg.type === "success" ? "#86EFAC" : "#FECACA"}`,
              color: statusMsg.type === "success" ? "#166534" : "#991B1B",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {statusMsg.type === "success" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#22C55E" />
                <path
                  d="M8 12.5L10.8 15.3L16.5 9.6"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#EF4444" />
                <path
                  d="M15 9L9 15M9 9l6 6"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {statusMsg.text}
            {/* <button
              onClick={() => setStatusMsg(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button> */}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            style={{
              padding: 16,
              background: "#FEF2F2",
              borderRadius: 8,
              color: "#991B1B",
            }}
          >
            Failed to load employee data.
          </div>
        )}

        {/* AppTable — sticky action col + horizontal scroll */}
        <AppTable
          columns={empColumns}
          dataSource={filteredEmployees} //{data?.employees ?? []}
          rowKey={(emp: any) => String(emp.empId)}
          loading={isLoading}
          scroll={{ x: 1120, y: 360 }}
          density="compact"
          sticky
        />
      </div>
    </Modal>
  );
};

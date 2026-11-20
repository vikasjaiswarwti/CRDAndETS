import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import {
  Phone,
  MapPin,
  Building2,
  Siren,
  // LogIn,
  // LogOut,
  Navigation,
  Shield,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { T } from "../constants/Designtokens";
import type {
  Alert,
  TripPassenger,
  TripResponse,
  // TripDetails,
} from "../types/Security.types";
import {
  useAcknowledgeAlertMutation,
  useResolveAlertMutation,
} from "../services/securityApi";
import { Button, Tooltip, message } from "antd";
import { redirectToRouteTracking } from "../../../shared/customHooks/useRedirectToTrack";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { selectAuthLoading } from "../../auth/slices/authSlice";
import { useGetCurrentUserQuery } from "../../auth/services/authApi";
import { useGetGlobalUserQuery } from "../../profile/services/profileApi";

import TripTypeBadge from "../../../shared/components/ui/LoginBadge";
import RemarkCell from "./RemarkCell";
import { useGetTrackingStatusQuery } from "../../route-tracking/services/routeTrackingApi";
import {
  formatDateTimeWithoutYear,
  formatTime,
} from "../../route-tracking/utils/commonFunction";

interface Props {
  alert: Alert | null;
  onClose: () => void;
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 6px",
  color: "#94A3B8",
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: "0.03em",
  borderBottom: "1px solid #E2E8F0",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 6px",
  borderBottom: "1px solid #F1F5F9",
};

const Pill: React.FC<{
  bg: string;
  color: string;
  border: string;
  children: React.ReactNode;
}> = ({ bg, color, border, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 10.5,
      fontWeight: 600,
      color,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 999,
      padding: "2px 8px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

interface AlertModalProps {
  alert: Alert;
  tripData?: TripResponse | null;
  open: boolean;
  onCancel: () => void;
  onSubmit: (remarks: string) => void;
  submitLoading?: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div
    style={{
      border: "1px solid #E2E8F0",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
    }}
  >
    <div
      style={{
        background: "#F8FAFC",
        borderBottom: "1px solid #E2E8F0",
        padding: "8px 14px",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94A3B8",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ background: "#fff", padding: "12px 14px" }}>{children}</div>
  </div>
);

export const AlertModal: React.FC<AlertModalProps> = ({
  alert,
  tripData,
  open,
  onCancel,
  onSubmit,
  submitLoading = false,
}) => {
  const { Modal } = useUILibrary();
  const [remarks, setRemarks] = useState("");
  const isLogin = tripData?.tripTypeCode === 1;

  const handleSubmit = () => {
    if (!remarks.trim()) return;
    onSubmit(remarks.trim());
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
            {alert.alertTypeName}
          </div>
          <span style={{ color: "#CBD5E1" }}>•</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#64748B" }}>
            Trip ID {alert.dsId ?? "N/A"}
          </span>
          <div style={{ marginLeft: "auto", marginRight: 24 }}>
            <TripTypeBadge type={isLogin ? "Login" : "Logout"} size={60} />
          </div>
        </div>
      }
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "2px 0",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#475569",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!remarks.trim() || submitLoading}
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              border: "none",
              background:
                !remarks.trim() || submitLoading ? "#CBD5E1" : "#2563EB",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              cursor:
                !remarks.trim() || submitLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.15s",
            }}
          >
            <Shield size={13} />
            {submitLoading ? "Submitting…" : "Submit Response"}
          </button>
        </div>
      }
      width={680}
      centered
      destroyOnClose
      maskClosable={false}
      styles={{
        body: { padding: "12px 16px", maxHeight: "85vh", overflowY: "auto" },
        header: { padding: "12px 16px", borderBottom: "1px solid #F1F5F9" },
        footer: { padding: "10px 16px", borderTop: "1px solid #F1F5F9" },
      }}
    >
      {/* ── Alert Details ── */}
      <Section title="ALERT DETAILS">
        <InfoRow label="Type" value={alert.alertTypeName} />
        <InfoRow label="Module" value={alert.moduleName} />
        <InfoRow label="Message" value={alert.message} />
        {/* <InfoRow
          label="Mobile"
          value={
            <a
              href={`tel:${alert.mobileNumber}`}
              style={{
                color: "#1E293B",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  justifyContent: "flex-end",
                }}
              >
                {alert.mobileNumber}
                <Phone size={12} color="#16A34A" />
              </span>
            </a>
          }
        /> */}
      </Section>

      {/* ── Passenger Info ── */}
      {tripData && tripData.passengers?.length > 0 && (
        <Section title={`PASSENGERS (${tripData.passengers.length})`}>
          <div>
            {tripData.passengers.map((p) => (
              <div
                key={p.empId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                  fontSize: 12.5,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#334155",
                    fontWeight: 500,
                  }}
                >
                  {p.firstname}
                  {p.empId === alert.empId && (
                    <Siren size={12} color="#DC2626" />
                  )}
                </div>

                <a
                  href={`tel:${p.mobileno}`}
                  style={{
                    color: "#334155",
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {p.mobileno}
                  <Phone size={12} color="#16A34A" />
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Manager Response ── */}
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: "#94A3B8",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        MANAGER RESPONSE
      </div>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Enter your response or remarks about this alert…"
        rows={2}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 10px",
          fontSize: 12.5,
          color: "#1E293B",
          border: "1px solid #E2E8F0",
          borderRadius: 8,
          resize: "vertical",
          outline: "none",
          fontFamily: "inherit",
          lineHeight: 1.5,
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
      />
    </Modal>
  );
};

const InfoRow: React.FC<{
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      alignItems: "center",
      marginBottom: 6,
      fontSize: 12.5,
    }}
  >
    <span
      style={{
        color: "#64748B",
        display: "flex",
        alignItems: "center",
        gap: 5,
        minWidth: 70,
      }}
    >
      {icon}
      {label}
    </span>
    <span
      style={{
        fontWeight: 600,
        color: "#1E293B",
        textAlign: "right",
        flex: 1,
      }}
    >
      {value ?? <span style={{ color: "#CBD5E1" }}>—</span>}
    </span>
  </div>
);

export const RightSecurityPanel: React.FC<Props> = ({ alert, onClose }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: user } = useGetCurrentUserQuery();
  const authLoading = useSelector(selectAuthLoading);
  const { data: profile, refetch } = useGetGlobalUserQuery(
    user?.id ?? skipToken,
  );

  useEffect(() => {
    if (user?.id) refetch();
  }, [user?.id, authLoading]);

  const [acknowledgeAlert, { isLoading: isAcking }] =
    useAcknowledgeAlertMutation();
  const [resolveAlert, { isLoading: isResolving }] = useResolveAlertMutation();
  const { data, isLoading } = useGetTrackingStatusQuery(
    { DsId: String(alert?.dsId) },
    {
      skip: !alert,
    },
  );
  if (!alert) return null;

  const handleAcknowledge = async () => {
    if (!profile?.user_Id) {
      message.error("Unable to acknowledge: user profile not loaded.");
      return;
    }
    try {
      await acknowledgeAlert({
        alertId: alert.alertId,
        actionBy: profile.user_Id,
      }).unwrap();
      message.success("Alert acknowledged successfully.");
    } catch (err: any) {
      message.error(
        err?.data?.message ?? "Failed to acknowledge alert. Please try again.",
      );
    }
  };

  const handleResolve = async (remarks: string) => {
    if (!profile?.user_Id) {
      message.error("Unable to resolve: user profile not loaded.");
      return;
    }
    try {
      await resolveAlert({
        alertId: alert.alertId,
        actionBy: profile.user_Id,
        remarks,
      }).unwrap();
      message.success("Alert resolved successfully.");
      setModalOpen(false);
    } catch (err: any) {
      message.error(
        err?.data?.message ?? "Failed to resolve alert. Please try again.",
      );
    }
  };

  const isLoginTrip = data?.tripTypeCode === 1;

  // ── One consolidated header for every state (loading / not-found / main) ──
  const PanelShell = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        width: 360,
        minWidth: 360,
        height: "100%",
        background: "#F8FAFC",
        borderLeft: `1px solid ${T.border}`,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${T.border}`,
          padding: "10px 12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 600,
                color: "#0F172A",
                lineHeight: 1.3,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "#475569",
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: 999,
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                Trip ID-{alert.dsId ?? "N/A"}
              </span>
              <span>{alert.alertTypeName}</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 10,
              }}
            >
              {data?.isTripFound && (
                <TripTypeBadge
                  type={isLoginTrip ? "Login" : "Logout"}
                  size={60}
                />
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 5,
                }}
              >
                <Pill bg={`${T.danger}22`} color={T.danger} border={T.danger}>
                  {alert.priorityName}
                </Pill>
                <Pill
                  bg={alert.isResolved ? "#E8F5E9" : "#FDECEC"}
                  color={alert.isResolved ? "#2E7D32" : "#D32F2F"}
                  border={alert.isResolved ? "#A5D6A7" : "#F5B5B5"}
                >
                  {alert.isResolved ? "Resolved" : "Unresolved"}
                </Pill>
                <Pill
                  bg={alert.isAcknowledged ? "#E8F5E9" : "#FFF8E1"}
                  color={alert.isAcknowledged ? "#2E7D32" : "#B45309"}
                  border={alert.isAcknowledged ? "#A5D6A7" : "#FDE68A"}
                >
                  {alert.isAcknowledged ? "Acknowledged" : "Pending"}
                </Pill>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#94A3B8",
              fontSize: 18,
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {children}
    </div>
  );

  // ── Loading State ──
  if (isLoading) {
    return (
      <PanelShell>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            minHeight: 250,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "3px solid #E2E8F0",
              borderTopColor: "#16A34A",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: "80%",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[100, 75, 60, 85, 50].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 12,
                  width: `${w}%`,
                  borderRadius: 6,
                  background:
                    "linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
          <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
            Fetching trip details…
          </span>
        </div>
      </PanelShell>
    );
  }

  // ── Not Found State ──
  if (!data?.dsId) {
    return (
      <PanelShell>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 250,
            color: "#6B7280",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Trip details not found.
        </div>
      </PanelShell>
    );
  }

  const passengers = data?.passengers ?? [];

  return (
    <>
      <PanelShell>
        {/* Main Card */}
        <div
          style={{
            margin: 8,
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Location + schedule */}
          <div style={{ padding: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Building2
                size={15}
                color="#16A34A"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
                {data?.officeDisplayName ?? "N/A"}
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <TripInfoRow
                label="Schedule Start"
                value={`${formatDateTimeWithoutYear(data?.scheduledStartTime) ?? "N/A"}`}
              />
              <TripInfoRow
                label="Schedule End"
                value={`${formatDateTimeWithoutYear(data?.scheduledEndTime) ?? "N/A"}`}
              />
              <TripInfoRow
                label="Actual Start Time"
                value={`${data?.actualStartTime != null ? (formatDateTimeWithoutYear(data?.actualStartTime) ?? "-") : "-"}`}
              />
              <TripInfoRow
                label="Actual End Time"
                value={`${data?.actualEndTime != null ? (formatDateTimeWithoutYear(data?.actualEndTime) ?? "-") : "-"}`}
              />
            </div>
          </div>

          {(alert.isAcknowledged || alert.isResolved) && (
            <div
              style={{
                margin: "10px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 10,
                padding: "10px",
              }}
            >
              {/* Resolution info — each action gets its own clearly separated block */}
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  fontSize: 11,
                }}
              >
                <colgroup>
                  <col style={{ width: "38%" }} />
                  <col style={{ width: "32%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={thStyle}>STATUS</th>
                    <th style={thStyle}>Done BY</th>
                    <th style={thStyle}> ON</th>
                  </tr>
                </thead>
                <tbody>
                  {alert.isAcknowledged && (
                    <>
                      <tr>
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: "#16A34A",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <CheckCircle2 size={12} style={{ flexShrink: 0 }} />{" "}
                            Acknowledged
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "#1E293B",
                            fontWeight: 600,
                          }}
                        >
                          <Tooltip title={alert.acknowledgedByName ?? "—"}>
                            <span
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {alert.acknowledgedByName ?? "—"}
                            </span>
                          </Tooltip>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "#64748B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {alert.acknowledgedOn
                            ? new Date(alert.acknowledgedOn).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                      {/* {alert.acknowledgedNote && (
                        <tr>
                          <td
                            style={{
                              ...tdStyle,
                              color: "#64748B",
                              fontWeight: 600,
                              verticalAlign: "top",
                            }}
                          >
                            Remark
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              padding: "5px 6px 8px",
                              borderBottom: "1px solid #F1F5F9",
                              color: "#334155",
                              fontStyle: "italic",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            “{alert.acknowledgedNote}”
                          </td>
                        </tr>
                      )} */}
                      {alert.acknowledgedNote && (
                        <tr>
                          <td
                            style={{
                              ...tdStyle,
                              color: "#64748B",
                              fontWeight: 600,
                              verticalAlign: "top",
                            }}
                          >
                            Remark
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              padding: "5px 6px 8px",
                              borderBottom: "1px solid #F1F5F9",
                              color: "#334155",
                              fontStyle: "italic",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            <RemarkCell text={alert.acknowledgedNote} />
                          </td>
                        </tr>
                      )}
                    </>
                  )}

                  {alert.isResolved && (
                    <>
                      <tr>
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: "#2563EB",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <CheckCircle2 size={12} style={{ flexShrink: 0 }} />{" "}
                            Resolved
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "#1E293B",
                            fontWeight: 600,
                          }}
                        >
                          <Tooltip title={alert.resolvedByName ?? "—"}>
                            <span
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {alert.resolvedByName ?? "—"}
                            </span>
                          </Tooltip>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "#64748B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {alert.resolvedOn
                            ? new Date(alert.resolvedOn).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                      {alert.resolvedNote && (
                        <tr>
                          <td
                            style={{
                              ...tdStyle,
                              color: "#64748B",
                              fontWeight: 600,
                              verticalAlign: "top",
                            }}
                          >
                            Remark
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              padding: "5px 6px 8px",
                              color: "#334155",
                              fontStyle: "italic",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            <RemarkCell text={alert.resolvedNote} />
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Passenger Header */}
          <div
            style={{
              borderTop: "1px solid #E2E8F0",
              background: "#F8FAFC",
              padding: "8px 10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "0.03em",
              }}
            >
              PASSENGERS
            </span>
            <span style={{ fontSize: 11, color: "#64748B" }}>
              Pax: {data?.totalPax}
            </span>
          </div>

          {/* Passenger list — capped height, scrolls once it overflows (7+ passengers) */}
          {passengers.length > 0 && (
            <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {passengers.map((passenger: TripPassenger) => {
                const isAlertPassenger = passenger.empId == alert.empId;

                return (
                  <div
                    key={passenger.empId}
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: "#334155",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {passenger.firstname} {passenger.lastName}
                        </span>
                        {isAlertPassenger && (
                          <Siren
                            size={13}
                            style={{ color: "red", flexShrink: 0 }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 10.5, color: "#94A3B8" }}>
                          #{passenger.empId}
                        </span>
                        <Tooltip title={passenger.address} placement="left">
                          <MapPin size={13} color="#DC2626" />
                        </Tooltip>
                        <Tooltip title={passenger.mobileno} placement="left">
                          <Phone
                            size={13}
                            color="#16A34A"
                            style={{ cursor: "pointer" }}
                          />
                        </Tooltip>
                      </div>
                    </div>

                    {isAlertPassenger && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr 1fr",
                          gap: "5px",
                          // marginTop: 8,
                          paddingTop: 5,
                          borderTop: "1px dashed #E2E8F0",
                        }}
                      >
                        {[
                          ["Sign in", passenger.empSigninTime],
                          ["Sign out", passenger.empSignOutTime],
                          ["Cab reached", passenger.cabReachedTime],
                          ["Reached home", passenger.reachedHomeTime],
                        ].map(([label, time]) => (
                          <div key={label} style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#94A3B8",
                                marginBottom: 1,
                              }}
                            >
                              {label}
                            </div>
                            <div
                              style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                color: "#475569",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {time ? formatTime(time) : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Track Link */}
        <div
          style={{
            padding: "0 12px 8px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            onClick={() => redirectToRouteTracking(data?.dsId)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "#2563EB",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 999,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            <Navigation size={13} />
            Track this trip
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: "0 12px 12px", display: "flex", gap: 8 }}>
          <Tooltip
            title={
              alert.isAcknowledged
                ? "Already acknowledged"
                : "Acknowledge this alert"
            }
            placement="top"
          >
            <Button
              onClick={handleAcknowledge}
              loading={isAcking}
              disabled={!profile?.user_Id || alert.isAcknowledged}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: alert.isAcknowledged ? "#16A34A" : "#B45309",
                background: alert.isAcknowledged ? "#F0FDF4" : "#FFFBEB",
                border: `1px solid ${alert.isAcknowledged ? "#BBF7D0" : "#FDE68A"}`,
                fontWeight: 600,
              }}
            >
              {alert.isAcknowledged ? (
                <CheckCircle2 size={14} />
              ) : (
                <Clock size={14} />
              )}
              {alert.isAcknowledged ? "Acknowledged" : "Acknowledge"}
            </Button>
          </Tooltip>

          <Tooltip
            title={
              alert.isResolved
                ? "Already resolved"
                : "Mark this alert as resolved"
            }
            placement="top"
          >
            <Button
              onClick={() => setModalOpen(true)}
              disabled={alert.isResolved}
              onMouseEnter={(e) => {
                if (!alert.isResolved)
                  e.currentTarget.style.background = "#1D4ED8";
              }}
              onMouseLeave={(e) => {
                if (!alert.isResolved)
                  e.currentTarget.style.background = "#2563EB";
              }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: alert.isResolved ? "#F0FDF4" : "#2563EB",
                borderColor: alert.isResolved ? "#BBF7D0" : "#2563EB",
                color: alert.isResolved ? "#16A34A" : "#fff",
                fontWeight: 600,
                transition: "background 0.15s",
              }}
            >
              <CheckCircle2 size={14} />
              {alert.isResolved ? "Resolved" : "Resolve"}
            </Button>
          </Tooltip>
        </div>
      </PanelShell>

      <AlertModal
        alert={alert}
        tripData={data}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleResolve}
        submitLoading={isResolving}
      />
    </>
  );
};

interface TripInfoRowProps {
  label: string;
  value?: string | React.ReactNode;
}

const TripInfoRow: React.FC<TripInfoRowProps> = ({ label, value }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
      <span
        style={{
          fontSize: 11.5,
          color: "#64748B",
          fontWeight: 600,
        }}
      >
        {value ?? "-"}
      </span>
    </div>
  );
};
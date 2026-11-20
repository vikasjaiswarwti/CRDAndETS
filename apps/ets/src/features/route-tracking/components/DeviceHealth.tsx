import React, { useState } from "react";
import {
  MobileOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  FilterOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGetDeviceHealthQuery } from "../services/routeTrackingApi";
import type { DeviceHealthLog } from "../types/tracking.types";

// ── Constants ─────────────────────────────────────────────────

const COL = "1fr 1fr 1fr 1fr 1fr ";
//           Time  Coords  Bat  Speed Net  Status

type EventKey =
  | "all"
  | "gpsLoss"
  | "networkLoss"
  | "isMocked"
  | "unhealthy"
  | "lowBattery"
  | "overspeed"
  | "isHasInternet"
  | "onCall"
  | "onCharging";

interface EventOption {
  key: EventKey;
  label: string;
  icon: React.ReactNode;
  match: (log: DeviceHealthLog) => boolean;
}

const EVENT_OPTIONS: EventOption[] = [
  {
    key: "all",
    label: "All Logs",
    icon: <FilterOutlined />,
    match: () => true,
  },
  {
    key: "gpsLoss",
    label: "GPS Loss",
    icon: <EnvironmentOutlined />,
    match: (l) => l.gpsLoss,
  },
  {
    key: "networkLoss",
    label: "Network Loss",
    icon: <WifiOutlined />,
    match: (l) => l.networkLoss,
  },
  {
    key: "isMocked",
    label: "Mocked GPS",
    icon: <ApiOutlined />,
    match: (l) => l.isMocked,
  },
  {
    key: "unhealthy",
    label: "Unhealthy Device",
    icon: <MobileOutlined />,
    match: (l) => l.deviceHealth !== "Healthy",
  },
  {
    key: "lowBattery",
    label: "Low Battery (≤20%)",
    icon: <ThunderboltOutlined />,
    match: (l) => l.batteryPercentage <= 20,
  },
  {
    key: "overspeed",
    label: "Overspeed (>60 km/h)",
    icon: <ThunderboltOutlined />,
    match: (l) => l.speed > 60,
  },
  {
    key: "isHasInternet",
    label: "No Internet",
    icon: <WifiOutlined />,
    match: (l) => !l.isHasInternet,
  },
  {
    key: "onCall",
    label: "On Call",
    icon: <MobileOutlined />,
    match: (l) => l.onCall,
  },
  {
    key: "onCharging",
    label: "Charging",
    icon: <ThunderboltOutlined />,
    match: (l) => l.onCharging,
  },
];

// ── Types ─────────────────────────────────────────────────────

interface DeviceHealthModalProps {
  open: boolean;
  onClose: () => void;
  dsid: number;
  isCompleted?: boolean;
}

// ── Component ─────────────────────────────────────────────────

const DeviceHealthModal: React.FC<DeviceHealthModalProps> = ({
  open,
  onClose,
  dsid,
  isCompleted = false,
}) => {
  const { Modal, Select, Spin } = useUILibrary();
  const [selectedEvent, setSelectedEvent] = useState<EventKey>("all");

  // TODO: swap to real query when API is live
  const {
    data,
    isLoading,
    //  isError
  } = useGetDeviceHealthQuery(
    { dsid },
    { pollingInterval: isCompleted ? 0 : 20000, skip: !open },
  );
  const logs: DeviceHealthLog[] = data ?? [];

  const activeOption = EVENT_OPTIONS.find((o) => o.key === selectedEvent)!;
  const filteredLogs = logs?.filter(activeOption.match);

  const getCount = (opt: EventOption) =>
    opt.key === "all" ? logs.length : logs.filter(opt.match).length;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Device Health"
      width={780}
      destroyOnClose
      style={{ top: 25 }}
      footer={null}
      styles={{
        header: { borderBottom: "none", paddingBottom: 0 },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        body: { paddingTop: 8, height: "80vh", overflowY: "auto" },
      }}
    >
      {/* ── Filter row ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingInline: "2px",
          gap: 12,
        }}
      >
        <Select
          value={selectedEvent}
          onChange={(val: EventKey) => setSelectedEvent(val)}
          style={{ width: 230, background: "#f3f4f6" }}
          size="middle"
          options={EVENT_OPTIONS.map((opt) => ({
            value: opt.key,
            label: (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#64748b" }}>{opt.icon}</span>
                {opt.label}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    background:
                      getCount(opt) > 0 && opt.key !== "all"
                        ? "#fee2e2"
                        : "#f1f5f9",
                    color:
                      getCount(opt) > 0 && opt.key !== "all"
                        ? "#b91c1c"
                        : "#64748b",
                    borderRadius: 99,
                    padding: "1px 6px",
                    fontWeight: 600,
                  }}
                >
                  {getCount(opt)}
                </span>
              </span>
            ),
          }))}
        />

        <p
          style={{ fontSize: 12, fontWeight: 600, color: "#475569", margin: 0 }}
        >
          {selectedEvent === "all"
            ? `Showing all ${filteredLogs.length} logs`
            : `${activeOption.label} — ${filteredLogs.length} of ${logs.length} logs`}
        </p>
      </div>
      {/* ── Loading state ────────────────────────────────────── */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0",
            gap: 12,
            color: "#64748b",
            fontSize: 13,
          }}
        >
          <Spin size="large" />
          <span>Loading device health logs…</span>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {filteredLogs.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          No logs match <strong>{activeOption.label}</strong> for this trip.
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────── */}
      {filteredLogs.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COL,
              padding: "6px 12px",
              background: "#f8fafc",
              border: "0.5px solid #e2e8f0",
              borderRadius: "8px 8px 0 0",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              gap: 4,
              textAlign: "center",
            }}
          >
            <span>Time</span>
            <span>Coordinates</span>
            <span>Battery</span>
            <span>Speed</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div
            style={{
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {filteredLogs.map((log, idx) => (
              <LogRow key={log.logID} log={log} isEven={idx % 2 === 0} />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeviceHealthModal;

// ── Log row ───────────────────────────────────────────────────

const LogRow: React.FC<{ log: DeviceHealthLog; isEven: boolean }> = ({
  log,
  isEven,
}) => {
  const hasAlert =
    log.gpsLoss ||
    log.networkLoss ||
    log.isMocked ||
    log.deviceHealth !== "Healthy";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COL,
        padding: "8px 12px",
        gap: 4,
        alignItems: "center",
        background: hasAlert ? "#fff8f8" : isEven ? "#ffffff" : "#fafafa",
        borderLeft: `3px solid ${hasAlert ? "#fca5a5" : "transparent"}`,
        borderBottom: "0.5px solid #f1f5f9",
        borderRight: "0.5px solid #e2e8f0",
        fontSize: 11,
      }}
    >
      {/* ── Time ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span
          style={{ color: "#0f172a", fontWeight: 500, textAlign: "center" }}
        >
          {new Date(log.createdOn).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
        {/* <span style={{ fontSize: 10, color: "#94a3b8" }}>
          {new Date(log.clientTimestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}{" "}
          <span style={{ fontStyle: "italic" }}>client</span>
        </span> */}
      </div>

      {/* ── Coordinates ───────────────────────────────────────── */}
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#475569",
          textAlign: "center",
        }}
      >
        {log.lat.toFixed(5)},&nbsp;{log.lng.toFixed(5)}
      </span>

      {/* ── Battery ───────────────────────────────────────────── */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          fontWeight: 600,
          color: log.batteryPercentage <= 20 ? "#dc2626" : "#16a34a",
          textAlign: "center",
        }}
      >
        {log.onCharging && <ThunderboltOutlined style={{ fontSize: 10 }} />}
        {log.batteryPercentage}%
      </span>

      {/* ── Speed ─────────────────────────────────────────────── */}
      <span
        style={{
          fontWeight: log.speed > 60 ? 600 : 400,
          color: log.speed > 60 ? "#dc2626" : "#475569",
          textAlign: "center",
        }}
      >
        {log.speed} km/h
      </span>

      {/* ── Device health ─────────────────────────────────────── */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: log.deviceHealth === "Healthy" ? "#dcfce7" : "#fee2e2",
          color: log.deviceHealth === "Healthy" ? "#15803d" : "#b91c1c",
          borderRadius: 99,
          padding: "2px 10px",
          fontWeight: 600,
          fontSize: 10,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {log.deviceHealth}
      </span>
    </div>
  );
};

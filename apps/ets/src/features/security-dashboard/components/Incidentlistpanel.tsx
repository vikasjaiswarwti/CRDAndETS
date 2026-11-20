import React, { useEffect } from "react";
import { T } from "../constants/Designtokens";

import type {
  Alert,
  AlertModuleSummary,
  AlertPrioritySummary,
  AlertSummaryResponse,
} from "../types/Security.types";
import { IncidentCard } from "./Incidentcard";

import { Tooltip, Badge, Switch } from "antd";

const MODULE_CONFIG: Record<
  number,
  { color: string; underline: string; badge: string }
> = {
  1: { color: "#7C3AED", underline: "#7C3AED", badge: "purple" },
  2: { color: "#D97706", underline: "#D97706", badge: "warning" },
  3: { color: "#6B7280", underline: "#6B7280", badge: "default" },
  4: { color: "#DC2626", underline: "#DC2626", badge: "error" },
  5: { color: "#0891B2", underline: "#0891B2", badge: "processing" },
  6: { color: "#16A34A", underline: "#16A34A", badge: "success" },
};

interface Props {
  selectedId: string | number | null;
  onSelect: (id: number | string) => void;
  alertSummary?: AlertSummaryResponse;
  isLoading?: boolean;
  isAlertsLoading?: boolean;
  activeMod: number | null;
  onModuleChange: (moduleCode: number) => void;
  priorityType: number | null;
  onPriorityChange: (priorityCode: number) => void;
  onCloseDetails: () => void;
  alertData: Alert[];
  showResolved: boolean;
  onToggleResolved: () => void;
}

const toTitleCase = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

// ── Shimmer base styles ──
const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: 6,
};

const SkeletonBlock = ({
  width = "100%",
  height = 12,
  delay = 0,
  style = {},
}: {
  width?: string | number;
  height?: number;
  delay?: number;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      ...shimmerStyle,
      width,
      height,
      animationDelay: `${delay}s`,
      ...style,
    }}
  />
);

// Mimics a single IncidentCard skeleton
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 12,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    {/* Top row: badge + time */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <SkeletonBlock
        width={80}
        height={20}
        delay={delay}
        style={{ borderRadius: 999 }}
      />
      <SkeletonBlock width={60} height={10} delay={delay + 0.05} />
    </div>
    {/* Title */}
    <SkeletonBlock width="65%" height={13} delay={delay + 0.1} />
    {/* Sub-row */}
    <div style={{ display: "flex", gap: 8 }}>
      <SkeletonBlock width={90} height={10} delay={delay + 0.15} />
      <SkeletonBlock width={110} height={10} delay={delay + 0.2} />
    </div>
    {/* Bottom row */}
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <SkeletonBlock width={70} height={10} delay={delay + 0.25} />
      <SkeletonBlock width={50} height={10} delay={delay + 0.3} />
    </div>
  </div>
);

export const IncidentListPanel: React.FC<Props> = ({
  selectedId,
  onSelect,
  alertSummary,
  isLoading,
  isAlertsLoading,
  activeMod,
  onModuleChange,
  priorityType,
  onPriorityChange,
  onCloseDetails,
  alertData,
  showResolved,
  onToggleResolved,
}) => {
  const priorities = alertSummary?.byPriority ?? [];
  const modules = alertSummary?.byModule ?? [];

  useEffect(() => {
    if (modules.length > 0 && activeMod === null) {
      const defaultModule = modules.find((m) => m.unresolved > 0) ?? modules[0];
      onModuleChange(defaultModule.moduleCode);
    }
  }, [modules, activeMod, onModuleChange]);

  useEffect(() => {
    if (priorities.length > 0 && priorityType === null) {
      const defaultPriority =
        priorities.find((p) => p.unresolved > 0) ?? priorities[0];
      onPriorityChange(defaultPriority.priorityCode);
    }
  }, [priorities, priorityType, onPriorityChange]);

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        style={{
          width: 400,
          minWidth: 400,
          background: T.bg,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* ── Module Tabs ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 8px",
            background: T.panel,
            borderBottom: `0.5px solid ${T.border}`,
            flexShrink: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {isLoading
            ? // Skeleton tabs
              [90, 70, 80, 65, 75].map((w, i) => (
                <SkeletonBlock
                  key={i}
                  width={w}
                  height={22}
                  delay={i * 0.08}
                  style={{ borderRadius: 6, flexShrink: 0 }}
                />
              ))
            : modules.map((mo: AlertModuleSummary) => {
                const isActive = activeMod === mo.moduleCode;
                const hasDanger = mo.unresolved > 0;
                const cfg = MODULE_CONFIG[mo.moduleCode];

                return (
                  <Badge
                    key={mo.moduleCode}
                    dot={hasDanger}
                    color={hasDanger ? cfg.underline : undefined}
                    styles={{ indicator: { width: 7, height: 7, minWidth: 7 } }}
                  >
                    <button
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        onCloseDetails();
                        onModuleChange(mo.moduleCode);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0 4px",
                        height: 24,
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#DC2626" : "#727272",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        position: "relative",
                        transition: "background 0.12s, color 0.12s",
                        background: "none",
                      }}
                    >
                      {mo.moduleName}
                      {isActive && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: -6,
                            left: 8,
                            right: 8,
                            height: 2,
                            borderRadius: "2px 2px 0 0",
                            background: "#DC2626",
                          }}
                        />
                      )}
                    </button>
                  </Badge>
                );
              })}
        </div>

        {/* ── Priority Toggle ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: T.panel,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#727272",
              whiteSpace: "nowrap",
            }}
          >
            Priority Type
          </span>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#F3F4F6",
              borderRadius: 999,
              padding: "3px",
              gap: 0,
            }}
          >
            {isLoading
              ? // Skeleton priority pills
                [60, 72, 65].map((w, i) => (
                  <SkeletonBlock
                    key={i}
                    width={w}
                    height={26}
                    delay={i * 0.08}
                    style={{ borderRadius: 999, margin: "0 2px" }}
                  />
                ))
              : priorities.map((pt: AlertPrioritySummary) => {
                  const isActive = priorityType === pt.priorityCode;
                  const activeColor =
                    pt.priorityCode === 1
                      ? "#ef4444"
                      : pt.priorityCode === 2
                        ? "#f59e0b"
                        : "#f59e0b85";

                  return (
                    <button
                      key={pt.priorityCode}
                      onClick={() => {
                        onCloseDetails();
                        onPriorityChange(pt.priorityCode);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 14px",
                        borderRadius: 999,
                        background: isActive ? activeColor : "none",
                        color: isActive ? "#fff" : "#9CA3AF",
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 500,
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease",
                        boxShadow: isActive
                          ? "0 1px 3px rgba(79,70,229,0.3)"
                          : "none",
                      }}
                    >
                      {toTitleCase(pt.priorityName)}
                      {/* ({pt.unresolved}) */}
                    </button>
                  );
                })}
          </div>

          <Tooltip
            title={
              showResolved
                ? "Toggle to see unresolved trips"
                : "Toggle to see resolved trips"
            }
            placement="top"
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#727272",
                cursor: "pointer",
                marginRight: "4px",
              }}
              onClick={onToggleResolved}
            >
              {showResolved ? "Resolved" : "Unresolved"}
            </span>

            <Switch
              size="small"
              checked={showResolved}
              onChange={onToggleResolved}
            />
          </Tooltip>
        </div>

        {/* ── Card List ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {isLoading || isAlertsLoading ? (
            // Skeleton cards
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 0.07} />
            ))
          ) : alertData.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: T.muted,
                fontSize: 13,
                marginTop: 40,
              }}
            >
              No Alert found
            </div>
          ) : (
            alertData.map((inc: Alert) => (
              <IncidentCard
                key={inc.alertId}
                incident={inc}
                selected={selectedId === inc?.alertId}
                onSelect={() => onSelect(inc?.alertId)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { T } from "../constants/designTokens";
import { rebuildQueueFromFailed } from "../slice/Allocationsessionslice";

interface Props {
  onRetryFailed: () => void;
  onClose: () => void;
}

export default function AllocationSummary({ onRetryFailed, onClose }: Props) {
  const dispatch = useDispatch();

  const completedTrips = useSelector(
    (state: RootState) => state.allocationSession.completedTrips,
  );
  const skippedTrips = useSelector(
    (state: RootState) => state.allocationSession.skippedTrips,
  );
  const failedTrips = useSelector(
    (state: RootState) => state.allocationSession.failedTrips,
  );
  const allocationQueue = useSelector(
    (state: RootState) => state.allocationSession.allocationQueue,
  );

  const total = allocationQueue.length;
  const hasFailures = failedTrips.length > 0;
  const hasSkipped = skippedTrips.length > 0;
  const allDone = !hasFailures && !hasSkipped;

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    completed: true,
    skipped: hasSkipped,
    failed: hasFailures,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRetryFailed = () => {
    dispatch(rebuildQueueFromFailed());
    onRetryFailed();
  };

  const pillStyle = (bg: string, color: string): React.CSSProperties => ({
    padding: "6px 16px",
    borderRadius: 99,
    background: bg,
    color,
    fontSize: T.fontXs,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  });

  const sectionHeaderStyle = (borderColor: string): React.CSSProperties => ({
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    borderLeft: `3px solid ${borderColor}`,
    background: T.panel,
    userSelect: "none",
    borderRadius: `0 ${T.radiusSm} ${T.radiusSm} 0`,
  });

  const rowStyle: React.CSSProperties = {
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderBottom: `1px solid ${T.border}`,
    fontSize: T.fontXs,
    color: T.text,
  };

  return (
    <div
      style={{
        padding: "32px 32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxHeight: "calc(90vh - 60px)",
        overflowY: "auto",
      }}
    >
      {/* Top: icon + heading */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: allDone ? "#dcfce7" : T.warnBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {allDone ? "✓" : "!"}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: T.fontMd,
            color: T.text,
            fontWeight: 700,
          }}
        >
          {allDone ? "All Done!" : "Partially Complete"}
        </h2>
        <p style={{ margin: 0, fontSize: T.fontSm, color: T.muted }}>
          {allDone
            ? `All ${total} trips have been successfully allocated.`
            : `${completedTrips.length} of ${total} trips allocated.${
                hasFailures ? ` ${failedTrips.length} failed.` : ""
              }${hasSkipped ? ` ${skippedTrips.length} skipped.` : ""}`}
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={pillStyle("#dcfce7", "#16a34a")}>
          ✓ {completedTrips.length} Complete
        </span>
        {hasSkipped && (
          <span style={pillStyle(T.warnBg, T.warn)}>
            ⟳ {skippedTrips.length} Skipped
          </span>
        )}
        {hasFailures && (
          <span style={pillStyle("rgba(239,68,68,0.12)", T.danger)}>
            ✗ {failedTrips.length} Failed
          </span>
        )}
      </div>

      {/* Collapsible sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Completed */}
        {completedTrips.length > 0 && (
          <div
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              overflow: "hidden",
            }}
          >
            <div
              onClick={() => toggleSection("completed")}
              style={sectionHeaderStyle("#22c55e")}
            >
              <span
                style={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: T.fontXs,
                  color: T.text,
                }}
              >
                Completed
              </span>
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 99,
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: T.fontXs,
                  fontWeight: 600,
                }}
              >
                {completedTrips.length}
              </span>
              <span
                style={{
                  color: T.muted,
                  fontSize: 12,
                  transform: expandedSections.completed
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                  transition: "transform 0.15s",
                  display: "inline-block",
                }}
              >
                ▼
              </span>
            </div>
            {expandedSections.completed && (
              <div style={{ background: T.card }}>
                {completedTrips.map((dsId) => (
                  <div key={dsId} style={rowStyle}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                    <span>Trip #{dsId}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color: "#16a34a",
                        padding: "1px 7px",
                        background: "#dcfce7",
                        borderRadius: 99,
                      }}
                    >
                      Allocated
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skipped */}
        {hasSkipped && (
          <div
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              overflow: "hidden",
            }}
          >
            <div
              onClick={() => toggleSection("skipped")}
              style={sectionHeaderStyle(T.warn)}
            >
              <span
                style={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: T.fontXs,
                  color: T.text,
                }}
              >
                Skipped
              </span>
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 99,
                  background: T.warnBg,
                  color: T.warn,
                  fontSize: T.fontXs,
                  fontWeight: 600,
                }}
              >
                {skippedTrips.length}
              </span>
              <span
                style={{
                  color: T.muted,
                  fontSize: 12,
                  transform: expandedSections.skipped
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                  transition: "transform 0.15s",
                  display: "inline-block",
                }}
              >
                ▼
              </span>
            </div>
            {expandedSections.skipped && (
              <div style={{ background: T.card }}>
                {skippedTrips.map((dsId) => (
                  <div key={dsId} style={rowStyle}>
                    <span style={{ color: T.warn, fontWeight: 700 }}>⟳</span>
                    <span>Trip #{dsId}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color: T.warn,
                        padding: "1px 7px",
                        background: T.warnBg,
                        borderRadius: 99,
                      }}
                    >
                      Assign Later
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Failed */}
        {hasFailures && (
          <div
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              overflow: "hidden",
            }}
          >
            <div
              onClick={() => toggleSection("failed")}
              style={sectionHeaderStyle(T.danger)}
            >
              <span
                style={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: T.fontXs,
                  color: T.text,
                }}
              >
                Failed
              </span>
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 99,
                  background: "rgba(239,68,68,0.12)",
                  color: T.danger,
                  fontSize: T.fontXs,
                  fontWeight: 600,
                }}
              >
                {failedTrips.length}
              </span>
              <span
                style={{
                  color: T.muted,
                  fontSize: 12,
                  transform: expandedSections.failed
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                  transition: "transform 0.15s",
                  display: "inline-block",
                }}
              >
                ▼
              </span>
            </div>
            {expandedSections.failed && (
              <div style={{ background: T.card }}>
                {failedTrips.map((dsId) => (
                  <div key={dsId} style={rowStyle}>
                    <span style={{ color: T.danger, fontWeight: 700 }}>✗</span>
                    <span>Trip #{dsId}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color: T.danger,
                        padding: "1px 7px",
                        background: "rgba(239,68,68,0.1)",
                        borderRadius: 99,
                      }}
                    >
                      Allocation Failed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 8,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {hasFailures && (
          <button
            onClick={handleRetryFailed}
            style={{
              padding: "9px 20px",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.danger}`,
              background: "rgba(239,68,68,0.08)",
              color: T.danger,
              fontSize: T.fontSm,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry All Failed ({failedTrips.length})
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            padding: "9px 24px",
            borderRadius: T.radiusSm,
            border: "none",
            background: T.accent,
            color: "#fff",
            fontSize: T.fontSm,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { T } from "../constants/designTokens";
import {
  startSession,
  buildAllocationQueue,
  endSession,
  setPhase,
} from "../slice/Allocationsessionslice";
import { selectSessionStats } from "../slice/Allocationsessionslice";
import VendorGroupingPanel from "../Modals/Vendorgroupingpanel";
import AllocationWizard from "../Modals/Allocationwizard";
import AllocationSummary from "../Modals/AllocationSummary";

interface Props {
  dsIds: number[];
  locCode: number;
  onClose: () => void;
  onSessionComplete: () => void;
}

const KEYFRAME_STYLE = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
    to   { opacity: 1; transform: translate(-50%, -50%); }
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

export default function AllocationOrchestrator({
  dsIds,
  locCode,
  onClose,
  onSessionComplete,
}: Props) {
  const dispatch = useDispatch();

  const justMountedRef = useRef(true);

  const phase = useSelector(
    (state: RootState) => state.allocationSession.phase,
  );
  const isDirty = useSelector(
    (state: RootState) => state.allocationSession.isDirty,
  );
  const selectedDsIds = useSelector(
    (state: RootState) => state.allocationSession.selectedDsIds,
  );
  const vendorAssignmentStatus = useSelector(
    (state: RootState) => state.allocationSession.vendorAssignmentStatus,
  );
  // const vendorNames = useSelector(
  //   (state: RootState) => state.allocationSession.vendorNames,
  // );
  const stats = useSelector((state: RootState) => selectSessionStats(state));

  const [showCloseGuard, setShowCloseGuard] = useState(false);
  const [phaseKey, setPhaseKey] = useState(0);
  const prevPhase = useRef(phase);

  useEffect(() => {
    dispatch(startSession(dsIds));
    const t = setTimeout(() => {
      justMountedRef.current = false;
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevPhase.current !== phase) {
      setPhaseKey((k) => k + 1);
      prevPhase.current = phase;
    }
  }, [phase]);

  const handleRequestClose = () => {
    if (justMountedRef.current) return;
    if (isDirty) {
      setShowCloseGuard(true);
    } else {
      dispatch(endSession());
      onClose();
    }
  };

  const handleForceClose = () => {
    dispatch(endSession());
    onClose();
  };

  // vendor_assigning: called by VendorGroupingPanel via onProceed
  //   const handleVendorProceed = async (
  //     vendorGroups: Record<number, number[]>,
  //   ) => {
  //     dispatch(setPhase("vendor_assigning"));
  //     // VendorGroupingPanel has already dispatched all assignments to Redux
  //     // and called setVendorAssignmentStatus for each. We just await here.
  //     // After all statuses are set, transition to vendor_complete.
  //     // The actual API calls complete asynchronously; VendorGroupingPanel
  //     // handles success/failure dispatching then calls setPhase('vendor_complete').
  //     void vendorGroups; // used by parent to trigger API; statuses flow via Redux
  //   };

  // WITH:
  const handleVendorProceed = async (
    _vendorGroups: Record<number, number[]>,
  ) => {
    // VendorGroupingPanel already handles all phase transitions and API calls.
    // vendor_assigning → vendor_complete is dispatched inside VendorGroupingPanel.
    // Nothing to do here.
  };

  const handleContinueToAllocate = () => {
    dispatch(buildAllocationQueue());
  };

  const handleSessionComplete = () => {
    dispatch(setPhase("summary"));
    onSessionComplete();
  };

  const handleRetryFailed = () => {
    // rebuildQueueFromFailed is dispatched inside AllocationSummary
  };

  const handleDone = () => {
    dispatch(endSession());
    onClose();
  };

  const successCount = selectedDsIds.filter(
    (id) => vendorAssignmentStatus[id]?.status === "success",
  ).length;
  const failedCount = selectedDsIds.filter(
    (id) => vendorAssignmentStatus[id]?.status === "failed",
  ).length;

  const renderPhase = () => {
    switch (phase) {
      case "vendor_grouping":
        return (
          <VendorGroupingPanel
            dsIds={dsIds}
            locCode={locCode}
            onProceed={handleVendorProceed}
            onCancel={handleRequestClose}
          />
        );

      case "vendor_assigning":
        return (
          <div style={{ padding: "24px 32px" }}>
            <h3
              style={{
                margin: "0 0 20px",
                fontSize: T.fontMd,
                color: T.text,
              }}
            >
              Assigning Vendors...
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {selectedDsIds.map((dsId) => {
                const assignment = vendorAssignmentStatus[dsId];
                const status = assignment?.status ?? "pending";

                const statusIcon =
                  status === "success" ? "✓" : status === "failed" ? "✗" : null;

                const statusColor =
                  status === "success"
                    ? "#22c55e"
                    : status === "failed"
                      ? T.danger
                      : T.muted;

                return (
                  <div
                    key={dsId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: T.card,
                      borderRadius: T.radiusSm,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    {status === "pending" ? (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `2px solid ${T.accent}`,
                          borderTopColor: "transparent",
                          display: "inline-block",
                          animation: "spin 0.8s linear infinite",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: statusColor,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {statusIcon}
                      </span>
                    )}
                    <span
                      style={{ fontSize: T.fontSm, color: T.text, flex: 1 }}
                    >
                      Trip #{dsId}
                    </span>
                    {assignment?.vendorName && (
                      <span
                        style={{
                          fontSize: T.fontXs,
                          color: T.muted,
                          padding: "2px 8px",
                          background: T.panel,
                          borderRadius: T.radiusSm,
                        }}
                      >
                        {assignment.vendorName}
                      </span>
                    )}
                    {assignment?.error && (
                      <span style={{ fontSize: T.fontXs, color: T.danger }}>
                        {assignment.error}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        );

      case "vendor_complete":
        return (
          <div
            style={{
              padding: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              ✓
            </div>
            <h2 style={{ margin: 0, fontSize: T.fontMd, color: T.text }}>
              Vendor Assignment Complete
            </h2>
            <p style={{ margin: 0, fontSize: T.fontSm, color: T.muted }}>
              {successCount} trip{successCount !== 1 ? "s" : ""} assigned
              successfully
              {failedCount > 0 ? `, ${failedCount} failed` : ""}
            </p>
            {failedCount > 0 && (
              <div
                style={{
                  padding: "10px 16px",
                  background: T.warnBg,
                  borderRadius: T.radiusSm,
                  border: `1px solid ${T.warn}`,
                  fontSize: T.fontXs,
                  color: T.warn,
                }}
              >
                {failedCount} trip{failedCount !== 1 ? "s" : ""} could not be
                assigned to a vendor and will be excluded from allocation.
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: T.radiusSm,
                  border: `1px solid ${T.border}`,
                  background: T.card,
                  color: T.text,
                  fontSize: T.fontSm,
                  cursor: "pointer",
                }}
              >
                Finish Later
              </button>
              <button
                onClick={handleContinueToAllocate}
                disabled={successCount === 0}
                style={{
                  padding: "9px 20px",
                  borderRadius: T.radiusSm,
                  border: "none",
                  background: successCount === 0 ? T.muted : T.accent,
                  color: "#fff",
                  fontSize: T.fontSm,
                  cursor: successCount === 0 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                Continue → Allocate Vehicles &amp; Drivers
              </button>
            </div>
          </div>
        );

      case "wizard":
        return (
          <AllocationWizard
            locCode={locCode}
            onComplete={handleSessionComplete}
          />
        );

      case "summary":
        return (
          <AllocationSummary
            onRetryFailed={handleRetryFailed}
            onClose={handleDone}
          />
        );

      default:
        return null;
    }
  };

  const phaseTitle: Record<string, string> = {
    idle: "Fleet Allocation",
    vendor_grouping: "Step 1 — Assign Vendors",
    vendor_assigning: "Step 1 — Assigning Vendors",
    vendor_complete: "Step 1 — Vendors Assigned",
    wizard: `Step 2 — Allocate Vehicles & Drivers (${stats.completed}/${stats.total})`,
    summary: "Allocation Summary",
  };

  return (
    <>
      <style>{KEYFRAME_STYLE}</style>

      {/* Backdrop */}
      <div
        onClick={handleRequestClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
          animation: "backdropIn 0.2s ease",
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          width: "min(960px, 95vw)",
          maxHeight: "90vh",
          background: T.bg,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeSlideIn 0.22s ease forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: `1px solid ${T.border}`,
            background: T.panel,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: T.fontSm,
              color: T.text,
            }}
          >
            {phaseTitle[phase] ?? "Fleet Allocation"}
          </span>
          <button
            onClick={handleRequestClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.muted,
              fontSize: 18,
              lineHeight: 1,
              padding: "2px 6px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Close guard banner */}
        {showCloseGuard && (
          <div
            style={{
              padding: "12px 24px",
              background: T.warnBg,
              borderBottom: `1px solid ${T.warn}`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: T.fontSm, color: T.text, flex: 1 }}>
              You have unsaved changes. Close anyway?
            </span>
            <button
              onClick={() => setShowCloseGuard(false)}
              style={{
                padding: "6px 14px",
                borderRadius: T.radiusSm,
                border: `1px solid ${T.border}`,
                background: T.card,
                color: T.text,
                fontSize: T.fontXs,
                cursor: "pointer",
              }}
            >
              Keep editing
            </button>
            <button
              onClick={handleForceClose}
              style={{
                padding: "6px 14px",
                borderRadius: T.radiusSm,
                border: "none",
                background: T.danger,
                color: "#fff",
                fontSize: T.fontXs,
                cursor: "pointer",
              }}
            >
              Close anyway
            </button>
          </div>
        )}

        {/* Phase content */}
        <div
          key={phaseKey}
          style={{
            flex: 1,
            overflowY: "auto",
            animation: "fadeSlideIn 0.18s ease",
          }}
        >
          {renderPhase()}
        </div>
      </div>
    </>
  );
}

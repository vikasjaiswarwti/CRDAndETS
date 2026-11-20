// ─── Modals/PublishTripModal.tsx ──────────────────────────────────────────────
// Confirms and publishes one OR many trips via TripPrintOrPublish.
//
// Mirrors AssignVendorModal's self-contained-mutation pattern:
//   From a card   → pass routes={[route]}        (single trip)
//   From toolbar  → pass routes={selectedRoutes}  (bulk)
//
// The modal owns the mutation call itself — callers only need onSuccess/onClose.
// Multiple trips are published in a single request: TripId is sent as a
// comma-separated string, e.g. "123,124,125".
//
// The API always resolves (HTTP 200) with { result, isSuccess, message } —
// business-logic failures (e.g. "Time is over.", missing vendor/vehicle/driver)
// come back as isSuccess:false rather than a thrown error, so both branches
// must be read from the response body, not just try/catch.

import { useState } from "react";
import { T } from "../constants/designTokens";
import type { VehicleRoute } from "../types/Routemaker.types";
import { useTripPrintOrPublishMutation } from "../services/routeMakerApi";
import { extractApiError } from "../utils/extractApiError";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  routes: VehicleRoute[];
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string; // "YYYY-MM-DD"
  onSuccess: () => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

function Spin() {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff",
        display: "inline-block",
        animation: "ptmSpin 0.7s linear infinite",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// PublishTripModal
// ---------------------------------------------------------------------------

export default function PublishTripModal({
  routes,
  locCode,
  shiftId,
  tripType,
  routeDate,
  onSuccess,
  onClose,
}: Props) {
  const [tripPrintOrPublish] = useTripPrintOrPublishMutation();
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const isSingle = routes.length === 1;

  async function handlePublish() {
    if (routes.length === 0) return;
    setIsPublishing(true);
    setResult(null);

    try {
      const response = await tripPrintOrPublish({
        LocCode: locCode,
        TripDate: routeDate,
        TripType: tripType,
        ShiftID: shiftId,
        TripId: routes.map((route) => route.VehicleId).join(","),
      }).unwrap();

      if (response?.isSuccess) {
        setResult({
          success: true,
          message:
            response.message ||
            (isSingle
              ? `Trip #${routes[0].VehicleId} published successfully.`
              : `${routes.length} trips published successfully.`),
        });
        // Refetch/clear selection in the background — the modal stays open
        // showing the result until the user dismisses it.
        onSuccess();
      } else {
        setResult({
          success: false,
          message:
            response?.message ||
            (isSingle
              ? `Failed to publish Trip #${routes[0].VehicleId}. Please try again.`
              : `Failed to publish ${routes.length} trips. Please try again.`),
        });
      }
    } catch (err) {
      setResult({ success: false, message: extractApiError(err) });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        zIndex: 2200,
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={isPublishing ? undefined : onClose}
    >
      <style>{`@keyframes ptmSpin { to { transform: rotate(360deg); } }`}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          width: 420,
          maxWidth: "calc(100vw - 32px)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: T.infoBg,
              border: `1px solid ${T.infoBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline
                points="6 9 6 2 18 2 18 9"
                stroke={T.info}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                stroke={T.info}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="6"
                y="14"
                width="12"
                height="8"
                stroke={T.info}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              {result
                ? result.success
                  ? "Published"
                  : "Publish Failed"
                : isSingle
                  ? "Publish Trip"
                  : "Publish Trips"}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
              {isSingle
                ? `Trip #${routes[0].VehicleId}`
                : `${routes.length} trips selected`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            style={{
              background: "none",
              border: "none",
              cursor: isPublishing ? "not-allowed" : "pointer",
              color: T.text,
              fontSize: 20,
              lineHeight: 1,
              padding: 2,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {!isSingle && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                maxHeight: 120,
                overflowY: "auto",
              }}
            >
              {routes.map((r) => (
                <span
                  key={r.VehicleId}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.text,
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 99,
                    padding: "3px 9px",
                  }}
                >
                  Trip #{r.VehicleId}
                </span>
              ))}
            </div>
          )}

          {result ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                background: result.success ? T.successBg : T.dangerBg,
                border: `1px solid ${result.success ? T.accentBorder : "#FCA5A5"}`,
                borderRadius: T.radiusSm,
                padding: "9px 12px",
                fontSize: 12,
                color: result.success ? T.accentDark : T.danger,
                lineHeight: 1.5,
              }}
            >
              {result.success ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    stroke={T.accentDark}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="22 4 12 14.01 9 11.01"
                    stroke={T.accentDark}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke={T.danger}
                    strokeWidth="2"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="13"
                    stroke={T.danger}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="16.5"
                    r="1"
                    fill={T.danger}
                    stroke="none"
                  />
                </svg>
              )}
              <span>{result.message}</span>
            </div>
          ) : (
            <div
              style={{
                background: T.infoBg,
                border: `1px solid ${T.infoBorder}`,
                borderRadius: T.radiusSm,
                padding: "9px 12px",
                fontSize: 12,
                color: "#1E40AF",
                lineHeight: 1.5,
              }}
            >
              {isSingle
                ? "This will print/publish this selected trip only."
                : `This will print/publish all ${routes.length} selected trips.`}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: T.border, margin: "0 20px" }} />

        {/* ── Footer ── */}
        <div
          style={{
            padding: "14px 20px 16px",
            display: "flex",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          {result?.success ? (
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: T.radiusSm,
                border: "none",
                background: T.accent,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          ) : result && !result.success ? (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: T.radiusSm,
                  border: `1px solid ${T.border}`,
                  background: T.card,
                  color: T.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: T.radiusSm,
                  border: "none",
                  background: T.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isPublishing ? "not-allowed" : "pointer",
                  opacity: isPublishing ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isPublishing && <Spin />}
                {isPublishing ? "Retrying..." : "Retry"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: T.radiusSm,
                  border: `1px solid ${T.border}`,
                  background: T.card,
                  color: T.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isPublishing ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || routes.length === 0}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: T.radiusSm,
                  border: "none",
                  background: T.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isPublishing ? "not-allowed" : "pointer",
                  opacity: isPublishing ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isPublishing && <Spin />}
                {isPublishing
                  ? "Publishing..."
                  : isSingle
                    ? "Publish Trip"
                    : `Publish ${routes.length} Trips`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

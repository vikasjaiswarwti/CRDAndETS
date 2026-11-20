// components/BulkUpdateProgressBar.tsx
import React, { useState } from "react";
import type { BulkUpdateResult, BulkUpdateStatus, SessionSummary } from "../hooks/useBulkShiftUpdate";

interface Props {
    status: BulkUpdateStatus;
    progress: { completed: number; total: number };
    results: BulkUpdateResult[];
    lastSession: SessionSummary | null;
    onAbort: () => void;
    onReset: () => void;
}

const STATUS_LABEL: Record<BulkUpdateStatus, string> = {
    idle: "",
    running: "Saving shifts…",
    done: "All shifts saved successfully",
    partial_failure: "Some shifts failed to save",
};

const STATUS_COLOR: Record<BulkUpdateStatus, string> = {
    idle: "#6B7280",
    running: "#1B4332",
    done: "#15803D",
    partial_failure: "#B91C1C",
};

function formatTime(iso: string) {
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}

const InfoPopover: React.FC<{ session: SessionSummary }> = ({ session }) => (
    <div
        style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            padding: "12px 14px",
            minWidth: 280,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 50,
        }}
    >
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Last Save — {formatTime(session.timestamp)}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6B7280" }}>
            {session.succeeded} of {session.total} shifts saved successfully
            {session.failed > 0 && (
                <span style={{ color: "#B91C1C", fontWeight: 600 }}>
                    {" "}· {session.failed} failed
                </span>
            )}
        </p>
        {session.failedShifts.length > 0 && (
            <div>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#B91C1C" }}>
                    Failed shifts:
                </p>
                <ul style={{ margin: 0, padding: "0 0 0 12px" }}>
                    {session.failedShifts.map((f) => (
                        <li key={f.id} style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, color: "#374151" }}>{f.shiftTime}</span>
                            {" — "}
                            {f.error}
                        </li>
                    ))}
                </ul>
                <p style={{ margin: "8px 0 0", fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>
                    Please check and retry the above shifts.
                </p>
            </div>
        )}
    </div>
);

export const BulkUpdateProgressBar: React.FC<Props> = ({
    status,
    progress,
    results,
    lastSession,
    onAbort,
    onReset,
}) => {
    const [showInfo, setShowInfo] = useState(false);

    const pct =
        progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;

    const failedSlots = results.filter((r) => r.status === "failed");
    const isIdle = status === "idle";

    // When idle, only show the info button if there's last session data
    if (isIdle && !lastSession) return null;

    return (
        <div>
            {/* ── Idle: just show info button ─────────────────────────────────── */}
            {/* {isIdle && lastSession && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                        Last save:{" "}
                        <span
                            style={{
                                fontWeight: 600,
                                color: lastSession.failed > 0 ? "#B91C1C" : "#15803D",
                            }}
                        >
                            {lastSession.failed > 0
                                ? `${lastSession.failed} shift(s) failed`
                                : `${lastSession.succeeded} saved successfully`}
                        </span>
                    </span>
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setShowInfo((v) => !v)}
                            title="View last save details"
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                border: "1.5px solid #D1D5DB",
                                background: "#fff",
                                color: "#6B7280",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                            }}
                        >
                            i
                        </button>
                        {showInfo && <InfoPopover session={lastSession} />}
                    </div>
                </div>
            )} */}

            {/* ── Active: full progress display ───────────────────────────────── */}
            {!isIdle && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLOR[status] }}>
                            {STATUS_LABEL[status]}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, color: "#6B7280" }}>
                                {progress.completed} / {progress.total}
                            </span>
                            {lastSession && (
                                <div style={{ position: "relative" }}>
                                    <button
                                        onClick={() => setShowInfo((v) => !v)}
                                        title="View last save details"
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "50%",
                                            border: "1.5px solid #D1D5DB",
                                            background: "#fff",
                                            color: "#6B7280",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        i
                                    </button>
                                    {showInfo && <InfoPopover session={lastSession} />}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ background: "#E5E7EB", borderRadius: 99, height: 6, marginBottom: 10 }}>
                        <div
                            style={{
                                width: `${pct}%`,
                                height: 6,
                                borderRadius: 99,
                                background:
                                    status === "partial_failure" ? "#EF4444"
                                        : status === "done" ? "#16A34A"
                                            : "#1B4332",
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>

                    {/* Offline warning */}
                    {!navigator.onLine && (
                        <p style={{ fontSize: 11, color: "#92400E", background: "#FFFBEB", borderRadius: 6, padding: "4px 8px", margin: "0 0 8px" }}>
                            ⚠ You appear to be offline. Saves are queued and will retry when reconnected.
                        </p>
                    )}

                    {/* Failed slot list */}
                    {failedSlots.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <p style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600, marginBottom: 4 }}>
                                Failed ({failedSlots.length}):
                            </p>
                            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                                {failedSlots.map((r) => (
                                    <li key={r.id} style={{ fontSize: 11, color: "#6B7280" }}>
                                        <span style={{ fontWeight: 600, color: "#374151" }}>{r.shiftTime}</span>
                                        {" — "}{r.error}
                                        <span style={{ color: "#9CA3AF" }}> (tried {r.attempts}×)</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        {status === "running" && (
                            <button
                                onClick={onAbort}
                                style={{
                                    fontSize: 12, padding: "5px 14px", borderRadius: 20,
                                    border: "1px solid #EF4444", color: "#EF4444",
                                    background: "#fff", cursor: "pointer",
                                }}
                            >
                                Abort
                            </button>
                        )}
                        {(status === "done" || status === "partial_failure") && (
                            <button
                                onClick={onReset}
                                style={{
                                    fontSize: 12, padding: "5px 14px", borderRadius: 20,
                                    border: "1px solid #D1D5DB", color: "#6B7280",
                                    background: "#fff", cursor: "pointer",
                                }}
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
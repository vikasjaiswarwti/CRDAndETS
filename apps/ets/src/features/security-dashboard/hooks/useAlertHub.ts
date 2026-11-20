import React, { useEffect, useState, useRef } from "react";
import { alertSignalRService } from "../services/signalr/AlertSignalRService";
import type { Alert } from "../types/Security.types";
import { notification } from "antd";


const alertSound = new Audio("/alertsSound.mp3");
alertSound.loop = true;
/**
 * useAlertHub
 *
 * Manages the full SignalR lifecycle for the Alert Dashboard:
 *   connect → join group → listen for alerts → reconnect handling → cleanup
 *
 * @param token  - JWT access token. Hook re-runs if the token changes.
 * @param active - Pass `true` to activate the connection (e.g. when the
 *                 user is on the alert dashboard page). Pass `false` to
 *                 keep the hook dormant without unmounting the component.
 *
 * Replace `any` with your actual alert DTO type once defined.
 */
export const useAlertHub = (token: string, active: boolean, soundDuration: number = 600_000) => {  // 600_000
    const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Ref so the latest `active` value is always accessible inside callbacks
    // without re-registering the SignalR listeners on every change
    const activeRef = useRef(active);
    const soundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Sync activeRef with the latest prop value ────────────────────────
    useEffect(() => {
        activeRef.current = active;

        // If the user disables sound while alert audio is playing → stop it
        if (!active) {
            alertSound.pause();
            alertSound.currentTime = 0;
        }
    }, [active]);

    useEffect(() => {
        // Guard: do nothing if inactive or token is missing
        if (!token) {
            return;
        }

        // Tracks whether the effect is still mounted.
        // Prevents state updates on unmounted components.
        let mounted = true;

        const startAlertHub = async () => {
            try {
                // 1. Establish the WebSocket connection
                await alertSignalRService.connect(token);

                if (!mounted) return;

                // 2. Join the tenant's alert group on the server
                await alertSignalRService.joinAlertDashboard();

                if (!mounted) return;

                setIsConnected(true);

                // 3. Register the main alert push listener
                //    off() is called inside onReceiveAlert before on() to prevent stacking
                alertSignalRService.onReceiveAlert((payload: any) => {
                    if (!mounted) return;
                    console.log(payload);
                    setLatestAlert(payload);
                    notification.open({
                        message: payload.alertTypeName ?? "New Alert",
                        description: payload.message,
                        placement: "topRight",
                        duration: 600_000,
                        onClick: () => window.open("/routing/security", "_blank"),
                        onClose: () => {
                            // Stop the sound
                            if (soundTimerRef.current) {
                                clearTimeout(soundTimerRef.current);
                                soundTimerRef.current = null;
                            }

                            alertSound.pause();
                            alertSound.currentTime = 0;
                        },
                        style: {
                            borderLeft: `4px solid ${payload.priorityCode === 1
                                ? "#DC2626"
                                : payload.priorityCode === 2
                                    ? "#D97706"
                                    : "#2563EB"
                                }`,
                            borderRadius: 10,
                            padding: "12px 16px",
                        },
                        icon: React.createElement(
                            "span",
                            { style: { fontSize: 18, lineHeight: 1 } },
                            payload.priorityCode === 1 ? "🔴" : payload.priorityCode === 2 ? "🟡" : "🔵"
                        ),
                    });

                    if (activeRef.current) {
                        // Clear previous timer if a new alert arrives before the old one finishes
                        if (soundTimerRef.current) {
                            clearTimeout(soundTimerRef.current);
                            soundTimerRef.current = null;
                        }

                        alertSound.currentTime = 0;
                        alertSound.play().catch((err) => {
                            console.warn("[AlertHub] Audio autoplay blocked.", err);
                        });

                        // ─── Auto-stop after soundDuration ms ────────────────────────
                        soundTimerRef.current = setTimeout(() => {
                            alertSound.pause();
                            alertSound.currentTime = 0;
                            soundTimerRef.current = null;
                        }, soundDuration); // <-- Added soundDuration here
                    }
                });

                // 4. Register server-side confirmation listeners
                alertSignalRService.onJoinedAlertDashboard((groupName: string) => {
                    if (!mounted) return;
                    console.log("[AlertHub] Joined group:", groupName);
                });

                alertSignalRService.onLeftAlertDashboard((groupName: string) => {
                    if (!mounted) return;
                    console.log("[AlertHub] Left group:", groupName);
                });

                // 5. Handle server-side tenant identification errors
                alertSignalRService.onAlertError((message: string) => {
                    if (!mounted) return;
                    console.error("[AlertHub] Server error:", message);
                    setError(message);
                });

                // 6. Re-join the group after automatic reconnection
                //    The connection is re-established but group membership is lost on the server,
                //    so JoinAlertDashboard must be invoked again.
                alertSignalRService.onReconnected(async () => {
                    if (!mounted) return;
                    console.log("[AlertHub] Reconnected — rejoining alert dashboard");
                    try {
                        await alertSignalRService.joinAlertDashboard();
                        setIsConnected(true);
                        setError(null);
                    } catch (rejoinErr) {
                        console.error("[AlertHub] Rejoin after reconnect failed:", rejoinErr);
                    }
                });
            } catch (err) {
                if (!mounted) return;
                console.error("[AlertHub] Connection error:", err);
                setIsConnected(false);
                setError("Failed to connect to alert hub.");
            }
        };

        startAlertHub();

        // ─── Cleanup ──────────────────────────────────────────────────────────
        // Order matters: remove listeners BEFORE disconnect so no stale
        // callbacks fire during the teardown sequence.
        return () => {
            mounted = false;
            if (soundTimerRef.current) {
                clearTimeout(soundTimerRef.current);
            }
            alertSound.pause();
            alertSound.currentTime = 0;

            alertSignalRService.removeReceiveAlert();
            alertSignalRService.removeJoinedAlertDashboard();
            alertSignalRService.removeLeftAlertDashboard();
            alertSignalRService.removeAlertError();

            alertSignalRService.leaveAlertDashboard().catch(() => { });
            alertSignalRService.disconnect();

            setIsConnected(false);
        };
    }, [token]); // Re-run only when token or active flag changes

    return {
        latestAlert,  // Latest alert payload pushed by the server
        isConnected,  // Whether the hub is currently connected
        error,        // Last server-side or connection error message
    };
};
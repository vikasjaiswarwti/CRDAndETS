import { useEffect, useRef, useState } from "react";
import { signalRService } from "../services/signalr/SignalRService";
import type { RouteLocationPayload } from "../types/tracking.types";

export const useSignalRTracking = (
  dsId: number,
  token: string,
  trackingMode: string,
  shouldUseSignalR: boolean,
) => {
  const [currentLocation, setCurrentLocation] =
    useState<RouteLocationPayload | null>(null);

  // ✅ Stable ref so the reconnect handler always sees the latest dsId
  // without needing to be re-registered on every render
  const dsIdRef = useRef(dsId);
  useEffect(() => { dsIdRef.current = dsId; }, [dsId]);

  useEffect(() => {
    if (trackingMode !== "LIVE_SIGNALR" || !shouldUseSignalR || !token) {
      return;
    }

    let mounted = true;

    const startTracking = async () => {
      try {
        await signalRService.connect(token);
        await signalRService.joinRouteTrackingGroup(dsId);

        // ✅ Register location listener
        signalRService.onReceiveRouteLocation((payload: RouteLocationPayload) => {
          if (!mounted) return;
          // console.log("[SignalR] payload: 142", payload);
          setCurrentLocation(payload);
        });


        // ✅ Re-join group after automatic reconnect
        signalRService.onReconnected(async () => {
          if (!mounted) return;
          console.log("[SignalR] Reconnected — rejoining group");
          await signalRService.joinRouteTrackingGroup(dsIdRef.current);

        });
      } catch (err) {
        console.error("[SignalR] Connection error:", err);
      }
    };

    startTracking();

    return () => {
      mounted = false;
      // ✅ Remove listener BEFORE disconnect so no stale callbacks fire
      signalRService.removeReceiveRouteLocation();
      signalRService.leaveRouteTrackingGroup(dsId).catch(() => { });
      signalRService.disconnect();
    };
  }, [dsId, token, trackingMode, shouldUseSignalR]);

  return { currentLocation };
};
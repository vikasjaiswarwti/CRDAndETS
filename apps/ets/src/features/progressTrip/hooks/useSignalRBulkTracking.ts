import { useEffect, useRef, useState } from "react";
import { signalRService } from "../services/signalr/SignalRService";
import type { Event } from "../types/progressTrip.types";
import { notification } from "antd";

export const useSignalRBulkTracking = (token: string | null, dsIds: number[]) => {
  const [multiTrackData, setMultiTrackData] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dsIdsRef = useRef<number[]>([]); // latest ids for the reconnect handler

  // ---- Connection lifecycle (only depends on token) ----
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    (async () => {
      try {
        await signalRService.connect(token);
        if (!mounted) return;

        signalRService.onReceiveLiveLocation((payload: any) => {
          console.log("[SignalR] live location:", payload);
          if (!mounted) return;
          console.log("[SignalR] live location:", payload);
          setMultiTrackData(payload);
        });

        // Optional: keep only if board events are still used
        signalRService.onReceiveBoardEvent((event: Event) => {
          if (!mounted) return;
          notification.info({
            message: event.eventType || "Trip Update",
            description: `Trip #${event.dsId} received an update.`,
            placement: "topRight",
          });
        });

        // Groups are lost on reconnect — rejoin the current set
        signalRService.onReconnected(async () => {
          if (!mounted) return;
          console.log("[SignalR] Reconnected — rejoining live trips");
          await signalRService.joinLiveTrips(dsIdsRef.current);
        });

        setIsConnected(true);
      } catch (err) {
        console.error("[SignalR] Connection error:", err);
      }
    })();

    return () => {
      mounted = false;
      setIsConnected(false);
      signalRService.removeReceiveLiveLocation();
      signalRService.removeReceiveBoardEvent();
      signalRService.disconnect();
    };
  }, [token]);

  // ---- Subscription lifecycle (join/leave when dsIds change) ----
  const dsKey = dsIds.slice().sort((a, b) => a - b).join(",");
  useEffect(() => {
    if (!isConnected) return;

    signalRService.joinLiveTrips(dsIds).catch((e) =>
      console.error("[SignalR] joinLiveTrips failed:", e)
    );
    dsIdsRef.current = dsIds;

    return () => {
      signalRService.leaveLiveTrips(dsIds).catch(() => { });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, dsKey]);

  return { multiTrackData, isConnected };
};
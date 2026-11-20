import { useEffect, useState } from "react";
import { signalRService } from "../services/signalr/SignalRService";
import { notification } from "antd";
import type { Event } from "../types/progressTrip.types";
// import type { RouteLocationPayload } from "../types/tracking.types";


export const useSignalRTracking = (
  token: string | null,
) => {
  const [currentLocation, setCurrentLocation] =
    useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    const startTracking = async () => {
      try {
        await signalRService.connect(token);
        await signalRService.joinBoardGroup();

        // ✅ Register board-event listener (status/pax/no-show updates)
        signalRService.onReceiveBoardEvent((event: Event) => {
          if (!mounted) return;
          console.log("[SignalR] board event:", event);
          setCurrentLocation(event);
          notification.info({
            message: event.eventType || "Trip Update",
            description: `Trip #${event.dsId} received an update.`,
            placement: "topRight",
          });
        });

        // ✅ Re-join group after automatic reconnect
        signalRService.onReconnected(async () => {
          if (!mounted) return;
          console.log("[SignalR] Reconnected — rejoining group");
          await signalRService.joinBoardGroup();
        });
        setIsConnected(true);
      } catch (err) {
        console.error("[SignalR] Connection error:", err);
      }
    };

    startTracking();

    return () => {
      mounted = false;
      setIsConnected(false);
      // ✅ Remove listener BEFORE disconnect so no stale callbacks fire
      signalRService.removeReceiveBoardEvent();
      signalRService.leaveBoardGroup().catch(() => { });
      signalRService.disconnect();
    };
  }, [token]);

  return { currentLocation, isConnected };
};

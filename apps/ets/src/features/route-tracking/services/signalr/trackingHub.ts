import { signalRService } from "./SignalRService";
import { type RouteLocationPayload } from "../../types/tracking.types";

export const trackingHub = {
  connect: async (token: string) => {
    await signalRService.connect(token);
  },

  disconnect: async () => {
    await signalRService.disconnect();
  },

  join: async (dsId: number) => {
    console.log(dsId, "dsId");
    await signalRService.joinRouteTrackingGroup(dsId);
  },

  leave: async (dsId: number) => {
    await signalRService.leaveRouteTrackingGroup(dsId);
  },

  onLocationUpdate: (
    callback: (payload: RouteLocationPayload) => void
  ) => {
    signalRService.onReceiveRouteLocation(callback);
  },

  removeLocationUpdateListener: () => {
    signalRService.removeReceiveRouteLocation();
  },
};
import { signalRService } from "./SignalRService";
// import { type RouteLocationPayload } from "../../types/tracking.types";

export const trackingHub = {
  connect: async (token: string) => {
    await signalRService.connect(token);
  },

  disconnect: async () => {
    await signalRService.disconnect();
  },

  join: async () => {
    await signalRService.joinBoardGroup();
  },

  leave: async () => {
    await signalRService.leaveBoardGroup();
  },

  onLocationUpdate: (
    callback: (payload: any) => void
  ) => {
    signalRService.onReceiveBoardEvent(callback);
  },

  removeLocationUpdateListener: () => {
    signalRService.removeReceiveBoardEvent();
  },

  joinLiveTrips: (dsIds: number[]) => signalRService.joinLiveTrips(dsIds),
  leaveLiveTrips: (dsIds: number[]) => signalRService.leaveLiveTrips(dsIds),

  onLiveLocation: (callback: (payload: any) => void) =>
    signalRService.onReceiveLiveLocation(callback),
  removeLiveLocationListener: () =>
    signalRService.removeReceiveLiveLocation(),
};
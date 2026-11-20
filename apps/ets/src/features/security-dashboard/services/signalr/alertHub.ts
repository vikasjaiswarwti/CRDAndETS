import { alertSignalRService } from "./AlertSignalRService";

/**
 * alertHub — thin facade over AlertSignalRService.
 * Mirrors the trackingHub pattern so all hub interactions
 * are consumed through a consistent, named API.
 *
 * Replace `any` in onAlertReceived with your actual alert DTO
 * type once it is defined (e.g. AlertDto from alert.types.ts).
 */
export const alertHub = {
  connect: async (token: string): Promise<void> => {
    await alertSignalRService.connect(token);
  },

  disconnect: async (): Promise<void> => {
    await alertSignalRService.disconnect();
  },

  join: async (): Promise<void> => {
    await alertSignalRService.joinAlertDashboard();
  },

  leave: async (): Promise<void> => {
    await alertSignalRService.leaveAlertDashboard();
  },

  // ─── Listeners ────────────────────────────────────────────────────────────

  /** Main alert push event from server to tenant group */
  onAlertReceived: (callback: (payload: any) => void): void => {
    alertSignalRService.onReceiveAlert(callback);
  },

  removeAlertReceived: (): void => {
    alertSignalRService.removeReceiveAlert();
  },

  onJoined: (callback: (groupName: string) => void): void => {
    alertSignalRService.onJoinedAlertDashboard(callback);
  },

  removeJoined: (): void => {
    alertSignalRService.removeJoinedAlertDashboard();
  },

  onLeft: (callback: (groupName: string) => void): void => {
    alertSignalRService.onLeftAlertDashboard(callback);
  },

  removeLeft: (): void => {
    alertSignalRService.removeLeftAlertDashboard();
  },

  onError: (callback: (message: string) => void): void => {
    alertSignalRService.onAlertError(callback);
  },

  removeError: (): void => {
    alertSignalRService.removeAlertError();
  },

  onReconnected: (callback: (connectionId?: string) => void): void => {
    alertSignalRService.onReconnected(callback);
  },
};
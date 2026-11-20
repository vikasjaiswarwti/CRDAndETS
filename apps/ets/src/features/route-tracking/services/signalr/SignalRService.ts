import * as signalR from "@microsoft/signalr";

const BASE_URL = import.meta.env.VITE_API_BASE_URL_SIGNALR ?? "https://core.commutr.in";

export class SignalRService {
  private connection: signalR.HubConnection | null = null;

  async connect(token: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connection) {
      await this.connection.stop().catch(() => { });
      this.connection = null;
    }

    this.connection = new signalR.HubConnectionBuilder()
      // Token only via accessTokenFactory, NOT in the URL
      .withUrl(`${BASE_URL}/hubs/route-tracking`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    await this.connection.start();
    console.log("[SignalR] Connected");
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop().catch(() => { });
      this.connection = null;
      console.log("[SignalR] Disconnected");
    }
  }

  async joinRouteTrackingGroup(dsId: number): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      console.warn("[SignalR] Cannot join — not connected");
      return;
    }
    try {
      await this.connection.invoke("JoinRouteTrackingGroup", dsId);
      console.log(`[SignalR] Joined group dsId=${dsId}`);
    } catch (err) {
      console.error("[SignalR] JoinRouteTrackingGroup failed:", err);
      throw err;
    }
  }

  async leaveRouteTrackingGroup(dsId: number): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return;
    try {
      await this.connection.invoke("LeaveRouteTrackingGroup", dsId);
      console.log(`[SignalR] Left group dsId=${dsId}`);
    } catch (err) {
      console.warn("[SignalR] LeaveRouteTrackingGroup failed:", err);
    }
  }

  onReceiveRouteLocation(callback: (data: any) => void): void {
    this.connection?.on("ReceiveRouteLocation", callback);
  }

  removeReceiveRouteLocation(): void {
    this.connection?.off("ReceiveRouteLocation");
  }

  // ✅ Exposes onreconnected — caller manages the callback reference
  onReconnected(callback: (connectionId?: string) => void): void {
    this.connection?.onreconnected(callback);
  }
}

export const signalRService = new SignalRService();
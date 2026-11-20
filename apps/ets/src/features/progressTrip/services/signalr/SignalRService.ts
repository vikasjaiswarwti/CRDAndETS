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

  // ---------- Board-level (tenant-wide, no dsId) ----------
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  async joinBoardGroup(): Promise<void> {
    if (!this.isConnected()) {
      console.warn("[SignalR] Cannot join board group — not connected");
      return;
    }
    try {
      await this.connection!.invoke("JoinBoardGroup");
      console.log("[SignalR] Joined board group");
    } catch (err) {
      console.error("[SignalR] JoinBoardGroup failed:", err);
      throw err;
    }
  }

  async leaveBoardGroup(): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.connection!.invoke("LeaveBoardGroup");
      console.log("[SignalR] Left board group");
    } catch (err) {
      console.warn("[SignalR] LeaveBoardGroup failed:", err);
    }
  }
  // ---------- Live trips (per-dsId groups) ----------
  async joinLiveTrips(dsIds: number[]): Promise<void> {
    if (!this.isConnected()) {
      console.warn("[SignalR] Cannot join live trips — not connected");
      return;
    }
    if (!dsIds.length) return;
    try {
      // one array arg → maps to List<long> dsIds
      await this.connection!.invoke("JoinLiveTrips", dsIds);
      console.log("[SignalR] Joined live trips", dsIds);
    } catch (err) {
      console.error("[SignalR] JoinLiveTrips failed:", err);
      throw err;
    }
  }

  async leaveLiveTrips(dsIds: number[]): Promise<void> {
    if (!this.isConnected() || !dsIds.length) return;
    try {
      await this.connection!.invoke("LeaveLiveTrips", dsIds);
      console.log("[SignalR] Left live trips", dsIds);
    } catch (err) {
      console.warn("[SignalR] LeaveLiveTrips failed:", err);
    }
  }
  // ---------- Board-level events (status, pax, no-show, etc.) ----------
  onReceiveBoardEvent(callback: (event: any) => void): void {
    this.connection?.on("ReceiveBoardEvent", callback);
  }

  removeReceiveBoardEvent(): void {
    this.connection?.off("ReceiveBoardEvent");
  }
  // // ⚠ Confirm this event name against your hub's SendAsync(...) call
  // onReceiveLiveLocation(callback: (payload: any) => void): void {
  //   this.connection?.on("ReceiveLiveLocation", callback);
  // }

  // removeReceiveLiveLocation(): void {
  //   this.connection?.off("ReceiveLiveLocation");
  // }

  // ✅ Exposes onreconnected — caller manages the callback reference
  onReconnected(callback: (connectionId?: string) => void): void {
    this.connection?.onreconnected(callback);
  }


  // To this:
  onReceiveLiveLocation(callback: (payload: any) => void): void {
    this.connection?.on("ReceiveLivePosition", callback);  // ✅ matches server
  }

  removeReceiveLiveLocation(): void {
    this.connection?.off("ReceiveLivePosition");  // ✅
  }

}

export const signalRService = new SignalRService();
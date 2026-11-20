import * as signalR from "@microsoft/signalr";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_SIGNALR ?? "https://core.commutr.in";

/**
 * Dedicated SignalR service for the AlertHub (/hubs/alerts).
 * Kept as a separate instance from SignalRService (tracking hub)
 * because ASP.NET Core SignalR does not multiplex multiple hubs
 * over a single connection.
 */
export class AlertSignalRService {
  private connection: signalR.HubConnection | null = null;

  // ─── Connection lifecycle ────────────────────────────────────────────────

  async connect(token: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Stop any stale connection before creating a new one
    if (this.connection) {
      await this.connection.stop().catch(() => {});
      this.connection = null;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/alerts`, {
        // Token is supplied via accessTokenFactory so SignalR
        // passes it as ?access_token= query param automatically.
        // Do NOT embed it in the URL string directly.
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    await this.connection.start();
    console.log("[AlertSignalR] Connected");
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop().catch(() => {});
      this.connection = null;
      console.log("[AlertSignalR] Disconnected");
    }
  }

  // ─── Hub method invocations ──────────────────────────────────────────────

  async joinAlertDashboard(): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      console.warn("[AlertSignalR] Cannot join — not connected");
      return;
    }
    try {
      await this.connection.invoke("JoinAlertDashboard");
      console.log("[AlertSignalR] Joined alert dashboard group");
    } catch (err) {
      console.error("[AlertSignalR] JoinAlertDashboard failed:", err);
      throw err;
    }
  }

  async leaveAlertDashboard(): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    try {
      await this.connection.invoke("LeaveAlertDashboard");
      console.log("[AlertSignalR] Left alert dashboard group");
    } catch (err) {
      console.warn("[AlertSignalR] LeaveAlertDashboard failed:", err);
    }
  }

  // ─── Event listeners ─────────────────────────────────────────────────────

  /**
   * Registers a listener for alert payloads pushed by the server.
   * Replace `any` with your actual alert DTO type once defined.
   */
  onReceiveAlert(callback: (data: any) => void): void {
    // Remove any previously registered handler first to prevent stacking
    this.connection?.off("ReceiveAlert");
    this.connection?.on("ReceiveAlert", callback);
  }

  removeReceiveAlert(): void {
    this.connection?.off("ReceiveAlert");
  }

  /** Fired by server after a successful JoinAlertDashboard invocation */
  onJoinedAlertDashboard(callback: (groupName: string) => void): void {
    this.connection?.off("JoinedAlertDashboard");
    this.connection?.on("JoinedAlertDashboard", callback);
  }

  removeJoinedAlertDashboard(): void {
    this.connection?.off("JoinedAlertDashboard");
  }

  /** Fired by server after a successful LeaveAlertDashboard invocation */
  onLeftAlertDashboard(callback: (groupName: string) => void): void {
    this.connection?.off("LeftAlertDashboard");
    this.connection?.on("LeftAlertDashboard", callback);
  }

  removeLeftAlertDashboard(): void {
    this.connection?.off("LeftAlertDashboard");
  }

  /** Fired by server when tenant cannot be identified for the connection */
  onAlertError(callback: (message: string) => void): void {
    this.connection?.off("AlertError");
    this.connection?.on("AlertError", callback);
  }

  removeAlertError(): void {
    this.connection?.off("AlertError");
  }

  /**
   * Registers a reconnected callback.
   * Caller is responsible for managing the callback reference
   * (re-join the group inside this callback).
   */
  onReconnected(callback: (connectionId?: string) => void): void {
    this.connection?.onreconnected(callback);
  }
}

// Singleton — one alert connection per app session
export const alertSignalRService = new AlertSignalRService();
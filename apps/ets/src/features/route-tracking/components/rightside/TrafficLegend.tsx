import {
  TRAFFIC_CONFIG,
  vehicleSpeedKMH,
  type TrafficStatus,
} from "../../constants/trackConstant";

const LEGEND_ORDER: TrafficStatus[] = [
  "stopped",
  "heavy-traffic",
  "traffic",
  "normal",
  "overspeed",
];

const TRAFFIC_SPEED_LABEL: Record<TrafficStatus, string> = {
  stopped: `≤ ${vehicleSpeedKMH.STOPPED_KMH} km/h`,
  "heavy-traffic": `${vehicleSpeedKMH.STOPPED_KMH}-${vehicleSpeedKMH.HEAVY_TRAFFIC_KMH} km/h`,
  traffic: `${vehicleSpeedKMH.HEAVY_TRAFFIC_KMH}-${vehicleSpeedKMH.TRAFFIC_KMH} km/h`,
  normal: `${vehicleSpeedKMH.TRAFFIC_KMH}-${vehicleSpeedKMH.OVERSPEED_KMH} km/h`,
  overspeed: `≥ ${vehicleSpeedKMH.OVERSPEED_KMH} km/h`,
};
const TrafficLegend = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "25%",
        right: 8,
        zIndex: 10,
        background: "#ffffff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        fontSize: 11,
        fontFamily: "inherit",
      }}
    >
      {LEGEND_ORDER.map((key) => {
        const { label, color } = TRAFFIC_CONFIG[key];
        return (
          <div
            key={key}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#374151" }}>{label}</span>
            <span
              style={{ color: "#9ca3af", marginLeft: "auto", paddingLeft: 8 }}
            >
              {TRAFFIC_SPEED_LABEL[key]}
            </span>
          </div>
        );
      })}
    </div>
  );
};
export default TrafficLegend;

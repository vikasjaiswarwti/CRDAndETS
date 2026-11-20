// ─── components/EfficiencyLegend.tsx ─────────────────────────────────────────
// Passenger efficiency colour legend — rendered as an overlay on the map.

const LEGEND_ITEMS: Array<[string, string]> = [
  ["90%+ Good", "#10B981"],
  ["70–89%", "#F59E0B"],
  ["50–69%", "#F97316"],
  ["Risk / Late", "#EF4444"],
];

export default function EfficiencyLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: 14,
        background: "rgba(255,255,255,0.93)",
        borderRadius: 7,
        border: "1px solid #E4E7EF",
        padding: "8px 12px",
        fontSize: 10,
        backdropFilter: "blur(4px)",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#6B7280",
          marginBottom: 5,
          fontSize: 9,
          letterSpacing: "0.06em",
        }}
      >
        PASSENGER EFFICIENCY
      </div>
      {LEGEND_ITEMS.map(([label, color]) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          <div
            style={{ width: 22, height: 4, background: color, borderRadius: 2 }}
          />
          <span style={{ color: "#6B7280" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

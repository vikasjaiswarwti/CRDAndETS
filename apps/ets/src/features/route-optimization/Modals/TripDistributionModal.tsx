import { T } from "../constants/designTokens";
import { useGetVendorRouteAllocationQuery } from "../services/routeMakerApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

interface Props {
  locCode: number;
  shiftId: number;
  routeDate: string;
  onClose: () => void;
}

interface AllocationItem {
  transporterId: number;
  vendor_Name: string;
  vendorRouteCount: number;
  totalRouteCount: number;
  allocationPercentage: number;
}

const TOP_N = 8;

// ── HSL color generator — works for any N ────────────────────────────────────
function getColor(index: number, total: number): string {
  return `hsl(${Math.round((index * 360) / total)}, 65%, 52%)`;
}

// ── Collapse to top N + "Others" ─────────────────────────────────────────────
function collapseItems(items: AllocationItem[]): AllocationItem[] {
  if (items.length <= TOP_N) return items;
  const sorted = [...items].sort(
    (a, b) => b.allocationPercentage - a.allocationPercentage,
  );
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const othersRouteCount = rest.reduce((s, i) => s + i.vendorRouteCount, 0);
  const totalRouteCount = items[0]?.totalRouteCount ?? 0;
  const othersPct = rest.reduce((s, i) => s + i.allocationPercentage, 0);
  top.push({
    transporterId: -1,
    vendor_Name: `Others (${rest.length} vendors)`,
    vendorRouteCount: othersRouteCount,
    totalRouteCount,
    allocationPercentage: parseFloat(othersPct.toFixed(2)),
  });
  return top;
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function PieChart({ items }: { items: AllocationItem[] }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const inner = 36;
  const total = items[0]?.totalRouteCount ?? 0;
  const n = items.length;

  if (n === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill={getColor(0, 1)} />
        <circle cx={cx} cy={cy} r={inner} fill={T.card} />
        <text
          x={cx}
          y={cy - 7}
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill={T.text}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="10"
          fill={T.muted}
        >
          routes
        </text>
      </svg>
    );
  }

  let angle = -Math.PI / 2;
  const slices = items.map((item, i) => {
    if (item.allocationPercentage <= 0) return null;
    const sweep = (item.allocationPercentage / 100) * 2 * Math.PI;
    const end = angle + sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const color = i === TOP_N ? "#9CA3AF" : getColor(i, n); // grey for Others

    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const ix1 = cx + inner * Math.cos(angle);
    const iy1 = cy + inner * Math.sin(angle);
    const ix2 = cx + inner * Math.cos(end);
    const iy2 = cy + inner * Math.sin(end);

    const d = `M${ix1} ${iy1} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${ix2} ${iy2} A${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1}Z`;
    angle = end;
    return <path key={i} d={d} fill={color} stroke={T.card} strokeWidth="2" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill={T.text}
      >
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill={T.muted}>
        routes
      </text>
    </svg>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function TripDistributionModal({
  locCode,
  shiftId,
  routeDate,
  onClose,
}: Props) {
  const { Modal } = useUILibrary();
  const { data, isLoading, isError } = useGetVendorRouteAllocationQuery({
    locCode,
    shiftId,
    routeDate,
  });

  const rawItems: AllocationItem[] = data?.result ?? [];
  const items = collapseItems(rawItems);
  const n = items.length;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      title={
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
            Trip Distribution
          </div>
          <div
            style={{
              fontSize: 11,
              color: T.muted,
              fontWeight: 400,
              marginTop: 2,
            }}
          >
            {routeDate} · Shift {shiftId} · {rawItems.length} vendor
            {rawItems.length !== 1 ? "s" : ""}
          </div>
        </div>
      }
      width={480}
    >
      {isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: T.muted,
            fontSize: 13,
          }}
        >
          Loading…
        </div>
      )}
      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "#EF4444",
            fontSize: 13,
          }}
        >
          Failed to load data.
        </div>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: T.muted,
            fontSize: 13,
          }}
        >
          No vendor data available.
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 24,
            padding: "8px 0",
          }}
        >
          {/* Left: donut */}
          <div style={{ flexShrink: 0 }}>
            <PieChart items={items} />
          </div>

          {/* Right: scrollable legend */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 200,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {items.map((item, i) => {
              const isOthers = item.transporterId === -1;
              const color = isOthers ? "#9CA3AF" : getColor(i, n);
              return (
                <div key={item.transporterId}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: color,
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: T.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.vendor_Name}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 11, color: T.muted }}>
                        {item.vendorRouteCount} of {item.totalRouteCount} trips
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color,
                          minWidth: 38,
                          textAlign: "right",
                        }}
                      >
                        {item.allocationPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ height: 4, borderRadius: 2, background: T.border }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background: color,
                        width: `${item.allocationPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

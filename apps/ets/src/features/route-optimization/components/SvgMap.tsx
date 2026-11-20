// ─── components/SvgMap.tsx ────────────────────────────────────────────────────
// Pure SVG map — no map library dependency.
// Renders Pune road network, route polylines, passenger markers, office dot.

import {
  project,
  SVG_W,
  SVG_H,
  PUNE_ROADS,
  PUNE_AREA_LABELS,
  OFFICE_LOCATION,
} from "../constants/mapConstants";
import type { VehicleRoute } from "../types/Routemaker.types";

interface Props {
  routes: VehicleRoute[];
  colorMap: Record<number, string>;
  activeVehicleId: number | null;
  onRouteClick: (vehicleId: number) => void;
}

export default function SvgMap({
  routes,
  colorMap,
  activeVehicleId,
  onRouteClick,
}: Props) {
  const officePt = project(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: "100%", height: "100%", display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Base background ── */}
      <rect width={SVG_W} height={SVG_H} fill="#e8e4d9" />

      {/* ── River (Mula-Mutha) ── */}
      <path
        d="M 80,290 C 150,278 250,272 370,268 C 450,265 530,278 620,295"
        fill="none"
        stroke="#b8d4e8"
        strokeWidth={6}
        strokeOpacity={0.6}
      />

      {/* ── Road network ── */}
      {PUNE_ROADS.map((road, i) => (
        <path
          key={i}
          d={road.d}
          fill="none"
          stroke={road.strokeColor ?? "#c8c1b5"}
          strokeWidth={road.strokeWidth ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* ── Area labels ── */}
      {PUNE_AREA_LABELS.map(({ label, lat, lng }) => {
        const p = project(lat, lng);
        return (
          <text
            key={label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            fontSize="9"
            fill="#8a7f6e"
            fontFamily="Inter,-apple-system,sans-serif"
          >
            {label}
          </text>
        );
      })}

      {/* ── Route polylines ── */}
      {routes.map((route) => {
        const color = colorMap[route.VehicleId] ?? "#3B82F6";
        const isActive = activeVehicleId === route.VehicleId;
        const pts = [...route.Waypoints]
          .sort((a, b) => a.Sequence - b.Sequence)
          .map((w) => project(w.Lat, w.Lng));

        if (pts.length < 2) return null;

        const d = pts
          .map(
            (p, i) =>
              `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
          )
          .join(" ");

        return (
          <g key={route.VehicleId}>
            {/* drop shadow */}
            <path
              d={d}
              fill="none"
              stroke="#000"
              strokeWidth={isActive ? 8 : 5}
              strokeOpacity={0.07}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* route line */}
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 6 : 3.5}
              strokeOpacity={isActive ? 1 : activeVehicleId ? 0.45 : 0.85}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ cursor: "pointer" }}
              onClick={() => onRouteClick(route.VehicleId)}
            />
          </g>
        );
      })}

      {/* ── Passenger stop markers ── */}
      {routes.map((route) => {
        // const color = colorMap[route.VehicleId] ?? "#3B82F6";
        const isActive = activeVehicleId === route.VehicleId;

        return route.Passengers.map((p) => {
          const pt = project(p.Lat, p.Lng);
          const r = isActive ? 13 : 11;

          return (
            <g
              key={`${route.VehicleId}-${p.Id}`}
              style={{ cursor: "pointer" }}
              onClick={() => onRouteClick(route.VehicleId)}
            >
              {/* halo */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={r + 2}
                fill="#fff"
                opacity={0.55}
              />
              {/* badge */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={r}
                fill="#1E2937"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={pt.x}
                y={pt.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={isActive ? 11 : 9}
                fontWeight="bold"
                fontFamily="Inter,-apple-system,sans-serif"
              >
                {p.PickupSequence}
              </text>
            </g>
          );
        });
      })}

      {/* ── Office marker ── */}
      <circle
        cx={officePt.x}
        cy={officePt.y}
        r={14}
        fill="white"
        opacity={0.65}
      />
      <circle
        cx={officePt.x}
        cy={officePt.y}
        r={11}
        fill="#3B82F6"
        stroke="white"
        strokeWidth={2.5}
      />
      <text
        x={officePt.x}
        y={officePt.y + 24}
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#1E2937"
        fontFamily="Inter,-apple-system,sans-serif"
      >
        OFFICE
      </text>
    </svg>
  );
}

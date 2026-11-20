// ─── map/markerIcons.ts ───────────────────────────────────────────────────────
// SVG-based data-URI marker icon factories.
// All icons are pure SVG — no external images, no CDN dependency.

import { MAP_ENGINE_CONFIG } from "./Mapengineconfig";

const { MARKER_SIZE, MARKER_SIZE_HIGHLIGHTED } = MAP_ENGINE_CONFIG;

// ─── Numbered stop marker (e.g. "3" inside a colored circle) ─────────────────

/**
 * Creates a circular numbered stop marker.
 * @param number  - The stop sequence number to display
 * @param color   - Fill color (hex / rgb)
 * @param size    - Icon width & height in px (default from config)
 */
export function createNumberedMarkerIcon(
  number: number,
  color: string,
  size = MARKER_SIZE,
): google.maps.Icon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="#fff" stroke-width="2.5"/>
      <text x="16" y="21" text-anchor="middle"
            font-family="Inter,system-ui,sans-serif"
            font-size="${number > 9 ? "12" : "14"}"
            font-weight="700"
            fill="#fff">
        ${number}
      </text>
    </svg>`.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

// ─── Highlighted / active stop marker (pulsing ring) ─────────────────────────

/**
 * Creates a larger, visually highlighted marker for the focused stop.
 */
export function createHighlightedMarkerIcon(
  number: number,
  color: string,
  size = MARKER_SIZE_HIGHLIGHTED,
): google.maps.Icon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 38 38">
      <!-- outer glow ring -->
      <circle cx="19" cy="19" r="18" fill="${color}" opacity="0.25"/>
      <!-- inner solid circle -->
      <circle cx="19" cy="19" r="13" fill="${color}" stroke="#fff" stroke-width="2.5"/>
      <text x="19" y="24" text-anchor="middle"
            font-family="Inter,system-ui,sans-serif"
            font-size="${number > 9 ? "13" : "15"}"
            font-weight="700"
            fill="#fff">
        ${number}
      </text>
    </svg>`.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

// ─── Cluster icon (shows count of grouped stops) ──────────────────────────────

/**
 * Creates a cluster bubble icon for RawClusterEngine / MarkerClusterer.
 * @param count  - Number of stops in this cluster
 * @param color  - Dominant route color for the cluster
 */
export function createClusterIcon(count: number, color = "#3B82F6"): string {
  const size = count > 9 ? 44 : 38;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill="${color}" opacity="0.18"/>
      <circle cx="22" cy="22" r="16" fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="22" y="27" text-anchor="middle"
            font-family="Inter,system-ui,sans-serif"
            font-size="${count > 99 ? "10" : "13"}"
            font-weight="700"
            fill="#fff">
        ${count > 99 ? "99+" : count}
      </text>
    </svg>`.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// src/features/route-maker/map/markerIcons.ts
//

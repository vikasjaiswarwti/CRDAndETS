// ─── map/Rawcluster.ts ────────────────────────────────────────────────────────
// Zero-dependency grid-based marker clustering fallback.
// Used when MAP_ENGINE_CONFIG.USE_MARKER_CLUSTERER_LIBRARY = false
// (avoids adding @googlemaps/markerclusterer to the bundle).
//
// Algorithm: divides the current viewport into a pixel-space grid.
// Markers that fall into the same cell are collapsed into one cluster icon.
// Re-clusters automatically on every map 'idle' event.

import { createClusterIcon } from "./markerIcons";
import { MAP_ENGINE_CONFIG } from "./Mapengineconfig";

const { CLUSTER_GRID_SIZE, CLUSTER_MIN_COUNT } = MAP_ENGINE_CONFIG;

interface ClusterCell {
  markers: google.maps.Marker[];
  lat: number;
  lng: number;
  color: string;
}

export class RawClusterEngine {
  private map: google.maps.Map;
  private sourceMarkers: google.maps.Marker[] = [];
  private clusterMarkers: google.maps.Marker[] = [];
  private idleListener: google.maps.MapsEventListener | null = null;

  constructor(map: google.maps.Map) {
    this.map = map;
    // Re-cluster whenever the map finishes panning / zooming
    this.idleListener = google.maps.event.addListener(map, "idle", () => {
      this._recluster();
    });
  }

  /** Register markers to be clustered. Call once after rendering route markers. */
  addMarkers(markers: google.maps.Marker[]): void {
    this.sourceMarkers = [...this.sourceMarkers, ...markers];
    this._recluster();
  }

  /** Remove all cluster overlays and detach listeners. */
  destroy(): void {
    this._clearClusterMarkers();
    if (this.idleListener) {
      google.maps.event.removeListener(this.idleListener);
      this.idleListener = null;
    }
    this.sourceMarkers = [];
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private _clearClusterMarkers(): void {
    this.clusterMarkers.forEach((m) => m.setMap(null));
    this.clusterMarkers = [];
  }

  private _recluster(): void {
    this._clearClusterMarkers();

    const projection = this.map.getProjection();
    if (!projection) return; // map not ready yet — next idle will retry

    const zoom = this.map.getZoom() ?? 12;
    const scale = Math.pow(2, zoom);
    const cells = new Map<string, ClusterCell>();

    for (const marker of this.sourceMarkers) {
      const pos = marker.getPosition();
      if (!pos) continue;

      const worldPt = projection.fromLatLngToPoint(pos);
      if (!worldPt) continue;

      const px = Math.floor((worldPt.x * scale) / CLUSTER_GRID_SIZE);
      const py = Math.floor((worldPt.y * scale) / CLUSTER_GRID_SIZE);
      const key = `${px}:${py}`;

      if (!cells.has(key)) {
        // Retrieve color stored in marker title as fallback
        const color =
          (marker as google.maps.Marker & { _routeColor?: string })
            ._routeColor ?? "#3B82F6";
        cells.set(key, { markers: [], lat: pos.lat(), lng: pos.lng(), color });
      }
      cells.get(key)!.markers.push(marker);
    }

    for (const cell of cells.values()) {
      if (cell.markers.length < CLUSTER_MIN_COUNT) {
        // Not enough to cluster — leave individual markers visible
        cell.markers.forEach((m) => m.setMap(this.map));
        continue;
      }

      // Hide individual markers
      cell.markers.forEach((m) => m.setMap(null));

      // Compute centroid
      const lat =
        cell.markers.reduce((s, m) => s + (m.getPosition()?.lat() ?? 0), 0) /
        cell.markers.length;
      const lng =
        cell.markers.reduce((s, m) => s + (m.getPosition()?.lng() ?? 0), 0) /
        cell.markers.length;

      const clusterMarker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        icon: {
          url: createClusterIcon(cell.markers.length, cell.color),
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 22),
        },
        title: `${cell.markers.length} stops`,
        zIndex: 1000,
      });

      this.clusterMarkers.push(clusterMarker);
    }
  }
}

// ─── map/Mapengineconfig.ts ───────────────────────────────────────────────────
// Central configuration for the Google Maps rendering engine.
// Change values here — nothing else needs touching.

export interface MapEngineConfig {
  /**
   * true  → use @googlemaps/markerclusterer for stop clustering
   * false → use RawClusterEngine (zero-dependency grid fallback)
   */
  USE_MARKER_CLUSTERER_LIBRARY: boolean;

  // ── Polyline visual settings ─────────────────────────────────────────────
  /** Normal route polyline stroke weight (px) */
  POLYLINE_WEIGHT: number;
  /** Focused / selected route stroke weight (px) */
  POLYLINE_WEIGHT_FOCUSED: number;
  /** Normal polyline opacity (0–1) */
  POLYLINE_OPACITY: number;
  /** Dimmed polyline opacity when another route is focused */
  POLYLINE_OPACITY_DIMMED: number;
  /** Focused polyline opacity */
  POLYLINE_OPACITY_FOCUSED: number;

  // ── Marker settings ──────────────────────────────────────────────────────
  /** Pixel size of numbered stop markers */
  MARKER_SIZE: number;
  /** Pixel size of the highlighted/active stop marker */
  MARKER_SIZE_HIGHLIGHTED: number;

  // ── Clustering ───────────────────────────────────────────────────────────
  /** Grid cell size in pixels for RawClusterEngine */
  CLUSTER_GRID_SIZE: number;
  /** Minimum stops in a cell before they collapse into a cluster icon */
  CLUSTER_MIN_COUNT: number;
}

export const MAP_ENGINE_CONFIG: MapEngineConfig = {
  USE_MARKER_CLUSTERER_LIBRARY: false, // flip to true once the package is installed

  POLYLINE_WEIGHT: 5,
  POLYLINE_WEIGHT_FOCUSED: 7,
  POLYLINE_OPACITY: 0.85,
  POLYLINE_OPACITY_DIMMED: 0.25,
  POLYLINE_OPACITY_FOCUSED: 1.0,

  MARKER_SIZE: 32,
  MARKER_SIZE_HIGHLIGHTED: 38,

  CLUSTER_GRID_SIZE: 60,
  CLUSTER_MIN_COUNT: 2,
};

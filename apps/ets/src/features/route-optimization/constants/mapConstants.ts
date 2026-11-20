// ─── constants/mapConstants.ts ────────────────────────────────────────────────
// SVG map projection config and Pune road-network geometry.
// project() converts a real lat/lng to SVG pixel coordinates.

export const OFFICE_LOCATION = { lat: 18.5108, lng: 73.9282 } as const;

// Pune bounding box for the SVG viewport
export const MAP_BOUNDS = {
  minLat: 18.38,
  maxLat: 18.68,
  minLng: 73.68,
  maxLng: 74.0,
} as const;

export const SVG_W = 700;
export const SVG_H = 560;

/** Convert a real-world lat/lng to SVG pixel coordinates. */
export const project = (
  lat: number,
  lng: number,
): { x: number; y: number } => ({
  x:
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) *
    SVG_W,
  y:
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
    SVG_H,
});

// Approximate SVG paths for Pune's major road network.
// Drawn as <path> elements behind the route polylines.
export interface RoadSegment {
  d: string;
  strokeWidth?: number;
  strokeColor?: string;
}

export const PUNE_ROADS: RoadSegment[] = [
  // NH48 / Mumbai–Pune Expressway (NW → SE)
  {
    d: "M 60,120 C 150,150 260,190 380,240 C 460,272 530,305 590,330",
    strokeWidth: 3,
  },
  // Pune Ring Road (outer loop)
  {
    d: "M 200,120 C 280,80 400,75 510,110 C 590,140 640,200 650,290 C 655,360 620,430 550,470 C 470,510 360,520 260,490 C 170,460 110,390 100,300 C 90,220 130,160 200,120",
    strokeWidth: 2,
  },
  // Sinhagad Road (SW diagonal)
  { d: "M 290,310 C 250,360 210,410 170,460", strokeWidth: 2 },
  // NH65 / Solapur Road (SE)
  { d: "M 540,315 C 570,370 600,420 640,480", strokeWidth: 2 },
  // Katraj–Dehu Road (N–S through centre)
  {
    d: "M 370,75 C 365,160 355,240 350,310 C 345,380 340,430 330,490",
    strokeWidth: 1.5,
  },
  // FC Road / JM Road (E–W connector)
  {
    d: "M 240,260 C 300,255 360,250 420,248 C 470,246 510,250 560,260",
    strokeWidth: 1.5,
  },
  // Paud Road
  { d: "M 180,300 C 230,295 290,292 350,290", strokeWidth: 1.5 },
  // Nagar Road (E)
  { d: "M 540,260 C 580,255 620,248 660,240", strokeWidth: 1.5 },
];

// Static area labels rendered as <text> on the map background
export interface AreaLabel {
  label: string;
  lat: number;
  lng: number;
}

export const PUNE_AREA_LABELS: AreaLabel[] = [
  { label: "Wakad", lat: 18.598, lng: 73.761 },
  { label: "Baner", lat: 18.559, lng: 73.789 },
  { label: "Pimpri", lat: 18.625, lng: 73.803 },
  { label: "Chinchwad", lat: 18.601, lng: 73.809 },
  { label: "Kothrud", lat: 18.507, lng: 73.807 },
  { label: "Katraj", lat: 18.449, lng: 73.859 },
  { label: "Kondhwa", lat: 18.478, lng: 73.89 },
  { label: "Viman Nagar", lat: 18.567, lng: 73.912 },
  { label: "Koregaon Pk", lat: 18.538, lng: 73.894 },
  { label: "Hadapsar", lat: 18.506, lng: 73.927 },
  { label: "Shivajinagar", lat: 18.531, lng: 73.848 },
  { label: "Aundh", lat: 18.551, lng: 73.815 },
  { label: "Deccan", lat: 18.517, lng: 73.845 },
];

export const ENABLE_ALLOCATION_ORCHESTRATOR = false;

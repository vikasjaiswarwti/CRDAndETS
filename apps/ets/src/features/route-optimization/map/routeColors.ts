// ─── map/routeColors.ts ───────────────────────────────────────────────────────
// Route color palette — shared by useRouteMap and the adapter layer.
// Colors are chosen to be visually distinct on both light and satellite tiles.

export const ROUTE_COLORS: string[] = [
  "#3B82F6", // blue      — Route index 0
  "#10B981", // emerald   — Route index 1
  "#F59E0B", // amber     — Route index 2
  "#8B5CF6", // violet    — Route index 3
  "#06B6D4", // cyan      — Route index 4
  "#EC4899", // pink      — Route index 5
  "#F97316", // orange    — Route index 6
  "#0D9488", // teal      — Route index 7
];

/**
 * Returns a stable color for a route by index.
 * Wraps around if there are more routes than colors.
 */
export function getRouteColor(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

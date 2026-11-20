// src/features/routing/constants/RouteActionRegistry.ts
//
// ── Single source of truth: dropdown action → modal ─────────────────────────
// Every footer dropdown item the backend returns (`RouteDropdownItem { id, name }`)
// is resolved to exactly one entry below, BY ID ONLY. The backend guarantees
// these ids never change even if the display `name` is renamed — so opening a
// modal never depends on label text anywhere in the app.
//
// StickyTableFooter just calls `resolveRouteAction(item)` and uses whatever
// comes back. Nothing else needs to know how a backend action maps to a modal.
//
// To wire up a new/changed action: add its id (from the live
// `/route-edit-dropdown` response) to the right entry's `ids` array below.
// That's the only change needed — no other file touches this mapping.
import type { RouteDropdownItem, RouteModalKey } from "../types/RouteTypes";

export interface ShiftRow {
  shiftId: number;
  tripType: number; // 1 | 2 — present on both RoutePlanningRow and TripPublishingRow
  shiftTime?: string;
}

export interface RouteActionContext {
  locCode: number;
  currentDate: string;
  panelType: "planning" | "publishing";
  row0: ShiftRow;
  selectedRows: ShiftRow[];
  shifts: { shiftId: number; tripType: number }[];
}

export interface RouteActionDefinition {
  /** Internal identifier for this business action — never shown to the backend or user. */
  actionKey: string;
  /** Stable backend action ids from GET /route-edit-dropdown. The ONLY thing matched on. */
  ids: string[];
  /** Documentation only — the backend's current display label. Never used for matching. */
  label: string;
  singleShiftOnly?: boolean;
  blockedOnPastDate?: boolean;
  resolveModalKey: (ctx: RouteActionContext) => RouteModalKey;
  buildPayload: (ctx: RouteActionContext) => Record<string, unknown>;
}

export function getTripType(row: ShiftRow): 1 | 2 {
  return row.tripType as 1 | 2;
}

// ── Registry ──────────────────────────────────────────────────────────────────
// ids sourced from the live GET /route-edit-dropdown response (2026-07-31).
export const ROUTE_ACTION_REGISTRY: RouteActionDefinition[] = [
  {
    actionKey: "GENERATE_ROUTES",
    ids: ["DA983F2A-1AD4-44EC-A2E6-6CDEF84B31A9"], // routePlanning: "Generate Route"
    label: "Generate Route",
    blockedOnPastDate: true,
    resolveModalKey: () => "GENERATE_ROUTES",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shifts: ctx.selectedRows,
      tripDate: ctx.currentDate,
    }),
  },
  {
    actionKey: "COPY_ROUTES",
    ids: ["627C75CF-A10B-4A83-8DA3-C7ECB902680F"], // routePlanning: "Copy Route"
    label: "Copy Route",
    singleShiftOnly: true,
    blockedOnPastDate: true,
    resolveModalKey: () => "COPY_ROUTES",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
      tripDate: ctx.currentDate,
    }),
  },
  {
    actionKey: "INTER_SHIFT_COPY",
    ids: ["81FBD5E3-61F9-470C-830E-8C231560E360"], // routePlanning: "Inter Shift Copy"
    label: "Inter Shift Copy",
    singleShiftOnly: true,
    blockedOnPastDate: true,
    resolveModalKey: () => "INTER_SHIFT_COPY",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      date: ctx.currentDate,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
    }),
  },
  {
    actionKey: "DELETE_ROUTE",
    ids: [
      "F077C9AB-3C38-4013-A45A-95FCF2A9D45E", // routePlanning: "Delete Route"
      "6D37CB1B-060F-4DC2-867A-C1B60988E643", // routePublishing: "Delete"
    ],
    label: "Delete Route",
    singleShiftOnly: true,
    blockedOnPastDate: true,
    resolveModalKey: () => "DELETE_ROUTE",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shifts: ctx.shifts,
      tripDate: ctx.currentDate,
    }),
  },
  {
    // Two separate ids per panel — the id itself now disambiguates which
    // modal opens, no more guessing by panelType/name.
    actionKey: "DOWNLOAD_ROUTE_DATA",
    ids: ["69EE43BB-DEF1-406F-8EF7-BD1118A1E412"], // routePlanning: "Download"
    label: "Download (Route Planning)",
    singleShiftOnly: true,
    resolveModalKey: () => "DOWNLOAD_ROUTE_DATA",
    buildPayload: (ctx) => ({
      date: ctx.currentDate,
      shiftId: String(ctx.row0.shiftId),
      locCode: ctx.locCode,
      tripType: getTripType(ctx.row0),
    }),
  },
  {
    actionKey: "DOWNLOAD_REPORTS",
    ids: ["0939275B-7C8F-4D43-9B2A-4FEF0F8006DA"], // routePublishing: "Download"
    label: "Download (Trip Publishing)",
    singleShiftOnly: true,
    resolveModalKey: () => "DOWNLOAD_REPORTS",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      date: ctx.currentDate,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
    }),
  },
  {
    actionKey: "UPLOAD_VEHICLE_FILE",
    ids: [
      "65BE262A-86BF-48F8-BEED-92AFBAC6A546", // routePlanning: "Upload Vehicle"
      "A5D48830-8C3B-41B2-B816-B941E908AFDF", // routePublishing: "Upload Vehicle"
      "64F18BB3-09DD-4FF3-AEAF-BF37E0A5471B",
    ],
    label: "Upload Vehicle",
    singleShiftOnly: true,
    blockedOnPastDate: true,
    resolveModalKey: () => "UPLOAD_VEHICLE_FILE",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
      routeDate: ctx.currentDate,
    }),
  },
  {
    // Modal key is "UPDATE_TRIPSHEETS" for historical reasons, but its actual
    // implementation (UpdateTripsheetsModal.tsx) fetches this shift's
    // unpublished trips and publishes them — i.e. this IS "Publish Trip".
    actionKey: "PUBLISH_TRIP",
    ids: ["EE7DCFC0-5AD7-4E48-A840-E1649AF7B2BC"], // routePublishing: "Publish Trip"
    label: "Publish Trip",
    singleShiftOnly: true,
    resolveModalKey: () => "UPDATE_TRIPSHEETS",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
      date: ctx.currentDate,
    }),
  },
  {
    actionKey: "ASSIGN_PHYSICAL_ID",
    ids: ["95AA7C73-C5D1-4B07-8FF7-CC3286CAB07B"], // routePublishing: "Assign Physical Id"
    label: "Assign Physical Id",
    singleShiftOnly: true,
    blockedOnPastDate: true,
    resolveModalKey: () => "ASSIGN_PHYSICAL_ID",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
      routeDate: ctx.currentDate,
    }),
  },
  {
    actionKey: "PUBLISH_WITH_ETA",
    ids: ["27B9E02A-10DC-468F-85E1-0305CB857EBE"], // routePublishing: "Publish With ETA"
    label: "Publish With ETA",
    singleShiftOnly: true,
    resolveModalKey: () => "PublishWithETA",
    buildPayload: (ctx) => ({
      locCode: ctx.locCode,
      shiftId: ctx.row0.shiftId,
      tripType: getTripType(ctx.row0),
      routeDate: ctx.currentDate,
    }),
  },

  // ── Known but not yet wired ────────────────────────────────────────────────
  // routePublishing: "Allocate Vendor" — id 64F18BB3-09DD-4FF3-AEAF-BF37E0A5471B
  // No modal in this codebase currently implements a vendor-allocation flow
  // (UploadVehicleFileModal is a file-upload flow; UpdateTripsheetsModal is
  // the publish-trip flow above). Deliberately left unmapped rather than
  // guessed — selecting it will show "not configured" + a console warning
  // with this id until a real modal/action is wired to it.
];

const BY_ID = new Map<string, RouteActionDefinition>();
for (const def of ROUTE_ACTION_REGISTRY) {
  def.ids.forEach((id) => BY_ID.set(id, def));
}

/**
 * Resolves a backend dropdown item to its action definition — by `id` only.
 * The `name` is never consulted, so a backend label rename can never break
 * (or silently change) which modal opens.
 */
export function resolveRouteAction(
  item: Pick<RouteDropdownItem, "id" | "name">,
): RouteActionDefinition | null {
  const def = BY_ID.get(item.id);
  if (!def) {
    console.warn(
      `[RouteActionRegistry] Unmapped action id "${item.id}" (name: "${item.name}"). ` +
        `Add it to the right entry's "ids" array in RouteActionRegistry.ts.`,
    );
  }
  return def ?? null;
}

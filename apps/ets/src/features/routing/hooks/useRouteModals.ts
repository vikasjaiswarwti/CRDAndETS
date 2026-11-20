// src/features/routeManagement/hooks/useRouteModals.ts
import { useState, useCallback } from "react";
import type { RouteModalState, RouteModalKey } from "../types/RouteTypes";
import type {
  GenerateRoutesPayload,
  CopyRoutesPayload,
  BaseDateOptionsPayload,
  UpdateTripsheetsPayload,
  UploadVehicleFilePayload,
  DeleteRoutePayload,
  RoutePlanningRow,
  AutomaticSmsStatusPayload,
  AssignPhysicalIdPayload,
  InterShiftCopyPayload,
  PublishWithETAPayload,
} from "../types/RouteTypes";

import type {
  DownloadReportsPayload,
  DownloadRouteDataPayload,
} from "../types/RouteReportType";

// RouteModalKey is now the source of truth here (not imported from RouteTypes)
// so it stays in sync with PayloadMap automatically.
// export type RouteModalKey =
//   | "GENERATE_ROUTES"
//   | "COPY_ROUTES"
//   | "BASE_DATE_OPTIONS"
//   | "UPDATE_TRIPSHEETS"
//   | "DOWNLOAD_REPORTS"
//   | "DOWNLOAD_ROUTE_DATA"
//   | "UPLOAD_VEHICLE_FILE"
//   | "EMPLOYEE_DETAILS"
//   | "AUTOMATIC_SMS_STATUS"
//   | "DELETE_ROUTE"
//   | "INTER_SHIFT_COPY"
//   | "ASSIGN_PHYSICAL_ID"; // ← added

type PayloadMap = {
  GENERATE_ROUTES: GenerateRoutesPayload;
  COPY_ROUTES: CopyRoutesPayload;
  BASE_DATE_OPTIONS: BaseDateOptionsPayload;
  UPDATE_TRIPSHEETS: UpdateTripsheetsPayload;
  DOWNLOAD_REPORTS: DownloadReportsPayload;
  DOWNLOAD_ROUTE_DATA: DownloadRouteDataPayload;
  UPLOAD_VEHICLE_FILE: UploadVehicleFilePayload;
  EMPLOYEE_DETAILS: RoutePlanningRow;
  AUTOMATIC_SMS_STATUS: AutomaticSmsStatusPayload;
  DELETE_ROUTE: DeleteRoutePayload; // ← added
  ASSIGN_PHYSICAL_ID: AssignPhysicalIdPayload;
  INTER_SHIFT_COPY: InterShiftCopyPayload;
  PublishWithETA: PublishWithETAPayload;
};

export interface UseRouteModals {
  active: RouteModalState;
  stack: RouteModalState[];
  open: <K extends RouteModalKey>(key: K, payload: PayloadMap[K]) => void;
  close: () => void;
  closeAll: () => void;
}

export function useRouteModals(): UseRouteModals {
  const [stack, setStack] = useState<RouteModalState[]>([]);

  const active = stack.length > 0 ? stack[stack.length - 1] : null;

  const open = useCallback(
    <K extends RouteModalKey>(key: K, payload: PayloadMap[K]) => {
      const entry = { key, payload } as unknown as NonNullable<RouteModalState>;
      setStack((prev) => [...prev, entry]);
    },
    [],
  );

  const close = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const closeAll = useCallback(() => {
    setStack([]);
  }, []);

  return { active, stack, open, close, closeAll };
}

import React from "react";
import type { UseRouteModals } from "../hooks/useRouteModals";
import type { ShiftTypeOption } from "../types/RouteTypes";
import {
  GenerateRoutesModal,
  CopyRoutesModal,
  UpdateTripsheetsModal,
  DownloadReportsModal,
  DownloadRouteDataModal,
  UploadVehicleFileModal,
  EmployeeDetailsModal,
  AutomaticSmsStatusModal,
  DeleteRouteModal,
  AssignPhysicalIdModal,
  IntershiftCopyModal,
  PublishWithETAOnly,
} from "../Modals/AllOtherModals";

interface Props {
  modals: UseRouteModals;
  onRefresh?: () => void;
  onGenerateRoutes?: (p: any) => Promise<void>; // ← ADD
  onCopyRoutes?: (p: any) => Promise<void>; // ← ADD
  onUpdateTripsheets?: (copyCabs: boolean) => Promise<void>;
  loginShiftsOptions?: ShiftTypeOption[];
  onDownloadReport?: (key: string, format: "PDF" | "XLS") => void;
  onDownloadRouteData?: (key: string) => void;
  onValidateVehicleFile?: (file: File) => Promise<void>;
  onSmsReviewed?: (comments: string) => Promise<void>;
  isUpdatingTripsheets?: boolean;
  isValidatingFile?: boolean;
  isReviewingSms?: boolean;
}

export const RouteModalRegistry: React.FC<Props> = ({
  modals,
  ...handlers
}) => {
  const { active, close } = modals;

  console.log("active from RouteModalRegistry", active);

  if (!active) return null;

  switch (active.key) {
    case "GENERATE_ROUTES":
      // onGenerate not wired yet — modal handles it internally when API is ready
      return (
        <GenerateRoutesModal
          open
          onClose={close}
          tripDate={active.payload.tripDate}
          locCode={active.payload.locCode} // ← ADD
          rows={active.payload.shifts}
        />
      );

    case "COPY_ROUTES":
      // onCopy not wired yet — modal handles it internally when API is ready
      return <CopyRoutesModal open onClose={close} payload={active.payload} />;

    // ── NEW ─────────────────────────────────────────────────────────────────
    case "INTER_SHIFT_COPY":
      return (
        <IntershiftCopyModal open onClose={close} payload={active.payload} loginShiftsOptions={handlers.loginShiftsOptions} />
      );
    // ────────────────────────────────────────────────────────────────────────

    case "UPDATE_TRIPSHEETS":
      return (
        <UpdateTripsheetsModal
          open
          onClose={close}
          payload={active.payload}
          onRefresh={handlers.onRefresh}
          // onUpdate={handlers.onUpdateTripsheets ?? (() => Promise.resolve())}
          // isSubmitting={handlers.isUpdatingTripsheets}
        />
      );

    case "DOWNLOAD_REPORTS":
      return (
        <DownloadReportsModal
          open
          onClose={close}
          payload={active.payload}
          onDownload={handlers.onDownloadReport ?? (() => {})}
        />
      );

    // inside switch:
    case "ASSIGN_PHYSICAL_ID":
      return (
        <AssignPhysicalIdModal open onClose={close} payload={active.payload} />
      );

    case "DOWNLOAD_ROUTE_DATA":
      return (
        <DownloadRouteDataModal
          open
          onClose={close}
          payload={active.payload}
          // onDownload={handlers.onDownloadRouteData ?? (() => {})}
        />
      );

    case "UPLOAD_VEHICLE_FILE":
      return (
        <UploadVehicleFileModal
          open
          onClose={close}
          payload={active.payload}
          onValidate={
            handlers.onValidateVehicleFile ?? (() => Promise.resolve())
          }
          isSubmitting={handlers.isValidatingFile}
        />
      );

    case "EMPLOYEE_DETAILS":
      return <EmployeeDetailsModal open onClose={close} row={active.payload} />;

    case "AUTOMATIC_SMS_STATUS":
      return (
        <AutomaticSmsStatusModal
          open
          onClose={close}
          payload={active.payload}
          onReviewed={handlers.onSmsReviewed ?? (() => Promise.resolve())}
          isSubmitting={handlers.isReviewingSms}
        />
      );

    case "DELETE_ROUTE":
      return <DeleteRouteModal open onClose={close} payload={active.payload} />;

    case "PublishWithETA":
      return (
        <PublishWithETAOnly open onClose={close} payload={active.payload} />
      );

    default:
      return null;
  }
};

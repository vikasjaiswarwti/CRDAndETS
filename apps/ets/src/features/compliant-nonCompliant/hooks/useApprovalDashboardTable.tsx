import { useMemo, useState, useCallback } from "react";
import {
  col,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
// import { APPROVAL_STATUS_MAP } from "../constants/VehicleComplianceConstants";
import type {
  VehicleApproval,
  ApprovalFilterStatus,
  DashboardView,
} from "../types/Vehiclecompliance.types";

// ─── Driver approval record shape ─────────────────────────────────────────────
// Field names match what mapDriverApproval() produces in VehicleApprovalApi.ts:
//   licenseDoc, policeVerificationDoc, govtIdDoc, trainingDoc, profileDoc
export interface DriverApproval {
  id: string;
  driverName: string;
  fatherName?: string | null;
  gender?: string;
  dob?: string | null;
  bloodGroup?: string | null;
  mobileNo: string;
  alternateMobileNo?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  inductionDate?: string | null;
  licenseIssueDate?: string | null;
  driverLicenceAuthority?: string | null;
  policeVerification?: boolean | null;
  govtIdProof?: number | null;
  lastInternalVerificationDate?: string | null;
  externalVerificationExpDate?: string | null;
  externalVerificationAgency?: string | null;
  trainingStatus?: string;
  lastTrainingDate?: string | null;
  privateBGVExpDate?: string | null;
  currentStatus?: number | null;
  currentStatusName?: string;
  remarks?: string | null;
  licenseNo?: string;
  driverType?: string;
  office?: string;
  transporterName?: string;
  licenseExpDate?: string | null;
  policeVerificationExpDate?: string | null;
  status: string;
  // documents — mapped names from VehicleApprovalApi.mapDriverApproval()
  profileDoc?: string | null;
  licenseDoc?: string | null;
  licenseExpDoc?: string | null;
  policeVerificationDoc?: string | null;
  policeVerificationExpDoc?: string | null;
  lastTrainingDoc?: string | null;
  govtIdDoc?: string | null;
  trainingDoc?: string | null;
  profileImageDoc?: string | null;
}

// export interface DriverApproval {
//   // ... existing fields ...
//   // Raw fields preserved via ...d spread
//   driver_Id?: string;
//   driverId?: number;
//   fatherName?: string | null;
//   dob?: string | null;
//   gender?: string;
//   bloodGroup?: string | null;
//   alternateMobileNo?: string | null;
//   presentAddress?: string | null;
//   permanentAddress?: string | null;
//   inductionDate?: string | null;
//   licenseIssueDate?: string | null;
//   driverLicenceAuthority?: string | null;
//   policeVerification?: boolean | null;
//   govtIdProof?: number | null;
//   lastInternalVerificationDate?: string | null;
//   externalVerificationExpDate?: string | null;
//   externalVerificationAgency?: string | null;
//   trainingStatus?: string;
//   lastTrainingDate?: string | null;
//   privateBGVExpDate?: string | null;
//   currentStatus?: number | null;
//   currentStatusName?: string;
//   remarks?: string | null;
//   active?: boolean;
//   locCode?: number | null;
//   transporterId?: number | null;
//   profileImageDoc?: string | null;
//   licenseExpDoc?: string | null;
//   policeVerificationExpDoc?: string | null;
//   lastTrainingDoc?: string | null;
// }

interface Options {
  onReview: (record: any) => void;
  view: DashboardView;
}

export function useApprovalDashboardTable({ onReview, view }: Options) {
  const [tableState, setTableState] = useTableState({
    syncUrl: false,
    defaultPageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusRaw] = useState<
    ApprovalFilterStatus | undefined
  >(undefined);
  const [office, setOffice] = useState<string | undefined>(undefined);

  const handleSearch = useCallback(
    (val: string) => {
      setSearch(val);
      setTableState({ ...tableState, page: 1 });
    },
    [tableState, setTableState],
  );

  const setStatusFilter = useCallback(
    (val: ApprovalFilterStatus | undefined) => {
      setStatusRaw(val);
      setTableState({ ...tableState, page: 1 });
    },
    [tableState, setTableState],
  );

  const queryArgs = useMemo(
    () => ({
      ...(statusFilter !== undefined && { status: statusFilter }),
      ...(office !== undefined && { office }),
      ...(search && { searchTerm: search }),
      page: tableState.page,
      pageSize: tableState.pageSize,
    }),
    [tableState, statusFilter, office, search],
  );

  // ── Vehicle columns ──────────────────────────────────────────────────────────
  const vehicleColumns = useMemo(
    () =>
      buildColumns<VehicleApproval>([
        col.text<VehicleApproval>("vehicleNo", "Vehicle No.", { width: 130 }),
        col.text<VehicleApproval>("vehicleType", "Type", { width: 90 }),
        col.text<VehicleApproval>("office", "Office", { width: 110 }),
        col.date<VehicleApproval>("registrationExpDate", "RC Expiry", {
          width: 110,
        }),
        col.date<VehicleApproval>("insuranceExpDate", "Insurance Expiry", {
          width: 130,
        }),
        col.date<VehicleApproval>("fitnessExpDate", "Fitness Expiry", {
          width: 120,
        }),
        col.date<VehicleApproval>("pucExpDate", "PUC Expiry", { width: 110 }),
        // col.status<VehicleApproval>("status", "Status", {
        //   map: APPROVAL_STATUS_MAP,
        //   width: 130,
        // }),
        {
          key: "__docs__",
          title: "Docs",
          width: 70,
          align: "center" as const,
          render: (_: unknown, record: VehicleApproval) => {
            const has = !!(
              record.insuranceDoc ||
              record.registrationDoc ||
              record.fitnessDoc ||
              record.permitDoc ||
              record.pucDoc
            );
            return has ? (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#16a34a",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                ✓ Docs
              </span>
            ) : (
              <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
            );
          },
        },
        {
          key: "__review__",
          title: "Action",
          width: 90,
          align: "center" as const,
          fixed: "right" as const,
          render: (_: unknown, record: VehicleApproval) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReview(record);
              }}
              style={{
                padding: "3px 12px",
                borderRadius: 14,
                border: "1px solid #d9d9d9",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
              }}
            >
              Review
            </button>
          ),
        },
      ]),
    [onReview],
  );

  // ── Driver columns ───────────────────────────────────────────────────────────
  const driverColumns = useMemo(
    () =>
      buildColumns<DriverApproval>([
        col.text<DriverApproval>("driverName", "Driver Name", { width: 150 }),
        col.text<DriverApproval>("mobileNo", "Mobile No.", { width: 120 }),
        col.text<DriverApproval>("licenseNo", "License No.", { width: 130 }),
        col.text<DriverApproval>("driverType", "Type", { width: 90 }),
        col.text<DriverApproval>("office", "Office", { width: 110 }),
        col.date<DriverApproval>("licenseExpDate", "License Expiry", {
          width: 130,
        }),
        col.date<DriverApproval>(
          "policeVerificationExpDate",
          "Police Verif. Expiry",
          { width: 160 },
        ),
        // col.status<DriverApproval>("status", "Status", {
        //   map: APPROVAL_STATUS_MAP,
        //   width: 130,
        // }),
        {
          key: "__docs__",
          title: "Docs",
          width: 70,
          align: "center" as const,
          render: (_: unknown, record: DriverApproval) => {
            const has = !!(
              record.profileDoc ||
              record.licenseDoc ||
              record.policeVerificationDoc ||
              record.govtIdDoc ||
              record.trainingDoc
            );
            return has ? (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#16a34a",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                ✓ Docs
              </span>
            ) : (
              <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
            );
          },
        },
        {
          key: "__review__",
          title: "Action",
          width: 90,
          align: "center" as const,
          fixed: "right" as const,
          render: (_: unknown, record: DriverApproval) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReview(record);
              }}
              style={{
                padding: "3px 12px",
                borderRadius: 14,
                border: "1px solid #d9d9d9",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
              }}
            >
              Review
            </button>
          ),
        },
      ]),
    [onReview],
  );

  const columns = view === "Driver" ? driverColumns : vehicleColumns;

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    statusFilter,
    setStatusFilter,
    office,
    setOffice,
    queryArgs,
  };
}

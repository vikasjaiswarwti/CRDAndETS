import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  COMPLIANCE_ROLES,
  selectAuthRole,
  selectAuthTransporterId,
} from "../constants/Complianceroleconfig";
// ⚠️ Adjust this import path to match your actual slice location
import {
  selectVendorTransporters,
  selectTransporterId as selectVendorContextTransporterId,
} from "../../VendorSuperVisor/slice/Vendorcontextslice";

export type VendorSelectorOption = {
  label: string;
  value: number;
  locCode?: number;
};

export interface ComplianceTransporterState {
  isAdmin: boolean;
  isTransportManager: boolean;
  isVendor: boolean;
  transporterId: number | undefined;
  selectedVendorId: number | undefined;
  setSelectedVendorId: (id: number | undefined) => void;
  isReady: boolean;
  canFetch: boolean;
  /** Vendor's own transporter options — non-empty only when role = vendor */
  vendorTransporterOptions: VendorSelectorOption[];
  /** True when vendor has more than one transporter mapped (show a selector) */
  isVendorMultiTransporter: boolean;
  /** Display name of the active transporter — show as a label when single-vendor */
  vendorLabel: string | null;
  /** locCode of the active transporter, derived from vendorOptions */
  locCode: number | undefined;
}

export function useComplianceTransporter(opts?: {
  vendorOptionsReady?: boolean;
  /** Pass vendorOptions from useLookups so locCode can be resolved for the active transporter */
  vendorOptions?: VendorSelectorOption[];
}): ComplianceTransporterState {
  const roles = useSelector(selectAuthRole);
  const authTransporterId = useSelector(selectAuthTransporterId);
  // Primary source for vendor: transporterId dispatched by useVendorBootstrap
  const vendorContextTransporterId = useSelector(
    selectVendorContextTransporterId,
  );
  const vendorTransporters = useSelector(selectVendorTransporters);

  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>(
    undefined,
  );

  // A user can hold multiple roles at once (e.g. ["employee", "transport manager"]),
  // so membership is checked against the full array rather than equality.
  const normalisedRoles = roles.map((r) => r.toLowerCase());
  const isAdmin = normalisedRoles.includes(COMPLIANCE_ROLES.ADMIN);
  const isTransportManager = normalisedRoles.includes(
    COMPLIANCE_ROLES.TRANSPORT_MANAGER,
  );
  /** Admin and Transport Manager have identical behaviour — can select any vendor */
  const isAdminLike = isAdmin || isTransportManager;
  const isVendor = normalisedRoles.includes(COMPLIANCE_ROLES.VENDOR);

  // Convert Redux transporters to Select-compatible options
  const vendorTransporterOptions: VendorSelectorOption[] = useMemo(
    () =>
      vendorTransporters.map((t) => ({
        label: t.vendorName,
        value: t.transporterId,
      })),
    [vendorTransporters],
  );

  const isVendorMultiTransporter =
    isVendor && vendorTransporterOptions.length > 1;

  // Effective vendor ID: vendorContextSlice (from bootstrap) → auth slice → undefined
  // Must be declared before vendorLabel and transporterId which depend on it
  const effectiveVendorId =
    vendorContextTransporterId ?? authTransporterId ?? undefined;

  // Display name of the active transporter — used for read-only label when single-vendor
  // For admin / transport manager: resolved from vendorOptions + selectedVendorId
  const vendorLabel = useMemo(() => {
    if (isAdminLike) {
      if (selectedVendorId === undefined || !opts?.vendorOptions) return null;
      return (
        opts.vendorOptions.find((o) => o.value === selectedVendorId)?.label ??
        null
      );
    }
    if (!isVendor || vendorTransporters.length === 0) return null;
    const activeId = effectiveVendorId ?? vendorTransporters[0]?.transporterId;
    const match = vendorTransporters.find((t) => t.transporterId === activeId);
    return match?.vendorName ?? vendorTransporters[0]?.vendorName ?? null;
  }, [
    isAdminLike,
    isVendor,
    vendorTransporters,
    effectiveVendorId,
    selectedVendorId,
    opts?.vendorOptions,
  ]);

  // Auto-initialise selectedVendorId for vendor when transporter ID arrives in Redux
  useEffect(() => {
    if (isVendor && !selectedVendorId && effectiveVendorId != null) {
      // console.log(
      //   "[useComplianceTransporter] initialising vendor selectedVendorId →",
      //   effectiveVendorId,
      // );
      setSelectedVendorId(effectiveVendorId);
    }
  }, [isVendor, effectiveVendorId, selectedVendorId]);

  const transporterId = useMemo(() => {
    if (isAdminLike) return selectedVendorId;
    if (isVendor) return selectedVendorId ?? effectiveVendorId;
    return undefined;
  }, [isAdminLike, isVendor, selectedVendorId, effectiveVendorId]);

  // locCode of the currently active transporter — looked up from vendorOptions
  const locCode = useMemo(() => {
    if (transporterId === undefined) return undefined;
    return opts?.vendorOptions?.find((o) => o.value === transporterId)?.locCode;
  }, [transporterId, opts?.vendorOptions]);

  const isReady = transporterId !== undefined;
  const canFetch = isAdminLike
    ? isReady && (opts?.vendorOptionsReady ?? false)
    : isReady;

  // ── Debug ──────────────────────────────────────────────────────────────────
  // console.log(
  //   "[useComplianceTransporter]",
  //   "role:",
  //   role,
  //   "| isAdmin:",
  //   isAdmin,
  //   "| isTransportManager:",
  //   isTransportManager,
  //   "| isVendor:",
  //   isVendor,
  //   "| authTransporterId:",
  //   authTransporterId,
  //   "| vendorContextTransporterId:",
  //   vendorContextTransporterId,
  //   "| effectiveVendorId:",
  //   effectiveVendorId,
  //   "| selectedVendorId:",
  //   selectedVendorId,
  //   "| transporterId:",
  //   transporterId,
  //   "| vendorLabel:",
  //   vendorLabel,
  //   "| canFetch:",
  //   canFetch,
  //   "| vendorTransporters:",
  //   vendorTransporters,
  // );

  return {
    isAdmin,
    isTransportManager,
    isVendor,
    transporterId,
    selectedVendorId,
    setSelectedVendorId,
    isReady,
    canFetch,
    vendorTransporterOptions,
    isVendorMultiTransporter,
    vendorLabel,
    locCode,
  };
}

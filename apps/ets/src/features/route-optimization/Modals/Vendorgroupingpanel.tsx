// src/features/route-maker/Modals/VendorGroupingPanel.tsx

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { T } from "../constants/designTokens";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { Select } from "../../../shared/components/ui/Select";
import {
  assignTripToVendor,
  removeTripFromVendor,
  setVendorAssignmentStatus,
  setPhase,
} from "../slice/Allocationsessionslice";
import { useGetAllVendorsQuery } from "../../vendors/services/vendorApi";
import { useAssignVendorMutation } from "../services/routeMakerApi";

interface Props {
  dsIds: number[];
  locCode: number;
  onProceed: (vendorGroups: Record<number, number[]>) => Promise<void>;
  onCancel: () => void;
}

interface VendorOption {
  value: number;
  label: string;
}

export default function VendorGroupingPanel({
  dsIds,
  locCode,
  onProceed,
  onCancel,
}: Props) {
  const dispatch = useDispatch();
  const { message } = useUILibrary();

  const unassignedDsIds = useSelector(
    (state: RootState) => state.allocationSession.unassignedDsIds,
  );
  const vendorGroups = useSelector(
    (state: RootState) => state.allocationSession.vendorGroups,
  );
  const vendorNames = useSelector(
    (state: RootState) => state.allocationSession.vendorNames,
  );

  const [tripVendorSelections, setTripVendorSelections] = useState<
    Record<number, number>
  >({});
  const [bulkVendorId, setBulkVendorId] = useState<number | null>(null);
  const [collapsedVendors, setCollapsedVendors] = useState<
    Record<number, boolean>
  >({});
  const [isProceeding, setIsProceeding] = useState(false);

  const { data: vendorData, isLoading: vendorsLoading } = useGetAllVendorsQuery(
    { page: 1, pageSize: 1000, location: String(locCode) },
  );

  const [assignVendor] = useAssignVendorMutation();

  const vendorOptions: VendorOption[] =
    vendorData?.items?.map((v: any) => ({
      value: v.transporterId ?? v.id ?? v.vendorId,
      label: v.vendorName ?? v.name ?? "—",
    })) ?? [];

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleTripVendorChange = (dsId: number, vendorId: number) => {
    const vendor = vendorOptions.find((v) => v.value === vendorId);
    if (!vendor) return;

    // Remove from previous vendor group if already assigned
    const prevVendorId = tripVendorSelections[dsId];
    if (prevVendorId && prevVendorId !== vendorId) {
      dispatch(removeTripFromVendor({ dsId, vendorId: prevVendorId }));
    }

    setTripVendorSelections((prev) => ({ ...prev, [dsId]: vendorId }));
    dispatch(assignTripToVendor({ dsId, vendorId, vendorName: vendor.label }));
  };

  const handleRemoveTripFromVendor = (dsId: number, vendorId: number) => {
    dispatch(removeTripFromVendor({ dsId, vendorId }));
    setTripVendorSelections((prev) => {
      const next = { ...prev };
      delete next[dsId];
      return next;
    });
  };

  const handleAssignAllToVendor = () => {
    if (bulkVendorId === null) return;
    const vendor = vendorOptions.find((v) => v.value === bulkVendorId);
    if (!vendor) return;
    for (const dsId of unassignedDsIds) {
      dispatch(
        assignTripToVendor({
          dsId,
          vendorId: bulkVendorId,
          vendorName: vendor.label,
        }),
      );
      setTripVendorSelections((prev) => ({ ...prev, [dsId]: bulkVendorId }));
    }
    message.success(`All trips assigned to ${vendor.label}`);
  };

  const toggleVendorCollapse = (vendorId: number) => {
    setCollapsedVendors((prev) => ({ ...prev, [vendorId]: !prev[vendorId] }));
  };

  // ── Core: call real assign-vendor API ──────────────────────────────────────
  // Strategy:
  //   - Group trips by vendor (already in Redux vendorGroups)
  //   - For each vendor group: ONE API call with all dsIds for that vendor
  //   - If trips go to different vendors → N calls (one per vendor)
  //   - If trips go to same vendor → 1 call with all dsIds
  const handleProceed = async () => {
    if (unassignedDsIds.length > 0) return;
    setIsProceeding(true);
    dispatch(setPhase("vendor_assigning"));

    // Mark all trips as pending
    for (const [vidStr, tripIds] of Object.entries(vendorGroups)) {
      const vendorId = Number(vidStr);
      const vendorName = vendorNames[vendorId] ?? "";
      for (const dsId of tripIds as number[]) {
        dispatch(
          setVendorAssignmentStatus({
            dsId,
            status: "pending",
            vendorId,
            vendorName,
          }),
        );
      }
    }

    // Fire one API call per vendor group
    for (const [vidStr, tripIds] of Object.entries(vendorGroups)) {
      const vendorId = Number(vidStr);
      const vendorName = vendorNames[vendorId] ?? "";
      const dsIdList = tripIds as number[];

      try {
        // Single call: passes all dsIds for this vendor at once
        await assignVendor({
          dsIds: dsIdList,
          transporterId: vendorId,
        }).unwrap();
        // Mark each trip in this group as success
        for (const dsId of dsIdList) {
          dispatch(
            setVendorAssignmentStatus({
              dsId,
              status: "success",
              vendorId,
              vendorName,
            }),
          );
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Assignment failed";

        // Mark each trip in this group as failed
        for (const dsId of dsIdList) {
          dispatch(
            setVendorAssignmentStatus({
              dsId,
              status: "failed",
              vendorId,
              vendorName,
              error: errorMsg,
            }),
          );
        }

        message.error(`Failed to assign ${vendorName}: ${errorMsg}`);
      }
    }

    dispatch(setPhase("vendor_complete"));
    await onProceed(vendorGroups);
    setIsProceeding(false);
  };

  const vendorGroupEntries = Object.entries(vendorGroups).map(
    ([vid, trips]) => ({
      vendorId: Number(vid),
      vendorName: vendorNames[Number(vid)] ?? `Vendor ${vid}`,
      trips: trips as number[],
    }),
  );

  const canProceed = unassignedDsIds.length === 0 && !isProceeding;
  const assignedCount = dsIds.length - unassignedDsIds.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* ── Bulk assign bar ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: "10px 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.panel,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.muted}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span
          style={{
            fontSize: T.fontXs,
            color: T.muted,
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          Assign all to one vendor:
        </span>

        <div style={{ width: 220 }}>
          <Select
            value={bulkVendorId ?? undefined}
            onChange={(val: number) => setBulkVendorId(val ?? null)}
            options={vendorOptions}
            placeholder="Select vendor..."
            autoSelectFirst={false}
            isEditMode
            style={{ width: "100%" }}
            loading={vendorsLoading}
            size="small"
          />
        </div>

        <button
          onClick={handleAssignAllToVendor}
          disabled={bulkVendorId === null || unassignedDsIds.length === 0}
          style={{
            padding: "5px 14px",
            borderRadius: T.radiusSm,
            border: "none",
            background:
              bulkVendorId === null || unassignedDsIds.length === 0
                ? T.border
                : T.accent,
            color:
              bulkVendorId === null || unassignedDsIds.length === 0
                ? T.muted
                : "#fff",
            fontSize: T.fontXs,
            fontWeight: 600,
            cursor:
              bulkVendorId === null || unassignedDsIds.length === 0
                ? "not-allowed"
                : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
        >
          Assign All ({unassignedDsIds.length})
        </button>
      </div>

      {/* ── Main body: two columns ────────────────────────────────────────── */}
      <div
        style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}
      >
        {/* Left: unassigned trips */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: `1px solid ${T.border}`,
              background: T.panel,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{ fontSize: T.fontXs, fontWeight: 700, color: T.text }}
            >
              Unassigned Trips
            </span>
            {unassignedDsIds.length > 0 && (
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 99,
                  background: T.warnBg,
                  color: T.warn,
                  fontSize: T.fontXs,
                  fontWeight: 700,
                }}
              >
                {unassignedDsIds.length}
              </span>
            )}
            {unassignedDsIds.length === 0 && (
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 99,
                  background: "#DCFCE7",
                  color: "#15803D",
                  fontSize: T.fontXs,
                  fontWeight: 700,
                }}
              >
                ✓ All done
              </span>
            )}
          </div>

          {/* Trip list */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {unassignedDsIds.length === 0 ? (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: T.muted,
                  fontSize: T.fontXs,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>
                  ✓
                </div>
                All trips assigned
              </div>
            ) : (
              unassignedDsIds.map((dsId) => (
                <div
                  key={dsId}
                  style={{
                    padding: "8px 10px",
                    background: T.card,
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: T.warn,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: T.fontXs,
                        color: T.text,
                        fontWeight: 600,
                      }}
                    >
                      Trip #{dsId}
                    </span>
                  </div>
                  <Select
                    value={tripVendorSelections[dsId] ?? undefined}
                    onChange={(val: number) => {
                      if (val) handleTripVendorChange(dsId, val);
                    }}
                    options={vendorOptions}
                    placeholder="Select vendor..."
                    autoSelectFirst={false}
                    isEditMode
                    style={{ width: "100%" }}
                    loading={vendorsLoading}
                    size="small"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: vendor buckets */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{ fontSize: T.fontXs, fontWeight: 700, color: T.text }}
            >
              Vendor Buckets
            </span>
            {vendorGroupEntries.length > 0 && (
              <span style={{ fontSize: T.fontXs, color: T.muted }}>
                {assignedCount} of {dsIds.length} trips assigned
              </span>
            )}
          </div>

          {vendorGroupEntries.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: T.muted,
                fontSize: T.fontXs,
                border: `2px dashed ${T.border}`,
                borderRadius: T.radiusSm,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>
                🗂
              </div>
              Assign trips using the left panel to see vendor groups here
            </div>
          ) : (
            vendorGroupEntries.map(({ vendorId, vendorName, trips }) => {
              const isCollapsed = !!collapsedVendors[vendorId];
              return (
                <div
                  key={vendorId}
                  style={{
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    background: T.card,
                    overflow: "hidden",
                  }}
                >
                  {/* Vendor header */}
                  <div
                    onClick={() => toggleVendorCollapse(vendorId)}
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      background: T.panel,
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: T.radiusSm,
                        background: T.accentBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={T.accent}
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: T.fontSm,
                        fontWeight: 600,
                        color: T.text,
                        flex: 1,
                      }}
                    >
                      {vendorName}
                    </span>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 99,
                        background: T.accentBg,
                        color: T.accent,
                        fontSize: T.fontXs,
                        fontWeight: 700,
                      }}
                    >
                      {trips.length} trip{trips.length !== 1 ? "s" : ""}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={T.muted}
                      strokeWidth="2.5"
                      style={{
                        transform: isCollapsed
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {/* Trip chips */}
                  {!isCollapsed && (
                    <div
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {trips.map((dsId) => (
                        <div
                          key={dsId}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 8px",
                            borderRadius: 99,
                            background: T.bg,
                            border: `1px solid ${T.border}`,
                            fontSize: T.fontXs,
                            color: T.text,
                            fontWeight: 500,
                          }}
                        >
                          <span>Trip #{dsId}</span>
                          <button
                            onClick={() =>
                              handleRemoveTripFromVendor(dsId, vendorId)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: T.muted,
                              fontSize: 12,
                              padding: 0,
                              lineHeight: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${T.border}`,
          background: T.panel,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {unassignedDsIds.length > 0 ? (
          <span
            style={{
              flex: 1,
              fontSize: T.fontXs,
              color: T.warn,
              fontWeight: 500,
            }}
          >
            ⚠ {unassignedDsIds.length} trip
            {unassignedDsIds.length !== 1 ? "s" : ""} still unassigned
          </span>
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: T.fontXs,
              color: "#15803D",
              fontWeight: 500,
            }}
          >
            ✓ All {dsIds.length} trips assigned — ready to proceed
          </span>
        )}

        <button
          onClick={onCancel}
          disabled={isProceeding}
          style={{
            padding: "8px 18px",
            borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`,
            background: T.card,
            color: T.text,
            fontSize: T.fontSm,
            cursor: isProceeding ? "not-allowed" : "pointer",
            opacity: isProceeding ? 0.5 : 1,
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          style={{
            padding: "8px 20px",
            borderRadius: T.radiusSm,
            border: "none",
            background: canProceed ? T.accent : T.border,
            color: canProceed ? "#fff" : T.muted,
            fontSize: T.fontSm,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 7,
            transition: "background 0.15s",
          }}
        >
          {isProceeding ? (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 36 36"
                fill="none"
                style={{ animation: "rmSpin 0.8s linear infinite" }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="3"
                />
                <path
                  d="M18 3 A15 15 0 0 1 33 18"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Assigning Vendors…
            </>
          ) : (
            `Assign ${assignedCount} Trip${assignedCount !== 1 ? "s" : ""} →`
          )}
        </button>
      </div>
    </div>
  );
}

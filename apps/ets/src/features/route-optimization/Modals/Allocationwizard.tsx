import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { T } from "../constants/designTokens";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { Select } from "../../../shared/components/ui/Select";
import {
  completeCurrentTrip,
  skipCurrentTrip,
  markTripFailed,
  goToPrevTrip,
  setVehicleAllocation,
  setDriverAllocation,
  selectCurrentDsId,
  selectCurrentVendorId,
} from "../slice/Allocationsessionslice";
import {
  useGetAvailableVehiclesQuery,
  useGetAvailableDriversQuery,
  useAllocateVehicleAndDriverMutation,
} from "../services/routeMakerApi";
import type { VehicleOption, DriverOption } from "../types/apiRouteTypes";

interface Props {
  locCode: number;
  onComplete: () => void;
}

export default function AllocationWizard({ onComplete }: Props) {
  const dispatch = useDispatch();
  const { message } = useUILibrary();

  const allocationQueue = useSelector(
    (state: RootState) => state.allocationSession.allocationQueue,
  );
  const currentTripIndex = useSelector(
    (state: RootState) => state.allocationSession.currentTripIndex,
  );
  const completedTrips = useSelector(
    (state: RootState) => state.allocationSession.completedTrips,
  );
  const skippedTrips = useSelector(
    (state: RootState) => state.allocationSession.skippedTrips,
  );
  const failedTrips = useSelector(
    (state: RootState) => state.allocationSession.failedTrips,
  );
  const vendorNames = useSelector(
    (state: RootState) => state.allocationSession.vendorNames,
  );
  const vendorGroups = useSelector(
    (state: RootState) => state.allocationSession.vendorGroups,
  );

  const currentDsId = useSelector((state: RootState) =>
    selectCurrentDsId(state),
  );
  const currentVendorId = useSelector((state: RootState) =>
    selectCurrentVendorId(state),
  );

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  );
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [vehicleOnlyMode, setVehicleOnlyMode] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);

  const skip = currentDsId === null;

  const { data: vehicles, isLoading: vehiclesLoading } =
    useGetAvailableVehiclesQuery(
      { dsId: currentDsId!, vendorId: currentVendorId! },
      { skip: skip || currentVendorId === null },
    );

  console.log("vehicles from route maker page", vehicles);

  const { data: drivers, isLoading: driversLoading } =
    useGetAvailableDriversQuery(
      { dsId: currentDsId!, vendorId: currentVendorId! },
      { skip: skip || currentVendorId === null },
    );

  const [allocate] = useAllocateVehicleAndDriverMutation();

  // Reset selections when trip changes
  React.useEffect(() => {
    setSelectedVehicleId(null);
    setSelectedDriverId(null);
    setVehicleOnlyMode(false);
  }, [currentDsId]);

  const getVendorForDsId = (dsId: number): number | null => {
    for (const [vid, trips] of Object.entries(vendorGroups)) {
      if ((trips as number[]).includes(dsId)) return Number(vid);
    }
    return null;
  };

  const getTripStatusInfo = (dsId: number) => {
    if (completedTrips.includes(dsId))
      return { icon: "✓", color: "#22c55e", label: "Completed" };
    if (failedTrips.includes(dsId))
      return { icon: "✗", color: T.danger, label: "Failed" };
    if (skippedTrips.includes(dsId))
      return { icon: "⟳", color: T.warn, label: "Skipped" };
    const idx = allocationQueue.indexOf(dsId);
    if (idx === currentTripIndex)
      return { icon: "→", color: T.accent, label: "Current" };
    return { icon: "○", color: T.muted, label: "Pending" };
  };

  const handleConfirm = async () => {
    if (!currentDsId || !selectedVehicleId) return;
    setIsAllocating(true);
    try {
      await allocate({
        dsId: currentDsId,
        vehicleId: selectedVehicleId,
        driverId: vehicleOnlyMode ? null : (selectedDriverId ?? null),
      }).unwrap();

      dispatch(
        setVehicleAllocation({
          dsId: currentDsId,
          vehicleId: selectedVehicleId,
        }),
      );
      if (!vehicleOnlyMode && selectedDriverId !== null) {
        dispatch(
          setDriverAllocation({
            dsId: currentDsId,
            driverId: selectedDriverId,
          }),
        );
      }

      dispatch(completeCurrentTrip());
      message.success(`Trip #${currentDsId} allocated successfully`);

      if (currentTripIndex + 1 >= allocationQueue.length) {
        onComplete();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Allocation failed";
      dispatch(markTripFailed(currentDsId));
      message.error(`Trip #${currentDsId}: ${errMsg}`);

      if (currentTripIndex + 1 >= allocationQueue.length) {
        onComplete();
      }
    } finally {
      setIsAllocating(false);
    }
  };

  const handleSkip = () => {
    if (!currentDsId) return;
    dispatch(skipCurrentTrip());
    if (currentTripIndex + 1 >= allocationQueue.length) {
      onComplete();
    }
  };

  const progress =
    allocationQueue.length > 0
      ? completedTrips.length / allocationQueue.length
      : 0;

  const currentVendorName =
    currentVendorId !== null ? (vendorNames[currentVendorId] ?? "") : "";

  const noDriversAvailable =
    !driversLoading && (!drivers || drivers.length === 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* ── Left sidebar: trip queue ── */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: `1px solid ${T.border}`,
              fontSize: T.fontXs,
              fontWeight: 600,
              color: T.text,
              background: T.panel,
              flexShrink: 0,
            }}
          >
            Trip Queue
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {allocationQueue.map((dsId, idx) => {
              const isCurrent = idx === currentTripIndex;
              const vendorId = getVendorForDsId(dsId);
              const vName =
                vendorId !== null ? (vendorNames[vendorId] ?? "") : "";
              const { icon, color } = getTripStatusInfo(dsId);
              return (
                <div
                  key={dsId}
                  style={{
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: isCurrent ? T.accentBg : "transparent",
                    borderLeft: isCurrent
                      ? `3px solid ${T.accent}`
                      : "3px solid transparent",
                    cursor: "default",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color,
                      fontWeight: 700,
                      flexShrink: 0,
                      width: 16,
                      textAlign: "center",
                    }}
                  >
                    {icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: T.fontXs,
                        fontWeight: isCurrent ? 600 : 400,
                        color: T.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Trip #{dsId}
                    </div>
                    {vName && (
                      <div
                        style={{
                          fontSize: 10,
                          color: T.muted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {vName}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right main panel ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {currentDsId === null ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.muted,
                fontSize: T.fontSm,
              }}
            >
              All trips processed.
            </div>
          ) : (
            <>
              {/* Trip header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: `1px solid ${T.border}`,
                  background: T.panel,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: T.fontSm,
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Trip #{currentDsId}
                </span>
                {currentVendorName && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: T.accentBg,
                      color: T.accent,
                      fontSize: T.fontXs,
                      fontWeight: 600,
                    }}
                  >
                    {currentVendorName}
                  </span>
                )}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: T.fontXs,
                    color: T.muted,
                  }}
                >
                  {currentTripIndex + 1} / {allocationQueue.length}
                </span>
              </div>

              {/* Scrollable selection area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                {/* Vehicle section */}
                <div>
                  <div
                    style={{
                      fontSize: T.fontXs,
                      fontWeight: 600,
                      color: T.text,
                      marginBottom: 10,
                    }}
                  >
                    Select Vehicle
                  </div>
                  <Select
                    value={selectedVehicleId ?? undefined}
                    onChange={(val: number) =>
                      setSelectedVehicleId(val ?? null)
                    }
                    options={(vehicles ?? []).map((v: VehicleOption) => ({
                      value: v.vehicleId,
                      label: `${v.vehicleNo} — ${v.vehicleModel}`,
                    }))}
                    placeholder={
                      vehiclesLoading
                        ? "Loading vehicles..."
                        : !vehicles || vehicles.length === 0
                          ? "No vehicles available"
                          : "Select a vehicle..."
                    }
                    autoSelectFirst={false}
                    isEditMode
                    disabled={
                      vehiclesLoading || !vehicles || vehicles.length === 0
                    }
                    loading={vehiclesLoading}
                    showSearch
                    style={{ width: "100%" }}
                    notFoundContent={
                      vehiclesLoading
                        ? "Loading..."
                        : "No vehicles available for this vendor"
                    }
                  />
                </div>

                {/* Driver section */}
                <div>
                  <div
                    style={{
                      fontSize: T.fontXs,
                      fontWeight: 600,
                      color: T.text,
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span>Select Driver</span>
                    {noDriversAvailable && (
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          cursor: "pointer",
                          fontWeight: 400,
                          color: T.muted,
                          fontSize: T.fontXs,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={vehicleOnlyMode}
                          onChange={(e) => setVehicleOnlyMode(e.target.checked)}
                          style={{ margin: 0, cursor: "pointer" }}
                        />
                        Allocate vehicle only
                      </label>
                    )}
                  </div>
                  {noDriversAvailable ? (
                    <div
                      style={{
                        padding: "14px 16px",
                        background: T.warnBg,
                        borderRadius: T.radiusSm,
                        border: `1px solid ${T.warn}44`,
                        fontSize: T.fontXs,
                        color: T.warn,
                      }}
                    >
                      No drivers available — enable "Allocate vehicle only"
                      above to continue
                    </div>
                  ) : (
                    <Select
                      value={selectedDriverId ?? undefined}
                      onChange={(val: number) =>
                        setSelectedDriverId(val ?? null)
                      }
                      options={(drivers ?? []).map((d: DriverOption) => ({
                        value: d.driverId,
                        label: `${d.driverName} — ${d.mobileNo}`,
                      }))}
                      placeholder={
                        driversLoading
                          ? "Loading drivers..."
                          : "Select a driver..."
                      }
                      autoSelectFirst={false}
                      isEditMode
                      disabled={driversLoading || vehicleOnlyMode}
                      loading={driversLoading}
                      showSearch
                      style={{ width: "100%" }}
                      notFoundContent={
                        driversLoading ? "Loading..." : "No drivers available"
                      }
                    />
                  )}
                </div>
              </div>

              {/* Footer controls */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: `1px solid ${T.border}`,
                  background: T.panel,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => dispatch(goToPrevTrip())}
                  disabled={currentTripIndex === 0}
                  style={{
                    padding: "8px 16px",
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    background: T.card,
                    color: currentTripIndex === 0 ? T.muted : T.text,
                    fontSize: T.fontSm,
                    cursor: currentTripIndex === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Previous
                </button>

                <button
                  onClick={handleSkip}
                  style={{
                    padding: "8px 16px",
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    background: T.card,
                    color: T.text,
                    fontSize: T.fontSm,
                    cursor: "pointer",
                  }}
                >
                  Skip →
                </button>

                <div style={{ flex: 1 }} />

                <button
                  onClick={handleConfirm}
                  disabled={
                    !selectedVehicleId ||
                    (!vehicleOnlyMode &&
                      !selectedDriverId &&
                      !noDriversAvailable) ||
                    isAllocating
                  }
                  style={{
                    padding: "8px 20px",
                    borderRadius: T.radiusSm,
                    border: "none",
                    background:
                      !selectedVehicleId ||
                      (!vehicleOnlyMode &&
                        !selectedDriverId &&
                        !noDriversAvailable) ||
                      isAllocating
                        ? T.muted
                        : T.accent,
                    color: "#fff",
                    fontSize: T.fontSm,
                    fontWeight: 600,
                    cursor:
                      !selectedVehicleId ||
                      (!vehicleOnlyMode &&
                        !selectedDriverId &&
                        !noDriversAvailable) ||
                      isAllocating
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isAllocating && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                  )}
                  Confirm &amp; Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          background: T.border,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(progress * 100)}%`,
            background: T.accent,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

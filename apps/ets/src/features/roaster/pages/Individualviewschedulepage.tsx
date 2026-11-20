// src/features/individualRoster/pages/IndividualViewSchedulePage.tsx

import React, { useState, useCallback, useMemo } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import {
  useGetScheduleHomePageQuery,
  useCancelIndividualScheduleMutation,
  useCancelScheduleConfirmationMutation,
  useCancelScheduleBulkConfirmationMutation,
  useCancelScheduleBulkMutation,
  useLazyGetAppControlSettingsByLocCodeQuery,
  type ScheduleHomepageEntry,
  type TatPopup,
} from "../services/IndividualRosterApi";
import { COLORS, CANCEL_SHIFT_TRIP_TYPE } from "../constants/Rosterconstants";
import type { Tab, ActionType } from "../types/scheduleView.types";
import { TRIP_TYPE } from "../types/scheduleView.types";
import type { CancelShiftType } from "../types/Roster.types";
import { useGetUserAppConfigByLocCodeQuery } from "../../profile/services/profileApi";

import TabSwitcher from "../individualRoster/TabSwitcher";
import ScheduleTable from "../individualRoster/ScheduleTable";
import DynamicActionPopup from "../individualRoster/Dynamicactionpopup";
import BulkCancelScheduleModal from "../individualRoster/BulkCancelScheduleModal";

dayjs.extend(customParseFormat);

function toIso(s?: string): string {
  if (!s) return "";
  const d = dayjs(s, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d.format("YYYY-MM-DD") : s;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const IndividualViewSchedulePage: React.FC = () => {
  const { message } = useUILibrary();

  // ── API ────────────────────────────────────────────────────────────────────
  const {
    data: entries = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetScheduleHomePageQuery();

  const [cancelSchedule, { isLoading: isCancelling }] =
    useCancelIndividualScheduleMutation();

  const [cancelScheduleConfirmation] = useCancelScheduleConfirmationMutation();

  const [cancelScheduleBulkConfirmation] =
    useCancelScheduleBulkConfirmationMutation();

  const [cancelScheduleBulk, { isLoading: isBulkCancellingApi }] =
    useCancelScheduleBulkMutation();

  // Lazy — cached by LocCode after first call
  const [fetchAppControlSettings] =
    useLazyGetAppControlSettingsByLocCodeQuery();

  // LocCode is only known once the user's own schedule has loaded
  const locCodeForConfig = entries[0]?.LocCode ?? null;

  const { data: userAppConfigData } = useGetUserAppConfigByLocCodeQuery(
    locCodeForConfig!,
    { skip: locCodeForConfig === null },
  );

  const isBulkCancellationEnabled = Boolean(
    userAppConfigData?.AppScheduleUiConfig?.IsScheduleBulkCancellationEnabled,
  );

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("LOGIN");

  // Which row is currently being checked (shows spinner in that row)
  const [tatCheckingId, setTatCheckingId] = useState<string | null>(null);

  // Which action triggered the current flow
  const [pendingAction, setPendingAction] = useState<ActionType>("CANCEL");

  // Popup state — set when backend returns a popup config
  const [popupState, setPopupState] = useState<{
    popup: TatPopup;
    entry: ScheduleHomepageEntry;
  } | null>(null);

  // ── Bulk delete state ─────────────────────────────────────────────────────
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkDateRange, setBulkDateRange] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);
  const [bulkTripType, setBulkTripType] = useState<CancelShiftType>("BOTH");
  const [isBulkChecking, setIsBulkChecking] = useState(false);

  type BulkRequestParams = {
    LocCode: number;
    EmpId: number;
    FromDate: string;
    ToDate: string;
    TripType: number;
  };

  const [bulkPopupState, setBulkPopupState] = useState<{
    popup: TatPopup;
    params: BulkRequestParams;
  } | null>(null);

  // ── Filtered data ──────────────────────────────────────────────────────────
  const tableData = useMemo(
    () =>
      entries.filter((e) =>
        activeTab === "LOGIN" ? !!e.LoginScheduleDate : !!e.LogoutScheduleDate,
      ),
    [entries, activeTab],
  );

  // ── executeCancellation ────────────────────────────────────────────────────
  // Same cancelIndividualSchedule API for both Cancel and No-Show.
  const executeCancellation = useCallback(
    async (entry: ScheduleHomepageEntry, actionType: ActionType) => {
      const scheduleDate = toIso(
        activeTab === "LOGIN"
          ? entry.LoginScheduleDate
          : entry.LogoutScheduleDate,
      );

      console.log("[executeCancellation] called", {
        entry: entry.id,
        actionType,
        scheduleDate,
        TripType: TRIP_TYPE[activeTab],
        LocCode: entry.LocCode,
        Empid: entry.Empid,
      });

      try {
        await cancelSchedule({
          LocCode: entry.LocCode,
          Empid: entry.Empid,
          ScheduleDate: scheduleDate,
          TripType: Number(TRIP_TYPE[activeTab]),
          ScheduleCancelVersion: "APP",
        }).unwrap();

        message.success(
          actionType === "NOSHOW"
            ? "No-Show marked successfully."
            : "Schedule cancelled successfully.",
        );
      } catch (err) {
        console.error("[executeCancellation] failed", err);
        message.error(
          actionType === "NOSHOW"
            ? "Failed to mark No-Show."
            : "Failed to cancel schedule.",
        );
      }
    },
    [activeTab, cancelSchedule, message],
  );

  // ── runActionFlow ──────────────────────────────────────────────────────────
  // Shared flow for Cancel and No-Show buttons.
  //
  // Decision tree:
  //  1. Fetch isCancelScheduleByUserAfterTAT for this entry's LocCode.
  //  2. true  → call CancelScheduleConfirmation API
  //              → backend returns popup → show DynamicActionPopup
  //              → backend returns no popup → execute directly
  //  3. false → execute directly (no popup at all)
  const runActionFlow = useCallback(
    async (entry: ScheduleHomepageEntry, actionType: ActionType) => {
      if (tatCheckingId === entry.id) return;

      console.log("[runActionFlow] start", { entry: entry.id, actionType });

      setPendingAction(actionType);
      setTatCheckingId(entry.id);

      try {
        // Step 1: get TAT flag (RTK Query caches per LocCode)
        const settingsResult = await fetchAppControlSettings(entry.LocCode);
        const isTatEnabled =
          settingsResult.data?.isCancelScheduleByUserAfterTAT ?? false;

        console.log(
          "[runActionFlow] isCancelScheduleByUserAfterTAT =",
          isTatEnabled,
        );

        if (isTatEnabled) {
          // Step 2a: TAT enabled → ask backend for popup config
          const res = await cancelScheduleConfirmation({
            LocCode: entry.LocCode,
            Empid: String(entry.Empid),
            ScheduleDate: toIso(
              activeTab === "LOGIN"
                ? entry.LoginScheduleDate
                : entry.LogoutScheduleDate,
            ),
            TripType: TRIP_TYPE[activeTab],
          }).unwrap();

          console.log("[runActionFlow] confirmation response", res);

          const popup = res.popups?.[0];
          if (popup) {
            // Backend gave us a popup → show it, wait for user action
            setPopupState({ popup, entry });
          } else {
            // Backend gave no popup → execute directly
            console.log(
              "[runActionFlow] no popup returned, executing directly",
            );
            await executeCancellation(entry, actionType);
          }
        } else {
          // Step 2b: TAT not required → execute directly, no popup
          console.log("[runActionFlow] TAT not enabled, executing directly");
          await executeCancellation(entry, actionType);
        }
      } catch (err) {
        console.error("[runActionFlow] error", err);
        // On any API error, still attempt the cancellation
        await executeCancellation(entry, actionType);
      } finally {
        setTatCheckingId(null);
      }
    },
    [
      activeTab,
      cancelScheduleConfirmation,
      executeCancellation,
      fetchAppControlSettings,
      tatCheckingId,
    ],
  );

  const handleCancelClick = useCallback(
    (entry: ScheduleHomepageEntry) => runActionFlow(entry, "CANCEL"),
    [runActionFlow],
  );

  const handleNoShowClick = useCallback(
    (entry: ScheduleHomepageEntry) => runActionFlow(entry, "NOSHOW"),
    [runActionFlow],
  );

  // ── handlePopupAction ──────────────────────────────────────────────────────
  // Called when user clicks ANY button in the dynamic popup.
  // Every button = execute cancellation. Dismiss = X / backdrop (no execution).
  const handlePopupAction = useCallback(
    async (_action: string) => {
      if (!popupState) return;

      console.log(
        "[handlePopupAction] action =",
        _action,
        "pendingAction =",
        pendingAction,
      );

      await executeCancellation(popupState.entry, pendingAction);
      setPopupState(null);
    },
    [executeCancellation, pendingAction, popupState],
  );

  // ── Bulk delete flow ───────────────────────────────────────────────────────
  const executeBulkCancellation = useCallback(
    async (params: BulkRequestParams) => {
      try {
        const res = await cancelScheduleBulk({
          ...params,
          ScheduleCancelVersion: "APP",
        }).unwrap();

        if (res.success) {
          message.success(res.message || "Schedules cancelled successfully.");
        } else {
          message.error(res.message || "Failed to cancel schedules.");
        }
      } catch (err) {
        console.error("[executeBulkCancellation] failed", err);
        message.error("Failed to cancel schedules.");
      }
    },
    [cancelScheduleBulk, message],
  );

  const handleBulkDeleteClick = useCallback(() => {
    setBulkDateRange([null, null]);
    setBulkTripType("BOTH");
    setBulkModalOpen(true);
  }, []);

  const handleBulkConfirm = useCallback(async () => {
    const [from, to] = bulkDateRange;
    if (!from || !to) return;

    const referenceEntry = entries[0];
    if (!referenceEntry) {
      message.error("No schedule data available.");
      return;
    }

    const params: BulkRequestParams = {
      LocCode: referenceEntry.LocCode,
      EmpId: referenceEntry.Empid,
      FromDate: from.format("YYYY-MM-DD"),
      ToDate: to.format("YYYY-MM-DD"),
      TripType: CANCEL_SHIFT_TRIP_TYPE[bulkTripType],
    };

    setIsBulkChecking(true);
    setBulkModalOpen(false);

    try {
      const settingsResult = await fetchAppControlSettings(params.LocCode);
      const isTatEnabled =
        settingsResult.data?.isCancelScheduleByUserAfterTAT ?? false;

      if (isTatEnabled) {
        const res = await cancelScheduleBulkConfirmation(params).unwrap();
        const popup = res.popups?.[0];
        if (popup) {
          setBulkPopupState({ popup, params });
        } else {
          await executeBulkCancellation(params);
        }
      } else {
        await executeBulkCancellation(params);
      }
    } catch (err) {
      console.error("[handleBulkConfirm] error", err);
      await executeBulkCancellation(params);
    } finally {
      setIsBulkChecking(false);
    }
  }, [
    bulkDateRange,
    bulkTripType,
    cancelScheduleBulkConfirmation,
    entries,
    executeBulkCancellation,
    fetchAppControlSettings,
    message,
  ]);

  const handleBulkPopupAction = useCallback(
    async (_action: string) => {
      if (!bulkPopupState) return;
      await executeBulkCancellation(bulkPopupState.params);
      setBulkPopupState(null);
    },
    [bulkPopupState, executeBulkCancellation],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#fff",
        gap: 12,
        padding: 14,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.textBody,
              lineHeight: 1.2,
            }}
          >
            My Schedule
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            View and manage your upcoming roster
          </div>
        </div>

        <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

        {isBulkCancellationEnabled && (
          <button
            type="button"
            onClick={handleBulkDeleteClick}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: `1px solid ${COLORS.cancelRedBorder}`,
              background: COLORS.cancelRedBg,
              color: COLORS.cancelRed,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Bulk Delete
          </button>
        )}

        {(isLoading || isFetching) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: COLORS.primaryDark,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke={COLORS.lightBg}
                strokeWidth="2"
              />
              <path
                d="M8 2a6 6 0 016 6"
                stroke={COLORS.primaryDark}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Loading…
          </div>
        )}
      </div>

      {/* Tab Switcher */}

      {/* Table */}
      <ScheduleTable
        data={tableData}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        activeTab={activeTab}
        tatCheckingId={tatCheckingId}
        onCancel={handleCancelClick}
        onNoShow={handleNoShowClick}
        onRetry={refetch}
      />

      {/* Dynamic popup — content 100% from backend */}
      <DynamicActionPopup
        open={!!popupState}
        popup={popupState?.popup ?? null}
        isLoading={isCancelling}
        onAction={handlePopupAction}
        onDismiss={() => setPopupState(null)}
      />

      {/* Bulk delete — date range + trip type picker */}
      <BulkCancelScheduleModal
        open={bulkModalOpen}
        dateRange={bulkDateRange}
        onDateRangeChange={setBulkDateRange}
        tripType={bulkTripType}
        onTripTypeChange={setBulkTripType}
        onConfirm={handleBulkConfirm}
        onDismiss={() => setBulkModalOpen(false)}
        isLoading={isBulkChecking}
      />

      {/* Bulk delete — TAT confirmation popup, backend-driven */}
      <DynamicActionPopup
        open={!!bulkPopupState}
        popup={bulkPopupState?.popup ?? null}
        isLoading={isBulkCancellingApi}
        onAction={handleBulkPopupAction}
        onDismiss={() => setBulkPopupState(null)}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default IndividualViewSchedulePage;

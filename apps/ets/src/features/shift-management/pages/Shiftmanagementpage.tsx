// features/shift-management/pages/ShiftManagementPage.tsx
// ═══════════════════════════════════════════════════════════════════════════════
//  ARCHITECTURE CHANGES (this version)
//  ─────────────────────────────────────────────────────────────────────────────
//  1. FILTER BAR — moved Search + Peak Hour into the page filter bar.
//     ShiftGridLayout no longer owns these controls.
//
//  2. CHECKBOX TOGGLE — no longer fires the API immediately.
//     Instead it opens ShiftActionModal with the row + field being changed.
//     User sees what will change, confirming fires the API with full context.
//
//  3. MULTI-ROW SELECTION:
//     • Rows gain a selection CB (Col 1) when selectedIds.size > 0 OR when
//       the user holds Shift (enableSelection becomes true automatically).
//     • A floating dark pill appears at the bottom when rows are selected,
//       with quick-apply buttons for each boolean field.
//     • Clicking a bulk action opens ShiftActionModal in bulk mode.
//
//  4. useRef TYPESCRIPT FIX:
//     useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
//     (previous version used useRef<ReturnType<typeof setTimeout>>() which
//     TS requires an initial argument.)
//
//  5. DROP DATA — ShiftActionModal fetches drops directly from ShiftDropDown
//     and parses result[0].jsonShiftDropDown (stringified JSON).
//     DropsPopover is no longer used in the grid rows.
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

import { ErrorBoundary } from "../../../shared/components/ErrorBounadry/ErrorBoundary";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { Select } from "../../../shared/components/ui/Select";

import {
  useGetShiftDefinitionMutation,
  useUpdateShiftSlotMutation,
} from "../services/shiftManagementApi";
import { useShiftGrid } from "../hooks/useShiftGrid";
import { useShiftMutations } from "../hooks/useShiftMutations";
import { useShiftModal } from "../hooks/useShiftModal";
import { setSelectedLocCode } from "../slice/shiftSlice";
import { useLookups } from "../../lookups";

import { ShiftGridLayout } from "../shift-grid/Shiftgridlayout";
import type { ShiftRow } from "../shift-grid/Shiftgridlayout";
import { EditSlotModal } from "../components/Editslotmodal";
import { ShiftActionModal } from "../components/ShiftActionModal";

import type {
  ShiftBoolKey,
  ShiftNumKey,
  ShiftStringKey,
  UpdateShiftPayload,
} from "../types/shift.mangement.types";

import { useLazyGetShiftValidationTypeQuery } from "../../shift-validation/services/shiftValidationApi";

import { message } from "antd";

import {
  RefreshCw,
  LogIn,
  LogOut,
  Search,
  Zap,
  X,
  Bus,
  Shield,
  CheckSquare,
} from "lucide-react";
import { C, F, SP, R, SH, CM, TR } from "../shift-grid/ShiftGridTokens";

const MAX_OCCUPANCY = 26;

// ── Bulk action configuration ─────────────────────────────────────────────────
const BULK_ACTIONS = [
  { field: "isGuardPick", label: "Guard Pickup", icon: Bus },
  { field: "isGuardDrop", label: "Guard Drop", icon: Bus },
  { field: "isSafeReachedMale", label: "Safe Reach (M)", icon: Shield },
  { field: "isSafeReachedFemale", label: "Safe Reach (F)", icon: Shield },
  { field: "peakHour", label: "Peak Hour", icon: Zap },
  { field: "unsPickAllwd", label: "Adhoc Pick", icon: CheckSquare },
  { field: "unsDropAllwd", label: "Adhoc Drop", icon: CheckSquare },
] as const;

// ── Payload builder ────────────────────────────────────────────────────────────
function rowToPayload(row: any): UpdateShiftPayload {
  return {
    locCode: Number(row.locCode ?? 0),
    shiftDesc: row.shiftDesc ?? null,
    shiftTime: row.shiftTime,
    dropShift: row.dropShift ?? null,
    dropDayShift: Boolean(row.dropDayShift),
    pickDayShift: Boolean(row.pickDayShift),
    peakHour: Boolean(row.peakHour),
    unsPickAllwd: Boolean(row.unsPickAllwd),
    unsDropAllwd: Boolean(row.unsDropAllwd),
    pickOccupancy: Number(row.pickOccupancy ?? 0),
    dropOccupancy: Number(row.dropOccupancy ?? 0),
    isGuardPick: Boolean(row.isGuardPick),
    isGuardDrop: Boolean(row.isGuardDrop),
    isSafeReachedMale: Boolean(row.isSafeReachedMale),
    isSafeReachedFemale: Boolean(row.isSafeReachedFemale),
    avgSpeed: Number(row.avgSpeed ?? 0),
  };
}

// ── FilterField helper ─────────────────────────────────────────────────────────
const FilterField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: SP[0.5] }}>
    <span
      style={{
        fontSize: F.size.xs,
        fontWeight: F.weight.bold,
        color: C.textMuted,
        textTransform: "uppercase",
        letterSpacing: F.ls.wider,
      }}
    >
      {label}
    </span>
    {children}
  </div>
);

// ── Pending action state type ─────────────────────────────────────────────────
interface PendingAction {
  rows: any[];
  field: string;
  newValue: boolean;
}

// ── Inner content ─────────────────────────────────────────────────────────────
const ShiftManagementContent: React.FC = () => {
  const dispatch = useDispatch();

  // ── Redux ──────────────────────────────────────────────────────────────────
  const selectedLocCode = useSelector(
    (s: RootState) => s.shiftUi.selectedLocCode,
  );
  const localSlots = useSelector((s: RootState) => s.shiftUi.localSlots);

  const activeLocCode = useMemo(
    () => selectedLocCode ?? null,
    [selectedLocCode],
  );

  // ── Login / Logout tab ─────────────────────────────────────────────────────
  const [shiftType, setShiftType] = useState<"login" | "logout">("login");
  const [tabLoading, setTabLoading] = useState(false);
  // ▸ FIX: provide the required initial value for useRef
  const tabTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleTabSwitch = useCallback(
    (tab: "login" | "logout") => {
      if (tab === shiftType) return;
      clearTimeout(tabTimerRef.current);
      setTabLoading(true);
      setShiftType(tab);
      tabTimerRef.current = setTimeout(() => setTabLoading(false), 250);
    },
    [shiftType],
  );

  // ── VT detection ───────────────────────────────────────────────────────────
  const [fetchValidationType, { isFetching: isFetchingVT }] =
    useLazyGetShiftValidationTypeQuery();
  const [fetchedVT, setFetchedVT] = useState<number | null>(null);
  const [wiseId, setWiseId] = useState("0");

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const [fetchShiftDefinition, { data: shiftData, isLoading, error }] =
    useGetShiftDefinitionMutation();

  const fetchRef = useRef(fetchShiftDefinition);
  fetchRef.current = fetchShiftDefinition;

  const refetch = useCallback(() => {
    if (activeLocCode != null)
      fetchRef.current({ locCode: activeLocCode, wiseID: wiseId });
  }, [activeLocCode, wiseId]);

  useEffect(() => {
    if (activeLocCode == null) return;
    setFetchedVT(null);
    setWiseId("0");
    fetchValidationType(activeLocCode)
      .then((res) => {
        const vt = "data" in res && res.data != null ? res.data : 1;
        setFetchedVT(vt);
        if (vt <= 2) fetchRef.current({ locCode: activeLocCode, wiseID: "0" });
      })
      .catch(() => {
        setFetchedVT(1);
        fetchRef.current({ locCode: activeLocCode, wiseID: "0" });
      });
  }, [activeLocCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Slots for current tab ──────────────────────────────────────────────────
  const serverSlots = useMemo(
    () =>
      shiftType === "login"
        ? (shiftData?.login ?? [])
        : (shiftData?.logout ?? []),
    [shiftData, shiftType],
  );

  const allDropTimes = useMemo(
    () =>
      (shiftData?.logout ?? [])
        .map((s: any) => s.shiftTime)
        .filter(Boolean) as string[],
    [shiftData],
  );

  // ── Grid state ─────────────────────────────────────────────────────────────
  const { handleToggle, handleNumChange, handleStrChange, resetToServer } =
    useShiftGrid(serverSlots);

  const resetToServerRef = useRef(resetToServer);
  resetToServerRef.current = resetToServer;
  useEffect(() => {
    resetToServerRef.current();
  }, [serverSlots]);

  // ── Lookups ────────────────────────────────────────────────────────────────
  const { locationOptions, departmentOptions, lobOptions, projectOptions } =
    useLookups({
      only: [
        "locationOptions",
        "departmentOptions",
        "lobOptions",
        "projectOptions",
      ],
    });

  const entityOptions = useMemo(() => {
    if (fetchedVT === 3) return departmentOptions;
    if (fetchedVT === 4) return lobOptions;
    if (fetchedVT === 5) return projectOptions;
    return [];
  }, [fetchedVT, departmentOptions, lobOptions, projectOptions]);

  const showEntityDropdown = fetchedVT != null && fetchedVT >= 3;
  const lockType =
    fetchedVT === 3 ? "DEPARTMENT" : fetchedVT === 4 ? "LOB" : "SHIFT";

  // ── Inline single-row save ─────────────────────────────────────────────────
  const [updateSlotInline] = useUpdateShiftSlotMutation();

  const pagedSlotsRef = useRef<any[]>([]);

  const resolveLocalIdxFromRef = useCallback(
    (pagedIdx: number): number => {
      const row = pagedSlotsRef.current[pagedIdx] as any;
      if (!row) return -1;
      return (localSlots as any[]).findIndex((s: any) => s.id === row.id);
    },
    [localSlots],
  );

  // ── Confirmation modal state ───────────────────────────────────────────────
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [isConfirming, setIsConfirming] = useState(false);

  /**
   * Called when a row's boolean checkbox is toggled.
   * Instead of firing the API immediately, we open ShiftActionModal.
   */
  const handleToggleWithConfirm = useCallback(
    (pagedIdx: number, field: string) => {
      const row = pagedSlotsRef.current[pagedIdx] as any;
      if (!row) return;
      const currentVal = Boolean(row[field]);
      setPendingAction({ rows: [row], field, newValue: !currentVal });
    },
    [],
  );

  /**
   * Fires after the user clicks Confirm in ShiftActionModal.
   * Runs the optimistic toggle + API call for every row in the pending action.
   */
  // const handleConfirmAction = useCallback(async () => {
  //   if (!pendingAction) return;
  //   setIsConfirming(true);
  //   let failCount = 0;

  //   const { rows, field, newValue } = pendingAction;

  //   let successCount = 0;

  //   for (const row of rows) {
  //     // Skip rows that are already at the target value
  //     if (Boolean(row[field]) === newValue) continue;

  //     const localIdx = (localSlots as any[]).findIndex(
  //       (s: any) => s.id === row.id,
  //     );
  //     if (localIdx < 0) continue;

  //     const slot = (localSlots as any[])[localIdx];

  //     // Optimistic update
  //     handleToggle(localIdx, field as ShiftBoolKey);

  //     try {
  //       await updateSlotInline({
  //         id: slot.id,
  //         body: rowToPayload({ ...slot, [field]: newValue }),
  //       }).unwrap();
  //     } catch {
  //       // Rollback this row
  //       handleToggle(localIdx, field as ShiftBoolKey);
  //     }
  //   }

  //   setIsConfirming(false);
  //   setPendingAction(null);
  //   clearSelection();

  //   if (successCount > 0 && failCount === 0) {
  //   message.success(
  //     successCount === 1
  //       ? "Shift updated successfully."
  //       : `${successCount} shifts updated successfully.`,
  //   );

  // }, [pendingAction, localSlots, handleToggle, updateSlotInline]); // eslint-disable-line

  // ── Num / Str changes — still immediate (no confirm for text fields) ───────
  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;
    setIsConfirming(true);

    const { rows, field, newValue } = pendingAction;
    let successCount = 0;
    let failCount = 0;

    for (const row of rows) {
      if (Boolean(row[field]) === newValue) continue;

      const localIdx = (localSlots as any[]).findIndex(
        (s: any) => s.id === row.id,
      );
      if (localIdx < 0) continue;

      const slot = (localSlots as any[])[localIdx];
      handleToggle(localIdx, field as ShiftBoolKey);

      try {
        await updateSlotInline({
          id: slot.id,
          body: rowToPayload({ ...slot, [field]: newValue }),
        }).unwrap();
        successCount++;
      } catch {
        handleToggle(localIdx, field as ShiftBoolKey); // rollback
        failCount++;
      }
    }

    setIsConfirming(false);
    setPendingAction(null);
    clearSelection();

    if (successCount > 0 && failCount === 0) {
      message.success(
        successCount === 1
          ? "Shift updated successfully."
          : `${successCount} shifts updated successfully.`,
      );
    } else if (successCount > 0 && failCount > 0) {
      message.warning(
        `${successCount} updated, ${failCount} failed. Please retry the failed ones.`,
      );
    } else if (failCount > 0) {
      message.error("Failed to update shift(s). Please try again.");
    }
  }, [pendingAction, localSlots, handleToggle, updateSlotInline]);

  const handleInlineNumChange = useCallback(
    async (pagedIdx: number, field: string, v: number | null) => {
      if (v === null) return;
      const localIdx = resolveLocalIdxFromRef(pagedIdx);
      if (localIdx < 0) return;
      const slot = (localSlots as any[])[localIdx];
      if (!slot) return;
      handleNumChange(localIdx, field as ShiftNumKey, v);
      try {
        await updateSlotInline({
          id: slot.id,
          body: rowToPayload({ ...slot, [field]: v }),
        }).unwrap();
      } catch {
        handleNumChange(localIdx, field as ShiftNumKey, slot[field]);
      }
    },
    [resolveLocalIdxFromRef, localSlots, handleNumChange, updateSlotInline],
  );

  const handleInlineStrChange = useCallback(
    async (pagedIdx: number, field: string, v: string) => {
      const localIdx = resolveLocalIdxFromRef(pagedIdx);
      if (localIdx < 0) return;
      const slot = (localSlots as any[])[localIdx];
      if (!slot) return;
      handleStrChange(localIdx, field as ShiftStringKey, v);
      try {
        await updateSlotInline({
          id: slot.id,
          body: rowToPayload({ ...slot, [field]: v || null }),
        }).unwrap();
      } catch {
        handleStrChange(localIdx, field as ShiftStringKey, slot[field] ?? "");
      }
    },
    [resolveLocalIdxFromRef, localSlots, handleStrChange, updateSlotInline],
  );

  // ── Drawer / edit modal ────────────────────────────────────────────────────
  const { isEditOpen, editingSlot, openEdit, closeEdit } = useShiftModal();

  const { updateShiftSlot, isUpdating, updateError } = useShiftMutations({
    onUpdateSuccess: () => {
      // message.success("Shift updated successfully.");
      closeEdit();
      refetch();
    },
  });

  const handleRowClick = useCallback(
    (row: ShiftRow) => {
      openEdit({ ...row, dropShiftOptions: allDropTimes } as any);
    },
    [openEdit, allDropTimes],
  );

  const handleEditSubmit = async (values: Record<string, unknown>) => {
    if (!editingSlot) return;
    const payload: UpdateShiftPayload = {
      locCode: editingSlot.locCode ?? 0,
      shiftDesc: editingSlot.shiftDesc ?? null,
      shiftTime: editingSlot.shiftTime,
      dropShift: values.dropShift ? String(values.dropShift) : null,
      dropDayShift: Boolean(values.dropDayShift),
      pickDayShift: Boolean(values.pickDayShift),
      peakHour: Boolean(values.peakHour),
      unsPickAllwd: Boolean(values.unsPickAllwd),
      unsDropAllwd: Boolean(values.unsDropAllwd),
      pickOccupancy: Number(values.pickOccupancy),
      dropOccupancy: Number(values.dropOccupancy),
      isGuardPick: Boolean(values.isGuardPick),
      isGuardDrop: Boolean(values.isGuardDrop),
      isSafeReachedMale: Boolean(values.isSafeReachedMale),
      isSafeReachedFemale: Boolean(values.isSafeReachedFemale),
      avgSpeed: Number(values.avgSpeed),
    };
    // const response = await updateShiftSlot({
    //   id: editingSlot.id,
    //   body: payload,
    // });

    try {
      await updateShiftSlot({ id: editingSlot.id, body: payload });
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.message ??
        "Failed to update shift. Please try again.";
      message.error(msg);
    }
  };

  // ── Filter + pagination state ──────────────────────────────────────────────
  const [searchText, setSearchText] = useState("");
  const [peakOnly, setPeakOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [shiftType, searchText, peakOnly]);

  const filteredSlots = useMemo(() => {
    let rows = [...localSlots] as any[];
    if (searchText) {
      const q = searchText.toLowerCase();
      rows = rows.filter(
        (s) =>
          (s.shiftTime ?? "").toLowerCase().includes(q) ||
          (s.dropShift ?? "").toLowerCase().includes(q),
      );
    }
    if (peakOnly) rows = rows.filter((s) => s.peakHour === true);
    return rows;
  }, [localSlots, searchText, peakOnly]);

  const totalCount = filteredSlots.length;
  const pagedSlots = filteredSlots.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  pagedSlotsRef.current = pagedSlots;

  // ── Multi-row selection ────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  /** Click a bulk action → open confirm modal for all selected rows */
  const handleBulkAction = useCallback(
    (field: string) => {
      const rows = pagedSlotsRef.current.filter((r: any) =>
        selectedIds.has(r.id),
      );
      if (rows.length === 0) return;
      // Bulk always sets the field to true (enabling)
      setPendingAction({ rows, field, newValue: true });
    },
    [selectedIds],
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const isEmptyDataError = (error as any)?.isEmpty === true;
  const displayError = isEmptyDataError ? undefined : error;
  const updateServerErrors = (updateError as any)?.fieldErrors ?? null;

  const entityLabel =
    fetchedVT === 3
      ? "Select Department"
      : fetchedVT === 4
        ? "Select LOB"
        : "Select Process";

  const enableSelection = selectedIds.size > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        fontFamily: F.family,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════
          STICKY HEADER — 3-zone
         ═══════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: CM.pageHeaderH,
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${CM.bodyPadding}px`,
          flexShrink: 0,
          boxShadow: SH.header,
        }}
      >
        {/* Left — title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: F.size["2xl"],
              fontWeight: F.weight.bold,
              color: C.text,
              lineHeight: F.lh.tight,
              letterSpacing: F.ls.tight,
            }}
          >
            Shift Configuration
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: F.size.sm,
              color: C.textMuted,
              lineHeight: F.lh.normal,
            }}
          >
            Define pickup and drop shift timings and related configurations.
          </p>
        </div>

        {/* Center — Login / Logout (absolute for true centering) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            background: C.bgSub,
            border: `1px solid ${C.border}`,
            borderRadius: R["2xl"],
            padding: 3,
            gap: 3,
          }}
        >
          {(["login", "logout"] as const).map((t) => {
            const active = shiftType === t;
            return (
              <button
                key={t}
                onClick={() => handleTabSwitch(t)}
                style={{
                  height: 32,
                  padding: `0 ${SP[4]}px`,
                  border: "none",
                  borderRadius: R.xl,
                  background: active ? C.primary : "transparent",
                  color: active ? C.white : C.textSub,
                  fontSize: F.size.sm,
                  fontWeight: active ? F.weight.semibold : F.weight.regular,
                  cursor: "pointer",
                  transition: TR.fast,
                  display: "flex",
                  alignItems: "center",
                  gap: SP[1.5],
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.background =
                      C.bgHover;
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                }}
              >
                {t === "login" ? (
                  <LogIn size={13} strokeWidth={1.8} />
                ) : (
                  <LogOut size={13} strokeWidth={1.8} />
                )}
                {t === "login" ? "Login Shifts" : "Logout Shifts"}
              </button>
            );
          })}
        </div>

        {/* Right — How it works */}
        {/* <div style={{ marginLeft: "auto" }}>
          <button
            style={{
              height: CM.btnMd,
              display: "flex",
              alignItems: "center",
              gap: SP[1.5],
              padding: `0 ${SP[3]}px`,
              border: `1px solid ${C.border}`,
              borderRadius: R.xl,
              background: C.white,
              color: C.textSub,
              fontSize: F.size.sm,
              cursor: "pointer",
              transition: TR.fast,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = C.primary)
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <HelpCircle size={13} color={C.textMuted} />
            How it works
          </button>
        </div> */}
      </header>

      {/* ═══════════════════════════════════════════════════════════
          FILTER BAR — Office | Entity | Search | Peak | Refresh
         ═══════════════════════════════════════════════════════════ */}
      <div style={{ padding: `${SP[3]}px ${CM.bodyPadding}px 0` }}>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: R["2xl"],
            padding: `${CM.filterCardP}px`,
            display: "flex",
            alignItems: "flex-end",
            gap: SP[3],
            flexWrap: "wrap",
          }}
        >
          {/* Office */}
          <FilterField label="Select Office">
            <Select
              style={{ width: 220, height: 34 }}
              placeholder="Select office"
              autoSelectFirst
              value={
                selectedLocCode != null
                  ? (selectedLocCode as string | number)
                  : undefined
              }
              onChange={(v: number | string) =>
                dispatch(setSelectedLocCode(Number(v)))
              }
              options={locationOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          </FilterField>

          {/* VT loading indicator */}
          {isFetchingVT && (
            <span
              style={{
                fontSize: 12,
                color: C.textMuted,
                alignSelf: "center",
                paddingBottom: 4,
              }}
            >
              Detecting scope…
            </span>
          )}

          {/* Entity dropdown — VT 3/4/5 only */}
          {showEntityDropdown && (
            <FilterField label={entityLabel}>
              <Select
                style={{ width: 220, height: 34 }}
                placeholder={entityLabel}
                autoSelectFirst
                value={wiseId !== "0" ? wiseId : undefined}
                onChange={(v: string | number) => {
                  const val = String(v);
                  setWiseId(val);
                  if (activeLocCode != null)
                    fetchRef.current({ locCode: activeLocCode, wiseID: val });
                }}
                options={entityOptions.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                showSearch
              />
            </FilterField>
          )}

          {/* ── Search Shift Time ── */}
          <FilterField label="Search Shift">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: `1px solid ${searchText ? C.primary : C.border}`,
                borderRadius: R.lg,
                padding: "0 10px",
                height: 34,
                background: C.white,
                width: 180,
                transition: TR.fast,
              }}
            >
              <Search
                size={13}
                color={searchText ? C.primary : C.textMuted}
                strokeWidth={2}
              />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="e.g. 06:30"
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  fontSize: F.size.sm,
                  color: C.text,
                  width: "100%",
                }}
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    color: C.textMuted,
                    flexShrink: 0,
                  }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </FilterField>

          {/* ── Peak Hour toggle ── */}
          <FilterField label="Shift Type">
            <button
              onClick={() => setPeakOnly((p) => !p)}
              style={{
                height: 34,
                padding: "0 14px",
                border: `1px solid ${peakOnly ? C.primary : C.border}`,
                borderRadius: R.lg,
                background: peakOnly ? C.primaryLight : C.white,
                color: peakOnly ? C.primary : C.textSub,
                fontSize: F.size.sm,
                fontWeight: peakOnly ? F.weight.semibold : F.weight.regular,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: TR.fast,
              }}
            >
              <Zap
                size={12}
                strokeWidth={2}
                color={peakOnly ? C.primary : C.textMuted}
              />
              {peakOnly ? "Peak Only" : "All Shifts"}
            </button>
          </FilterField>

          <div style={{ flex: 1 }} />

          {/* Refresh */}
          <button
            onClick={refetch}
            style={{
              height: 34,
              display: "flex",
              alignItems: "center",
              gap: SP[1.5],
              padding: `0 ${SP[3]}px`,
              border: `1px solid ${C.border}`,
              borderRadius: R.lg,
              background: C.white,
              color: C.textSub,
              fontSize: F.size.sm,
              cursor: "pointer",
              transition: TR.fast,
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = C.bgHover)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = C.white)
            }
          >
            <RefreshCw size={12} color={C.textMuted} />
            Refresh
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GRID
         ═══════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          padding: `${SP[3]}px ${CM.bodyPadding}px ${SP[4]}px`,
        }}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={displayError}
          isEmpty={!isLoading && !localSlots.length}
          onRetry={refetch}
          emptyMessage={
            activeLocCode == null
              ? "Select an office above to load shifts."
              : "No shifts defined yet."
          }
        >
          <ShiftGridLayout
            slots={pagedSlots as unknown as ShiftRow[]}
            isLoading={tabLoading}
            // ── Toggles → open confirmation modal ──
            onToggle={(i, key) => handleToggleWithConfirm(i, key)}
            onNumChange={(i, key, v) => handleInlineNumChange(i, key, v)}
            onStrChange={(i, key, v) => handleInlineStrChange(i, key, v)}
            onRowClick={handleRowClick}
            onEdit={handleRowClick}
            maxOccupancy={MAX_OCCUPANCY}
            // ── search / peak intentionally omitted — handled in filter bar ──
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            lockType={lockType}
            // ── Row selection ──
            enableSelection={enableSelection}
            selectedIds={selectedIds}
            onSelectRow={toggleSelectRow}
          />
        </ApiStateWrapper>
      </div>

      {/* ── Edit drawer ── */}
      <EditSlotModal
        open={isEditOpen}
        onClose={closeEdit}
        editingSlot={editingSlot as any}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
        serverErrors={updateServerErrors}
        lockType={lockType}
      />

      {/* ── Confirmation modal (single-row toggle or bulk apply) ── */}
      {pendingAction && (
        <ShiftActionModal
          open
          onClose={() => setPendingAction(null)}
          rows={pendingAction.rows}
          field={pendingAction.field}
          newValue={pendingAction.newValue}
          locCode={activeLocCode ?? 0}
          lockType={lockType}
          onConfirm={handleConfirmAction}
          isConfirming={isConfirming}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          FLOATING BULK SELECTION BAR
          Appears when ≥1 row is selected.  Dark pill, fixed bottom.
         ═══════════════════════════════════════════════════════════ */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            background: "#1C1917",
            borderRadius: 999,
            padding: "10px 18px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            animation: "slideUpPill 0.2s ease",
          }}
        >
          {/* Count badge */}
          <span
            style={{
              color: "#F5F5F4",
              fontWeight: 700,
              fontSize: 13,
              paddingRight: 4,
            }}
          >
            {selectedIds.size} shift{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.15)",
              margin: "0 4px",
            }}
          />

          {/* Bulk action buttons */}
          {BULK_ACTIONS.map(({ field, label, icon: Icon }) => (
            <button
              key={field}
              onClick={() => handleBulkAction(field)}
              style={{
                height: 30,
                padding: "0 11px",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 999,
                background: "transparent",
                color: "#E7E5E4",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: TR.fast,
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.12)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <Icon size={11} strokeWidth={2} />
              {label}
            </button>
          ))}

          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.15)",
              margin: "0 4px",
            }}
          />

          {/* Clear selection */}
          <button
            onClick={clearSelection}
            title="Clear selection"
            style={{
              width: 28,
              height: 28,
              border: "none",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              color: "#A8A29E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: TR.fast,
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.18)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.1)")
            }
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUpPill {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── Export ────────────────────────────────────────────────────────────────────
const ShiftManagementPage: React.FC = () => (
  <ErrorBoundary fallbackTitle="Shift Management Error">
    <ShiftManagementContent />
  </ErrorBoundary>
);

export default ShiftManagementPage;

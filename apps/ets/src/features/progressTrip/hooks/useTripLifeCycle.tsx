import { useState, useMemo, useCallback, useEffect } from "react";
import { useGetUserShiftsQuery } from "../../roaster/services/RosterApi";
import { tripTypeOption, TOTAL_MINUTES } from "../constants/TripOption";
import type {
  SelectOptions,
  TripLifeCycleRequest,
} from "../types/progressTrip.types";
import dayjs from "dayjs";

export interface UserShift {
  shiftId: number;
  shiftName: string;
}

// "HH:mm" → minutes from midnight
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function mapShiftsToOptions(shifts: UserShift[]): SelectOptions[] {
  return shifts.map((s) => ({ label: s.shiftName, value: s.shiftId }));
}
function filterShiftsByRange(
  shifts: UserShift[],
  range: [number, number],
): UserShift[] {
  const [start, end] = range;
  return shifts.filter((s) => {
    const t = timeToMinutes(s.shiftName);
    return t >= start && t <= end;
  });
}

function getShiftTimeRange(shifts: UserShift[]): [number, number] | null {
  const times = shifts.map((shift) => timeToMinutes(shift.shiftName));
  if (times.length === 0) return null;
  return [Math.min(...times), Math.max(...times)];
}

export function useTripLifeCycle() {
  // ── selected filters ──────────────────────────────────────────
  const [locCode, setLocCode] = useState<number | string>("");
  const [tripType, setTripType] = useState<number>(1);
  // state — already number[] in your hook, just make sure initial value matches
  const [pickShiftId, setPickShiftId] = useState<number[]>([]);
  const [dropShiftId, setDropShiftId] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number]>([
    0,
    TOTAL_MINUTES,
  ]);
  // ── fetch shifts whenever an office is selected ───────────────
  const { data: shiftData, isFetching: isShiftLoading } = useGetUserShiftsQuery(
    (locCode ?? 0) as number,
    {
      skip: !locCode,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    const shifts =
      tripType === 1
        ? (shiftData?.pickShifts ?? [])
        : tripType === 2
          ? (shiftData?.dropShifts ?? [])
          : [...(shiftData?.pickShifts ?? []), ...(shiftData?.dropShifts ?? [])];
    const shiftTimeRange = getShiftTimeRange(shifts);
    if (shiftTimeRange) setTimeRange(shiftTimeRange);
  }, [shiftData?.pickShifts, shiftData?.dropShifts, tripType]);

  // ── filtered options (respect time range) ────────────────────
  const pickShiftOptions = useMemo<SelectOptions[]>(
    () =>
      mapShiftsToOptions(
        filterShiftsByRange(shiftData?.pickShifts ?? [], timeRange),
      ),
    [shiftData?.pickShifts, timeRange],
  );

  const dropShiftOptions = useMemo<SelectOptions[]>(
    () =>
      mapShiftsToOptions(
        filterShiftsByRange(shiftData?.dropShifts ?? [], timeRange),
      ),
    [shiftData?.dropShifts, timeRange],
  );

  // ── derive time-label arrays for ShiftTimeSelector ───────────
  const pickShiftTimes = useMemo(
    () => pickShiftOptions.map((o) => o.label),
    [pickShiftOptions],
  );

  const dropShiftTimes = useMemo(
    () => dropShiftOptions.map((o) => o.label),
    [dropShiftOptions],
  );

  // ── build the API request body automatically ─────────────────
  const requestBody: TripLifeCycleRequest | null = useMemo(
    () =>
      locCode
        ? {
            locCode: Number(locCode),
            fromDate: dayjs().format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD"),
            tripType: tripType,
            loginShifts: tripType == 2 ? "" : pickShiftId.join(","),
            logoutShifts: tripType == 1 ? "" : dropShiftId.join(","),
            transporterId: 0,
          }
        : null,
    [locCode, tripType, pickShiftId, dropShiftId],
  );
  const handleTimeRangeChange = useCallback((range: [number, number]) => {
    setTimeRange(range);
  }, []);

  // ── handlers ─────────────────────────────────────────────────
  const handleOfficeChange = useCallback((value: number) => {
    setLocCode(value);
    // reset shift selections when office changes
    setPickShiftId([]);
    setDropShiftId([]);
  }, []);

  // handlers — receive the full checked array directly
  const handlePickShiftChange = useCallback((values: number[]) => {
    setPickShiftId(values);
  }, []);

  const handleDropShiftChange = useCallback((values: number[]) => {
    setDropShiftId(values);
  }, []);

  return {
    pickShiftOptions,
    dropShiftOptions,
    tripTypeOptions: tripTypeOption,
    pickShiftTimes,
    dropShiftTimes,
    timeRange,

    // selected values
    locCode,
    tripType,
    pickShiftId,
    dropShiftId,

    // loading state
    isShiftLoading,

    // the ready-to-send body
    requestBody,

    // handlers
    handleTimeRangeChange,
    handleOfficeChange,
    handleTripTypeChange: setTripType,
    handlePickShiftChange,
    handleDropShiftChange,
  };
}

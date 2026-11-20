// features/shift-validation/hooks/useShiftMutations.ts

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/index";
import {
  useUpdateShiftManagementMutation,
  useUpdateShiftValidationMutation,
} from "../services/shiftValidationApi";

import {
  useDefineShiftMutation,
  useCreateShiftIntervalMutation,
} from "../../shift-management/services/shiftManagementApi";
import { closeConfirmModal } from "../slice/shiftValidationSlice";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import type { CreateShiftIntervalDto } from "../types/shiftValidation.types";

interface UseShiftMutationsOptions {
  onSuccess?: () => void;
  onCreateIntervalSuccess?: () => void;
  tab?: "create" | "mapping"; // ← add
}

export const useShiftMutations = (options: UseShiftMutationsOptions = {}) => {
  const { onSuccess, onCreateIntervalSuccess, tab } = options;

  const dispatch = useAppDispatch();
  const { message } = useUILibrary();
  const state = useAppSelector((s) => s.shiftValidationUi);

  const [updateNormal, { isLoading: isUpdatingNormal }] =
    useUpdateShiftManagementMutation();
  const [updateValidation, { isLoading: isUpdatingValidation }] =
    useUpdateShiftValidationMutation();
  const [defineShiftMutation, { isLoading: isDefining, error: defineError }] =
    useDefineShiftMutation();
  const [
    createIntervalMutation,
    { isLoading: isintervalCreating, error: createIntervalError },
  ] = useCreateShiftIntervalMutation();

  const isUpdating = isUpdatingNormal || isUpdatingValidation;

  // ── Submit shift validation changes ────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    try {
      const idKey = tab === "mapping" ? "shiftId" : "controlId";

      console.log("tab:", tab, "idKey:", idKey);

      console.log(
        "ALL pickup slots:",
        state.pickupShifts.map((s) => ({
          shiftId: s.shiftId,
          controlId: s.controlId,
          active: s.active,
        })),
      );

      console.log(
        "ALL drop slots:",
        state.dropShifts.map((s) => ({
          shiftId: s.shiftId,
          controlId: s.controlId,
          active: s.active,
        })),
      );

      const pickupControlIds = state.pickupShifts
        .filter((s) => s.active)
        .map((s) => s[idKey])
        .filter(Boolean);

      const dropControlIds = state.dropShifts
        .filter((s) => s.active)
        .map((s) => s[idKey])
        .filter(Boolean);

      let serverMessage: string | undefined;

      console.log("tab:", tab, "idKey:", idKey);
      console.log("pickup ids:", pickupControlIds);
      console.log("drop ids:", dropControlIds);

      // if (state.currentMode === 1) {
      //   const res = await updateNormal({
      //     locCode: state.locCode,
      //     controlIds: [...pickupControlIds, ...dropControlIds].join(","),
      //   }).unwrap();
      //   serverMessage = (res as any)?.message;
      // } else {
      //   const res = await updateValidation({
      //     locCode: state.locCode,
      //     tripType: 1,
      //     wiseID: String(state.wiseId ?? ""),
      //     validateType: state.currentMode,
      //     pickShifts: pickupControlIds.join(","),
      //     dropShifts: dropControlIds.join(","),
      //   }).unwrap();
      //   serverMessage = (res as any)?.message;
      // }

      // Create tab + mode 1 → updateNormal (shift management)
      // Mapping tab (any mode including 1) → updateValidation
      if (tab === "create" && state.currentMode === 1) {
        const res = await updateNormal({
          locCode: state.locCode,
          controlIds: [...pickupControlIds, ...dropControlIds].join(","),
        }).unwrap();
        serverMessage = (res as any)?.message;
      } else {
        const res = await updateValidation({
          locCode: state.locCode,
          tripType: 1,
          wiseID: String(state.wiseId ?? ""),
          validateType: state.currentMode, // correctly 1 when VT=1 on mapping tab
          pickShifts: pickupControlIds.join(","),
          dropShifts: dropControlIds.join(","),
        }).unwrap();
        serverMessage = (res as any)?.message;
      }

      message.success(serverMessage || "Shifts updated successfully");
      dispatch(closeConfirmModal());
    } catch (err: unknown) {
      const apiMsg =
        (err as any)?.data?.message ||
        (err as any)?.message ||
        "Failed to update shifts. Please try again.";
      message.error(apiMsg);
    }
  }, [dispatch, message, state, updateNormal, updateValidation, tab]);

  // ── Define shift ───────────────────────────────────────────────────────────
  const defineShift = useCallback(
    async (payload: { locCode: number; interval: number }) => {
      try {
        const res = await defineShiftMutation(payload).unwrap();
        const serverMessage = (res as any)?.message;

        const errorResult = (res as any)?.result?.[0];
        if (errorResult?.errorCode === 1) {
          message.error(errorResult.dB_Response || "Operation failed");
          return; // keep modal open, don't call onSuccess
        }

        message.success(serverMessage || "Shifts defined successfully");
        onSuccess?.();
      } catch (err: unknown) {
        const apiMsg =
          (err as any)?.data?.message ||
          (err as any)?.message ||
          "Failed to define shifts. Please try again.";
        message.error(apiMsg);
      }
    },
    [defineShiftMutation, message, onSuccess],
  );

  // ── Create shift interval ──────────────────────────────────────────────────
  const createShiftInterval = useCallback(
    async (payload: CreateShiftIntervalDto) => {
      try {
        const res = await createIntervalMutation(payload).unwrap();
        const serverMessage = (res as any)?.message;
        message.success(serverMessage || "Shift interval created successfully");
        await onCreateIntervalSuccess?.();
      } catch (err: unknown) {
        const apiMsg =
          (err as any)?.data?.message ||
          (err as any)?.message ||
          "Failed to create shift interval. Please try again.";
        message.error(apiMsg);
      }
    },
    [createIntervalMutation, message, onCreateIntervalSuccess],
  );

  return {
    // validation submit
    handleSubmit,
    isUpdating,
    // define shift
    defineShift,
    isDefining,
    defineError,
    // create interval
    createShiftInterval,
    isintervalCreating,
    createIntervalError,
  };
};

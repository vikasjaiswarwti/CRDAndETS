import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useDefineShiftMutation,
  useUpdateShiftSlotMutation,
  useCreateShiftIntervalMutation,
} from "../services/shiftManagementApi";

interface UseShiftMutationsOptions {
  onCreateIntervalSuccess?: () => void;
  onSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useShiftMutations = ({
  onSuccess,
  onUpdateSuccess,
  onCreateIntervalSuccess,
}: UseShiftMutationsOptions = {}) => {
  const {
    mutate: defineShift,
    isLoading: isDefining,
    error: defineError,
  } = useApiMutation(useDefineShiftMutation, {
    showToast: false, // ← suppress default static message
    onSuccess: (result: any) => {
      const dbResponse = result?.result?.[0];
      const msg = dbResponse?.dB_Response ?? "Operation completed";
      const isBusinessError = dbResponse?.errorCode === 1;

      import("antd").then(({ message }) => {
        if (isBusinessError) {
          message.error(msg, 5); // ← errorCode 1 = already exists etc.
        } else {
          message.success(msg, 4); // ← errorCode 0 = created successfully
          onSuccess?.(); // ← only advance (close modal/refetch) on real success
        }
      });
    },
  });

  const {
    mutate: updateShiftSlot,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateShiftSlotMutation, {
    successMessage: "Shift updated successfully",
    onSuccess: onUpdateSuccess,
  });
  const {
    mutate: createShiftInterval,
    isLoading: isintervalCreating,
    error: createIntervalError,
  } = useApiMutation(useCreateShiftIntervalMutation, {
    successMessage: "Shift interval created successfully",
    onSuccess: onCreateIntervalSuccess,
  });

  return {
    defineShift,
    isDefining,
    defineError,
    updateShiftSlot,
    isUpdating,
    updateError,
    // ----------
    createShiftInterval,
    isintervalCreating,
    createIntervalError,
  };
};

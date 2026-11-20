import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateShiftIntervalMutation,
  useUpdateShiftIntervalMutation,
} from "../services/shiftintervalApi";

interface UseShiftIntervalMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useShiftIntervalMutations = (
  options: UseShiftIntervalMutationsOptions = {},
) => {
  const { onCreateSuccess, onUpdateSuccess } = options;

  const {
    mutate: createShiftInterval,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateShiftIntervalMutation, {
    successMessage: "Shift interval created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateShiftInterval,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateShiftIntervalMutation, {
    successMessage: "Shift interval updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createShiftInterval,
    updateShiftInterval,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

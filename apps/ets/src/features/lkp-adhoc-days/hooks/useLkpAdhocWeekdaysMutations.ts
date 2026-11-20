import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateLkpAdhocWeekDayMutation,
  useUpdateLkpAdhocWeekDayMutation,
} from "../services/LkpAdhocWeekDaysApi";

interface UseLkpAdhocWeekDaysMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useLkpAdhocWeekDaysMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseLkpAdhocWeekDaysMutationsOptions = {}) => {
  const {
    mutate: createLkpAdhocWeekDay,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateLkpAdhocWeekDayMutation, {
    successMessage: "Adhoc week day created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateLkpAdhocWeekDay,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateLkpAdhocWeekDayMutation, {
    successMessage: "Adhoc week day updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createLkpAdhocWeekDay,
    updateLkpAdhocWeekDay,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

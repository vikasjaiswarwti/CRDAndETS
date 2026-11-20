import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateScheduleFromMasterMutation,
  useUpdateMasterScheduleMutation,
} from "../services/MasterWeeklyScheduleApi";

interface UseMasterWeeklyScheduleMutationsOptions {
  onUpdateSuccess?: () => void;
  onFillSuccess?: () => void;
}

export const useMasterWeeklyScheduleMutations = ({
  onUpdateSuccess,
  onFillSuccess,
}: UseMasterWeeklyScheduleMutationsOptions = {}) => {
  const {
    mutate: updateMasterSchedule,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateMasterScheduleMutation, {
    successMessage: "Weekly schedule updated successfully.",
    onSuccess: onUpdateSuccess,
  });

  const {
    mutate: createScheduleFromMaster,
    isLoading: isFilling,
    error: fillError,
  } = useApiMutation(useCreateScheduleFromMasterMutation, {
    successMessage: "Schedule filled from master successfully.",
    onSuccess: onFillSuccess,
  });

  return {
    updateMasterSchedule,
    isUpdating,
    updateError,
    createScheduleFromMaster,
    isFilling,
    fillError,
  };
};

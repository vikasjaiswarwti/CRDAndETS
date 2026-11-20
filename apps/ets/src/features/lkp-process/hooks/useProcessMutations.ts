import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateProcessMutation,
  useUpdateProcessMutation,
} from "../services/processApi";

interface UseProcessMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useProcessMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseProcessMutationsOptions = {}) => {
  const {
    mutate: createProcess,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateProcessMutation, {
    successMessage: "Process created successfully.",
    onSuccess: onCreateSuccess,
  });
  const {
    mutate: updateProcess,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateProcessMutation, {
    successMessage: "Process updated successfully.",
    onSuccess: onUpdateSuccess,
  });
  return {
    createProcess,
    updateProcess,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

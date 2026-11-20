import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateLkpFeedbackTypeMutation,
  useUpdateLkpFeedbackTypeMutation,
} from "../services/LkpfeedbacktypeApi";

interface UseLkpFeedbackTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useLkpFeedbackTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseLkpFeedbackTypeMutationsOptions = {}) => {
  const {
    mutate: createLkpFeedbackType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateLkpFeedbackTypeMutation, {
    successMessage: "Feedback type created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateLkpFeedbackType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateLkpFeedbackTypeMutation, {
    successMessage: "Feedback type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createLkpFeedbackType,
    updateLkpFeedbackType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from "../services/businessApi";

interface UseBusinessMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useBusinessMutations = (
  options: UseBusinessMutationsOptions = {},
) => {
  const { onCreateSuccess, onUpdateSuccess } = options;

  const {
    mutate: createBusiness,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateBusinessMutation, {
    successMessage: "Business created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateBusiness,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateBusinessMutation, {
    successMessage: "Business updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createBusiness,
    updateBusiness,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

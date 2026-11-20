import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateLineOfBusinessMutation,
  useUpdateLineOfBusinessMutation,
} from "../services/lineofbusinessapi";

interface UseLineOfBusinessMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useLineOfBusinessMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseLineOfBusinessMutationsOptions = {}) => {
  const {
    mutate: createLineOfBusiness,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateLineOfBusinessMutation, {
    successMessage: "Line of Business created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateLineOfBusiness,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateLineOfBusinessMutation, {
    successMessage: "Line of Business updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createLineOfBusiness,
    updateLineOfBusiness,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

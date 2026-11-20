import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateLkpLocationMutation,
  useUpdateLkpLocationMutation,
} from "../services/lkplocationapi";

interface UseLkpLocationMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useLkpLocationMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseLkpLocationMutationsOptions = {}) => {
  const {
    mutate: createLkpLocation,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateLkpLocationMutation, {
    successMessage: "Location created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateLkpLocation,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateLkpLocationMutation, {
    successMessage: "Location updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createLkpLocation,
    updateLkpLocation,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

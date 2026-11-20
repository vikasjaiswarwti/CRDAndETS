import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateLkpTripTypeMutation,
  useUpdateLkpTripTypeMutation,
} from "../services/LkpTripTypeApi";

interface UseLkpTripTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useLkpTripTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseLkpTripTypeMutationsOptions = {}) => {
  const {
    mutate: createLkpTripType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateLkpTripTypeMutation, {
    successMessage: "Trip type created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateLkpTripType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateLkpTripTypeMutation, {
    successMessage: "Trip type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createLkpTripType,
    updateLkpTripType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

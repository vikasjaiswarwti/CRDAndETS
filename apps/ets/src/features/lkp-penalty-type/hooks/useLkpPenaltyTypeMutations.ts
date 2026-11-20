import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateLkpPenaltyTypeMutation,
  useUpdateLkpPenaltyTypeMutation,
} from "../services/LkpPenaltytypeApi";

interface UseLkpPenaltyTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useLkpPenaltyTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseLkpPenaltyTypeMutationsOptions = {}) => {
  const {
    mutate: createLkpPenaltyType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateLkpPenaltyTypeMutation, {
    successMessage: "Penalty type created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateLkpPenaltyType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateLkpPenaltyTypeMutation, {
    successMessage: "Penalty type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createLkpPenaltyType,
    updateLkpPenaltyType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

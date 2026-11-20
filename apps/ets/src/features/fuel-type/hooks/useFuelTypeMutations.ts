import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateFuelTypeMutation,
  useUpdateFuelTypeMutation,
} from "../services/FuelTypeApi";

interface UseFuelTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useFuelTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseFuelTypeMutationsOptions = {}) => {
  const {
    mutate: createFuelType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateFuelTypeMutation, {
    successMessage: "Fuel Type created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateFuelType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateFuelTypeMutation, {
    successMessage: "Fuel Type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createFuelType,
    updateFuelType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

import {
  useCreateVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
} from "../services/vehicletypeapi";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseVehicleTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useVehicleTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseVehicleTypeMutationsOptions = {}) => {
  const createVehicleType = useApiMutation(useCreateVehicleTypeMutation, {
    successMessage: "Vehicle Type created successfully",
    onSuccess: onCreateSuccess,
  });

  const updateVehicleType = useApiMutation(useUpdateVehicleTypeMutation, {
    successMessage: "Vehicle Type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createVehicleType: createVehicleType.mutate,
    updateVehicleType: updateVehicleType.mutate,
    isCreating: createVehicleType.isLoading,
    isUpdating: updateVehicleType.isLoading,
    createError: createVehicleType.error,
    updateError: updateVehicleType.error,
  };
};

import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateEscortVendorMutation,
  useUpdateEscortVendorMutation,
} from "../services/EscortVendorApi";

interface UseEscortVendorMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useEscortVendorMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseEscortVendorMutationsOptions = {}) => {
  const {
    mutate: createEscortVendor,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateEscortVendorMutation, {
    successMessage: "Escort Vendor created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateEscortVendor,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateEscortVendorMutation, {
    successMessage: "Escort Vendor updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createEscortVendor,
    updateEscortVendor,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

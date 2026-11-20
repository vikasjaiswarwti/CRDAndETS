import {
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from "../services/vendorApi";   // ← Note: your file is named vendorApi.ts

import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseVendorMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useVendorMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseVendorMutationsOptions = {}) => {
  const createVendorMutation = useApiMutation(useCreateVendorMutation, {
    successMessage: "Vendor created successfully",
    onSuccess: onCreateSuccess,
  });

  const updateVendorMutation = useApiMutation(useUpdateVendorMutation, {
    successMessage: "Vendor updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createVendor: createVendorMutation.mutate,
    updateVendor: updateVendorMutation.mutate,
    isCreating: createVendorMutation.isLoading,
    isUpdating: updateVendorMutation.isLoading,
    createError: createVendorMutation.error,
    updateError: updateVendorMutation.error,
  };
};
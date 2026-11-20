import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateEscortMutation,
  useUpdateEscortMutation,
  useBulkUploadEscortsMutation,
} from "../services/EscortApi";

interface UseEscortMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onBulkUploadSuccess?: () => void;
}

export const useEscortMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
  onBulkUploadSuccess,
}: UseEscortMutationsOptions = {}) => {
  const {
    mutate: createEscort,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateEscortMutation, {
    successMessage: "Escort created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateEscort,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateEscortMutation, {
    successMessage: "Escort updated successfully",
    onSuccess: onUpdateSuccess,
  });

  const {
    mutate: bulkUploadEscorts,
    isLoading: isBulkUploading,
    error: bulkUploadError,
  } = useApiMutation(useBulkUploadEscortsMutation, {
    // successMessage: "Escorts bulk uploaded successfully",
    onSuccess: onBulkUploadSuccess,
  });

  return {
    createEscort,
    updateEscort,
    bulkUploadEscorts,
    isCreating,
    isUpdating,
    isBulkUploading,
    createError,
    updateError,
    bulkUploadError,
  };
};

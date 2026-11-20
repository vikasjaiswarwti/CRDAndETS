import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import {
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useCreateDriverStageMutation,
  useUpdateDriverStageMutation,
  useApproveeDriverStageMutation,
  useBulkUploadDriverStageMutation
} from '../services/driverApi';

interface UseDriverMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onStageCreateSuccess?: () => void,
  onStageUpdateSuccess?: () => void
  onStageApproveSuccess?: () => void;
  onBulkUploadSuccess?: () => void;
}

export const useDriverMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
  onStageCreateSuccess,
  onStageUpdateSuccess,
  onStageApproveSuccess,
  // onBulkUploadSuccess
}: UseDriverMutationsOptions = {}) => {
  const { mutate: createDriver, isLoading: isCreating, error: createError } =
    useApiMutation(useCreateDriverMutation, {
      successMessage: 'Driver created successfully',
      onSuccess: onCreateSuccess,
    });

  const { mutate: updateDriver, isLoading: isUpdating, error: updateError } =
    useApiMutation(useUpdateDriverMutation, {
      successMessage: 'Driver updated successfully',
      onSuccess: onUpdateSuccess,
    });

  const { mutate: createStageDriver, isLoading: isCreatingStage, error: createStageError } =
    useApiMutation(useCreateDriverStageMutation, {
      successMessage: 'Stage Driver created successfully',
      onSuccess: onStageCreateSuccess,
    });

  const { mutate: updateStageDriver, isLoading: isUpdatingStage, error: updateStageError } =
    useApiMutation(useUpdateDriverStageMutation, {
      successMessage: 'Stage Driver updated successfully',
      onSuccess: onStageUpdateSuccess,
    });
  const {
    mutate: approveStageDriver,
    isLoading: isApprovingStage,
    error: approveStageError,
  } = useApiMutation(useApproveeDriverStageMutation, {
    successMessage: "Driver approved and registered",
    onSuccess: onStageApproveSuccess,
  });
  const {
    mutate: bulkDriverUpload,
    isLoading: isBulkDriverUpload,
    error: bulkDriverUploadError,
      reset:resetBulk,
  } = useApiMutation(useBulkUploadDriverStageMutation, {
    successMessage: "Bulk Driver Excel uploaded Successfully",
    showToast: false,
  });


  return {
    createDriver,
    updateDriver,
    createStageDriver,
    updateStageDriver,
    approveStageDriver,
    bulkDriverUpload,
    isCreating,
    isUpdating,
    isCreatingStage,
    isUpdatingStage,
    isApprovingStage,
    isBulkDriverUpload,
    createError,
    updateError,
    createStageError,
    updateStageError,
    approveStageError,
    bulkDriverUploadError,
    resetBulk,
  };
};
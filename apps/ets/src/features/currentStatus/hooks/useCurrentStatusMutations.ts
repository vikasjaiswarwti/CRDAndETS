import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import {
  useCreateCurrentStatusMutation,
  useUpdateCurrentStatusMutation,
} from '../services/currentStatusApi';

interface UseCurrentStatusMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useCurrentStatusMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseCurrentStatusMutationsOptions = {}) => {
  const { mutate: createCurrentStatus, isLoading: isCreating, error: createError } =
    useApiMutation(useCreateCurrentStatusMutation, {
      successMessage: 'Current status created successfully',
      onSuccess: onCreateSuccess,
    });

  const { mutate: updateCurrentStatus, isLoading: isUpdating, error: updateError } =
    useApiMutation(useUpdateCurrentStatusMutation, {
      successMessage: 'Current status updated successfully',
      onSuccess: onUpdateSuccess,
    });

  return {
    createCurrentStatus,
    updateCurrentStatus,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};
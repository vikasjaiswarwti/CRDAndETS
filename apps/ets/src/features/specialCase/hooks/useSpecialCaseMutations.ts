import { useCreateMutation, useUpdateMutation } from '../services/specialCaseApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

interface UseSpecialCaseMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useSpecialCaseMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseSpecialCaseMutationsOptions = {}) => {
  const { mutate: createSpecialCase, isLoading: isCreating, error: createError } =
    useApiMutation(useCreateMutation, {
      successMessage: 'Special case created successfully',
      onSuccess: onCreateSuccess,
    });

  const { mutate: updateSpecialCase, isLoading: isUpdating, error: updateError } =
    useApiMutation(useUpdateMutation, {
      successMessage: 'Special case updated successfully',
      onSuccess: onUpdateSuccess,
    });

  return {
    createSpecialCase,
    updateSpecialCase,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};
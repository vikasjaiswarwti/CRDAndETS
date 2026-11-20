import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import { useUpdatePenaltiesMutation } from '../services/penaltyApi';

interface UsePenaltyMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const usePenaltyMutations = (options: UsePenaltyMutationsOptions = {}) => {
  const { onCreateSuccess, onUpdateSuccess } = options;

  // The API uses the same endpoint for create and update (SNO=0 → create, SNO>0 → update)
  // We expose two separate handles so the page stays clear about intent.

  const { mutate: createPenalty, isLoading: isCreating, error: createError } =
    useApiMutation(useUpdatePenaltiesMutation, {
      successMessage: 'Penalty created successfully',
      onSuccess: onCreateSuccess,
    });

  const { mutate: updatePenalty, isLoading: isUpdating, error: updateError } =
    useApiMutation(useUpdatePenaltiesMutation, {
      successMessage: 'Penalty updated successfully',
      onSuccess: onUpdateSuccess,
    });

  return {
    createPenalty,
    updatePenalty,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

// FILE 7 — hooks/useStateMutations.ts

import { useCreateStateMutation, useUpdateStateMutation } from '../services/stateApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

interface UseStateMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useStateMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseStateMutationsOptions = {}) => {
  const {
    mutate: createState,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateStateMutation, {
    successMessage: 'State created successfully.',
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateState,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateStateMutation, {
    successMessage: 'State updated successfully.',
    onSuccess: onUpdateSuccess,
  });

  return {
    createState,
    updateState,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};
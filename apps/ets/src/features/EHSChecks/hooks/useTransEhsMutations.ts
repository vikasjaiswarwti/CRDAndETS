import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import {
  useCreateTransEhsMutation,
} from '../services/transEhsApi';

interface UseEHSMutationsOptions {
  onCreateSuccess?: () => void;
}

export const useTransEhsMutations = ({
  onCreateSuccess,
}: UseEHSMutationsOptions = {}) => {
  const { mutate: createEhsCheck, isLoading: isCreating, error: ehsError } =
    useApiMutation(useCreateTransEhsMutation, {
      successMessage: 'Current status created successfully',
      onSuccess: onCreateSuccess,
    });

  return {
   createEhsCheck,isCreating, ehsError 
  };
};
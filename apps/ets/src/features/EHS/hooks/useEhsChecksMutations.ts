import { useCreateMutation } from '../services/ehsChecksApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

// ─── Options ──────────────────────────────────────────────────────────────────
interface UseEhsChecksMutationsOptions {
  onCreateSuccess?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// All mutation logic lives here. The page never calls RTK mutations directly.

export const useEhsChecksMutations = ({
  onCreateSuccess,
}: UseEhsChecksMutationsOptions = {}) => {
  // ── Create ──────────────────────────────────────────────────────────────
  const {
    mutate: createEhsCheck,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateMutation, {
    successMessage: 'EHS Check created successfully.',
    onSuccess: onCreateSuccess,
  });

  // ── Update ──────────────────────────────────────────────────────────────


  return {
    createEhsCheck,
    isCreating,
    
    createError,
   
  };
};
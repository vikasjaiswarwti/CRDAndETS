import { useCreateVendorSupervisorMutation } from '../services/vendorSupervisorApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

// ─── Options ──────────────────────────────────────────────────────────────────

interface UseVendorSuperVisorMutationsOptions {
  onCreateSuccess?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// All mutation logic lives here. The page never calls RTK mutations directly.

export const useVendorSuperVisorMutations = ({
  onCreateSuccess,
}: UseVendorSuperVisorMutationsOptions = {}) => {
  // ── Create ──────────────────────────────────────────────────────────────
  const {
    mutate: createVendorSuperVisor,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateVendorSupervisorMutation, {
    successMessage: 'Vendor SuperVisor created successfully.',
    onSuccess: onCreateSuccess,
  });

  // ── Update ──────────────────────────────────────────────────────────────


  return {
    createVendorSuperVisor,
    isCreating,

    createError,

  };
};
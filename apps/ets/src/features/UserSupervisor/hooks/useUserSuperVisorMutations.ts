import { useBulkUploadUserSupervisorMutation } from '../services/userSupervisorApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

// ─── Options ──────────────────────────────────────────────────────────────────

interface UseUserSuperVisorMutationsOptions {
  onBulkSuccess?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// All mutation logic lives here. The page never calls RTK mutations directly.

export const useUserSuperVisorMutations = ({
  // onBulkSuccess,
}: UseUserSuperVisorMutationsOptions = {}) => {
  // ── Create ──────────────────────────────────────────────────────────────
  const {
    mutate: createVendorSuperVisor,
    isLoading: isUploaded,
    error: uploadError,
    
  } = useApiMutation(useBulkUploadUserSupervisorMutation, {
    successMessage: 'File Uploaded Successfully.',
    // onSuccess: onBulkSuccess,
    showToast: false,
  });

  // ── Update ──────────────────────────────────────────────────────────────


  return {
    createVendorSuperVisor,
    isUploaded,
    uploadError,
  };
};
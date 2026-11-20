import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import {
  useAllocateVendorTripMutation,
} from '../services/vendorTripApi';

interface UseVendorTripMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export const useVendorTripMutations = ({
  onUpdateSuccess,
}: UseVendorTripMutationsOptions = {}) => {


  const {
    mutate: updateVendorTrip,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useAllocateVendorTripMutation, {
    successMessage: 'Vendor trip updated successfully.',
    onSuccess: onUpdateSuccess,
  });


  return {
    updateVendorTrip,
    isUpdating,
    updateError,
  };
};
import {
  useEditProfileMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../services/profileApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

interface UseProfileMutationsOptions {
  onUpdateSuccess?: () => void;
}

export const useProfileMutations = ({
  onUpdateSuccess,
}: UseProfileMutationsOptions = {}) => {
  const {
    mutate: updateState,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useEditProfileMutation, {
    successMessage: 'Profile updated successfully.',
    onSuccess: onUpdateSuccess,
  });
  const {
    mutate: sendOtp,
    isLoading: isSendingOtp,
    error: sendOtpError,
  } = useApiMutation(useSendOtpMutation, {
    successMessage: 'OTP sent successfully.',
  });
  const {
    mutate: verifyOtp,
    isLoading: isVerifyingOtp,
    error: verifyOtpError,
  } = useApiMutation(useVerifyOtpMutation, {
    successMessage: 'OTP verified successfully.',
  });

  return {
    updateState,
    isUpdating,
    updateError,
    sendOtp,
    isSendingOtp,
    sendOtpError,
    verifyOtp,
    isVerifyingOtp,
    verifyOtpError,
  };
};
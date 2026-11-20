import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateUserStageMutation,
  useUpdateUserStageMutation,
  useBulkCreateUserStagesMutation,
  useApproveUserStageMutation,
  useRejectUserStageMutation,
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useUpdateUserTransportMutation,
  useUpdateApprovedUserMutation,
  useUpdateUserLocationsMutation,
  useUpdateUserRoleMutation,
  useSendCredentialsMutation,
  useResetNoShowMutation,
  useResetAdhocCountMutation,
} from "../services/Employeeapi";

interface UseEmployeeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onApproveSuccess?: () => void;
  onRejectSuccess?: () => void;
  // onBulkSuccess?: () => void;
  onDeactivateSuccess?: () => void;
  onTransportSuccess?: () => void;
  onUpdateApprovedSuccess?: () => void;

  onLocationsSuccess?: () => void; // ← new
  onRolesSuccess?: () => void; // ← new
  onSendCredentialsSuccess?: () => void; // ← add

  onResetNoShowSuccess?: () => void; // ← add
  onResetAdhocCountSuccess?: () => void; // ← add
}

export const useEmployeeMutations = (
  options: UseEmployeeMutationsOptions = {},
) => {
  const {
    onCreateSuccess,
    onUpdateSuccess,
    onApproveSuccess,
    onRejectSuccess,
    onDeactivateSuccess,
    onTransportSuccess,
    // onBulkSuccess,
    onUpdateApprovedSuccess,

    onLocationsSuccess,
    onRolesSuccess,
    onResetAdhocCountSuccess,
  } = options;

  const {
    mutate: createEmployee,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateUserStageMutation, {
    successMessage: "Employee registered successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateEmployee,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateUserStageMutation, {
    successMessage: "Employee details updated",
    onSuccess: onUpdateSuccess,
  });

  const {
    mutate: bulkCreate,
    isLoading: isBulkCreating,
    error: bulkError,
    reset: resetBulk,
  } = useApiMutation(useBulkCreateUserStagesMutation, {
    successMessage: "Employees uploaded successfully",
    // onSuccess: onBulkSuccess,
    showToast: false, // we'll handle toasts manually in the component for better control
  });

  const {
    mutate: approveEmployee,
    isLoading: isApproving,
    error: approveError,
  } = useApiMutation(useApproveUserStageMutation, {
    successMessage: "Employee approved and registered",
    onSuccess: onApproveSuccess,
  });

  const {
    mutate: rejectEmployee,
    isLoading: isRejecting,
    error: rejectError,
  } = useApiMutation(useRejectUserStageMutation, {
    successMessage: "Employee application rejected",
    onSuccess: onRejectSuccess,
  });
  const {
    mutate: updateUserStatus,
    isLoading: isDeactiving,
    error: deactiveError,
  } = useApiMutation(useUpdateUserStatusMutation, {
    successMessage: "Employee Deactived Successfully",
    onSuccess: onDeactivateSuccess,
  });
  const {
    mutate: resetUserPassword,
    isLoading: isResettingPassword,
  } = useApiMutation(useResetUserPasswordMutation, {
    successMessage: "Password reset successfully",
    errorMessage: "Failed to reset password. Please try again.",
  });
  const {
    mutate: updateTransportStatus,
    isLoading: isTransporting,
    error: transportError,
  } = useApiMutation(useUpdateUserTransportMutation, {
    successMessage: "Transport Service Status Updated Successfully",
    onSuccess: onTransportSuccess,
  });

  const {
    mutate: updateApprovedUser,
    isLoading: isUpdatingApproved,
    error: updateApprovedError,
  } = useApiMutation(useUpdateApprovedUserMutation, {
    successMessage: "Employee updated successfully",
    onSuccess: onUpdateApprovedSuccess,
  });

  const { mutate: updateUserLocations, isLoading: isUpdatingLocations } =
    useApiMutation(useUpdateUserLocationsMutation, {
      successMessage: "Locations mapped successfully",
      onSuccess: onLocationsSuccess,
    });

  const { mutate: updateUserRoles, isLoading: isUpdatingRoles } =
    useApiMutation(useUpdateUserRoleMutation, {
      successMessage: "Roles updated successfully",
      onSuccess: onRolesSuccess,
    });

  const { mutate: sendCredentials, isLoading: isSendingCredentials } =
    useApiMutation(useSendCredentialsMutation, {
      successMessage: "Credentials sent successfully",
      errorMessage: "Failed to send credentials. Please try again.",
      onSuccess: options.onSendCredentialsSuccess,
    });

  const { mutate: resetNoShow, isLoading: isResettingNoShow } = useApiMutation(
    useResetNoShowMutation,
    {
      successMessage: "No-show count reset successfully",
      errorMessage: "Failed to reset no-show count. Please try again.",
      onSuccess: options.onResetNoShowSuccess,
    },
  );
  const { mutate: resetAdhocCount, isLoading: isResettingAdhocCount } = useApiMutation(
    useResetAdhocCountMutation,
    {
      successMessage: "Adhoc count reset successfully",
      errorMessage: "Failed to reset adhoc count. Please try again.",
      onSuccess: onResetAdhocCountSuccess,
    },
  );

  return {
    createEmployee,
    updateEmployee,
    bulkCreate,
    approveEmployee,
    rejectEmployee,
    isCreating,
    isUpdating,
    isBulkCreating,
    isApproving,
    isRejecting,
    createError,
    updateError,
    bulkError,
    resetBulk,
    approveError,
    rejectError,
    // --------
    updateUserStatus,
    isDeactiving,
    resetUserPassword,
    isResettingPassword,
    deactiveError,
    // --------
    updateTransportStatus,
    isTransporting,
    transportError,

    updateApprovedUser, // ← expose mutate fn
    isUpdatingApproved, // ← expose loading state
    updateApprovedError, //

    updateUserLocations,
    isUpdatingLocations,
    updateUserRoles,
    isUpdatingRoles,

    sendCredentials,
    isSendingCredentials,

    resetNoShow, // ← add
    isResettingNoShow, // ← add
    resetAdhocCount, // ← add
    isResettingAdhocCount, // ← add
  };
};

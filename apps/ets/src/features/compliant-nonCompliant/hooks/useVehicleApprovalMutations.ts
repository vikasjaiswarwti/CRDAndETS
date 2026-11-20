/**
 * useVehicleApprovalMutations.ts
 * All mutation logic lives here. Page calls mutate() only.
 */
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { useSubmitApprovalActionMutation } from "../services/VehicleApprovalApi";

interface Options {
  onApproveSuccess?: () => void;
  onChangesSuccess?: () => void;
}

export function useVehicleApprovalMutations(options: Options = {}) {
  const { mutate: approve, isLoading: isApproving } = useApiMutation(
    useSubmitApprovalActionMutation,
    {
      successMessage: "Vehicle approved successfully",
      onSuccess: options.onApproveSuccess,
    },
  );

  const { mutate: requestChanges, isLoading: isRequestingChanges } =
    useApiMutation(useSubmitApprovalActionMutation, {
      successMessage: "Change request sent",
      onSuccess: options.onChangesSuccess,
    });

  return {
    approve,
    requestChanges,
    isApproving,
    isRequestingChanges,
    isSubmitting: isApproving || isRequestingChanges,
  };
}

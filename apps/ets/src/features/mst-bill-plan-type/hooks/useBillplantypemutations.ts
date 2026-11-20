import {
  useCreateBillPlanTypeMutation,
  useUpdateBillPlanTypeMutation,
} from "../services/bill-plan-typeapi";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseBillPlanTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useBillPlanTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseBillPlanTypeMutationsOptions = {}) => {
  const createBillPlanType = useApiMutation(useCreateBillPlanTypeMutation, {
    successMessage: "Bill Plan Type created successfully",
    onSuccess: onCreateSuccess,
  });

  const updateBillPlanType = useApiMutation(useUpdateBillPlanTypeMutation, {
    successMessage: "Bill Plan Type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createBillPlanType: createBillPlanType.mutate,
    updateBillPlanType: updateBillPlanType.mutate,
    isCreating: createBillPlanType.isLoading,
    isUpdating: updateBillPlanType.isLoading,
    createError: createBillPlanType.error,
    updateError: updateBillPlanType.error,
  };
};

import {
  useCreateBillPlanMutation,
  useUpdateBillPlanMutation,
} from "../services/bill-plan-api";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseBillPlanMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useBillPlanMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseBillPlanMutationsOptions = {}) => {
  const createBillPlan = useApiMutation(useCreateBillPlanMutation, {
    successMessage: "Bill Plan created successfully",
    onSuccess: onCreateSuccess,
  });

  const updateBillPlan = useApiMutation(useUpdateBillPlanMutation, {
    successMessage: "Bill Plan updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createBillPlan: createBillPlan.mutate,
    updateBillPlan: updateBillPlan.mutate,
    isCreating: createBillPlan.isLoading,
    isUpdating: updateBillPlan.isLoading,
    createError: createBillPlan.error,
    updateError: updateBillPlan.error,
  };
};

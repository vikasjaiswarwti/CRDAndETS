import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateSosEscalationMutation,
  useUpdateSosEscalationMutation,
  useDeactivateSosEscalationMutation,
} from "../services/notificationManagementApi";

interface Options {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useSosEscalationMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: Options = {}) => {
  const create = useApiMutation(useCreateSosEscalationMutation, {
    successMessage: "Escalation recipient created successfully",
    onSuccess: onCreateSuccess,
  });

  const update = useApiMutation(useUpdateSosEscalationMutation, {
    successMessage: "Escalation recipient updated successfully",
    onSuccess: onUpdateSuccess,
  });

  const deactivate = useApiMutation(useDeactivateSosEscalationMutation, {
    successMessage: "Escalation recipient deactivated",
  });

  return {
    createSosEscalation: create.mutate,
    updateSosEscalation: update.mutate,
    deactivateSosEscalation: deactivate.mutate,
    isCreating: create.isLoading,
    isUpdating: update.isLoading,
    createError: create.error,
    updateError: update.error,
  };
};

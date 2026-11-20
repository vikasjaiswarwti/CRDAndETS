import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "../services/SystemRoleApi";

interface UseRoleMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useRoleMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseRoleMutationsOptions = {}) => {
  const createRole = useApiMutation(useCreateRoleMutation, {
    successMessage: "Role created successfully",
    onSuccess: onCreateSuccess,
  });

  const updateRole = useApiMutation(useUpdateRoleMutation, {
    successMessage: "Role updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createRole: createRole.mutate,
    updateRole: updateRole.mutate,
    isCreating: createRole.isLoading,
    isUpdating: updateRole.isLoading,
    createError: createRole.error,
    updateError: updateRole.error,
  };
};

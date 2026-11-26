import { useApiMutation } from "@commutr/ui/api";
import { useSystemAdminApis } from "../api/context";

interface UseRoleMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useRoleMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseRoleMutationsOptions = {}) => {
  const { roleApi } = useSystemAdminApis();

  const createRole = useApiMutation(roleApi.useCreateRoleMutation, {
    successMessage: "Role created successfully",
    onSuccess: onCreateSuccess,
  });

  const updateRole = useApiMutation(roleApi.useUpdateRoleMutation, {
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

// src/features/role-management/hooks/useRoleMutations.ts

import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "../services/roleApi";

interface UseRoleMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useRoleMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseRoleMutationsOptions = {}) => {
  const {
    mutate: createX,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateRoleMutation, {
    successMessage: "Role created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateX,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateRoleMutation, {
    successMessage: "Role updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return { createX, updateX, isCreating, isUpdating, createError, updateError };
};

import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateEmployeeTypeMutation,
  useUpdateEmployeeTypeMutation,
} from "../services/EmployeeTypeApi";

interface UseEmployeeTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useEmployeeTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseEmployeeTypeMutationsOptions = {}) => {
  const {
    mutate: createEmployeeType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateEmployeeTypeMutation, {
    successMessage: "Employee type created successfully.",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateEmployeeType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateEmployeeTypeMutation, {
    successMessage: "Employee type updated successfully.",
    onSuccess: onUpdateSuccess,
  });

  return {
    createEmployeeType,
    updateEmployeeType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

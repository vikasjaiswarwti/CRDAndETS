import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "../services/Departmentapi";

interface UseDepartmentMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useDepartmentMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseDepartmentMutationsOptions = {}) => {
  const {
    mutate: createDepartment,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateDepartmentMutation, {
    successMessage: "Department created successfully.",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateDepartment,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateDepartmentMutation, {
    successMessage: "Department updated successfully.",
    onSuccess: onUpdateSuccess,
  });

  return {
    createDepartment,
    updateDepartment,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

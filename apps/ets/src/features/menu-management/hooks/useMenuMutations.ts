import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateMenuMutation,
  useUpdateMenuMutation,
} from "../services/adminMenuApi";
import type { CreateMenuDto, UpdateMenuDto, Menu } from "../types/menu.types";

interface UseMenuMutationsOptions {
  onCreateSuccess?: (result: Menu) => void;
  onUpdateSuccess?: (result: Menu) => void;
}

export const useMenuMutations = (options: UseMenuMutationsOptions = {}) => {
  const createMutation = useApiMutation<CreateMenuDto, Menu>(
    useCreateMenuMutation,
    {
      successMessage: "Menu created successfully",
      onSuccess: options.onCreateSuccess,
    },
  );

  const updateMutation = useApiMutation<UpdateMenuDto, Menu>(
    useUpdateMenuMutation,
    {
      successMessage: "Menu updated successfully",
      onSuccess: options.onUpdateSuccess,
    },
  );

  return {
    createX: createMutation.mutate,
    updateX: updateMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    createError: createMutation.error,
    updateError: updateMutation.error,
    resetCreate: createMutation.reset,
    resetUpdate: updateMutation.reset,
  };
};

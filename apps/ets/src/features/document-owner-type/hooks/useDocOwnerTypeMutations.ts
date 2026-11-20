import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateDocumentOwnerTypeMutation,
  useUpdateDocumentOwnerTypeMutation,
} from "../services/DocOwnerTypeApi";

interface UseDocumentOwnerTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useDocumentOwnerTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseDocumentOwnerTypeMutationsOptions = {}) => {
  const {
    mutate: createDocumentOwnerType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateDocumentOwnerTypeMutation, {
    successMessage: "Document Owner Type created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateDocumentOwnerType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateDocumentOwnerTypeMutation, {
    successMessage: "Document Owner Type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createDocumentOwnerType,
    updateDocumentOwnerType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

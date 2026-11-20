import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
} from "../services/DocTypeApi";

interface UseDocumentTypeMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useDocumentTypeMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseDocumentTypeMutationsOptions = {}) => {
  const {
    mutate: createDocumentType,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateDocumentTypeMutation, {
    successMessage: "Document Type created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateDocumentType,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateDocumentTypeMutation, {
    successMessage: "Document Type updated successfully",
    onSuccess: onUpdateSuccess,
  });

  return {
    createDocumentType,
    updateDocumentType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  };
};

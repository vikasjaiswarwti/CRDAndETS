// import { useApiMutation } from "../../../shared/hooks/useApiMutation";
// import { useUploadComplianceMutation } from "../services/VehicleComplianceApi";
// import { useSubmitApprovalActionMutation } from "../services/VehicleApprovalApi";
// import type {
//   UploadCompliancePayload,
//   ApproveRejectPayload,
// } from "../types/Vehiclecompliance.types";

// interface ComplianceOptions {
//   onUploadSuccess?: () => void;
// }
// interface ApprovalOptions {
//   onApproveSuccess?: () => void;
//   onRejectSuccess?: () => void;
// }

// export function useVehicleComplianceMutations(options: ComplianceOptions = {}) {
//   // FIX: <TArg, TResult> — both generics required
//   // const { mutate: uploadCompliance, isLoading: isUploading } = useApiMutation<
//   //   UploadCompliancePayload,
//   //   { success: boolean }
//   // >(useUploadComplianceMutation, {
//   //   successMessage: "Documents uploaded successfully",
//   //   onSuccess: options.onUploadSuccess,
//   // });

//   const { mutate: uploadCompliance, isLoading: isUploading } = useApiMutation<
//     UploadCompliancePayload,
//     { success: boolean }
//   >(useUploadComplianceMutation as any, {
//     successMessage: "Documents uploaded successfully",
//     onSuccess: options.onUploadSuccess,
//   });

//   return { uploadCompliance, isUploading };
// }

// export function useApprovalMutations(options: ApprovalOptions = {}) {
//   // TResult is `unknown` — submitApprovalAction returns unknown (server may return
//   // an empty body or a status object; we don't rely on the shape).
//   const { mutate: approve, isLoading: isApproving } = useApiMutation<
//     ApproveRejectPayload,
//     unknown
//   >(useSubmitApprovalActionMutation, {
//     successMessage: "Vehicle approved",
//     onSuccess: options.onApproveSuccess,
//   });
//   const { mutate: reject, isLoading: isRejecting } = useApiMutation<
//     ApproveRejectPayload,
//     unknown
//   >(useSubmitApprovalActionMutation, {
//     successMessage: "Vehicle rejected",
//     onSuccess: options.onRejectSuccess,
//   });

//   return {
//     approve,
//     reject,
//     isApproving,
//     isRejecting,
//     isSubmitting: isApproving || isRejecting,
//   };
// }

import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { useUploadComplianceMutation } from "../services/VehicleComplianceApi";
import {
  useSubmitApprovalActionMutation,
  useSubmitDriverApprovalActionMutation,
} from "../services/VehicleApprovalApi";
import type { ApproveRejectPayload } from "../types/Vehiclecompliance.types";

// ─── Shared options shapes ────────────────────────────────────────────────────
interface UploadOptions {
  onUploadSuccess?: () => void;
}

interface ApprovalOptions {
  onApproveSuccess?: () => void;
  onRejectSuccess?: () => void;
}

// ─── Vehicle compliance upload ────────────────────────────────────────────────
// Note: no explicit TArg generic — let TS infer from the mutation hook to avoid
// UploadCompliancePayload vs UploadComplianceBody mismatch.
export function useVehicleComplianceMutations(options: UploadOptions = {}) {
  const { mutate: uploadCompliance, isLoading: isUploading } = useApiMutation(
    useUploadComplianceMutation,
    {
      successMessage: "Compliance uploaded successfully",
      onSuccess: options.onUploadSuccess,
    },
  );
  return { uploadCompliance, isUploading };
}

// ─── Vehicle approve / reject ─────────────────────────────────────────────────
export function useApprovalMutations(options: ApprovalOptions = {}) {
  const { mutate: approve, isLoading: isApproving } = useApiMutation<
    ApproveRejectPayload,
    unknown
  >(useSubmitApprovalActionMutation, {
    successMessage: "Vehicle approved",
    onSuccess: options.onApproveSuccess,
  });
  const { mutate: reject, isLoading: isRejecting } = useApiMutation<
    ApproveRejectPayload,
    unknown
  >(useSubmitApprovalActionMutation, {
    successMessage: "Vehicle rejected",
    onSuccess: options.onRejectSuccess,
  });
  return {
    approve,
    reject,
    isApproving,
    isRejecting,
    isSubmitting: isApproving || isRejecting,
  };
}

// ─── Driver approve / reject ──────────────────────────────────────────────────
export function useDriverApprovalMutations(options: ApprovalOptions = {}) {
  const { mutate: approve, isLoading: isApproving } = useApiMutation<
    ApproveRejectPayload,
    unknown
  >(useSubmitDriverApprovalActionMutation, {
    successMessage: "Driver approved",
    onSuccess: options.onApproveSuccess,
  });
  const { mutate: reject, isLoading: isRejecting } = useApiMutation<
    ApproveRejectPayload,
    unknown
  >(useSubmitDriverApprovalActionMutation, {
    successMessage: "Driver rejected",
    onSuccess: options.onRejectSuccess,
  });
  return {
    approve,
    reject,
    isApproving,
    isRejecting,
    isSubmitting: isApproving || isRejecting,
  };
}

import {
  useGetBillingDetailsReportMutation,
  useGetBillingSummaryReportMutation,
  useGetTechnologyUsageDetailsReportMutation,
  useGetTechnologyUsageSummaryReportMutation,
  useGenerateBillingSixMutation,
  useGetPenaltyReportMutation, // ← add
} from "../services/billingApi"; // Update this path to match your billingApi location
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseBillingReportMutationsOptions {
  onBillingDetailsSuccess?: () => void;
  onBillingSummarySuccess?: () => void;
  onTechUsageDetailsSuccess?: () => void;
  onTechUsageSummarySuccess?: () => void;
  onPenaltyReportSuccess?: () => void; // ← add
}

export const useBillingReportMutations = ({
  onBillingDetailsSuccess,
  onBillingSummarySuccess,
  onTechUsageDetailsSuccess,
  onTechUsageSummarySuccess,
  onPenaltyReportSuccess, // ← add
}: UseBillingReportMutationsOptions = {}) => {

  // ── New Billing Report Mutations ───────────────────────────────────────
  const fetchBillingDetails = useApiMutation(useGetBillingDetailsReportMutation, {
    successMessage: "Billing details report fetched successfully",
    onSuccess: onBillingDetailsSuccess,
  });

  const fetchBillingSummary = useApiMutation(useGetBillingSummaryReportMutation, {
    successMessage: "Billing summary report fetched successfully",
    onSuccess: onBillingSummarySuccess,
  });

  const fetchTechUsageDetails = useApiMutation(useGetTechnologyUsageDetailsReportMutation, {
    successMessage: "Technology usage details report fetched successfully",
    onSuccess: onTechUsageDetailsSuccess,
  });

  const fetchTechUsageSummary = useApiMutation(useGetTechnologyUsageSummaryReportMutation, {
    successMessage: "Technology usage summary report fetched successfully",
    onSuccess: onTechUsageSummarySuccess,
  });
  const generateBillingSix = useApiMutation(useGenerateBillingSixMutation);
  const fetchPenaltyReport = useApiMutation(useGetPenaltyReportMutation, {
    successMessage: "Penalty report fetched successfully",
    onSuccess: onPenaltyReportSuccess,
  });

  return {

    fetchBillingDetails: fetchBillingDetails.mutate,
    fetchBillingSummary: fetchBillingSummary.mutate,
    fetchTechUsageDetails: fetchTechUsageDetails.mutate,
    fetchTechUsageSummary: fetchTechUsageSummary.mutate,

    isFetchingBillingDetails: fetchBillingDetails.isLoading,
    isFetchingBillingSummary: fetchBillingSummary.isLoading,
    isFetchingTechUsageDetails: fetchTechUsageDetails.isLoading,
    isFetchingTechUsageSummary: fetchTechUsageSummary.isLoading,


    billingDetailsError: fetchBillingDetails.error,
    billingSummaryError: fetchBillingSummary.error,
    techUsageDetailsError: fetchTechUsageDetails.error,
    techUsageSummaryError: fetchTechUsageSummary.error,
    // Generate Billing Six
    generateBillingSix: generateBillingSix.mutate,
    isGeneratingBillingSix: generateBillingSix.isLoading,
    generateBillingSixError: generateBillingSix.error,
    resetBillingDetails: fetchBillingDetails.reset,

    fetchPenaltyReport: fetchPenaltyReport.mutate,       // ← add
    isFetchingPenaltyReport: fetchPenaltyReport.isLoading, // ← add
    penaltyReportError: fetchPenaltyReport.error,          // ← add
  };
};
import { useApiMutation } from "../../../../shared/hooks/useApiMutation";
import {
  useUpdateMobileMutation,
  useRequestAddressChangeMutation,
  useRequestPasswordChangeMutation,
  useLazyGetUserDashboardReportQuery,
  useRequestCreateComplaintMutation,
} from "../services/employeeProfileApi";

interface Options {
  onMobileSuccess?: () => void;
  onAddressSuccess?: () => void;
  onPasswordSuccess?: () => void;
  onComplaintSuccess?:()=>void;
}

export const useEmployeeProfileMutations = ({
  onMobileSuccess,
  onAddressSuccess,
  onPasswordSuccess,
  onComplaintSuccess,
}: Options = {}) => {
  const updateMobile = useApiMutation(useUpdateMobileMutation, {
    successMessage: "Mobile number updated successfully",
    onSuccess: onMobileSuccess,
  });

  const requestAddressChange = useApiMutation(useRequestAddressChangeMutation, {
    successMessage: "Address change request submitted",
    onSuccess: onAddressSuccess,
  });
  const requestPasswordChange = useApiMutation(useRequestPasswordChangeMutation, {
    successMessage: "Password change Successfully",
    onSuccess: onPasswordSuccess,
  });
  const requestCreateComplaint = useApiMutation(useRequestCreateComplaintMutation, {
    successMessage: "Complaint Created Successfully",
    onSuccess: onComplaintSuccess,
  });
  const [fetchUserDashboardReport, { data: dashboardReportData, isLoading: isFetchingDashboardReport, error: dashboardReportError }] =
    useLazyGetUserDashboardReportQuery();
  return {
    updateMobile: updateMobile.mutate,
    isUpdatingMobile: updateMobile.isLoading,
    mobileError: updateMobile.error,

    requestAddressChange: requestAddressChange.mutate,
    isRequestingAddress: requestAddressChange.isLoading,
    addressError: requestAddressChange.error,

    requestPasswordChange: requestPasswordChange.mutate,
    isPasswordChanging: requestPasswordChange.isLoading,
    passwordError: requestPasswordChange.error,

    // -----------------------------
    fetchUserDashboardReport,
    dashboardReportData,
    isFetchingDashboardReport,
    dashboardReportError,
    // ----------------------------
    requestCreateComplaint:requestCreateComplaint.mutate,
    isCreateComplaint:requestCreateComplaint.isLoading,
    createComplaintError:requestCreateComplaint.error,
  };
};

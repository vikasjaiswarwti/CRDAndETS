// import { useApiMutation } from "../../../../shared/hooks/useApiMutation";
// import { useGetAdminDashboardReportMutation } from "../services/adminDashboardApi";
// import type { AdminDashboardRequest } from "../services/adminDashboardApi";

// export const useAdminDashboardMutations = () => {
//   const fetchDashboard = useApiMutation(useGetAdminDashboardReportMutation, {
//     showSuccessMessage: false,
//   });

//   const fetchReport = (params: AdminDashboardRequest) => {
//     return fetchDashboard.mutate(params);
//   };

//   return {
//     fetchReport,
//     isLoading: fetchDashboard.isLoading,
//     data: fetchDashboard,
//     isError: fetchDashboard.error,
//   };
// };
import { useGetAdminDashboardReportMutation } from "../services/adminDashboardApi";
import type { AdminDashboardRequest } from "../services/adminDashboardApi";

export const useAdminDashboardMutations = () => {
  const [trigger, { data, isLoading, isError, reset }] =
    useGetAdminDashboardReportMutation();

  const fetchReport = (params: AdminDashboardRequest) => {
    return trigger(params).unwrap();
  };

  return {
    fetchReport,
    data,
    isLoading,
    isError,
    reset,
  };
};
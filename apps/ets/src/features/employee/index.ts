// ─── Pages ────────────────────────────────────────────────────────────────────
export { default as EmployeeListPage } from "./pages/Employeelistpage";
export { default as PublicEmployeeSignup } from "./pages/Employeelistpage";

// ─── API ─────────────────────────────────────────────────────────────────────
export { employeeApi } from "./services/Employeeapi";
export {
  useGetUserStagesQuery,
  useCreateUserStageMutation,
  useUpdateUserStageMutation,
  useBulkCreateUserStagesMutation,
  useApproveUserStageMutation,
  useRejectUserStageMutation,
  useGetApprovedUsersQuery,
} from "./services/Employeeapi";

// ─── Slice ────────────────────────────────────────────────────────────────────
export {
  employeeSlice,
  resetEmployeeUi,
  setActiveTab,
} from "./slice/Employeeslice";
export { default as employeeReducer } from "./slice/Employeeslice";

// ─── Reusable form (for embedding in other contexts) ─────────────────────────
export { EmployeeRegisterForm } from "./components/Employeeregisterform";
export { EmployeeRegisterModal } from "./components/Employeeregistermodal";

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  UserStage,
  ApprovedUser,
  CreateUserStageDto,
  UpdateUserStageDto,
  BulkCreateDto,
  AddressComponents,
} from "./types/Employee.types";

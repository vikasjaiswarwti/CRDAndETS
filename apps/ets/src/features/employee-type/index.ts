export { default as EmployeeTypeListPage } from "./pages/EmployeeTypeListPage";
export { employeeTypeApi } from "./services/EmployeeTypeApi";

export {
  employeeTypeSlice,
  resetEmployeeTypeUi,
} from "./slice/EmployeeTypeSlice";

export type {
  EmployeeType,
  CreateEmployeeTypeDto,
  UpdateEmployeeTypeDto,
} from "./types/emplType.types";

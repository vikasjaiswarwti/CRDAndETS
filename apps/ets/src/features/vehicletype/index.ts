export { default as VehicleTypeListPage } from "./pages/Vehicletypelistpage";
export { vehicleTypeApi } from "./services/vehicletypeapi";
export { vehicleTypeSlice, resetVehicleTypeUi } from "./slice/vhicleTypeSlice";
export type {
  VehicleType,
  CreateVehicleTypeDto,
  UpdateVehicleTypeDto,
} from "./types/vehicType.types";

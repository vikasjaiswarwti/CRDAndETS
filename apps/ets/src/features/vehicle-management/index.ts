// FILE 11 — index.ts

export { default as VehicleListPage } from './pages/VehicleListPage';
export { vehicleApi }                  from './services/vehicleApi';
export { vehicleSlice, resetVehicleUi } from './slice/vehicleSlice';
export type { Vehicle, CreateVehicleDto, UpdateVehicleDto } from './types/vehicle.types';
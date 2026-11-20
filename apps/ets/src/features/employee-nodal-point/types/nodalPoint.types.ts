export type TripType = 1 | 2; // 1 = Pick, 2 = Drop

export interface NodalPoint {
  id: number;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  tripType: TripType;
  boardingOrder: number;
  locationCode: number;
  isActive: boolean;
  routeId?: number | null;
}

export interface NodalPointCreateDto {
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  tripType: TripType;
  boardingOrder: number;
  locationCode: number;
  isActive: boolean;
  routeId?: number | null;
}

export interface NodalPointListParams {
  locationCode?: number;
  tripType?: TripType;
  isActive?: boolean;
}

export interface NodalPointEmployeeMapping {
  id: number;
  nodalPointId: number;
  empId: number;
  tripType: TripType;
  isActive: boolean;
}

export interface MappingCreateDto {
  id?: number; // present when updating an existing mapping (e.g. to unmap)
  nodalPointId: number;
  empId: number | null;
  tripType: TripType;
  isActive: boolean;
}

export interface MappingListParams {
  empId?: number;
  tripType?: TripType;
  isActive?: boolean;
}

// Shared shape returned by both GET /NodalPointEmployee/mapped and /unmapped
export interface NodalPointEmployeeInfo {
  empId: number;
  employeeName: string;
  emailId?: string;
  mobileNumber?: string;
  gender?: string;
  address?: string;
  empLocCode?: number;
  proCode?: string;
  userId?: string;
}

export type MappedEmployee = NodalPointEmployeeInfo;
export type UnmappedEmployee = NodalPointEmployeeInfo;

// The API doesn't envelope lists in pagination — result is a plain array
export interface CoreResponse<T> {
  result: T;
  isSuccess: boolean;
  message: string;
}
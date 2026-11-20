export interface RouteTableItem {
  routeId: number;
  routeName: string;
  isActive: boolean;
  locCode: number | null;
  routeNo: number | null;
}

export interface RouteTableCreateDto {
  routeName: string;
  isActive: boolean;
  locCode: number | null;
  routeNo: number | null;
}

export interface RouteTableUpdateDto extends RouteTableCreateDto {
  routeId: number;
}

export interface RouteTableListParams {
  locCode?: number;
}

// Same plain-array result envelope used by the sibling NodalPoint API
export interface CoreResponse<T> {
  result: T;
  isSuccess: boolean;
  message: string;
}

export interface empObj { employeeId: string; supEmployeeId: string | null };
export interface CreateUSVDto {
    users: empObj[];
}
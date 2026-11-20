import { useCallback } from "react";
import {
    useLazyGetUserDetailsQuery,
    useLazyGetTripDetailsQuery,
    useLazyGetVehicleDetailsQuery,
} from "../services/adminDashboardApi";

import type { UserSearchParams } from "../types/admin.types"
export type SearchTab = "Employee" | "Trip" | "Vehicle";

const buildUserParams = (q: string): UserSearchParams => {
    const v = q.trim();
    if (v.includes("@")) return { emailId: v };
    if (/^\d{10}$/.test(v)) return { mobileNo: v };
    if (/^\d+$/.test(v)) return { empId: v };
    return { empName: v };
};

export const useEntitySearch = (activeTab: SearchTab) => {
    const [searchUsers, userResult] = useLazyGetUserDetailsQuery();
    const [searchTrip, tripResult] = useLazyGetTripDetailsQuery();
    const [searchVehicle, vehicleResult] = useLazyGetVehicleDetailsQuery();

    const search = useCallback(
        (query: string) => {
            const q = query.trim();
            if (!q) return;
            switch (activeTab) {
                case "Employee":
                    return searchUsers(buildUserParams(q));
                case "Trip":
                    return searchTrip(q);
                case "Vehicle":
                    return searchVehicle(q);
            }
        },
        [activeTab, searchUsers, searchTrip, searchVehicle]
    );

    const active =
        activeTab === "Employee"
            ? userResult
            : activeTab === "Trip"
                ? tripResult
                : vehicleResult;

    return {
        search,
        employees: userResult.data ?? [],
        trip: tripResult.data,
        vehicles: vehicleResult.data ?? [],
        isFetching: active.isFetching,
        isError: active.isError,
        isUninitialized: active.isUninitialized,
    };
};
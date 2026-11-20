const parse = (value: any) => {
    if (value == null) return null;

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    return value;
};

export function parseDashboardResponse(raw: any) {
    return {
        jsonUserInfo: parse(raw.jsonUserInfo),
        jsonTodayTommorowTrips: parse(raw.jsonTodayTommorowTrips),
        jsonAdhocRequest: parse(raw.jsonAdhocRequest),
        jsonNoshowTrips: parse(raw.jsonNoshowTrips),
        jsonWeeklySchedule: parse(raw.jsonWeeklySchedule),
        jsonTeamCabs: parse(raw.jsonTeamCabs),
        jsonTeamAdhocTrips: parse(raw.jsonTeamAdhocTrips),
        jsonComplaint: parse(raw.jsonComplaint),
        jsonTeamComplaint: parse(raw.jsonTeamComplaint),
    };
}

export const parseValue = <T = any>(value: any): T | null => {
    if (value == null) return null;

    // Already parsed object/array
    if (typeof value === "object") {
        return value as T;
    }

    // JSON string
    if (typeof value === "string") {
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    return value as T;
};
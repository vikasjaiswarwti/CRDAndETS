

export const redirectToRouteTracking = (
    tripId: number | string,
    type?: 1 | 2,
) => {
    if (!tripId) return "/";
    if (type == 2) {
        window.open(`/routing/route-tracking?dsId=${encodeURIComponent(tripId)}`, "_blank");
        return;
    }
    const url = `/routing/route-tracking?dsId=${encodeURIComponent(tripId)}`;
    window.open(url, "_blank");
};
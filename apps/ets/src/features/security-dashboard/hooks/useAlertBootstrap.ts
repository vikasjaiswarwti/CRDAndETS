import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useAlertHub } from "./useAlertHub"; // Verify this path matches your codebase
import type { RootState } from "../../../app/store";

// TODO: extract to a shared route-constants file if one exists in your codebase
const SECURITY_DASHBOARD_ROUTE = "/routing/security";

export const useAlertBootstrap = () => {
    const token = useSelector((state: RootState) => state.auth?.accessToken);
    const playSoundEnabled = useSelector(
        (state: RootState) => state.securityUi.enabled,
    );
    const location = useLocation();

    const isOnSecurityDashboard = location.pathname != SECURITY_DASHBOARD_ROUTE;

    const shouldShowGlobalAlert = playSoundEnabled && isOnSecurityDashboard;

    useAlertHub(token ?? "", shouldShowGlobalAlert);
};
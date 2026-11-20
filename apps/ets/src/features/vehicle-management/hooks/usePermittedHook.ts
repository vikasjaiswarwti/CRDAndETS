import { useAppSelector } from "../../../app/store/index";
import { selectActiveRole } from "../../navigation/slices/navigationSlice";
import { ROLE_PERMISSIONS } from "../config"

export const usePermittedHook = () => {
    const activeRole = useAppSelector(selectActiveRole);
    // console.log(activeRole, "activeRole");
    if (!activeRole) {
        return {
            VEHICLE_CONFIG: {
                canCreate: true,
                canUpdate: false,
                canView: false,
                canBulk: false,
                canDelete: false,
                canStageCreate: true,
                canStageUpdate: true,
                canStageView: false,
                canStageDelete: false,
                canStageApprove: true,
                canStageBulk: false,
                 canStageSelectTransported:false,
                canTabPendingView: true,
                canTabApproveView: true
            }
        };
    }

    return { VEHICLE_CONFIG: ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS] };
};


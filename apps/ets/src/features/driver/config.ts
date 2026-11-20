

export const ROLE_PERMISSIONS = {
    admin: {
        canCreate: true,
        canUpdate: true,
        canView: false,
        canBulk: false,
        canDelete: false,
        canStageCreate: true,
        canStageUpdate: true,
        canStageView: false,
        canStageDelete: false,
        canStageApprove: true,
        canStageBulk: true,
        canStageSelectTransported:true,
        canTabPendingView: true,
        canTabApproveView: true
    },
    vendor: {
        canCreate: true,
        canUpdate: false,
        canView: false,
        canBulk: false,
        canDelete: false,
        canStageCreate: true,
        canStageUpdate: true,
        canStageView: false,
        canStageDelete: false,
        canStageApprove: false,
        canStageBulk: true,
        canStageSelectTransported:false,
        canTabPendingView: true,
        canTabApproveView: false
    },
}
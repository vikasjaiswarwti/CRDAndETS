// src/routes/registry/featureRegistry.ts
// ─────────────────────────────────────────────────────────────────────────────
// Maps backend routeUrl values → lazy feature page imports.
// This is the ONLY file to edit when adding or removing a feature page.
//
// Key format: must exactly match the NORMALISED routeUrl from the API.
// menuApi.transformResponse adds a leading slash, so keys here have one too.
//   API sends:   "fleet/vendor"
//   After normalise: "/fleet/vendor"
//   Key here:   "/fleet/vendor"   ← must match
//
// Dashboard paths (last segment = "dashboard") are handled automatically
// by routeUtils → RoleDashboard. Do NOT register them here.
// ─────────────────────────────────────────────────────────────────────────────

import type { ComponentType } from "react";

type LazyImport = () => Promise<{ default: ComponentType }>;

export const FEATURE_REGISTRY: Record<string, LazyImport> = {
  // ── System Administration ─────────────────────────────────────────────────
  "/dashoboard/chat-bot": () =>
    import("../../features/chatbot/Chatbot").then((m) => ({
      default: m.default,
    })),

  "/account/change-password": () =>
    import("../../features/dashboard/user/components/ChangePasswordForm").then(
      (m) => ({
        default: m.default,
      }),
    ),

  // ── Account Management ────────────────────────────────────────────────────
  "/account/office": () =>
    import("../../features/lkp-location/pages/Lkplocationlistpage").then(
      (m) => ({ default: m.default }),
    ),

  "/lookup/cityzone": () =>
    import("../../features/cityzone/pages/CityZoneListPage").then((m) => ({
      default: m.default,
    })),

  "/lookup/bill-plan": () =>
    import("../../features/mst-bill-plans/pages/Billplanlistpage").then(
      (m) => ({ default: m.default }),
    ),

  "/lookup/bill-plan-type": () =>
    import("../../features/mst-bill-plan-type").then((m) => ({
      default: m.BillPlanTypeListPage,
    })),

  "/lookup/lob": () =>
    import("../../features/line-of-business/pages/Lineofbusinesslistpage").then(
      (m) => ({ default: m.default }),
    ),

  "/lookup/document-owner-type": () =>
    import("../../features/document-owner-type").then((m) => ({
      default: m.DocumentOwnerTypeListPage,
    })),

  "/lookup/document-type": () =>
    import("../../features/document-type/pages/DocTypeListPage").then((m) => ({
      default: m.default,
    })),

  "/lookup/fuel-type": () =>
    import("../../features/fuel-type/Index").then((m) => ({
      default: m.FuelTypeListPage,
    })),
  // "/account/fuel-type": () =>
  //   import("../../features/escort").then((m) => ({
  //     default: m.EscortListPage,
  //   })),
  // ------------------ Amit
  "/lookup/special-cases": () =>
    import("../../features/specialCase").then((m) => ({
      default: m.SpecialCaseListPage,
    })),
  // -------------- Amit End
  "/lookup/employee-type": () =>
    import("../../features/employee-type").then((m) => ({
      default: m.EmployeeTypeListPage,
    })),

  "/lookup/department": () =>
    import("../../features/lkp-department/pages/Departmentlistpage").then(
      (m) => ({ default: m.default }),
    ),

  "/lookup/process": () =>
    import("../../features/lkp-process").then((m) => ({
      default: m.ProcessListPage,
    })),

  "/user/employee": () =>
    import("../../features/employee").then((m) => ({
      default: m.EmployeeListPage,
    })),

  "/account/app-control": () =>
    import("../../features/new-app-control/pages/AppcontrolListPage").then(
      (m) => ({
        default: m.default,
      }),
    ),

  "/account/shift-interval": () =>
    import("../../features/shiftinterval").then((m) => ({
      default: m.ShiftIntervalListPage,
    })),

  //"/account/corporate": () =>

  "/account/corporate-register": () =>
    import("../../features/corporate").then((m) => ({
      default: m.BusinessListPage,
    })),
  "/lookup/current-status": () =>
    import("../../features/currentStatus").then((m) => ({
      default: m.CurrentStatusListPage,
    })),
  "/lookup/state": () =>
    import("../../features/state").then((m) => ({
      default: m.StateListPage,
    })),

  "/account/shift-configuration": () =>
    import("../../features/shift-management").then((m) => ({
      default: m.ShiftManagementPage,
    })),

  // ── Fleet Management ──────────────────────────────────────────────────────

  // "/compliance/vendor-dashboard": () =>
  //   import("../../features/compliant-nonCompliant/index").then((m) => ({
  //     default: m.VendorDashboardPage,
  //   })),
  "/compliance/vendor-management": () =>
    import("../../features/compliant-nonCompliant/index").then((m) => ({
      default: m.VendorDashboardPage,
    })),

  "/compliance/approval-dashboard": () =>
    import("../../features/compliant-nonCompliant/index").then((m) => ({
      default: m.ApprovalDashboardPage,
    })),

  "/compliance/vendor": () =>
    import("../../features/vendors/pages/VendorListPage").then((m) => ({
      default: m.default,
    })),
  "/lookup/vehicle-type": () =>
    import("../../features/vehicletype").then((m) => ({
      default: m.VehicleTypeListPage,
    })),
  "/compliance/ehs": () =>
    import("../../features/EHS").then((m) => ({
      default: m.EhsChecksListPage,
    })),
  "/compliance/ehs-check": () =>
    import("../../features/EHSChecks").then((m) => ({
      default: m.TransEhsPage,
    })),
  "/lookup/vehicle-status": () =>
    import("../../features/vehicleStatus").then((m) => ({
      default: m.VehicleStatusListPage,
    })),
  "/fleet/vehicle": () =>
    import("../../features/vehicle-management").then((m) => ({
      default: m.VehicleListPage,
    })),
  "/compliance/driver": () =>
    import("../../features/driver").then((m) => ({
      default: m.DriverListPage,
    })),
  "/compliance/escort": () =>
    import("../../features/escort").then((m) => ({
      default: m.EscortListPage,
    })),
  "/compliance/escort-vendor": () =>
    import("../../features/escort-vendor/indexV2").then((m) => ({
      default: m.EscortVendorListPage,
    })),
  // ── User / HR ─────────────────────────────────────────────────────────────

  // ── Dashboard sub-pages (system admin features) ───────────────────────────
  // "/dashboard/menu": () =>
  //   import("../../features/menu-management").then((m) => ({
  //     default: m.MenuListPage,
  //   })),

  // "/dashboard/role-management": () =>
  //   import("../../features/role-management").then((m) => ({
  //     default: m.RoleListPage,
  //   })),

  "/compliance/qr-dashboard": () =>
    import("../../features/pocforqr/pages/VendorManagementPage").then((m) => ({
      default: m.default,
    })),

  "/trip-management/qr-trips": () =>
    import("../../features/pocforqr/pages/Bookingdashboardpage").then((m) => ({
      default: m.default,
    })),

  "/dashboard/permission-access": () =>
    import("../../features/system-administration").then((m) => ({
      default: m.RolePermissionPage,
    })),
  "/dashboard/menu-permission": () =>
    import("../../features/menu-permission").then((m) => ({
      default: m.default,
    })),
  "/account/shift-management": () =>
    import("../../features/shift-validation/pages/ShiftValidationPage").then(
      (m) => ({
        default: m.ShiftValidationPage,
      }),
    ),

  "/lookup/feedback-type": () =>
    import("../../features/lkp-feedbacktype").then((m) => ({
      default: m.LkpFeedbackTypeListPage,
    })),

  "/lookup/penalty-type": () =>
    import("../../features/lkp-penalty-type").then((m) => ({
      default: m.LkpPenaltyTypeListPage,
    })),

  "/lookup/trip-type": () =>
    import("../../features/lkp-trip-type").then((m) => ({
      default: m.LkpTripTypeListPage,
    })),
  "/account/profile": () =>
    import("../../features/profile/pages/UserProfile").then((m) => ({
      default: m.default,
    })),

  // "/account/lkp-trip-type": () =>
  //   import("../../features/roaster/pages/Createrosterpage").then((m) => ({
  //     default: m.default,
  //     // default: m.Createrosterpage,
  //   })),

  "/account/adhoc-week-days": () =>
    import("../../features/lkp-adhoc-days").then((m) => ({
      default: m.LkpAdhocWeekDaysListPage,
    })),
  "/user/super-visor": () =>
    import("../../features/UserSupervisor").then((m) => ({
      default: m.UserSupervisorPage,
    })),
  "/user/vendor-supervisor": () =>
    import("../../features/VendorSuperVisor").then((m) => ({
      default: m.VendorSupervisor,
    })),
  "/user/address-change": () =>
    import("../../features/AddressChange").then((m) => ({
      default: m.AddressChangesListPage,
    })),
  "/account/notification-management": () =>
    import("../../features/NotificationManagement/index").then((m) => ({
      default: m.default,
    })),

  "/schedule/fill-roaster": () =>
    import("../../features/roaster").then((m) => ({
      default: m.CreateRosterPage,
    })),

  "/schedule/roaster-data": () =>
    import("../../features/roaster").then((m) => ({
      default: m.EmployeeSchedulePage,
    })),

  "/schedule/bulk-roaster-upload": () =>
    import("../../features/roaster").then((m) => ({
      default: m.UploadSchedulePage,
    })),

  "/schedule/fill-employee-roaster": () =>
    import("../../features/roaster/pages/CreateIndividualrosterPage").then(
      (m) => ({
        default: m.default,
      }),
    ),

  "/schedule/employee-roaster": () =>
    import("../../features/roaster/pages/Individualviewschedulepage").then(
      (m) => ({
        default: m.default,
      }),
    ),

  "/routing/today-routing": () =>
    import("../../features/routing/pages/RouteManagementPage").then((m) => ({
      default: m.default,
    })),

  "/routing/route-maker": () =>
    import("../../features/route-optimization/pages/RouteMakerPage").then(
      (m) => ({
        default: m.default,
      }),
    ),
  //RouteManagementPage
  "/routing/route-tracking": () =>
    import("../../features/route-tracking/pages/RouteTracking").then((m) => ({
      default: m.default,
    })),
  "/trip-management/vendor-trip": () =>
    import("../../features/vendor-trip/index").then((m) => ({
      default: m.VendorTripListPage,
    })),

  "/reports/analytics": () =>
    import("../../features/report-analytics/pages/ReportPage").then((m) => ({
      default: m.default,
    })),
  "/reports/report-permission": () =>
    import("../../features/report-permission/pages/ReportPage").then((m) => ({
      default: m.default,
    })),
  "/escort/assign-escort": () =>
    import("../../features/dashboard/escort/EscortDashboard").then((m) => ({
      default: m.default,
    })),
  "/billing/rate-card": () =>
    import("../../features/billing/pages/BillingPage").then((m) => ({
      default: m.default,
    })),
  "/billing/mis-report": () =>
    import("../../features/billing/pages/MISReport").then((m) => ({
      default: m.default,
    })),
  "/routing/security": () =>
    import("../../features/security-dashboard/pages/Securitydashboardpage").then(
      (m) => ({
        default: m.default,
      }),
    ),
  "/routing/track-shift": () =>
    import("../../features/progressTrip/pages/ProgressTripPage").then((m) => ({
      default: m.default,
    })),
  "/reports/add-report": () =>
    import("../../features/report-analytics/index").then((m) => ({
      default: m.CreateReport,
    })),
  "/routing/multiple-trip-view": () =>
    import("../../features/progressTrip/pages/MultipleViewTrip").then((m) => ({
      default: m.default,
    })),
  "/routing/trip-life-cycle": () =>
    import("../../features/progressTrip/pages/TripLifeCycle").then((m) => ({
      default: m.default,
    })),

  "/feedback/complaint-resolution": () =>
    import("../../features/complaint-resolution/pages/ComplaintResolutionPage").then(
      (m) => ({
        default: m.default,
      }),
    ),
  "/billing/generate": () =>
    import("../../features/billing/pages/GenerateBilling").then(
      (m) => ({
        default: m.default,
      }),
    ),
  "/compliance/vehicle-check-sheet": () =>
    import("../../features/LTR/vehicle-check-sheet/pages").then(
      (m) => ({
        default: m.default,
      }),
    ),
  "/billing/penalty": () =>
    import("../../features/penalty").then(
      (m) => ({
        default: m.PenaltyListPage,
      }),
    ),
  "/schedule/adhoc-request": () => import("../../features/roaster/index").then(
    (m) => ({
      default: m.AdhocRequestPage,
    }),
  ),
  "/schedule/adhoc-approval": () => import("../../features/roaster/index").then(
    (m) => ({
      default: m.AdhocApprovalList,
    }),
  ),
  "/dashboard/audit": () => import("../../features/audit/pages/AuditLogPage").then(
    (m) => ({
      default: m.default,
    })),
  '/user/nodal-points': () => import("../../features/employee-nodal-point").then(
    (m) => ({
      default: m.NodalPointListPage,
    })
  ),
  "/account/speed-service-grid": () =>
    import("../../features/speed-service-grid/index").then((m) => ({
      default: m.default,
    })),
  "/schedule/master-weekly-schedule": () =>
    import("../../features/master-weekly-schedule").then((m) => ({
      default: m.MasterWeeklyScheduleListPage,
    })),
};

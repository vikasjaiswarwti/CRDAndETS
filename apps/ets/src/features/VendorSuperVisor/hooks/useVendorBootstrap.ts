
// useVendorBootstrap.ts
// ─────────────────────────────────────────────────────────────────────────────
// Called once in App.tsx alongside useMenuBootstrap.
// If the logged-in user has role "vendor" (case-insensitive), fetches their
// transporter mapping and dispatches both the primary ID and the full named
// list into Redux (vendorContextSlice).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated } from "../../auth/slices/authSlice";
import { selectRoles } from "../../navigation/slices/navigationSlice";
import { useGetMyTransporterIdQuery } from "../services/vendorSupervisorApi";
// ⚠️ Adjust this import path to match your actual slice location
import { setTransporterId, setTransporters } from "../slice/Vendorcontextslice";

// Case-insensitive — API may return "Vendor" or "vendor"
const VENDOR_ROLE = "vendor";

export const useVendorBootstrap = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const roles: string[] = useSelector(selectRoles) ?? [];
  const isVendor = roles.some((r) => r.toLowerCase() === VENDOR_ROLE);

  // console.log(
  //   "[VendorBootstrap] isAuthenticated:",
  //   isAuthenticated,
  //   "| roles:",
  //   roles,
  //   "| isVendor:",
  //   isVendor,
  // );

  const { data, isLoading, error } = useGetMyTransporterIdQuery(undefined, {
    skip: !isAuthenticated || !isVendor,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    // console.log(
    //   "[VendorBootstrap] query state → isLoading:",
    //   isLoading,
    //   "| error:",
    //   error,
    //   "| data:",
    //   data,
    // );

    if (!data) return;

    // Primary transporter ID — first from array, fallback to singular field
    const id = data.transporterIds?.[0] ?? data.transporterId ?? null;
    // console.log("[VendorBootstrap] resolved primary transporterId:", id);
    if (id != null) {
      dispatch(setTransporterId(id));
    }

    // Full named list → used to build the vendor selector in compliance pages
    if (data.transporters && data.transporters.length > 0) {
      // console.log(
      //   "[VendorBootstrap] dispatching transporters:",
      //   data.transporters,
      // );
      dispatch(setTransporters(data.transporters));
    } else {
      // Fallback: build from IDs when API doesn't return names
      const fallback = (data.transporterIds ?? (id != null ? [id] : [])).map(
        (tid) => ({
          transporterId: tid,
          vendorName: `Vendor ${tid}`,
        }),
      );
      if (fallback.length) {
        // console.warn(
        //   "[VendorBootstrap] no transporters array — building from IDs:",
        //   fallback,
        // );
        dispatch(setTransporters(fallback));
      }
    }
  }, [data, isLoading, error, dispatch]);
};

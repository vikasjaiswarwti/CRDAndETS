import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store";
import {
  setCollapsed, // ← was setSidebarCollapsed
  selectCollapsed, // ← was selectSidebarCollapsed (which was never exported)
} from "../../features/navigation/slices/navigationSlice";
import { useEffect, useRef } from "react";

// then restore the previous state on exit.
const AUTO_COLLAPSE_PATHS = [
  "/routing/today-routing",
  "/dashboard/permission-access",
  // add more here as needed
];

export const useSidebarAutoCollapse = () => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const collapsed = useAppSelector(selectCollapsed); // ← reads the real field

  const prevCollapsed = useRef<boolean | null>(null);

  useEffect(() => {
    const shouldCollapse = AUTO_COLLAPSE_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (shouldCollapse) {
      if (prevCollapsed.current === null) {
        prevCollapsed.current = collapsed;
      }
      if (!collapsed) {
        dispatch(setCollapsed(true)); // ← writes the real field
      }
    } else {
      if (prevCollapsed.current !== null) {
        dispatch(setCollapsed(prevCollapsed.current)); // ← restores the real field
        prevCollapsed.current = null;
      }
    }
  }, [pathname]);
};

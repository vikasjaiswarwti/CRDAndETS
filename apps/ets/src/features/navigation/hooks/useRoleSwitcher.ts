// src/features/navigation/hooks/useRoleSwitcher.ts
// ─────────────────────────────────────────────────────────────────────────────
// Provides role-switching capability for the header UI.
//
// canSwitch is false when the user holds only one role — the header widget
// uses this flag to hide itself entirely, so single-role users never see it.
//
// switchRole validates the target role against the user's actual roles list
// before dispatching — prevents injecting arbitrary role strings via the UI.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store";
import {
  selectRoles,
  selectActiveRole,
  setActiveRole,
} from "../slices/navigationSlice";
import { ROLE_LABEL_MAP } from "../../../shared/constants/roles.constants";

export const useRoleSwitcher = () => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles); // e.g. ["vendor", "employee"]
  const activeRole = useAppSelector(selectActiveRole); // e.g. "employee"

  const switchRole = useCallback(
    (role: string) => {
      // setActiveRole in the slice already validates against roles array —
      // this call is a no-op if `role` isn't in the user's roles.
      dispatch(setActiveRole(role));
    },
    [dispatch],
  );

  return {
    activeRole,
    /** true only when user holds more than one role — use to show/hide switcher UI */
    canSwitch: roles.length > 1,
    /** Options array ready for a Select or pill buttons */
    roleOptions: roles.map((r) => ({
      value: r,
      label: ROLE_LABEL_MAP[r] ?? r, // falls back to raw slug if label missing
    })),
    switchRole,
  };
};

// ETS top bar. Presentation lives in @commutr/ui (AppHeader); this file only
// supplies ETS-specific content: corporate name, command palette, sound toggle,
// notifications, and the user-menu entries.

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  AppHeader,
  OrgBadge,
  HeaderIconButton,
  BellIcon,
  type HeaderMenuItem,
} from "@commutr/ui/layout";
import { useAuth } from "../../../../features/auth/hooks/useAuth";
import { CommandPalette } from "../../../../features/command-pallete/component/Commandpalette";
import { useGetBusinessesQuery } from "../../../../features/corporate/services/businessApi";
import PlaySoundSwitch from "../../RoutingHeader/PlaySoundSwitch";
import { setBusiness } from "../../../../features/corporate/slice/businessSlice";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, handleLogout, otherApps, handleSwitchApp } = useAuth();

  // ── Corporate name ──────────────────────────────────────────────────────
  const { data: businessData } = useGetBusinessesQuery({
    searchTerm: "",
    sortColumn: "",
    sortOrder: "",
    page: 1,
    pageSize: 10,
  });
  const corporateName = businessData?.items?.[0]?.businessFullName ?? "";
  useEffect(() => {
    if (!!businessData?.items?.length) {
      const business = businessData.items[0];
      dispatch(
        setBusiness({
          businessFullName: business.businessFullName,
          businessShortName: business.businessShortName,
        }),
      );
    }
  }, [businessData?.items, dispatch]);

  const userMenuItems: HeaderMenuItem[] = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/account/profile"),
    },
    {
      key: "change-password",
      label: "Change Password",
      onClick: () => navigate("/account/change-password"),
    },
    // Shown only when the user also has access to another app (e.g. CRD)
    ...otherApps.map((a) => ({
      key: `switch-app-${a.appId}`,
      label: `Switch to ${a.appName}`,
      onClick: () => {
        handleSwitchApp(a.appId).catch(() => {});
      },
    })),
    { type: "divider", key: "divider-1" },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      onClick: async () => {
        await handleLogout();
      },
    },
  ];

  return (
    <AppHeader
      left={<OrgBadge name={corporateName} />}
      actions={
        <>
          <CommandPalette />
          <PlaySoundSwitch />
          <HeaderIconButton
            aria-label="Notifications"
            dot
            onClick={() => window.open(`${import.meta.env.BASE_URL}routing/security`, "_blank")}
          >
            <BellIcon />
          </HeaderIconButton>
        </>
      }
      userName={user?.name}
      userMenuItems={userMenuItems}
    />
  );
};

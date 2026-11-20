// src/features/route-maker/components/TripTypeBadge.tsx

import { memo } from "react";
import LoginIcon from "../../../features/routing/assets/login.svg";
import LogoutIcon from "../../../features/routing/assets/logout.svg";

interface Props {
  type: "Login" | "Logout";
  size?: number;
}

const TripTypeBadge = memo(function TripTypeBadge({ type, size = 52 }: Props) {
  return (
    <img
      src={type === "Login" ? LoginIcon : LogoutIcon}
      alt={type}
      style={{ width: size, height: "auto", display: "block", flexShrink: 0 }}
      draggable={false}
    />
  );
});

export default TripTypeBadge;

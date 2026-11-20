import React from "react";
import CommutrLogo from "../../../shared/components/RoutingHeader/CommutrLogo";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

const Header: React.FC = () => {
   const isMobile=useIsMobile();
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        height: isMobile? "6vh" : "8vh",
        padding: "0 16px",
        borderBottom: "1px solid #E5E7EB",
        background: "#FFFFFF",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      {/* Brand logo, centered on the page */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <CommutrLogo />
      </div>
    </header>
  );
};
export default Header;

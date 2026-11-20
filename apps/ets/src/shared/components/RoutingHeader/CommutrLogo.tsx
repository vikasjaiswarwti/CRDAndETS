import { NavLink } from "react-router-dom";
import CommutrLogoSvg from "../../../assets/commutr.svg";
import { useIsMobile } from "../../customHooks/useIsMobile";
import { SidebarLogoUrl } from "../../constants/app.constants";

function CommutrLogo() {
  const isMobile =useIsMobile();
  return (
    <NavLink to="/">
      <img
        src={SidebarLogoUrl ?? CommutrLogoSvg}
        alt="Commutr"
        style={{ height: isMobile ? 20:26, width: "auto", display: "block" }}
      />
    </NavLink>
  );
}
export default CommutrLogo;
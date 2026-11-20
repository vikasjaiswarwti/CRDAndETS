import React from "react";
import { useSearchParams } from "react-router-dom";
import ModuleToggle from "../components/ModuleToggle";
import SosEscalationPanel from "../components/SosEscalationPanel";
import EventNotificationPanel from "../components/EventNotificationPanel";
import type { NotificationManagementTab } from "../types/notificationManagement.types";

// Selected module is kept in the URL (?tab=sos|event) so refresh keeps it.
const NotificationManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: NotificationManagementTab =
    searchParams.get("tab") === "event" ? "event" : "sos";

  const handleTabChange = (tab: NotificationManagementTab) =>
    setSearchParams({ tab }, { replace: true });

  const toggle = <ModuleToggle value={activeTab} onChange={handleTabChange} />;

  return activeTab === "sos" ? (
    <SosEscalationPanel toggle={toggle} />
  ) : (
    <EventNotificationPanel toggle={toggle} />
  );
};

export default NotificationManagementPage;

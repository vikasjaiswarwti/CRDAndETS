import { createContext, useContext, type ReactNode } from "react";
import type { SystemAdminApis } from "./createSystemAdminApis";

const SystemAdminContext = createContext<SystemAdminApis | null>(null);

export const SystemAdminProvider = ({
  apis,
  children,
}: {
  apis: SystemAdminApis;
  children: ReactNode;
}) => (
  <SystemAdminContext.Provider value={apis}>
    {children}
  </SystemAdminContext.Provider>
);

/** The calling app's own RTK Query APIs. Must be used under SystemAdminProvider. */
export const useSystemAdminApis = (): SystemAdminApis => {
  const apis = useContext(SystemAdminContext);
  if (!apis) {
    throw new Error(
      "useSystemAdminApis must be used inside <SystemAdminProvider> (or via <SystemAdminPage apis={...} />).",
    );
  }
  return apis;
};

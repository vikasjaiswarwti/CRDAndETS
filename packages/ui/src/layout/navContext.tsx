import { createContext, useContext } from "react";
import type { ReactNode } from "react";

// Router-agnostic navigation for the shell. The app (ETS/CRD) supplies its own
// pathname + navigate (from react-router), so this package never imports a router.
export interface ShellNav {
  pathname: string;
  navigate: (to: string) => void;
}

const NavContext = createContext<ShellNav>({
  pathname: "/",
  navigate: () => {},
});

export const ShellNavProvider = ({
  value,
  children,
}: {
  value: ShellNav;
  children: ReactNode;
}) => <NavContext.Provider value={value}>{children}</NavContext.Provider>;

export const useShellNav = (): ShellNav => useContext(NavContext);

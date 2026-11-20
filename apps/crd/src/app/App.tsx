import { useAuthSync } from "../features/auth/hooks/useAuthSync";
import { AppRoutes } from "../routes/AppRoutes";

export const App = () => {
  useAuthSync();
  return <AppRoutes />;
};

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getAppIdForPath } from "@commutr/shared";
import LoginPage from "./pages/LoginPage";
import ChooseAppPage from "./pages/ChooseAppPage";

/**
 * Old ETS bookmarks (before ETS moved to /ets/) keep working: /bookings/1 ->
 * /ets/bookings/1.
 *
 * Paths that already belong to an app (/ets/..., /crd/...) must NEVER be
 * rewritten again. In production the gateway serves them before they reach
 * this app; if they DO reach it, the app is not mounted (e.g. dev without
 * `npm run dev:stack`). Redirecting them would loop: /ets/ -> /ets/ets/ -> ...
 */
function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();

  if (getAppIdForPath(pathname) !== null) {
    return (
      <div className="page">
        <div className="card">
          <h1>App not available</h1>
          <p>
            <code>{pathname}</code> is not being served. Start the whole stack
            with <code>npm run dev:stack</code> (or check the gateway routes).
          </p>
        </div>
      </div>
    );
  }

  window.location.replace(`/ets${pathname}${search}${hash}`);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/choose-app" element={<ChooseAppPage />} />
      <Route path="*" element={<LegacyRedirect />} />
    </Routes>
  );
}

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { clearApps, clearToken, getApps, getToken } from "@commutr/shared";
import { enterApp } from "../routeUser";

export default function ChooseAppPage() {
  const apps = getApps();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  if (!getToken()) return <Navigate to="/" replace />;

  const pick = async (appId: number) => {
    setError(null);
    setBusy(appId);
    try {
      await enterApp(appId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the app");
      setBusy(null);
    }
  };

  const signOut = () => {
    clearToken();
    clearApps();
    window.location.replace("/");
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Choose an application</h1>
        <div className="apps">
          {apps.map((a) => (
            <button key={a.appId} disabled={busy !== null} onClick={() => pick(a.appId)}>
              {busy === a.appId ? "Opening…" : a.appName}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button className="link" onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

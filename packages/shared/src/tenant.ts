// Tenant resolution — single source of truth, shared by every app.
// Production: first label of the hostname (e.g. "acme.commutr.in" -> "acme").
// Local dev (localhost): the app passes its own VITE_X_TENENT_ID, because a
// library must not read import.meta.env (it is frozen at the library's build).

export const getTenant = (devTenant = ""): string => {
  const hostname = window.location.hostname;
  return hostname === "localhost" ? devTenant : hostname.split(".")[0];
};

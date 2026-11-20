// Thin wrapper over the shared package (../commutr-shared).
// ETS passes its own env value for the local-dev tenant.
import { getTenant as sharedGetTenant } from "@commutr/shared";

export * from "@commutr/shared";

export const getTenant = (): string =>
  sharedGetTenant(import.meta.env.VITE_X_TENENT_ID as string);

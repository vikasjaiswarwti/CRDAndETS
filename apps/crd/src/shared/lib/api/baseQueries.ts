import { createBaseQuery } from "./baseQueryWithReauth";
import { AUTH_API_BASE, CRD_API_BASE } from "../../constants/app.constants";

/** CrdCore APIs (browser path /crd-api/...). */
export const crdBaseQuery = createBaseQuery(CRD_API_BASE);

/** Identity APIs (/api/v1/Auth/...). */
export const authBaseQuery = createBaseQuery(AUTH_API_BASE);

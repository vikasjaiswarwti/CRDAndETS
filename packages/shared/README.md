# @commutr/shared

Shared auth/session contract used by `commutr-auth`, ETS and CRD:
token store, apps store, tenant, URL contract (`APP_IDS`, `APP_ROUTES`,
`getLoginUrl`, `readRedirectUrl`).

Rules: no React, no `import.meta.env` inside this package (frozen at the
library's build time) — apps pass env values in.

Local use: consumers depend on it via `"@commutr/shared": "file:../commutr-shared"`
(source is consumed directly). Before production, publish it to a private
registry (GitHub Packages) and replace the `file:` dependency with a version.
